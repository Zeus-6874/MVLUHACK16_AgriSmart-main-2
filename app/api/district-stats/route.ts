import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district")
    const taluka = searchParams.get("taluka")
    const crop = searchParams.get("crop")
    const year = searchParams.get("year")
    const limit = parseInt(searchParams.get("limit") || "100")

    const supabase = await createClient()
    let query = supabase
      .from("district_statistics")
      .select("*")
      .order("recorded_year", { ascending: false })
      .order("district", { ascending: true })
      .limit(limit)

    if (district) {
      query = query.ilike("district", `%${district}%`)
    }

    if (taluka) {
      query = query.ilike("taluka", `%${taluka}%`)
    }

    if (crop) {
      query = query.ilike("crop", `%${crop}%`)
    }

    if (year) {
      const yearNum = parseInt(year)
      if (!isNaN(yearNum)) {
        query = query.eq("recorded_year", yearNum)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("District stats fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch district statistics" }, { status: 500 })
    }

    // Calculate aggregate statistics if multiple records
    const aggregates = data
      ? {
          totalArea: data.reduce((sum, r) => sum + (Number(r.area_ha) || 0), 0),
          totalProduction: data.reduce((sum, r) => sum + (Number(r.production_mt) || 0), 0),
          avgYield: data.length > 0 ? data.reduce((sum, r) => sum + (Number(r.yield_mt_per_ha) || 0), 0) / data.length : 0,
          avgRainfall: data.length > 0 ? data.reduce((sum, r) => sum + (Number(r.rainfall_mm) || 0), 0) / data.length : 0,
          avgIrrigationCoverage:
            data.length > 0 ? data.reduce((sum, r) => sum + (Number(r.irrigation_coverage_percent) || 0), 0) / data.length : 0,
        }
      : null

    return NextResponse.json({
      success: true,
      stats: data,
      aggregates,
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("District stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


