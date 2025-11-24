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
      .select("*")
      .order("arrival_date", { ascending: false })

    if (crop) {
      query = query.ilike("commodity", `%${crop}%`)
    }

    if (state) {
      query = query.ilike("state", `%${state}%`)
    }

    const { data: pricesData, error } = await query.limit(limit)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch market prices" }, { status: 500 })
    }

    // Calculate trends from price history
    const processedPrices =
      pricesData?.map((price, index, array) => {
        // Find previous price for same crop to calculate trend
        const previousPrice = array
          .slice(index + 1)
          .find((p) => p.commodity === price.commodity && p.market_name === price.market_name)

        let trend = "stable"
        let changePercent = 0

        if (previousPrice) {
          const currentPrice = price.modal_price || 0
          const prevPrice = previousPrice.modal_price || 0

          if (prevPrice > 0) {
            changePercent = ((currentPrice - prevPrice) / prevPrice) * 100
            trend = changePercent > 2 ? "up" : changePercent < -2 ? "down" : "stable"
          }
        }

        return {
          ...price,
          trend,
          change_percent: Number.parseFloat(changePercent.toFixed(1)),
          change_amount: Math.round((price.modal_price || 0) * (changePercent / 100)),
        }
      }) || []

    // Group prices by commodity for better organization
    const groupedPrices = processedPrices.reduce((acc: any, price: any) => {
      const commodityName = price.commodity
      if (!acc[commodityName]) {
        acc[commodityName] = []
      }
      acc[commodityName].push(price)
      return acc
    }, {})

    const marketStats = {
      total_crops: Object.keys(groupedPrices).length,
      price_increases: processedPrices.filter((p) => p.trend === "up").length,
      price_decreases: processedPrices.filter((p) => p.trend === "down").length,
      avg_price:
        processedPrices.length > 0
          ? Math.round(processedPrices.reduce((sum, p) => sum + (p.modal_price || 0), 0) / processedPrices.length)
          : 0,
      highest_price: processedPrices.length > 0 ? Math.max(...processedPrices.map((p) => p.modal_price || 0)) : 0,
      lowest_price: processedPrices.length > 0 ? Math.min(...processedPrices.map((p) => p.modal_price || 0)) : 0,
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
