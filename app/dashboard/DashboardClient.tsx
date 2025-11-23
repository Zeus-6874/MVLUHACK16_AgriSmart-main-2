"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  IndianRupee,
  Loader2,
  Plus,
  Settings,
  Sprout,
  TrendingUp,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import CropCard from "@/components/CropCard"
import WeatherWidget from "@/components/WeatherWidget"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface MarketPrice {
  crop_name: string
  price_per_kg: number
  market_name: string
  date: string
}

interface WeatherData {
  location: string
  temperature: number
  humidity: number
  weather_condition: string
  windSpeed?: number
}

interface CROPSAPAlert {
  id: string
  district?: string
  taluka?: string
  village?: string
  crop: string
  pest?: string
  disease?: string
  severity?: string
  advisory?: string
  reported_on?: string
}

interface DistrictStat {
  id: string
  district: string
  taluka?: string
  crop?: string
  area_ha?: number
  production_mt?: number
  yield_mt_per_ha?: number
  rainfall_mm?: number
  irrigation_coverage_percent?: number
  recorded_year?: number
}

interface DashboardClientProps {
  profile: any
  clerkUser: any
}

export default function DashboardClient({ profile }: DashboardClientProps) {
  const { language, t } = useI18n()
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [cropsapAlerts, setCropsapAlerts] = useState<CROPSAPAlert[]>([])
  const [districtStats, setDistrictStats] = useState<DistrictStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    void fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch market prices
      const pricesResponse = await fetch("/api/prices")
      const pricesData = await pricesResponse.json()
      if (pricesData.success) {
        setMarketPrices(pricesData.prices.slice(0, 4))
      }

      // Fetch weather data
      const location = profile?.location || "Delhi"
      const weatherResponse = await fetch(`/api/weather?location=${encodeURIComponent(location)}`)
      const weatherPayload = await weatherResponse.json()
      if (weatherPayload.success) {
        setWeatherData(weatherPayload.current || weatherPayload.weather || null)
      }

      // Fetch CROPSAP alerts - filter by user's district if available
      const district = profile?.location ? extractDistrict(profile.location) : null
      const cropsapUrl = district ? `/api/cropsap?district=${encodeURIComponent(district)}&limit=5` : "/api/cropsap?limit=5"
      const cropsapResponse = await fetch(cropsapUrl)
      const cropsapData = await cropsapResponse.json()
      if (cropsapData.success && cropsapData.alerts) {
        setCropsapAlerts(cropsapData.alerts)
      }

      // Fetch district statistics - filter by user's district if available
      const statsUrl = district ? `/api/district-stats?district=${encodeURIComponent(district)}&limit=50` : "/api/district-stats?limit=50"
      const statsResponse = await fetch(statsUrl)
      const statsData = await statsResponse.json()
      if (statsData.success && statsData.stats) {
        setDistrictStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: t("common.error"),
        description: language === "hi" ? "डेटा लोड करने में त्रुटि" : "Error loading dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to extract district from location string
  const extractDistrict = (location: string): string | null => {
    if (!location) return null
    // Common Maharashtra districts
    const districts = [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Solapur",
      "Amravati",
      "Kolhapur",
      "Sangli",
      "Satara",
      "Jalgaon",
      "Akola",
      "Latur",
      "Ahmednagar",
      "Chandrapur",
      "Parbhani",
      "Ichalkaranji",
      "Jalna",
      "Bhusawal",
      "Panvel",
      "Satara",
      "Beed",
      "Yavatmal",
      "Kamptee",
      "Gondia",
      "Barshi",
      "Achalpur",
      "Osmanabad",
      "Nandurbar",
      "Wardha",
    ]
    for (const district of districts) {
      if (location.toLowerCase().includes(district.toLowerCase())) {
        return district
      }
    }
    return null
  }

  // Calculate KPIs from real district statistics
  const calculateKPIs = () => {
    if (districtStats.length === 0) {
      return {
        totalArea: profile?.land_size ? `${profile.land_size}` : "0",
        activeCrops: "0",
        avgYield: "0",
        avgRainfall: "0",
      }
    }

    const latestYear = Math.max(...districtStats.map((s) => s.recorded_year || 0))
    const latestStats = districtStats.filter((s) => s.recorded_year === latestYear)

    const totalArea = latestStats.reduce((sum, s) => sum + (Number(s.area_ha) || 0), 0)
    const uniqueCrops = new Set(latestStats.map((s) => s.crop).filter(Boolean))
    const avgYield = latestStats.length > 0
      ? latestStats.reduce((sum, s) => sum + (Number(s.yield_mt_per_ha) || 0), 0) / latestStats.length
      : 0
    const avgRainfall = latestStats.length > 0
      ? latestStats.reduce((sum, s) => sum + (Number(s.rainfall_mm) || 0), 0) / latestStats.length
      : 0

    return {
      totalArea: totalArea > 0 ? totalArea.toFixed(1) : profile?.land_size ? `${profile.land_size}` : "0",
      activeCrops: uniqueCrops.size.toString(),
      avgYield: avgYield > 0 ? avgYield.toFixed(1) : "0",
      avgRainfall: avgRainfall > 0 ? avgRainfall.toFixed(0) : "0",
    }
  }

  const kpis = calculateKPIs()

  const quickStats = [
    {
      title: t("dashboard.totalArea"),
      value: kpis.totalArea,
      unit: language === "hi" ? "हेक्टेयर" : "hectares",
      icon: <Sprout className="h-5 w-5 text-green-600" />,
      trend: districtStats.length > 0 ? "📊" : "",
    },
    {
      title: t("dashboard.activeCrops"),
      value: kpis.activeCrops,
      unit: language === "hi" ? "फसलें" : "crops",
      icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
      trend: districtStats.length > 0 ? "📈" : "",
    },
    {
      title: language === "hi" ? "औसत उपज" : "Avg Yield",
      value: kpis.avgYield,
      unit: language === "hi" ? "टन/हेक्टेयर" : "t/ha",
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
      trend: districtStats.length > 0 ? "📊" : "",
    },
    {
      title: language === "hi" ? "औसत वर्षा" : "Avg Rainfall",
      value: kpis.avgRainfall,
      unit: language === "hi" ? "मिमी" : "mm",
      icon: <IndianRupee className="h-5 w-5 text-orange-600" />,
      trend: districtStats.length > 0 ? "🌧️" : "",
    },
  ]

  const activeCrops = [
    {
      id: 1,
      name: language === "hi" ? "गेहूं" : "Wheat",
      area: 5.2,
      health: 92,
      daysToHarvest: 45,
      expectedYield: 2800,
      image: "/golden-wheat-field.png",
    },
    {
      id: 2,
      name: language === "hi" ? "मक्का" : "Corn",
      area: 3.8,
      health: 88,
      daysToHarvest: 62,
      expectedYield: 3200,
      image: "/endless-cornfield.png",
    },
    {
      id: 3,
      name: language === "hi" ? "टमाटर" : "Tomato",
      area: 2.1,
      health: 95,
      daysToHarvest: 28,
      expectedYield: 1500,
      image: "/vibrant-tomato-plants.png",
    },
    {
      id: 4,
      name: language === "hi" ? "प्याज" : "Onion",
      area: 1.4,
      health: 78,
      daysToHarvest: 85,
      expectedYield: 900,
      image: "/onion-field.jpg",
    },
  ]

  interface AlertDisplay {
    type: string
    titleEn: string
    titleHi: string
    descEn: string
    descHi: string
    severity?: string
    reportedDate?: string
  }

  // Convert CROPSAP alerts to display format
  const alerts: AlertDisplay[] = cropsapAlerts.length > 0
    ? cropsapAlerts.slice(0, 5).map((alert) => {
        const severity = alert.severity?.toLowerCase() || "info"
        const alertType = severity.includes("high") || severity.includes("critical") ? "error" : severity.includes("medium") ? "warning" : "info"
        const cropName = alert.crop || "Crop"
        const issue = alert.pest || alert.disease || "Issue detected"
        const location = [alert.district, alert.taluka, alert.village].filter(Boolean).join(", ") || "Your region"
        const advisory = alert.advisory || ""

        return {
          type: alertType,
          titleEn: `${cropName} Alert`,
          titleHi: `${cropName} चेतावनी`,
          descEn: `${issue} detected in ${location}. ${advisory}`.trim(),
          descHi: `${location} में ${issue} पाया गया। ${advisory}`.trim(),
          severity: alert.severity,
          reportedDate: alert.reported_on,
        }
      })
    : weatherData
      ? [
          {
            type: "info",
            titleEn: "Weather Alert",
            titleHi: "मौसम चेतावनी",
            descEn: `${weatherData.weather_condition} - ${weatherData.temperature}°C`,
            descHi: `${weatherData.weather_condition} - ${weatherData.temperature}°C`,
          },
        ]
      : []

  const upcomingTasks = [
    {
      titleEn: "Apply fertilizer to corn field",
      titleHi: "मक्का के खेत में उर्वरक डालें",
      date: "2024-01-15",
      priority: "high",
    },
    {
      titleEn: "Harvest tomatoes",
      titleHi: "टमाटर की कटाई करें",
      date: "2024-01-18",
      priority: "medium",
    },
    {
      titleEn: "Soil testing for onion field",
      titleHi: "प्याज के खेत के लिए मिट्टी परीक्षण",
      date: "2024-01-20",
      priority: "low",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.title")}</h1>
            <p className="mt-1 text-gray-600">
              {profile?.full_name ? `${t("dashboard.subtitle")} – ${profile.full_name}` : t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-50">
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("dashboard.settings")}
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("dashboard.addCrop")}
            </Button>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.title} role="region" aria-label={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.unit}</p>
                    </div>
                    <p className="text-xs font-medium text-green-600">{stat.trend}</p>
                  </div>
                  <div className="rounded-full bg-gray-50 p-3" aria-hidden="true">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sprout className="h-5 w-5 text-green-600" aria-hidden="true" />
                  <span>{language === "hi" ? "सक्रिय फसलें" : "Active Crops"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activeCrops.map((crop) => (
                    <CropCard key={crop.id} crop={crop} language={language} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5 text-green-600" aria-hidden="true" />
                    <span>{language === "hi" ? "आज के बाजार भाव" : "Today's Market Prices"}</span>
                  </div>
                  <Link href="/market-prices">
                    <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-50">
                      {language === "hi" ? "सभी देखें" : "View All"}
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" aria-hidden="true" />
                    <span className="sr-only">Loading market prices...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {marketPrices.map((price) => (
                      <div
                        key={`${price.crop_name}-${price.market_name}`}
                        className="flex items-center justify-between rounded-lg bg-green-50 p-4"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{price.crop_name}</h4>
                          <p className="text-sm text-gray-600">{price.market_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">₹{price.price_per_kg}/kg</p>
                          <p className="text-xs text-gray-500">{new Date(price.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" aria-hidden="true" />
                  <span>{language === "hi" ? "अलर्ट" : "Alerts"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" aria-hidden="true" />
                    <span className="sr-only">Loading alerts...</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {language === "hi" ? "कोई अलर्ट नहीं" : "No alerts at this time"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert, index) => {
                      const bgColor =
                        alert.type === "error"
                          ? "bg-red-50"
                          : alert.type === "warning"
                            ? "bg-orange-50"
                            : "bg-blue-50"
                      const iconColor =
                        alert.type === "error"
                          ? "text-red-600"
                          : alert.type === "warning"
                            ? "text-orange-600"
                            : "text-blue-600"

                      return (
                        <div key={`${alert.titleEn}-${index}`} className={`flex items-start space-x-3 rounded-lg ${bgColor} p-4`}>
                          <AlertTriangle className={`mt-0.5 h-5 w-5 ${iconColor}`} aria-hidden="true" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{language === "hi" ? alert.titleHi : alert.titleEn}</h4>
                              {"severity" in alert && alert.severity && (
                                <span className="text-xs font-medium text-gray-500 uppercase">{alert.severity}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{language === "hi" ? alert.descHi : alert.descEn}</p>
                            {"reportedDate" in alert && alert.reportedDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {language === "hi" ? "रिपोर्ट की तारीख" : "Reported"}: {new Date(alert.reportedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <WeatherWidget language={language} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  <span>{language === "hi" ? "आगामी कार्य" : "Upcoming Tasks"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.titleEn} className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{language === "hi" ? task.titleHi : task.titleEn}</p>
                        <p className="text-xs text-gray-500">{task.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "त्वरित कार्य" : "Quick Actions"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/soil-health">
                    <Button variant="outline" className="w-full justify-start bg-white text-gray-900 hover:bg-gray-50">
                      <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                      {language === "hi" ? "मिट्टी परीक्षण" : "Soil Analysis"}
                    </Button>
                  </Link>
                  <Link href="/disease-detection">
                    <Button variant="outline" className="w-full justify-start bg-white text-gray-900 hover:bg-gray-50">
                      <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" />
                      {language === "hi" ? "रोग पहचान" : "Disease Detection"}
                    </Button>
                  </Link>
                  <Link href="/market-prices">
                    <Button variant="outline" className="w-full justify-start bg-white text-gray-900 hover:bg-gray-50">
                      <TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
                      {language === "hi" ? "बाजार मूल्य देखें" : "View Market Prices"}
                    </Button>
                  </Link>
                  <Link href="/encyclopedia">
                    <Button variant="outline" className="w-full justify-start bg-white text-gray-900 hover:bg-gray-50">
                      <Sprout className="mr-2 h-4 w-4" aria-hidden="true" />
                      {language === "hi" ? "फसल विश्वकोश" : "Crop Encyclopedia"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

