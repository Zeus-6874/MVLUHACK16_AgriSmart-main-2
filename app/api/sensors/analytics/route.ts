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
    const fieldId = searchParams.get("field_id")
    const sensorType = searchParams.get("sensor_type")
    const period = searchParams.get("period") || "7d" // 24h, 7d, 30d, 90d
    const aggregation = searchParams.get("aggregation") || "hourly" // hourly, daily, weekly

    const supabase = await createClient()

    // Calculate time range based on period
    const timeRanges: { [key: string]: number } = {
      "24h": 24,
      "7d": 7 * 24,
      "30d": 30 * 24,
      "90d": 90 * 24
    }

    const hoursBack = timeRanges[period] || 168 // Default to 7 days
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

    // Fetch sensor readings with sensor information
    let readingsQuery = supabase
      .from("sensor_readings")
      .select(`
        id,
        reading_value,
        unit,
        quality_score,
        anomaly_detected,
        timestamp,
        iot_sensors!inner (
          id,
          sensor_id,
          sensor_type,
          field_id,
          status,
          fields!inner (
            field_name
          )
        )
      `)
      .eq("iot_sensors.farmer_id", userId)
      .gte("timestamp", startTime)
      .order("timestamp", { ascending: true })

    // Apply filters
    if (sensorId) {
      readingsQuery = readingsQuery.eq("iot_sensors.sensor_id", sensorId)
    }

    if (fieldId) {
      readingsQuery = readingsQuery.eq("iot_sensors.field_id", fieldId)
    }

    if (sensorType) {
      readingsQuery = readingsQuery.eq("iot_sensors.sensor_type", sensorType)
    }

    const { data: readings, error: readingsError } = await readingsQuery

    if (readingsError) {
      console.error("Error fetching sensor readings for analytics:", readingsError)
      return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 })
    }

    if (!readings || readings.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          timeSeries: [],
          summary: {},
          alerts: [],
          trends: {}
        },
        message: "No sensor data available for the specified period"
      })
    }

    // Process analytics data
    const analytics = processSensorAnalytics(readings, aggregation, period)

    // Fetch recent alerts for the same period
    const { data: alerts } = await supabase
      .from("sensor_alerts")
      .select(`
        id,
        alert_type,
        severity,
        message,
        current_value,
        created_at,
        iot_sensors!inner (
          sensor_id,
          sensor_type
        )
      `)
      .eq("iot_sensors.farmer_id", userId)
      .gte("created_at", startTime)
      .order("created_at", { ascending: false })

    // Fetch sensor health information
    const { data: sensors } = await supabase
      .from("iot_sensors")
      .select(`
        id,
        sensor_id,
        sensor_type,
        status,
        battery_level,
        last_maintenance,
        field_id,
        fields!inner (
          field_name
        )
      `)
      .eq("farmer_id", userId)

    analytics.alerts = alerts || []
    analytics.sensorHealth = processSensorHealth(sensors || [])

    return NextResponse.json({
      success: true,
      analytics,
      parameters: {
        period,
        aggregation,
        sensor_id: sensorId,
        field_id: fieldId,
        sensor_type: sensorType
      }
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processSensorAnalytics(readings: any[], aggregation: string, period: string) {
  // Group readings by sensor and time period
  const timeSeriesData: any[] = []
  const sensorGroups: { [key: string]: any[] } = {}

  // Group readings by sensor
  readings.forEach(reading => {
    const sensorKey = `${reading.iot_sensors.sensor_id}_${reading.iot_sensors.sensor_type}`
    if (!sensorGroups[sensorKey]) {
      sensorGroups[sensorKey] = []
    }
    sensorGroups[sensorKey].push(reading)
  })

  // Process each sensor's data
  Object.entries(sensorGroups).forEach(([sensorKey, sensorReadings]) => {
    const [sensorId, sensorType] = sensorKey.split('_')
    const sensor = sensorReadings[0]?.iot_sensors

    // Aggregate data based on aggregation level
    const aggregatedData = aggregateReadings(sensorReadings, aggregation)

    aggregatedData.forEach(dataPoint => {
      timeSeriesData.push({
        timestamp: dataPoint.timestamp,
        sensor_id: sensorId,
        sensor_type: sensorType,
        field_id: sensor?.field_id,
        field_name: sensor?.fields?.field_name,
        reading_value: dataPoint.reading_value,
        unit: sensorReadings[0]?.unit,
        quality_score: dataPoint.quality_score,
        anomaly_count: dataPoint.anomaly_count,
        reading_count: dataPoint.reading_count
      })
    })
  })

  // Calculate summary statistics
  const summary = calculateSummaryStats(readings)

  // Calculate trends
  const trends = calculateTrends(readings, period)

  return {
    timeSeries: timeSeriesData,
    summary,
    trends
  }
}

function aggregateReadings(readings: any[], aggregation: string): any[] {
  const groupedData: { [key: string]: any[] } = {}

  readings.forEach(reading => {
    const timestamp = new Date(reading.timestamp)
    let groupKey = ""

    switch (aggregation) {
      case "hourly":
        groupKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`
        break
      case "daily":
        groupKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`
        break
      case "weekly":
        const weekStart = new Date(timestamp)
        weekStart.setDate(timestamp.getDate() - timestamp.getDay())
        groupKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`
        break
      default:
        groupKey = timestamp.toISOString()
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = []
    }
    groupedData[groupKey].push(reading)
  })

  return Object.entries(groupedData).map(([groupKey, groupReadings]) => {
    const values = groupReadings.map(r => r.reading_value)
    const qualityScores = groupReadings.map(r => r.quality_score || 1)
    const anomalyCount = groupReadings.filter(r => r.anomaly_detected).length

    return {
      timestamp: groupReadings[0].timestamp,
      reading_value: values.reduce((sum, val) => sum + val, 0) / values.length,
      min_value: Math.min(...values),
      max_value: Math.max(...values),
      quality_score: qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length,
      anomaly_count: anomalyCount,
      reading_count: values.length
    }
  })
}

function calculateSummaryStats(readings: any[]) {
  if (readings.length === 0) {
    return {}
  }

  const values = readings.map(r => r.reading_value)
  const qualityScores = readings.map(r => r.quality_score || 1)
  const anomalies = readings.filter(r => r.anomaly_detected)

  // Group by sensor type
  const typeGroups: { [key: string]: any[] } = {}
  readings.forEach(reading => {
    const type = reading.iot_sensors.sensor_type
    if (!typeGroups[type]) {
      typeGroups[type] = []
    }
    typeGroups[type].push(reading)
  })

  const typeStats: { [key: string]: any } = {}
  Object.entries(typeGroups).forEach(([type, typeReadings]) => {
    const typeValues = typeReadings.map(r => r.reading_value)
    typeStats[type] = {
      count: typeReadings.length,
      average: typeValues.reduce((sum, val) => sum + val, 0) / typeValues.length,
      min: Math.min(...typeValues),
      max: Math.max(...typeValues),
      latest: typeReadings[typeReadings.length - 1]?.reading_value
    }
  })

  return {
    total_readings: readings.length,
    average_value: values.reduce((sum, val) => sum + val, 0) / values.length,
    min_value: Math.min(...values),
    max_value: Math.max(...values),
    average_quality: qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length,
    anomaly_count: anomalies.length,
    anomaly_rate: (anomalies.length / readings.length) * 100,
    sensor_types: typeStats,
    time_range: {
      start: readings[0]?.timestamp,
      end: readings[readings.length - 1]?.timestamp
    }
  }
}

function calculateTrends(readings: any[], period: string) {
  const trends: { [key: string]: any } = {}

  // Group by sensor type
  const typeGroups: { [key: string]: any[] } = {}
  readings.forEach(reading => {
    const type = reading.iot_sensors.sensor_type
    if (!typeGroups[type]) {
      typeGroups[type] = []
    }
    typeGroups[type].push(reading)
  })

  Object.entries(typeGroups).forEach(([type, typeReadings]) => {
    if (typeReadings.length < 2) {
      trends[type] = {
        trend: "stable",
        change: 0,
        confidence: "low"
      }
      return
    }

    // Calculate trend using first and last readings
    const firstReading = typeReadings[0].reading_value
    const lastReading = typeReadings[typeReadings.length - 1].reading_value
    const change = ((lastReading - firstReading) / firstReading) * 100

    // Determine trend direction
    let trend = "stable"
    if (Math.abs(change) > 10) {
      trend = change > 0 ? "increasing" : "decreasing"
    }

    // Calculate confidence based on number of readings and variability
    const values = typeReadings.map(r => r.reading_value)
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length
    const coefficientOfVariation = Math.sqrt(variance) / avgValue

    let confidence = "medium"
    if (typeReadings.length >= 10 && coefficientOfVariation < 0.2) {
      confidence = "high"
    } else if (typeReadings.length < 5 || coefficientOfVariation > 0.5) {
      confidence = "low"
    }

    trends[type] = {
      trend,
      change: parseFloat(change.toFixed(2)),
      confidence,
      first_value: firstReading,
      last_value: lastReading,
      data_points: typeReadings.length
    }
  })

  return trends
}

function processSensorHealth(sensors: any[]) {
  const healthStatus: { [key: string]: any } = {
    total_sensors: sensors.length,
    active_sensors: sensors.filter(s => s.status === "active").length,
    offline_sensors: sensors.filter(s => s.status === "offline').length,
    maintenance_sensors: sensors.filter(s => s.status === "maintenance").length,
    low_battery_sensors: sensors.filter(s => s.battery_level && s.battery_level < 20).length,
    sensors_by_type: {},
    average_battery_level: 0
  }

  // Calculate battery statistics
  const batteries = sensors.filter(s => s.battery_level !== null)
  if (batteries.length > 0) {
    healthStatus.average_battery_level = batteries.reduce((sum, s) => sum + s.battery_level, 0) / batteries.length
  }

  // Group by sensor type
  const typeGroups: { [key: string]: any[] } = {}
  sensors.forEach(sensor => {
    if (!typeGroups[sensor.sensor_type]) {
      typeGroups[sensor.sensor_type] = []
    }
    typeGroups[sensor.sensor_type].push(sensor)
  })

  Object.entries(typeGroups).forEach(([type, typeSensors]) => {
    healthStatus.sensors_by_type[type] = {
      total: typeSensors.length,
      active: typeSensors.filter(s => s.status === "active").length,
      offline: typeSensors.filter(s => s.status === "offline").length
    }
  })

  return healthStatus
}