"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { TrendingUp, TrendingDown, IndianRupee, BarChart3, RefreshCw, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { useToast } from "@/hooks/use-toast"

interface MarketPrice {
  crop: string
  cropHi: string
  price: number
  unit: string
  trend: "up" | "down"
  change: number
  market: string
  lastUpdated: string
}

export default function MarketPrices() {
  const { language, t } = useI18n()
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchMarketPrices = async () => {
    try {
      const response = await fetch("/api/market-prices")
      const data = await response.json()

      if (data.success) {
        setPrices(data.prices)
      } else {
        throw new Error(data.error || "Failed to fetch prices")
      }
    } catch (error) {
      console.error("Error fetching market prices:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "बाजार मूल्य लोड करने में त्रुटि" : "Error loading market prices",
        variant: "destructive",
      })
      setPrices([
        {
          crop: "Rice",
          cropHi: "चावल",
          price: 3200,
          unit: "per quintal",
          trend: "up",
          change: 2.5,
          market: "Delhi Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
        {
          crop: "Wheat",
          cropHi: "गेहूं",
          price: 2150,
          unit: "per quintal",
          trend: "up",
          change: 1.8,
          market: "Punjab Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
        {
          crop: "Maize",
          cropHi: "मक्का",
          price: 1800,
          unit: "per quintal",
          trend: "down",
          change: -1.2,
          market: "UP Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
        {
          crop: "Cotton",
          cropHi: "कपास",
          price: 5600,
          unit: "per quintal",
          trend: "up",
          change: 3.2,
          market: "Gujarat Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
        {
          crop: "Sugarcane",
          cropHi: "गन्ना",
          price: 350,
          unit: "per quintal",
          trend: "up",
          change: 0.8,
          market: "Maharashtra Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
        {
          crop: "Tomato",
          cropHi: "टमाटर",
          price: 4500,
          unit: "per quintal",
          trend: "down",
          change: -5.2,
          market: "Karnataka Mandi",
          lastUpdated: new Date().toLocaleString(),
        },
      ])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMarketPrices()
    toast({
      title: language === "hi" ? "अपडेट हो गया" : "Updated",
      description: language === "hi" ? "बाजार मूल्य अपडेट हो गए हैं" : "Market prices have been updated",
    })
  }

  useEffect(() => {
    fetchMarketPrices()
    const interval = setInterval(fetchMarketPrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "hi" ? "बाजार मूल्य" : "Market Prices"}
            </h1>
            <p className="text-gray-600">
              {language === "hi" ? "वर्तमान बाजार मूल्य और रुझान देखें" : "View current market prices and trends"}
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {language === "hi" ? "रिफ्रेश करें" : "Refresh"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              {language === "hi" ? "आज के मूल्य" : "Today's Prices"}
              <Badge variant="secondary" className="ml-auto">
                {language === "hi" ? "लाइव" : "Live"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {prices.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{language === "hi" ? item.cropHi : item.crop}</h3>
                      <p className="text-sm text-gray-500">{item.unit}</p>
                      <p className="text-xs text-gray-400">{item.market}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-xl font-bold">₹{item.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        {item.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={item.trend === "up" ? "default" : "destructive"} className="text-xs">
                          {item.change > 0 ? "+" : ""}
                          {item.change}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {language === "hi" ? "अपडेट:" : "Updated:"} {new Date(item.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{language === "hi" ? "बढ़ते मूल्य" : "Rising Prices"}</p>
                  <p className="text-xs text-gray-500">
                    {prices.filter((p) => p.trend === "up").length} {language === "hi" ? "फसलें" : "crops"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">{language === "hi" ? "गिरते मूल्य" : "Falling Prices"}</p>
                  <p className="text-xs text-gray-500">
                    {prices.filter((p) => p.trend === "down").length} {language === "hi" ? "फसलें" : "crops"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{language === "hi" ? "औसत वृद्धि" : "Average Growth"}</p>
                  <p className="text-xs text-gray-500">
                    {(prices.reduce((acc, p) => acc + p.change, 0) / prices.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
