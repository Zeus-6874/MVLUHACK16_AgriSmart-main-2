"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3, Plus, Calendar, Wheat } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface YieldRecord {
  id: string
  crop_cycle_id: string
  actual_yield: number
  yield_unit: string
  quality_grade: "A" | "B" | "C" | "Premium"
  harvest_date: string
  market_price: number
  total_revenue: number
  notes?: string
  created_at: string
}

interface CropCycle {
  id: string
  crop_name: string
  variety?: string
  fields: {
    field_name: string
    area_hectares: number
  }
}

interface YieldTrackerProps {
  farmerId: string
  cropCycleId?: string
}

export default function YieldTracker({ farmerId, cropCycleId }: YieldTrackerProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [yieldRecords, setYieldRecords] = useState<YieldRecord[]>([])
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddYieldDialogOpen, setIsAddYieldDialogOpen] = useState(false)

  const [yieldForm, setYieldForm] = useState({
    crop_cycle_id: cropCycleId || "",
    actual_yield: "",
    yield_unit: "tons",
    quality_grade: "A" as const,
    harvest_date: new Date().toISOString().split('T')[0],
    market_price: "",
    notes: ""
  })

  const yieldUnits = ["tons", "kg", "quintals", "bags"]
  const qualityGrades = [
    { value: "Premium", label: "Premium", color: "bg-purple-100 text-purple-800" },
    { value: "A", label: "Grade A", color: "bg-green-100 text-green-800" },
    { value: "B", label: "Grade B", color: "bg-yellow-100 text-yellow-800" },
    { value: "C", label: "Grade C", color: "bg-red-100 text-red-800" }
  ]

  useEffect(() => {
    fetchCropCycles()
    fetchYieldRecords()
  }, [])

  const fetchCropCycles = async () => {
    try {
      // Mock implementation - in real app, this would fetch from API
      const mockCropCycles: CropCycle[] = [
        {
          id: "1",
          crop_name: "Wheat",
          variety: "HD-2967",
          fields: {
            field_name: "North Field",
            area_hectares: 5.2
          }
        },
        {
          id: "2",
          crop_name: "Rice",
          fields: {
            field_name: "South Field",
            area_hectares: 3.8
          }
        }
      ]
      setCropCycles(mockCropCycles)
    } catch (error) {
      console.error("Error fetching crop cycles:", error)
    }
  }

  const fetchYieldRecords = async () => {
    try {
      // Mock implementation
      const mockYieldRecords: YieldRecord[] = [
        {
          id: "1",
          crop_cycle_id: "1",
          actual_yield: 12.5,
          yield_unit: "tons",
          quality_grade: "A",
          harvest_date: "2024-01-15",
          market_price: 2500,
          total_revenue: 31250,
          notes: "Good quality harvest",
          created_at: "2024-01-16T10:00:00Z"
        }
      ]
      setYieldRecords(mockYieldRecords)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching yield records:", error)
      setIsLoading(false)
    }
  }

  const handleSubmitYield = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!yieldForm.crop_cycle_id || !yieldForm.actual_yield || !yieldForm.market_price) {
      toast({
        title: language === "hi" ? "वैलिडेशन त्रुटि" : "Validation Error",
        description: language === "hi" ? "सभी आवश्यक फ़ील्ड भरें" : "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    const cropCycle = cropCycles.find(c => c.id === yieldForm.crop_cycle_id)
    if (!cropCycle) return

    const newYieldRecord: YieldRecord = {
      id: Date.now().toString(),
      crop_cycle_id: yieldForm.crop_cycle_id,
      actual_yield: parseFloat(yieldForm.actual_yield),
      yield_unit: yieldForm.yield_unit,
      quality_grade: yieldForm.quality_grade,
      harvest_date: yieldForm.harvest_date,
      market_price: parseFloat(yieldForm.market_price),
      total_revenue: parseFloat(yieldForm.actual_yield) * parseFloat(yieldForm.market_price),
      notes: yieldForm.notes || undefined,
      created_at: new Date().toISOString()
    }

    setYieldRecords([newYieldRecord, ...yieldRecords])
    setIsAddYieldDialogOpen(false)
    resetYieldForm()

    toast({
      title: language === "hi" ? "उपज दर्ज की गई" : "Yield Recorded",
      description: language === "hi" ? "उपज रिकॉर्ड सफलतापूर्वक जोड़ा गया" : "Yield record added successfully"
    })
  }

  const resetYieldForm = () => {
    setYieldForm({
      crop_cycle_id: cropCycleId || "",
      actual_yield: "",
      yield_unit: "tons",
      quality_grade: "A",
      harvest_date: new Date().toISOString().split('T')[0],
      market_price: "",
      notes: ""
    })
  }

  const getQualityColor = (grade: string) => {
    const quality = qualityGrades.find(q => q.value === grade)
    return quality ? quality.color : "bg-gray-100 text-gray-800"
  }

  const calculateYieldPerHectare = (record: YieldRecord) => {
    const cropCycle = cropCycles.find(c => c.id === record.crop_cycle_id)
    if (!cropCycle) return 0
    return (record.actual_yield / cropCycle.fields.area_hectares).toFixed(2)
  }

  const getYieldTrendData = () => {
    return yieldRecords
      .sort((a, b) => new Date(a.harvest_date).getTime() - new Date(b.harvest_date).getTime())
      .map(record => {
        const cropCycle = cropCycles.find(c => c.id === record.crop_cycle_id)
        return {
          date: new Date(record.harvest_date).toLocaleDateString(),
          crop: cropCycle?.crop_name || "Unknown",
          yield: record.actual_yield,
          yieldPerHa: parseFloat(calculateYieldPerHectare(record)),
          revenue: record.total_revenue
        }
      })
  }

  const getTotalRevenue = () => {
    return yieldRecords.reduce((sum, record) => sum + record.total_revenue, 0)
  }

  const getAverageYield = () => {
    if (yieldRecords.length === 0) return 0
    const totalYield = yieldRecords.reduce((sum, record) => sum + record.actual_yield, 0)
    return (totalYield / yieldRecords.length).toFixed(2)
  }

  const getCropWithHighestYield = () => {
    if (yieldRecords.length === 0) return null
    return yieldRecords.reduce((max, record) =>
      record.actual_yield > max.actual_yield ? record : max
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === "hi" ? "उपज ट्रैकर" : "Yield Tracker"}
        </h2>

        <Dialog open={isAddYieldDialogOpen} onOpenChange={setIsAddYieldDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              {language === "hi" ? "उपज दर्ज करें" : "Record Yield"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === "hi" ? "उपज दर्ज करें" : "Record Harvest Yield"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitYield} className="space-y-4">
              <div>
                <Label>{language === "hi" ? "फसल चक्र" : "Crop Cycle"}</Label>
                <Select
                  value={yieldForm.crop_cycle_id}
                  onValueChange={(value) => setYieldForm({ ...yieldForm, crop_cycle_id: value })}
                  disabled={!!cropCycleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "फसल चक्र चुनें" : "Select crop cycle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cropCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.crop_name} - {cycle.fields.field_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "hi" ? "वास्तविक उपज" : "Actual Yield"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yieldForm.actual_yield}
                    onChange={(e) => setYieldForm({ ...yieldForm, actual_yield: e.target.value })}
                    placeholder={language === "hi" ? "उपज दर्ज करें" : "Enter yield"}
                    required
                  />
                </div>
                <div>
                  <Label>{language === "hi" ? "इकाई" : "Unit"}</Label>
                  <Select
                    value={yieldForm.yield_unit}
                    onValueChange={(value) => setYieldForm({ ...yieldForm, yield_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yieldUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{language === "hi" ? "गुणवत्ता ग्रेड" : "Quality Grade"}</Label>
                <Select
                  value={yieldForm.quality_grade}
                  onValueChange={(value: "A" | "B" | "C" | "Premium") => setYieldForm({ ...yieldForm, quality_grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityGrades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "hi" ? "कटाई की तारीख" : "Harvest Date"}</Label>
                  <Input
                    type="date"
                    value={yieldForm.harvest_date}
                    onChange={(e) => setYieldForm({ ...yieldForm, harvest_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{language === "hi" ? "बाजार मूल्य" : "Market Price"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yieldForm.market_price}
                    onChange={(e) => setYieldForm({ ...yieldForm, market_price: e.target.value })}
                    placeholder="₹ per unit"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>{language === "hi" ? "टिप्पणियाँ" : "Notes"}</Label>
                <Input
                  value={yieldForm.notes}
                  onChange={(e) => setYieldForm({ ...yieldForm, notes: e.target.value })}
                  placeholder={language === "hi" ? "वैकल्पिक टिप्पणियाँ" : "Optional notes"}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddYieldDialogOpen(false)}>
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {language === "hi" ? "दर्ज करें" : "Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "कुल उपज" : "Total Yield"}
                </p>
                <p className="text-2xl font-bold">{getAverageYield()} avg</p>
                <p className="text-xs text-gray-500">
                  {language === "hi" ? "औसत उपज" : "Average yield"}
                </p>
              </div>
              <Wheat className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "कुल आय" : "Total Revenue"}
                </p>
                <p className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {language === "hi" ? "सभी फसलों से" : "From all crops"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "रिकॉर्ड" : "Records"}
                </p>
                <p className="text-2xl font-bold">{yieldRecords.length}</p>
                <p className="text-xs text-gray-500">
                  {language === "hi" ? "उपज रिकॉर्ड" : "Yield records"}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "सर्वोच्च उपज" : "Best Yield"}
                </p>
                <p className="text-2xl font-bold">
                  {getCropWithHighestYield()?.actual_yield || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {cropCycles.find(c => c.id === getCropWithHighestYield()?.crop_cycle_id)?.crop_name || "-"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Trend Chart */}
      {yieldRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "hi" ? "उपज रुझान" : "Yield Trends"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getYieldTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="yield"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Yield"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="yieldPerHa"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Yield/ha"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Yield Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "उपज रिकॉर्ड" : "Yield Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {yieldRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wheat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {language === "hi" ? "कोई उपज रिकॉर्ड नहीं मिला" : "No yield records found"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {language === "hi" ? "अपनी पहली फसल की उपज दर्ज करें" : "Record your first harvest yield"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {yieldRecords.map((record) => {
                const cropCycle = cropCycles.find(c => c.id === record.crop_cycle_id)
                return (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {cropCycle?.crop_name || "Unknown Crop"}
                        </h4>
                        {cropCycle?.variety && (
                          <p className="text-sm text-gray-600">{cropCycle.variety}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {cropCycle?.fields.field_name} • {cropCycle?.fields.area_hectares} ha
                        </p>
                      </div>
                      <Badge className={getQualityColor(record.quality_grade)}>
                        {record.quality_grade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">
                          {language === "hi" ? "उपज:" : "Yield:"}
                        </span>
                        <p className="font-semibold">
                          {record.actual_yield} {record.yield_unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === "hi" ? "प्रति हेक्टेयर:" : "Per ha:"}
                        </span>
                        <p className="font-semibold">
                          {calculateYieldPerHectare(record)} {record.yield_unit}/ha
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === "hi" ? "आय:" : "Revenue:"}
                        </span>
                        <p className="font-semibold">₹{record.total_revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === "hi" ? "तारीख:" : "Date:"}
                        </span>
                        <p className="font-semibold">
                          {new Date(record.harvest_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded">
                        {record.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}