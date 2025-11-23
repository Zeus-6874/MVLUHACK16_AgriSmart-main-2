import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const crop = searchParams.get("crop")
    const state = searchParams.get("state")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const supabase = await createClient()

    let query = supabase
      .from("market_prices")
      .select(`
        *,
        crop_varieties (
          variety_name,
          quality_grade
        )
      `)
      .order("date", { ascending: false })

    if (crop) {
      query = query.ilike("crop_name", `%${crop}%`)
    }

    if (state) {
      query = query.ilike("state", `%${state}%`)
    }

    const { data: pricesData, error } = await query.limit(limit)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch market prices" }, { status: 500 })
    }

    // Calculate real trends from price history
    const processedPrices =
      pricesData?.map((price, index, array) => {
        // Find previous price for same crop to calculate trend
        const previousPrice = array
          .slice(index + 1)
          .find((p) => p.crop_name === price.crop_name || p.commodity === price.commodity)
        
        let trend = "stable"
        let changePercent = 0
        
        if (previousPrice) {
          const currentPrice = price.modal_price || price.max_price || price.min_price || 0
          const prevPrice = previousPrice.modal_price || previousPrice.max_price || previousPrice.min_price || 0
          
          if (prevPrice > 0) {
            changePercent = ((currentPrice - prevPrice) / prevPrice) * 100
            trend = changePercent > 2 ? "up" : changePercent < -2 ? "down" : "stable"
          }
        }

        return {
          ...price,
          trend,
          change_percent: Number.parseFloat(changePercent.toFixed(1)),
          change_amount: Math.round((price.modal_price || price.max_price || 0) * (changePercent / 100)),
        }
      }) || []

    // Group prices by crop for better organization
    const groupedPrices = processedPrices.reduce((acc: any, price: any) => {
      const cropName = price.crop_name
      if (!acc[cropName]) {
        acc[cropName] = []
      }
      acc[cropName].push(price)
      return acc
    }, {})

    const marketStats = {
      total_crops: Object.keys(groupedPrices).length,
      price_increases: processedPrices.filter((p) => p.trend === "up").length,
      price_decreases: processedPrices.filter((p) => p.trend === "down").length,
      avg_price:
        processedPrices.length > 0
          ? Math.round(processedPrices.reduce((sum, p) => sum + p.price_per_quintal, 0) / processedPrices.length)
          : 0,
      highest_price: processedPrices.length > 0 ? Math.max(...processedPrices.map((p) => p.price_per_quintal)) : 0,
      lowest_price: processedPrices.length > 0 ? Math.min(...processedPrices.map((p) => p.price_per_quintal)) : 0,
    }

    return NextResponse.json({
      success: true,
      prices: processedPrices,
      grouped_prices: groupedPrices,
      market_stats: marketStats,
      filters: { crop, state, limit },
      source: "database",
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Market Prices API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
