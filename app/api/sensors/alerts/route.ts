import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sensorId = searchParams.get("sensor_id")
    const severity = searchParams.get("severity")
    const acknowledged = searchParams.get("acknowledged")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = await createClient()

    let query = supabase
      .from("sensor_alerts")
      .select(`
        id,
        alert_type,
        severity,
        message,
        threshold_value,
        current_value,
        acknowledged,
        acknowledged_at,
        resolved,
        resolved_at,
        created_at,
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
      .order("created_at", { ascending: false })
      .limit(limit)

    // Apply filters
    if (sensorId) {
      query = query.eq("iot_sensors.sensor_id", sensorId)
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === "true"
      query = query.eq("acknowledged", isAcknowledged)
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error("Error fetching sensor alerts:", error)
      return NextResponse.json({ error: "Failed to fetch sensor alerts" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      total: alerts?.length || 0
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sensor_id, alert_type, severity, message, threshold_value, current_value, anomaly_details } = body

    // Validate required fields
    if (!sensor_id || !alert_type || !message) {
      return NextResponse.json({
        error: "Sensor ID, alert type, and message are required"
      }, { status: 400 })
    }

    // Validate severity
    const validSeverities = ["low", "medium", "high", "critical"]
    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json({
        error: "Invalid severity. Must be one of: " + validSeverities.join(", ")
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify sensor ownership
    const { data: sensor, error: sensorError } = await supabase
      .from("iot_sensors")
      .select("id")
      .eq("sensor_id", sensor_id)
      .eq("farmer_id", userId)
      .single()

    if (sensorError || !sensor) {
      return NextResponse.json({
        error: "Sensor not found or access denied"
      }, { status: 404 })
    }

    // Create the alert
    const { data: alert, error: alertError } = await supabase
      .from("sensor_alerts")
      .insert({
        sensor_id: sensor.id,
        alert_type,
        severity: severity || "medium",
        message,
        threshold_value: threshold_value || null,
        current_value: current_value || null,
        anomaly_details: anomaly_details || null
      })
      .select()
      .single()

    if (alertError) {
      console.error("Error creating sensor alert:", alertError)
      return NextResponse.json({ error: "Failed to create sensor alert" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alert
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}