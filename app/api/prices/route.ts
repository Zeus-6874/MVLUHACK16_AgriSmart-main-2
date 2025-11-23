import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const crop = searchParams.get("crop")
    const state = searchParams.get("state")

    const supabase = await createClient()

    let query = supabase.from("market_prices").select("*").order("date", { ascending: false })

    if (crop) {
      query = query.ilike("crop_name", `%${crop}%`)
    }

    if (state) {
      query = query.ilike("state", `%${state}%`)
    }

    const { data: pricesData, error } = await query.limit(50)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch market prices" }, { status: 500 })
    }

    // Group prices by crop for better organization
    const groupedPrices = pricesData?.reduce((acc: any, price: any) => {
      const cropName = price.crop_name
      if (!acc[cropName]) {
        acc[cropName] = []
      }
      acc[cropName].push(price)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      prices: pricesData || [],
      grouped_prices: groupedPrices || {},
      filters: { crop, state },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
