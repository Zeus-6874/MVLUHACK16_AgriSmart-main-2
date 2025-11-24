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
    const fieldId = searchParams.get("field_id")
    const status = searchParams.get("status")

    const supabase = await createClient()

    let query = supabase
      .from("crop_cycles")
      .select(`
        *,
        fields (
          id,
          field_name,
          area_hectares
        ),
        field_activities (
          id,
          activity_type,
          activity_date,
          materials_used,
          cost
        )
      `)
      .eq("fields.farmer_id", userId)

    if (fieldId) {
      query = query.eq("field_id", fieldId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: cropCycles, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching crop cycles:", error)
      return NextResponse.json({ error: "Failed to fetch crop cycles" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      crop_cycles: cropCycles || [],
      total: cropCycles?.length || 0
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
    const { field_id, crop_name, variety, planting_date, expected_harvest_date, notes } = body

    // Validate required fields
    if (!field_id || !crop_name) {
      return NextResponse.json({
        error: "Field ID and crop name are required"
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify field ownership
    const { data: field } = await supabase
      .from("fields")
      .select("id")
      .eq("id", field_id)
      .eq("farmer_id", userId)
      .single()

    if (!field) {
      return NextResponse.json({
        error: "Field not found or access denied"
      }, { status: 404 })
    }

    // Check for overlapping crop cycles
    const { data: overlappingCycles } = await supabase
      .from("crop_cycles")
      .select("id")
      .eq("field_id", field_id)
      .in("status", ["planning", "planted", "growing"])
      .limit(1)

    if (overlappingCycles && overlappingCycles.length > 0) {
      return NextResponse.json({
        error: "Field already has an active crop cycle"
      }, { status: 400 })
    }

    // Create the crop cycle
    const { data: cropCycle, error } = await supabase
      .from("crop_cycles")
      .insert({
        field_id,
        crop_name: crop_name.trim(),
        variety: variety?.trim() || null,
        planting_date: planting_date || null,
        expected_harvest_date: expected_harvest_date || null,
        status: "planning",
        notes: notes?.trim() || null
      })
      .select(`
        *,
        fields (
          id,
          field_name,
          area_hectares
        )
      `)
      .single()

    if (error) {
      console.error("Error creating crop cycle:", error)
      return NextResponse.json({ error: "Failed to create crop cycle" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      crop_cycle: cropCycle
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}