"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Clock, CheckCircle, AlertCircle, Sprout } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface CropCycle {
  id: string
  field_id: string
  crop_name: string
  variety?: string
  planting_date?: string
  expected_harvest_date?: string
  actual_harvest_date?: string
  status: "planning" | "planted" | "growing" | "harvested"
  notes?: string
  created_at: string
  fields?: {
    id: string
    field_name: string
    area_hectares: number
  }
}

interface CropCalendarProps {
  fieldId?: string
  farmerId: string
}

export default function CropCalendar({ fieldId, farmerId }: CropCalendarProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  const statusColors = {
    planning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    planted: "bg-blue-100 text-blue-800 border-blue-200",
    growing: "bg-green-100 text-green-800 border-green-200",
    harvested: "bg-gray-100 text-gray-800 border-gray-200"
  }

  const statusIcons = {
    planning: <Clock className="h-4 w-4" />,
    planted: <Sprout className="h-4 w-4" />,
    growing: <AlertCircle className="h-4 w-4" />,
    harvested: <CheckCircle className="h-4 w-4" />
  }

  const cropSeasons = {
    "Kharif": ["June", "July", "August", "September"],
    "Rabi": ["October", "November", "December", "January"],
    "Zaid": ["February", "March", "April", "May"]
  }

  const getCropSeason = (month: string) => {
    for (const [season, months] of Object.entries(cropSeasons)) {
      if (months.includes(month)) {
        return season
      }
    }
    return null
  }

  const getDaysInMonth = (dateString: string) => {
    const date = new Date(dateString + "-01")
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (dateString: string) => {
    const date = new Date(dateString + "-01")
    return date.getDay()
  }

  useEffect(() => {
    fetchCropCycles()
  }, [fieldId])

  const fetchCropCycles = async () => {
    try {
      const url = fieldId
        ? `/api/crop-cycles?field_id=${fieldId}`
        : "/api/crop-cycles"

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setCropCycles(data.crop_cycles)
      } else {
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: data.error || "Failed to fetch crop cycles",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching crop cycles:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "फसल चक्र लोड करने में त्रुटि" : "Failed to load crop cycles",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredCycles = () => {
    let filtered = cropCycles

    if (filterStatus !== "all") {
      filtered = filtered.filter(cycle => cycle.status === filterStatus)
    }

    return filtered
  }

  const getCyclesForMonth = (year: number, month: number) => {
    return getFilteredCycles().filter(cycle => {
      if (cycle.planting_date) {
        const plantingDate = new Date(cycle.planting_date)
        if (plantingDate.getFullYear() === year && plantingDate.getMonth() === month - 1) {
          return true
        }
      }
      if (cycle.expected_harvest_date) {
        const harvestDate = new Date(cycle.expected_harvest_date)
        if (harvestDate.getFullYear() === year && harvestDate.getMonth() === month - 1) {
          return true
        }
      }
      return false
    })
  }

  const renderCalendar = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const daysInMonth = getDaysInMonth(selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const monthCycles = getCyclesForMonth(year, month)

    const monthName = new Date(year, month - 1).toLocaleString(language === "hi" ? "hi-IN" : "en-US", {
      month: 'long',
      year: 'numeric'
    })

    const calendarDays = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-20 border border-gray-100"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCycles = monthCycles.filter(cycle => {
        if (cycle.planting_date) {
          const plantingDate = new Date(cycle.planting_date)
          if (plantingDate.getDate() === day) return "planting"
        }
        if (cycle.expected_harvest_date) {
          const harvestDate = new Date(cycle.expected_harvest_date)
          if (harvestDate.getDate() === day) return "harvest"
        }
        return false
      })

      calendarDays.push(
        <div key={day} className="h-20 border border-gray-200 p-1 overflow-hidden">
          <div className="text-xs font-medium text-gray-700 mb-1">{day}</div>
          <div className="space-y-1">
            {dayCycles.map((cycle, idx) => {
              const eventType = cycle.planting_date && new Date(cycle.planting_date).getDate() === day ? "planting" : "harvest"
              return (
                <div
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                    eventType === "planting"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                  title={`${cycle.crop_name} - ${cycle.fields?.field_name} (${eventType})`}
                >
                  {cycle.crop_name} ({eventType === "planting" ? "🌱" : "🌾"})
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">{monthName}</h3>
        <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>
    )
  }

  const renderCropTimeline = () => {
    const filteredCycles = getFilteredCycles()

    if (filteredCycles.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>
            {language === "hi" ? "कोई फसल चक्र नहीं मिला" : "No crop cycles found"}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredCycles.map((cycle) => (
          <Card key={cycle.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{cycle.crop_name}</h4>
                  {cycle.variety && (
                    <p className="text-sm text-gray-600">{cycle.variety}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {cycle.fields?.field_name} • {cycle.fields?.area_hectares} ha
                  </p>
                </div>
                <Badge className={`${statusColors[cycle.status]} flex items-center gap-1`}>
                  {statusIcons[cycle.status]}
                  {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                {cycle.planting_date && (
                  <div className="flex items-center">
                    <Sprout className="h-4 w-4 mr-1 text-green-600" />
                    {language === "hi" ? "रोपण:" : "Planted:"}{" "}
                    {new Date(cycle.planting_date).toLocaleDateString()}
                  </div>
                )}
                {cycle.expected_harvest_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-orange-600" />
                    {language === "hi" ? "अपेक्षित फसल:" : "Expected:"}{" "}
                    {new Date(cycle.expected_harvest_date).toLocaleDateString()}
                  </div>
                )}
                {cycle.actual_harvest_date && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-blue-600" />
                    {language === "hi" ? "वास्तविक फसल:" : "Harvested:"}{" "}
                    {new Date(cycle.actual_harvest_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {cycle.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {cycle.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === "hi" ? "फसल कैलेंडर" : "Crop Calendar"}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "hi" ? "सभी स्थिति" : "All Status"}
              </SelectItem>
              <SelectItem value="planning">
                {language === "hi" ? "योजना" : "Planning"}
              </SelectItem>
              <SelectItem value="planted">
                {language === "hi" ? "रोपित" : "Planted"}
              </SelectItem>
              <SelectItem value="growing">
                {language === "hi" ? "बढ़ रही है" : "Growing"}
              </SelectItem>
              <SelectItem value="harvested">
                {language === "hi" ? "कटाई" : "Harvested"}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() + i - 6) // Show 6 months before and after
                const monthString = date.toISOString().slice(0, 7)
                const monthName = date.toLocaleString(language === "hi" ? "hi-IN" : "en-US", {
                  month: 'long',
                  year: 'numeric'
                })
                return (
                  <SelectItem key={monthString} value={monthString}>
                    {monthName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === "hi" ? "मासिक कैलेंडर" : "Monthly View"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCalendar()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === "hi" ? "फसल टाइमलाइन" : "Crop Timeline"}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {renderCropTimeline()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "सीज़न गाइड" : "Season Guide"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(cropSeasons).map(([season, months]) => (
              <div key={season} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{season}</h4>
                <div className="flex flex-wrap gap-1">
                  {months.map(month => (
                    <Badge key={month} variant="outline" className="text-xs">
                      {month.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}