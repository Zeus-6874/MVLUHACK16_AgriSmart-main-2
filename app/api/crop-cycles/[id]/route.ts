import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

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
    const { crop_name, variety, planting_date, expected_harvest_date, actual_harvest_date, status, notes } = body

    const supabase = await createClient()

    // Verify ownership and update crop cycle
    const { data: cropCycle, error } = await supabase
      .from("crop_cycles")
      .from("crop_cycles")
      .select(`
        id,
        fields!inner (
          farmer_id
        )
      `)
      .eq("id", params.id)
      .eq("fields.farmer_id", userId)
      .single()

    if (error || !cropCycle) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 })
    }

    // Update the crop cycle
    const { data: updatedCycle, error: updateError } = await supabase
      .from("crop_cycles")
      .update({
        crop_name: crop_name?.trim() || undefined,
        variety: variety?.trim() || null,
        planting_date: planting_date || null,
        expected_harvest_date: expected_harvest_date || null,
        actual_harvest_date: actual_harvest_date || null,
        status: status || undefined,
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select(`
        *,
        fields (
          id,
          field_name,
          area_hectares
        )
      `)
      .single()

    if (updateError) {
      console.error("Error updating crop cycle:", updateError)
      return NextResponse.json({ error: "Failed to update crop cycle" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      crop_cycle: updatedCycle
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

    // Verify ownership
    const { data: cropCycle } = await supabase
      .from("crop_cycles")
      .select(`
        id,
        fields!inner (
          farmer_id
        )
      `)
      .eq("id", params.id)
      .eq("fields.farmer_id", userId)
      .single()

    if (!cropCycle) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 })
    }

    // Delete the crop cycle (cascade will handle field_activities)
    const { error } = await supabase
      .from("crop_cycles")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting crop cycle:", error)
      return NextResponse.json({ error: "Failed to delete crop cycle" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Crop cycle deleted successfully"
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}