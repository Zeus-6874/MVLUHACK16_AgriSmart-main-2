"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Calendar, Sprout } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface Field {
  id: string
  field_name: string
  area_hectares: number
  coordinates?: any
  soil_type?: string
  irrigation_type?: string
  created_at: string
  updated_at: string
  crop_cycles?: Array<{
    id: string
    crop_name: string
    variety?: string
    status: string
    planting_date?: string
  }>
}

interface FieldFormData {
  field_name: string
  area_hectares: string
  soil_type: string
  irrigation_type: string
}

interface FieldManagerProps {
  farmerId: string
  onFieldSelect?: (field: Field) => void
}

export default function FieldManager({ farmerId, onFieldSelect }: FieldManagerProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [formData, setFormData] = useState<FieldFormData>({
    field_name: "",
    area_hectares: "",
    soil_type: "",
    irrigation_type: ""
  })

  const soilTypes = [
    "Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Black", "Red", "Alluvial"
  ]

  const irrigationTypes = [
    "Drip", "Sprinkler", "Flood", "Center Pivot", "Manual", "Rain-fed"
  ]

  const cropStatusColors = {
    planning: "bg-yellow-100 text-yellow-800",
    planted: "bg-green-100 text-green-800",
    growing: "bg-blue-100 text-blue-800",
    harvested: "bg-gray-100 text-gray-800"
  }

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const response = await fetch("/api/fields")
      const data = await response.json()

      if (data.success) {
        setFields(data.fields)
      } else {
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: data.error || "Failed to fetch fields",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching fields:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "फ़ील्ड लोड करने में त्रुटि" : "Failed to load fields",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.field_name || !formData.area_hectares) {
      toast({
        title: language === "hi" ? "वैलिडेशन त्रुटि" : "Validation Error",
        description: language === "hi" ? "फ़ील्ड का नाम और क्षेत्रफल आवश्यक है" : "Field name and area are required",
        variant: "destructive"
      })
      return
    }

    try {
      const url = editingField ? `/api/fields/${editingField.id}` : "/api/fields"
      const method = editingField ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editingField
            ? (language === "hi" ? "फ़ील्ड अपडेट किया गया" : "Field updated")
            : (language === "hi" ? "फ़ील्ड बनाया गया" : "Field created"),
          description: editingField
            ? (language === "hi" ? "फ़ील्ड सफलतापूर्वक अपडेट किया गया" : "Field updated successfully")
            : (language === "hi" ? "फ़ील्ड सफलतापूर्वक बनाया गया" : "Field created successfully")
        })

        setIsCreateDialogOpen(false)
        setEditingField(null)
        resetForm()
        fetchFields()
      } else {
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: data.error || "Failed to save field",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving field:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "फ़ील्ड सहेजने में त्रुटि" : "Failed to save field",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (field: Field) => {
    setEditingField(field)
    setFormData({
      field_name: field.field_name,
      area_hectares: field.area_hectares.toString(),
      soil_type: field.soil_type || "",
      irrigation_type: field.irrigation_type || ""
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (field: Field) => {
    if (!confirm(language === "hi"
      ? `क्या आप "${field.field_name}" फ़ील्ड को हटाना चाहते हैं?`
      : `Are you sure you want to delete "${field.field_name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/fields/${field.id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: language === "hi" ? "फ़ील्ड हटाया गया" : "Field deleted",
          description: language === "hi" ? "फ़ील्ड सफलतापूर्वक हटाया गया" : "Field deleted successfully"
        })
        fetchFields()
      } else {
        toast({
          title: language === "hi" ? "त्रुटि" : "Error",
          description: data.error || "Failed to delete field",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting field:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "फ़ील्ड हटाने में त्रुटि" : "Failed to delete field",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      field_name: "",
      area_hectares: "",
      soil_type: "",
      irrigation_type: ""
    })
    setEditingField(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const closeDialog = () => {
    setIsCreateDialogOpen(false)
    resetForm()
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
          {language === "hi" ? "फ़ील्ड प्रबंधन" : "Field Management"}
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              {language === "hi" ? "नया फ़ील्ड" : "Add Field"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingField
                  ? (language === "hi" ? "फ़ील्ड संपादित करें" : "Edit Field")
                  : (language === "hi" ? "नया फ़ील्ड बनाएं" : "Create New Field")
                }
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="field_name">
                  {language === "hi" ? "फ़ील्ड का नाम" : "Field Name"}
                </Label>
                <Input
                  id="field_name"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  placeholder={language === "hi" ? "फ़ील्ड का नाम दर्ज करें" : "Enter field name"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="area_hectares">
                  {language === "hi" ? "क्षेत्रफल (हेक्टेयर)" : "Area (hectares)"}
                </Label>
                <Input
                  id="area_hectares"
                  type="number"
                  step="0.01"
                  value={formData.area_hectares}
                  onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                  placeholder={language === "hi" ? "क्षेत्रफल दर्ज करें" : "Enter area in hectares"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="soil_type">
                  {language === "hi" ? "मिट्टी का प्रकार" : "Soil Type"}
                </Label>
                <Select
                  value={formData.soil_type}
                  onValueChange={(value) => setFormData({ ...formData, soil_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "मिट्टी का प्रकार चुनें" : "Select soil type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="irrigation_type">
                  {language === "hi" ? "सिंचाई का प्रकार" : "Irrigation Type"}
                </Label>
                <Select
                  value={formData.irrigation_type}
                  onValueChange={(value) => setFormData({ ...formData, irrigation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "सिंचाई का प्रकार चुनें" : "Select irrigation type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {irrigationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingField
                    ? (language === "hi" ? "अपडेट करें" : "Update")
                    : (language === "hi" ? "बनाएं" : "Create")
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "hi" ? "कोई फ़ील्ड नहीं मिला" : "No fields found"}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {language === "hi"
                ? "अपना पहला फ़ील्ड जोड़कर शुरू करें"
                : "Get started by adding your first field"
              }
            </p>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              {language === "hi" ? "पहला फ़ील्ड जोड़ें" : "Add First Field"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card
              key={field.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onFieldSelect?.(field)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{field.field_name}</CardTitle>
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(field)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {field.area_hectares} {language === "hi" ? "हेक्टेयर" : "hectares"}
                </div>

                {field.soil_type && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Sprout className="h-4 w-4 mr-2" />
                    {field.soil_type} {language === "hi" ? "मिट्टी" : "soil"}
                  </div>
                )}

                {field.crop_cycles && field.crop_cycles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      {language === "hi" ? "वर्तमान फसलें:" : "Current Crops:"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.crop_cycles.slice(0, 2).map((cycle) => (
                        <Badge
                          key={cycle.id}
                          className={cropStatusColors[cycle.status as keyof typeof cropStatusColors]}
                        >
                          {cycle.crop_name}
                        </Badge>
                      ))}
                      {field.crop_cycles.length > 2 && (
                        <Badge variant="secondary">
                          +{field.crop_cycles.length - 2} {language === "hi" ? "और" : "more"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {field.updated_at && (
                  <div className="text-xs text-gray-500">
                    {language === "hi" ? "अंतिम अपडेट:" : "Last updated"}{" "}
                    {new Date(field.updated_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}