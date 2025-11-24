import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sensor_id, reading_value, unit, raw_data, quality_score } = body

    // Validate required fields
    if (!sensor_id || reading_value === undefined) {
      return NextResponse.json({
        error: "Sensor ID and reading value are required"
      }, { status: 400 })
    }

    // Validate reading value
    const numValue = parseFloat(reading_value)
    if (isNaN(numValue)) {
      return NextResponse.json({
        error: "Reading value must be a valid number"
      }, { status: 400 })
    }

    // Validate quality score if provided
    if (quality_score !== undefined) {
      const numQualityScore = parseFloat(quality_score)
      if (isNaN(numQualityScore) || numQualityScore < 0 || numQualityScore > 1) {
        return NextResponse.json({
          error: "Quality score must be a number between 0 and 1"
        }, { status: 400 })
      }
    }

    const supabase = await createClient()

    // Verify sensor ownership and get sensor details
    const { data: sensor, error: sensorError } = await supabase
      .from("iot_sensors")
      .select(`
        id,
        farmer_id,
        sensor_type,
        field_id,
        status,
        manufacturer,
        sensor_model,
        configuration
      `)
      .eq("sensor_id", sensor_id)
      .eq("farmer_id", userId)
      .single()

    if (sensorError || !sensor) {
      return NextResponse.json({
        error: "Sensor not found or access denied"
      }, { status: 404 })
    }

    // Check if sensor is active
    if (sensor.status !== "active") {
      return NextResponse.json({
        error: "Sensor is not active. Status: " + sensor.status
      }, { status: 400 })
    }

    // Get sensor type information for validation
    const { data: sensorType, error: typeError } = await supabase
      .from("sensor_types")
      .select("min_value, max_value, unit, default_threshold_low, default_threshold_high")
      .eq("type_name", sensor.sensor_type)
      .single()

    if (!typeError && sensorType) {
      // Validate reading is within reasonable bounds
      if (numValue < sensorType.min_value || numValue > sensorType.max_value) {
        console.warn(`Reading ${numValue} outside expected range [${sensorType.min_value}, ${sensorType.max_value}] for sensor ${sensor_id}`)
      }

      // Override unit if not provided
      if (!unit && sensorType.unit) {
        unit = sensorType.unit
      }
    }

    // Anomaly detection (basic implementation)
    let anomalyDetected = false
    let anomalyDetails = null

    // Check for recent readings to detect anomalies
    const { data: recentReadings } = await supabase
      .from("sensor_readings")
      .select("reading_value")
      .eq("sensor_id", sensor.id)
      .order("timestamp", { ascending: false })
      .limit(10)

    if (recentReadings && recentReadings.length > 2) {
      const recentValues = recentReadings.map(r => r.reading_value).map(v => parseFloat(v))
      const avgRecent = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
      const stdDev = Math.sqrt(recentValues.reduce((sum, val) => sum + Math.pow(val - avgRecent, 2), 0) / recentValues.length)

      // Flag as anomaly if reading is more than 3 standard deviations from recent average
      if (Math.abs(numValue - avgRecent) > 3 * stdDev) {
        anomalyDetected = true
        anomalyDetails = {
          reason: "Statistical anomaly",
          deviation: Math.abs(numValue - avgRecent),
          standardDeviations: Math.abs(numValue - avgRecent) / stdDev,
          recentAverage: avgRecent
        }
      }
    }

    // Insert the sensor reading
    const { data: reading, error: readingError } = await supabase
      .from("sensor_readings")
      .insert({
        sensor_id: sensor.id,
        reading_value: numValue,
        unit: unit || null,
        raw_data: raw_data || null,
        quality_score: quality_score !== undefined ? parseFloat(quality_score) : 1.0,
        anomaly_detected: anomalyDetected,
        anomaly_details: anomalyDetails
      })
      .select()
      .single()

    if (readingError) {
      console.error("Error inserting sensor reading:", readingError)
      return NextResponse.json({ error: "Failed to store sensor reading" }, { status: 500 })
    }

    // Check for threshold alerts
    await checkThresholdAlerts(supabase, sensor.id, numValue, sensorType)

    // Update sensor last seen timestamp
    await supabase
      .from("iot_sensors")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", sensor.id)

    // If anomaly detected, create alert
    if (anomalyDetected) {
      await createAnomalyAlert(supabase, sensor.id, anomalyDetails, numValue)
    }

    return NextResponse.json({
      success: true,
      reading: {
        id: reading.id,
        sensor_id: sensor_id,
        reading_value: numValue,
        unit: unit,
        timestamp: reading.timestamp,
        anomaly_detected: anomalyDetected,
        quality_score: quality_score || 1.0
      }
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sensorId = searchParams.get("sensor_id")
    const sensorType = searchParams.get("sensor_type")
    const fieldId = searchParams.get("field_id")
    const limit = parseInt(searchParams.get("limit") || "100")
    const hours = parseInt(searchParams.get("hours") || "24")

    const supabase = await createClient()

    let query = supabase
      .from("sensor_readings")
      .select(`
        id,
        reading_value,
        unit,
        quality_score,
        anomaly_detected,
        anomaly_details,
        timestamp,
        processed_at,
        iot_sensors!inner (
          id,
          sensor_id,
          sensor_type,
          field_id,
          fields!inner (
            field_name
          )
        )
      `)
      .eq("iot_sensors.farmer_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    // Apply filters
    if (sensorId) {
      query = query.eq("iot_sensors.sensor_id", sensorId)
    }

    if (sensorType) {
      query = query.eq("iot_sensors.sensor_type", sensorType)
    }

    if (fieldId) {
      query = query.eq("iot_sensors.field_id", fieldId)
    }

    // Time range filter
    if (hours > 0) {
      query = query.gte("timestamp", new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    }

    const { data: readings, error } = await query

    if (error) {
      console.error("Error fetching sensor readings:", error)
      return NextResponse.json({ error: "Failed to fetch sensor readings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      readings: readings || [],
      total: readings?.length || 0,
      parameters: {
        sensor_id: sensorId,
        sensor_type: sensorType,
        field_id: fieldId,
        hours: hours,
        limit: limit
      }
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function checkThresholdAlerts(
  supabase: any,
  sensorId: string,
  readingValue: number,
  sensorType: any
) {
  if (!sensorType) return

  // Check low threshold
  if (sensorType.default_threshold_low && readingValue < sensorType.default_threshold_low) {
    await supabase
      .from("sensor_alerts")
      .insert({
        sensor_id: sensorId,
        alert_type: "threshold",
        severity: readingValue < sensorType.default_threshold_low * 0.5 ? "high" : "medium",
        message: `Reading (${readingValue}) is below low threshold (${sensorType.default_threshold_low})`,
        threshold_value: sensorType.default_threshold_low,
        current_value: readingValue
      })
  }

  // Check high threshold
  if (sensorType.default_threshold_high && readingValue > sensorType.default_threshold_high) {
    await supabase
      .from("sensor_alerts")
      .insert({
        sensor_id: sensorId,
        alert_type: "threshold",
        severity: readingValue > sensorType.default_threshold_high * 1.5 ? "high" : "medium",
        message: `Reading (${readingValue}) is above high threshold (${sensorType.default_threshold_high})`,
        threshold_value: sensorType.default_threshold_high,
        current_value: readingValue
      })
  }
}

async function createAnomalyAlert(
  supabase: any,
  sensorId: string,
  anomalyDetails: any,
  readingValue: number
) {
  await supabase
    .from("sensor_alerts")
    .insert({
      sensor_id: sensorId,
      alert_type: "anomaly",
      severity: "medium",
      message: `Statistical anomaly detected in sensor reading`,
      anomaly_details: anomalyDetails,
      current_value: readingValue
    })
}