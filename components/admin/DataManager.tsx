"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type SchemeCategory = {
  id: string
  name: string
}

type CropCategory = {
  id: string
  name: string
}

type Scheme = {
  id: string
  name: string
  name_local?: string
  state: string
  department?: string
  description?: string
  eligibility?: string
  benefits?: string
  subsidy_details?: string
  application_process?: string
  official_url?: string
  contact_info?: string
  is_active: boolean
  category_id?: string
  category?: { name: string }
}

type Crop = {
  id: string
  common_name: string
  local_name?: string
  scientific_name?: string
  climate?: string
  soil_type?: string
  optimal_ph_range?: string
  water_requirements?: string
  fertilizer_requirements?: string
  planting_season?: string
  harvest_time?: string
  average_yield?: string
  diseases?: string[]
  disease_management?: string
  market_demand?: string
  image_url?: string
  source?: string
  category?: { name: string }
  category_id?: string
}

interface DataManagerProps {
  schemeCategories: SchemeCategory[]
  cropCategories: CropCategory[]
}

export default function DataManager({ schemeCategories, cropCategories }: DataManagerProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [schemesLoading, setSchemesLoading] = useState(true)
  const [cropsLoading, setCropsLoading] = useState(true)
  const [schemeForm, setSchemeForm] = useState<Partial<Scheme>>({
    state: "All India",
    is_active: true,
  })
  const [cropForm, setCropForm] = useState<Partial<Crop>>({})
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch schemes
  const fetchSchemes = async () => {
    try {
      setSchemesLoading(true)
      const response = await fetch("/api/schemes")
      const data = await response.json()
      if (data.success) {
        setSchemes(data.schemes || [])
      }
    } catch (error) {
      console.error("Error fetching schemes:", error)
      toast.error("Failed to fetch schemes")
    } finally {
      setSchemesLoading(false)
    }
  }

  // Fetch crops
  const fetchCrops = async () => {
    try {
      setCropsLoading(true)
      const response = await fetch("/api/encyclopedia")
      const data = await response.json()
      if (data.success) {
        setCrops(data.crops || [])
      }
    } catch (error) {
      console.error("Error fetching crops:", error)
      toast.error("Failed to fetch crops")
    } finally {
      setCropsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchemes()
    fetchCrops()
  }, [])

  const mutateSchemes = () => fetchSchemes()
  const mutateCrops = () => fetchCrops()

  const schemeCategoryMap = useMemo(
    () => Object.fromEntries(schemeCategories.map((cat) => [cat.id, cat.name])),
    [schemeCategories],
  )

  const cropCategoryMap = useMemo(
    () => Object.fromEntries(cropCategories.map((cat) => [cat.id, cat.name])),
    [cropCategories],
  )

  useEffect(() => {
    if (editingScheme) {
      setSchemeForm(editingScheme)
    } else {
      setSchemeForm({ state: "All India", is_active: true, category_id: schemeCategories[0]?.id })
    }
  }, [editingScheme, schemeCategories])

  useEffect(() => {
    if (editingCrop) {
      setCropForm(editingCrop)
    } else {
      setCropForm({ category_id: cropCategories[0]?.id })
    }
  }, [editingCrop, cropCategories])

  async function handleSchemeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...schemeForm }
      const endpoint = editingScheme ? `/api/admin/schemes/${editingScheme.id}` : "/api/admin/schemes"
      const method = editingScheme ? "PUT" : "POST"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save scheme")
      await mutateSchemes()
      setEditingScheme(null)
      toast.success(editingScheme ? "Scheme updated" : "Scheme created")
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save scheme")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSchemeDelete(id: string) {
    if (!confirm("Delete this scheme?")) return
    try {
      const res = await fetch(`/api/admin/schemes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete scheme")
      await mutateSchemes()
      toast.success("Scheme deleted")
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete scheme")
    }
  }

  async function handleCropSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...cropForm }
      const endpoint = editingCrop ? `/api/admin/crops/${editingCrop.id}` : "/api/admin/crops"
      const method = editingCrop ? "PUT" : "POST"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save crop")
      await mutateCrops()
      setEditingCrop(null)
      toast.success(editingCrop ? "Crop updated" : "Crop created")
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save crop")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCropDelete(id: string) {
    if (!confirm("Delete this crop?")) return
    try {
      const res = await fetch(`/api/admin/crops/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete crop")
      await mutateCrops()
      toast.success("Crop deleted")
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete crop")
    }
  }

  return (
    <Tabs defaultValue="schemes" className="mt-6">
      <TabsList>
        <TabsTrigger value="schemes">Schemes</TabsTrigger>
        <TabsTrigger value="crops">Crops & Encyclopedia</TabsTrigger>
      </TabsList>

      <TabsContent value="schemes">
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingScheme ? "Edit Scheme" : "Add New Scheme"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSchemeSubmit}>
                <Input
                  required
                  placeholder="Scheme name"
                  value={schemeForm.name ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Local name"
                  value={schemeForm.name_local ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, name_local: e.target.value }))}
                />
                <Select
                  value={schemeForm.category_id}
                  onValueChange={(value) => setSchemeForm((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="State (e.g., All India, Maharashtra)"
                  value={schemeForm.state ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, state: e.target.value }))}
                />
                <Input
                  placeholder="Department"
                  value={schemeForm.department ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, department: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={schemeForm.description ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Textarea
                  placeholder="Eligibility"
                  value={schemeForm.eligibility ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, eligibility: e.target.value }))}
                />
                <Textarea
                  placeholder="Benefits"
                  value={schemeForm.benefits ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, benefits: e.target.value }))}
                />
                <Textarea
                  placeholder="Subsidy details"
                  value={schemeForm.subsidy_details ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, subsidy_details: e.target.value }))}
                />
                <Textarea
                  placeholder="Application process"
                  value={schemeForm.application_process ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, application_process: e.target.value }))}
                />
                <Input
                  placeholder="Official URL"
                  value={schemeForm.official_url ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, official_url: e.target.value }))}
                />
                <Input
                  placeholder="Contact info"
                  value={schemeForm.contact_info ?? ""}
                  onChange={(e) => setSchemeForm((prev) => ({ ...prev, contact_info: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {editingScheme ? "Update Scheme" : "Create Scheme"}
                  </Button>
                  {editingScheme && (
                    <Button type="button" variant="ghost" onClick={() => setEditingScheme(null)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Schemes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              {schemesLoading ? (
                <p className="text-sm text-muted-foreground">Loading schemes...</p>
              ) : schemes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No schemes found.</p>
              ) : (
                schemes.map((sche
                  
                  
                  me) => (
                  <div key={scheme.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{scheme.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {scheme.state} • {schemeCategoryMap[scheme.category_id ?? ""] || "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingScheme(scheme)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleSchemeDelete(scheme.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    {scheme.description && <p className="text-sm mt-2">{scheme.description}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="crops">
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingCrop ? "Edit Crop" : "Add New Crop"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCropSubmit}>
                <Input
                  required
                  placeholder="Common name"
                  value={cropForm.common_name ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, common_name: e.target.value }))}
                />
                <Input
                  placeholder="Local name"
                  value={cropForm.local_name ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, local_name: e.target.value }))}
                />
                <Input
                  placeholder="Scientific name"
                  value={cropForm.scientific_name ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, scientific_name: e.target.value }))}
                />
                <Select
                  value={cropForm.category_id}
                  onValueChange={(value) => setCropForm((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Climate"
                  value={cropForm.climate ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, climate: e.target.value }))}
                />
                <Input
                  placeholder="Soil type"
                  value={cropForm.soil_type ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, soil_type: e.target.value }))}
                />
                <Input
                  placeholder="Optimal pH range"
                  value={cropForm.optimal_ph_range ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, optimal_ph_range: e.target.value }))}
                />
                <Textarea
                  placeholder="Water requirements"
                  value={cropForm.water_requirements ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, water_requirements: e.target.value }))}
                />
                <Textarea
                  placeholder="Fertilizer requirements"
                  value={cropForm.fertilizer_requirements ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, fertilizer_requirements: e.target.value }))}
                />
                <Input
                  placeholder="Planting season"
                  value={cropForm.planting_season ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, planting_season: e.target.value }))}
                />
                <Input
                  placeholder="Harvest time"
                  value={cropForm.harvest_time ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, harvest_time: e.target.value }))}
                />
                <Input
                  placeholder="Average yield"
                  value={cropForm.average_yield ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, average_yield: e.target.value }))}
                />
                <Textarea
                  placeholder="Diseases (comma separated)"
                  value={cropForm.diseases?.join(", ") ?? ""}
                  onChange={(e) =>
                    setCropForm((prev) => ({ ...prev, diseases: e.target.value.split(",").map((v) => v.trim()) }))
                  }
                />
                <Textarea
                  placeholder="Disease management"
                  value={cropForm.disease_management ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, disease_management: e.target.value }))}
                />
                <Textarea
                  placeholder="Market demand"
                  value={cropForm.market_demand ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, market_demand: e.target.value }))}
                />
                <Input
                  placeholder="Image URL"
                  value={cropForm.image_url ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, image_url: e.target.value }))}
                />
                <Input
                  placeholder="Source"
                  value={cropForm.source ?? ""}
                  onChange={(e) => setCropForm((prev) => ({ ...prev, source: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {editingCrop ? "Update Crop" : "Create Crop"}
                  </Button>
                  {editingCrop && (
                    <Button type="button" variant="ghost" onClick={() => setEditingCrop(null)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Crops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              {cropsLoading ? (
                <p className="text-sm text-muted-foreground">Loading crops...</p>
              ) : crops.length === 0 ? (
                <p className="text-sm text-muted-foreground">No crops found.</p>
              ) : (
                crops.map((crop) => (
                  <div key={crop.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{crop.common_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {crop.scientific_name} • {cropCategoryMap[crop.category_id ?? ""] || "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingCrop(crop)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleCropDelete(crop.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    {crop.climate && <p className="text-sm mt-2">{crop.climate}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

