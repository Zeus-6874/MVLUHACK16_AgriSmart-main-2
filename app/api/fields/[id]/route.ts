import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch field with related data
    const { data: field, error } = await supabase
      .from("fields")
      .select(`
        *,
        crop_cycles (
          id,
          crop_name,
          variety,
          planting_date,
          expected_harvest_date,
          actual_harvest_date,
          status,
          notes,
          field_activities (
            id,
            activity_type,
            activity_date,
            materials_used,
            cost,
            notes
          )
        )
      `)
      .eq("id", params.id)
      .eq("farmer_id", userId)
      .single()

    if (error || !field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      field
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { field_name, area_hectares, coordinates, soil_type, irrigation_type } = body

    // Validate required fields
    if (!field_name || !area_hectares) {
      return NextResponse.json({
        error: "Field name and area are required"
      }, { status: 400 })
    }

    if (area_hectares <= 0) {
      return NextResponse.json({
        error: "Area must be greater than 0"
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify ownership and update field
    const { data: field, error } = await supabase
      .from("fields")
      .update({
        field_name: field_name.trim(),
        area_hectares: parseFloat(area_hectares),
        coordinates: coordinates || null,
        soil_type: soil_type || null,
        irrigation_type: irrigation_type || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("farmer_id", userId)
      .select()
      .single()

    if (error || !field) {
      return NextResponse.json({ error: "Field not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      field
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if field has active crop cycles
    const { data: activeCycles } = await supabase
      .from("crop_cycles")
      .select("id")
      .eq("field_id", params.id)
      .in("status", ["planning", "planted", "growing"])
      .limit(1)

    if (activeCycles && activeCycles.length > 0) {
      return NextResponse.json({
        error: "Cannot delete field with active crop cycles"
      }, { status: 400 })
    }

    // Delete the field
    const { error } = await supabase
      .from("fields")
      .delete()
      .eq("id", params.id)
      .eq("farmer_id", userId)

    if (error) {
      console.error("Error deleting field:", error)
      return NextResponse.json({ error: "Failed to delete field" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Field deleted successfully"
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}