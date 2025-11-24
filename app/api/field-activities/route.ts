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
    const cropCycleId = searchParams.get("crop_cycle_id")
    const activityType = searchParams.get("activity_type")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = await createClient()

    let query = supabase
      .from("field_activities")
      .select(`
        *,
        crop_cycles (
          id,
          crop_name,
          fields (
            field_name
          )
        )
      `)
      .eq("crop_cycles.fields.farmer_id", userId)
      .order("activity_date", { ascending: false })
      .limit(limit)

    if (cropCycleId) {
      query = query.eq("crop_cycle_id", cropCycleId)
    }

    if (activityType) {
      query = query.eq("activity_type", activityType)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error("Error fetching field activities:", error)
      return NextResponse.json({ error: "Failed to fetch field activities" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      activities: activities || [],
      total: activities?.length || 0
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
    const { crop_cycle_id, activity_type, activity_date, materials_used, cost, notes } = body

    // Validate required fields
    if (!crop_cycle_id || !activity_type) {
      return NextResponse.json({
        error: "Crop cycle ID and activity type are required"
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify crop cycle ownership
    const { data: cropCycle } = await supabase
      .from("crop_cycles")
      .select(`
        id,
        fields!inner (
          farmer_id
        )
      `)
      .eq("id", crop_cycle_id)
      .eq("fields.farmer_id", userId)
      .single()

    if (!cropCycle) {
      return NextResponse.json({
        error: "Crop cycle not found or access denied"
      }, { status: 404 })
    }

    // Create the field activity
    const { data: activity, error } = await supabase
      .from("field_activities")
      .insert({
        crop_cycle_id,
        activity_type: activity_type.trim(),
        activity_date: activity_date || new Date().toISOString().split('T')[0],
        materials_used: materials_used || null,
        cost: cost ? parseFloat(cost) : null,
        notes: notes?.trim() || null
      })
      .select(`
        *,
        crop_cycles (
          id,
          crop_name,
          fields (
            field_name
          )
        )
      `)
      .single()

    if (error) {
      console.error("Error creating field activity:", error)
      return NextResponse.json({ error: "Failed to create field activity" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      activity
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}