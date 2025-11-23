import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

function assertAdmin(userId?: string | null) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
  if (!userId) throw new Error("UNAUTHORIZED")
  if (adminIds.length > 0 && !adminIds.includes(userId)) throw new Error("FORBIDDEN")
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    assertAdmin(userId)

    const payload = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("crops")
      .insert({
        common_name: payload.common_name,
        local_name: payload.local_name,
        scientific_name: payload.scientific_name,
        category_id: payload.category_id,
        climate: payload.climate,
        soil_type: payload.soil_type,
        optimal_ph_range: payload.optimal_ph_range,
        water_requirements: payload.water_requirements,
        fertilizer_requirements: payload.fertilizer_requirements,
        planting_season: payload.planting_season,
        harvest_time: payload.harvest_time,
        average_yield: payload.average_yield,
        diseases: payload.diseases,
        disease_management: payload.disease_management,
        market_demand: payload.market_demand,
        image_url: payload.image_url,
        source: payload.source,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create crop", error)
      return NextResponse.json({ error: "Failed to create crop" }, { status: 500 })
    }

    return NextResponse.json({ success: true, crop: data })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    console.error("Admin crop create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

