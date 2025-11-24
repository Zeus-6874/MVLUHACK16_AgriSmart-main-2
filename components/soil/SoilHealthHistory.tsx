"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Activity, Droplets, Flame } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface SoilAnalysis {
  id: string
  nitrogen_level: number
  phosphorus_level: number
  potassium_level: number
  ph_level: number
  organic_matter?: number
  analysis_date: string
  created_at: string
}

interface SoilHealthHistoryProps {
  farmerId: string
  analyses: SoilAnalysis[]
  latestAnalysis?: SoilAnalysis
}

export default function SoilHealthHistory({ farmerId, analyses, latestAnalysis }: SoilHealthHistoryProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("1year")

  const getChartData = () => {
    return analyses
      .sort((a, b) => new Date(a.analysis_date).getTime() - new Date(b.analysis_date).getTime())
      .map(analysis => ({
        date: new Date(analysis.analysis_date).toLocaleDateString(),
        nitrogen: analysis.nitrogen_level,
        phosphorus: analysis.phosphorus_level,
        potassium: analysis.potassium_level,
        ph: analysis.ph_level,
        organic: analysis.organic_matter || 0,
        healthScore: calculateHealthScore(analysis)
      }))
  }

  const calculateHealthScore = (analysis: SoilAnalysis): number => {
    let score = 100

    if (analysis.nitrogen_level < 150) score -= 15
    else if (analysis.nitrogen_level > 400) score -= 10

    if (analysis.phosphorus_level < 15) score -= 20
    else if (analysis.phosphorus_level > 50) score -= 5

    if (analysis.potassium_level < 120) score -= 15
    else if (analysis.potassium_level > 300) score -= 5

    if (analysis.ph_level < 5.5) score -= 25
    else if (analysis.ph_level > 8.5) score -= 20
    else if (analysis.ph_level < 6.0 || analysis.ph_level > 8.0) score -= 10

    if (analysis.organic_matter && analysis.organic_matter < 2) score -= 10

    return Math.max(0, Math.round(score))
  }

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return "neutral"
    const change = ((current - previous) / previous) * 100
    return change > 5 ? "improving" : change < -5 ? "declining" : "stable"
  }

  const getLatestTrend = (nutrient: keyof SoilAnalysis) => {
    if (analyses.length < 2) return { trend: "neutral", change: 0 }

    const sorted = [...analyses].sort((a, b) =>
      new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
    )

    const current = sorted[0][nutrient] as number
    const previous = sorted[1][nutrient] as number
    const trend = getTrend(current, previous)
    const change = ((current - previous) / previous) * 100

    return { trend, change }
  }

  const getNutrientStatus = (value: number, type: string) => {
    const ranges = {
      nitrogen: { min: 150, max: 400, optimal: 250 },
      phosphorus: { min: 15, max: 50, optimal: 30 },
      potassium: { min: 120, max: 300, optimal: 200 },
      ph: { min: 6.0, max: 8.0, optimal: 7.0 }
    }

    const range = ranges[type as keyof typeof ranges]
    if (!range) return "normal"

    if (value < range.min) return "deficient"
    if (value > range.max) return "excessive"
    return "optimal"
  }

  const getNutrientColor = (status: string) => {
    switch (status) {
      case "deficient": return "text-red-600"
      case "excessive": return "text-orange-600"
      case "optimal": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getNutrientIcon = (status: string) => {
    switch (status) {
      case "deficient": return <TrendingDown className="h-4 w-4" />
      case "excessive": return <TrendingUp className="h-4 w-4" />
      case "optimal": return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const exportData = async () => {
    try {
      const csvContent = [
        ["Date", "Nitrogen (kg/ha)", "Phosphorus (kg/ha)", "Potassium (kg/ha)", "pH", "Organic Matter (%)", "Health Score"],
        ...analyses.map(analysis => [
          analysis.analysis_date,
          analysis.nitrogen_level,
          analysis.phosphorus_level,
          analysis.potassium_level,
          analysis.ph_level,
          analysis.organic_matter || 0,
          calculateHealthScore(analysis)
        ])
      ].map(row => row.join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `soil-health-history-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: language === "hi" ? "डेटा निर्यात" : "Export Complete",
        description: language === "hi" ? "मिट्टी स्वास्थ्य इतिहास निर्यात किया गया" : "Soil health history exported successfully"
      })
    } catch (error) {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "निर्यात में त्रुटि" : "Failed to export data",
        variant: "destructive"
      })
    }
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === "hi" ? "कोई इतिहास नहीं" : "No History Available"}
        </h3>
        <p className="text-gray-600 mb-6">
          {language === "hi"
            ? "अपने मिट्टी स्वास्थ्य इतिहास देखने के लिए पहले मिट्टी विश्लेषण करें"
            : "Start analyzing your soil to see health trends and improvements over time"}
        </p>
        <Button onClick={() => window.location.href = "/soil-health"}>
          {language === "hi" ? "मिट्टी विश्लेषण करें" : "Analyze Soil"}
        </Button>
      </div>
    )
  }

  const chartData = getChartData()
  const nitrogenTrend = getLatestTrend("nitrogen_level")
  const phosphorusTrend = getLatestTrend("phosphorus_level")
  const potassiumTrend = getLatestTrend("potassium_level")
  const phTrend = getLatestTrend("ph_level")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {language === "hi" ? "मिट्टी स्वास्थ्य इतिहास" : "Soil Health History"}
        </h3>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportData}>
            {language === "hi" ? "निर्यात करें" : "Export Data"}
          </Button>
        </div>
      </div>

      {/* Current Status Cards */}
      {latestAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "नाइट्रोजन (N)" : "Nitrogen (N)"}
                </span>
                <div className={`flex items-center gap-1 ${getNutrientColor(getNutrientStatus(latestAnalysis.nitrogen_level, "nitrogen"))}`}>
                  {getNutrientIcon(getNutrientStatus(latestAnalysis.nitrogen_level, "nitrogen"))}
                  <span className="text-xs">
                    {nitrogenTrend.trend === "improving" ? "+" : nitrogenTrend.trend === "declining" ? "-" : ""}
                    {Math.abs(nitrogenTrend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{latestAnalysis.nitrogen_level}</p>
              <p className="text-xs text-gray-500">kg/ha</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "फॉस्फोरस (P)" : "Phosphorus (P)"}
                </span>
                <div className={`flex items-center gap-1 ${getNutrientColor(getNutrientStatus(latestAnalysis.phosphorus_level, "phosphorus"))}`}>
                  {getNutrientIcon(getNutrientStatus(latestAnalysis.phosphorus_level, "phosphorus"))}
                  <span className="text-xs">
                    {phosphorusTrend.trend === "improving" ? "+" : phosphorusTrend.trend === "declining" ? "-" : ""}
                    {Math.abs(phosphorusTrend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{latestAnalysis.phosphorus_level}</p>
              <p className="text-xs text-gray-500">kg/ha</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "पोटैशियम (K)" : "Potassium (K)"}
                </span>
                <div className={`flex items-center gap-1 ${getNutrientColor(getNutrientStatus(latestAnalysis.potassium_level, "potassium"))}`}>
                  {getNutrientIcon(getNutrientStatus(latestAnalysis.potassium_level, "potassium"))}
                  <span className="text-xs">
                    {potassiumTrend.trend === "improving" ? "+" : potassiumTrend.trend === "declining" ? "-" : ""}
                    {Math.abs(potassiumTrend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{latestAnalysis.potassium_level}</p>
              <p className="text-xs text-gray-500">kg/ha</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">pH</span>
                <div className={`flex items-center gap-1 ${getNutrientColor(getNutrientStatus(latestAnalysis.ph_level, "ph"))}`}>
                  {getNutrientIcon(getNutrientStatus(latestAnalysis.ph_level, "ph"))}
                  <span className="text-xs">
                    {phTrend.trend === "improving" ? "+" : phTrend.trend === "declining" ? "-" : ""}
                    {Math.abs(phTrend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{latestAnalysis.ph_level.toFixed(1)}</p>
              <p className="text-xs text-gray-500">pH level</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "मिट्टी स्वास्थ्य रुझान" : "Soil Health Score Trend"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="healthScore"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Health Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NPK Trends */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "पोषक तत्व रुझान" : "Nutrient Trends"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="nitrogen"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Nitrogen (kg/ha)"
              />
              <Line
                type="monotone"
                dataKey="phosphorus"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Phosphorus (kg/ha)"
              />
              <Line
                type="monotone"
                dataKey="potassium"
                stroke="#ef4444"
                strokeWidth={2}
                name="Potassium (kg/ha)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* pH and Organic Matter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "hi" ? "pH स्तर रुझान" : "pH Level Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 14]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="pH Level"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === "hi" ? "कार्बनिक पदार्थ" : "Organic Matter"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="organic"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Organic Matter (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analysis History Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "विश्लेषण इतिहास" : "Analysis History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.map((analysis, index) => (
              <div key={analysis.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">
                      {language === "hi" ? "विश्लेषण #" : "Analysis #"} {analyses.length - index}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(analysis.analysis_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={
                    calculateHealthScore(analysis) >= 85 ? "bg-green-100 text-green-800" :
                    calculateHealthScore(analysis) >= 70 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    Score: {calculateHealthScore(analysis)}/100
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">N:</span>
                    <p className="font-semibold">{analysis.nitrogen_level} kg/ha</p>
                  </div>
                  <div>
                    <span className="text-gray-600">P:</span>
                    <p className="font-semibold">{analysis.phosphorus_level} kg/ha</p>
                  </div>
                  <div>
                    <span className="text-gray-600">K:</span>
                    <p className="font-semibold">{analysis.potassium_level} kg/ha</p>
                  </div>
                  <div>
                    <span className="text-gray-600">pH:</span>
                    <p className="font-semibold">{analysis.ph_level.toFixed(1)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {language === "hi" ? "कार्बनिक" : "Organic"}:
                    </span>
                    <p className="font-semibold">{analysis.organic_matter || 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}