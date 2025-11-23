"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/Navbar"
import CropCard from "@/components/CropCard"
import { CROP_SEASONS } from "@/lib/constants"
import { Sprout, Plus, Calendar, TrendingUp, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export default function CropManagement() {
  const { language, t } = useI18n()
  const [selectedSeason, setSelectedSeason] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [crops, setCrops] = useState<any[]>([])

  useEffect(() => {
    // Fetch crops from encyclopedia API
    const fetchCrops = async () => {
      try {
        const response = await fetch("/api/encyclopedia")
        const data = await response.json()
        if (data.success && data.crops) {
          // Convert encyclopedia crops to display format
          const convertedCrops = data.crops.slice(0, 8).map((crop: any, index: number) => ({
            id: crop.id || index,
            name: crop.crop_name || crop.common_name || "Unknown",
            area: 0, // User's crop area would come from their profile/farm data
            health: 85, // Default health
            daysToHarvest: 60, // Default
            expectedYield: 0,
            image: crop.image_url || "/placeholder.jpg",
            season: crop.planting_season || "all",
            status: "Growing", // Default status
          }))
          setCrops(convertedCrops)
        }
      } catch (error) {
        console.error("Error fetching crops:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrops()
  }, [])

  const filteredCrops = crops.filter((crop) => {
    const seasonMatch = selectedSeason === "all" || crop.season === selectedSeason
    const statusMatch = selectedStatus === "all" || crop.status.toLowerCase() === selectedStatus
    return seasonMatch && statusMatch
  })

  const cropStats = {
    total: crops.length,
    growing: crops.filter((c) => c.status === "Growing").length,
    harvested: crops.filter((c) => c.status === "Harvested").length,
    totalArea: crops.reduce((sum, c) => sum + c.area, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "hi" ? "फसल प्रबंधन" : "Crop Management"}
          </h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "अपनी फसलों की निगरानी करें और नई फसल के सुझाव प्राप्त करें"
              : "Monitor your crops and get new crop recommendations"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{cropStats.total}</div>
              <div className="text-sm text-gray-600">{language === "hi" ? "कुल फसलें" : "Total Crops"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{cropStats.growing}</div>
              <div className="text-sm text-gray-600">{language === "hi" ? "बढ़ रही हैं" : "Growing"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{cropStats.harvested}</div>
              <div className="text-sm text-gray-600">{language === "hi" ? "कटाई हो गई" : "Harvested"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{cropStats.totalArea}</div>
              <div className="text-sm text-gray-600">{language === "hi" ? "कुल एकड़" : "Total Acres"}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-green-600" />
                    {language === "hi" ? "मेरी फसलें" : "My Crops"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={language === "hi" ? "सीजन" : "Season"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "hi" ? "सभी सीजन" : "All Seasons"}</SelectItem>
                        {Object.entries(CROP_SEASONS).map(([key, season]) => (
                          <SelectItem key={key} value={key}>
                            {language === "hi" ? season.labelHi : season.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "hi" ? "नई फसल" : "Add Crop"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  </div>
                ) : filteredCrops.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {language === "hi" ? "कोई फसल नहीं मिली" : "No crops found"}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredCrops.map((crop) => (
                      <CropCard key={crop.id} crop={crop} language={language} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "त्वरित कार्य" : "Quick Actions"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  {language === "hi" ? "सिंचाई शेड्यूल करें" : "Schedule Irrigation"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Sprout className="h-4 w-4 mr-2" />
                  {language === "hi" ? "फसल स्वास्थ्य जांचें" : "Check Crop Health"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {language === "hi" ? "उत्पादन रिपोर्ट" : "Yield Report"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
