import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch all fields for the authenticated farmer
    const { data: fields, error } = await supabase
      .from("fields")
      .select(`
        *,
        crop_cycles (
          id,
          crop_name,
          variety,
          planting_date,
          expected_harvest_date,
          status
        )
      `)
      .eq("farmer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching fields:", error)
      return NextResponse.json({ error: "Failed to fetch fields" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fields: fields || [],
      total: fields?.length || 0
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

    // Create the field
    const { data: field, error } = await supabase
      .from("fields")
      .insert({
        farmer_id: userId,
        field_name: field_name.trim(),
        area_hectares: parseFloat(area_hectares),
        coordinates: coordinates || null,
        soil_type: soil_type || null,
        irrigation_type: irrigation_type || null
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating field:", error)
      return NextResponse.json({ error: "Failed to create field" }, { status: 500 })
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