import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get("state")
    const category = searchParams.get("category")

    const supabase = await createClient()

    let query = supabase.from("schemes").select("*").eq("is_active", true).order("scheme_name")

    if (state && state !== "All India") {
      query = query.or(`state.eq.${state},state.eq.All India`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data: schemesData, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch schemes data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      schemes: schemesData || [],
      total: schemesData?.length || 0,
      filters: { state, category },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
