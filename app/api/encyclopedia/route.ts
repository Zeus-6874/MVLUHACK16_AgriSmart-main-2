import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const crop = searchParams.get("crop")

    const supabase = await createClient()

    let query = supabase.from("encyclopedia").select("*").order("crop_name")

    if (search) {
      query = query.or(`crop_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (crop) {
      query = query.eq("crop_name", crop)
    }

    const { data: encyclopediaData, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch encyclopedia data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      crops: encyclopediaData || [],
      total: encyclopediaData?.length || 0,
      filters: { search, crop },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
