import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district")
    const crop = searchParams.get("crop")
    const severity = searchParams.get("severity")

    const supabase = await createClient()
    let query = supabase.from("cropsap_alerts").select("*").order("reported_on", { ascending: false }).limit(100)

    if (district) {
      query = query.ilike("district", `%${district}%`)
    }

    if (crop) {
      query = query.ilike("crop", `%${crop}%`)
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    const { data, error } = await query

    if (error) {
      console.error("CROPSAP fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    return NextResponse.json({ success: true, alerts: data })
  } catch (error) {
    console.error("CROPSAP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

