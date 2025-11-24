"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, AlertTriangle, TrendingDown, TrendingUp, Sprout } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface Resource {
  id: string
  name: string
  category: "seeds" | "fertilizers" | "pesticides" | "tools" | "other"
  current_quantity: number
  unit: string
  min_quantity: number
  max_quantity: number
  cost_per_unit: number
  supplier?: string
  last_restocked?: string
  notes?: string
}

interface ResourceUsage {
  id: string
  resource_id: string
  quantity_used: number
  field_id?: string
  crop_cycle_id?: string
  usage_date: string
  purpose: string
  cost: number
}

interface ResourceTrackerProps {
  farmerId: string
}

export default function ResourceTracker({ farmerId }: ResourceTrackerProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [usage, setUsage] = useState<ResourceUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false)
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = {
    seeds: { label: language === "hi" ? "बीज" : "Seeds", icon: "🌱", color: "green" },
    fertilizers: { label: language === "hi" ? "उर्वरक" : "Fertilizers", icon: "🧪", color: "blue" },
    pesticides: { label: language === "hi" ? "कीटनाशक" : "Pesticides", icon: "⚠️", color: "red" },
    tools: { label: language === "hi" ? "उपकरण" : "Tools", icon: "🔧", color: "gray" },
    other: { label: language === "hi" ? "अन्य" : "Other", icon: "📦", color: "purple" }
  }

  const units = ["kg", "liters", "bags", "bottles", "packs", "units", "tons"]

  const [resourceForm, setResourceForm] = useState({
    name: "",
    category: "seeds" as keyof typeof categories,
    current_quantity: "",
    unit: "kg",
    min_quantity: "",
    max_quantity: "",
    cost_per_unit: "",
    supplier: "",
    notes: ""
  })

  const [usageForm, setUsageForm] = useState({
    resource_id: "",
    quantity_used: "",
    purpose: "",
    field_id: "",
    crop_cycle_id: ""
  })

  useEffect(() => {
    fetchResources()
    fetchUsage()
  }, [])

  const fetchResources = async () => {
    // Mock implementation - in real app, this would fetch from API
    const mockResources: Resource[] = [
      {
        id: "1",
        name: "Wheat Seeds",
        category: "seeds",
        current_quantity: 50,
        unit: "kg",
        min_quantity: 20,
        max_quantity: 200,
        cost_per_unit: 30,
        supplier: "AgriSeeds Co.",
        last_restocked: "2024-01-15"
      },
      {
        id: "2",
        name: "Urea Fertilizer",
        category: "fertilizers",
        current_quantity: 15,
        unit: "bags",
        min_quantity: 10,
        max_quantity: 50,
        cost_per_unit: 300,
        supplier: "FertiPlus"
      },
      {
        id: "3",
        name: "Pesticide Spray",
        category: "pesticides",
        current_quantity: 8,
        unit: "liters",
        min_quantity: 5,
        max_quantity: 25,
        cost_per_unit: 150
      }
    ]
    setResources(mockResources)
  }

  const fetchUsage = async () => {
    // Mock implementation
    const mockUsage: ResourceUsage[] = [
      {
        id: "1",
        resource_id: "1",
        quantity_used: 10,
        field_id: "field-1",
        crop_cycle_id: "cycle-1",
        usage_date: "2024-01-20",
        purpose: "Wheat planting",
        cost: 300
      }
    ]
    setUsage(mockUsage)
    setIsLoading(false)
  }

  const getResourceStatus = (resource: Resource) => {
    const percentage = (resource.current_quantity / resource.max_quantity) * 100
    if (resource.current_quantity <= resource.min_quantity) {
      return { status: "critical", color: "red", text: language === "hi" ? "कम स्टॉक" : "Low Stock" }
    } else if (percentage < 30) {
      return { status: "warning", color: "yellow", text: language === "hi" ? "रीफिल करें" : "Refill Soon" }
    } else if (percentage > 80) {
      return { status: "high", color: "green", text: language === "hi" ? "अच्छा स्टॉक" : "Well Stocked" }
    }
    return { status: "normal", color: "blue", text: language === "hi" ? "सामान्य" : "Normal" }
  }

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resourceForm.name || !resourceForm.current_quantity || !resourceForm.unit) {
      toast({
        title: language === "hi" ? "वैलिडेशन त्रुटि" : "Validation Error",
        description: language === "hi" ? "नाम, मात्रा और इकाई आवश्यक है" : "Name, quantity, and unit are required",
        variant: "destructive"
      })
      return
    }

    const newResource: Resource = {
      id: Date.now().toString(),
      name: resourceForm.name,
      category: resourceForm.category,
      current_quantity: parseFloat(resourceForm.current_quantity),
      unit: resourceForm.unit,
      min_quantity: parseFloat(resourceForm.min_quantity) || 0,
      max_quantity: parseFloat(resourceForm.max_quantity) || 100,
      cost_per_unit: parseFloat(resourceForm.cost_per_unit) || 0,
      supplier: resourceForm.supplier || undefined,
      notes: resourceForm.notes || undefined,
      last_restocked: new Date().toISOString().split('T')[0]
    }

    setResources([...resources, newResource])
    setIsAddResourceDialogOpen(false)
    resetResourceForm()

    toast({
      title: language === "hi" ? "संसाधन जोड़ा गया" : "Resource Added",
      description: language === "hi" ? "संसाधन सफलतापूर्वक जोड़ा गया" : "Resource added successfully"
    })
  }

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!usageForm.resource_id || !usageForm.quantity_used || !usageForm.purpose) {
      toast({
        title: language === "hi" ? "वैलिडेशन त्रुटि" : "Validation Error",
        description: language === "hi" ? "संसाधन, मात्रा और उद्देश्य आवश्यक है" : "Resource, quantity, and purpose are required",
        variant: "destructive"
      })
      return
    }

    const resource = resources.find(r => r.id === usageForm.resource_id)
    if (!resource) return

    const quantityUsed = parseFloat(usageForm.quantity_used)
    if (quantityUsed > resource.current_quantity) {
      toast({
        title: language === "hi" ? "अपर्याप्त स्टॉक" : "Insufficient Stock",
        description: language === "hi" ? "पर्याप्त संसाधन उपलब्ध नहीं है" : "Not enough resources available",
        variant: "destructive"
      })
      return
    }

    const newUsage: ResourceUsage = {
      id: Date.now().toString(),
      resource_id: usageForm.resource_id,
      quantity_used: quantityUsed,
      field_id: usageForm.field_id || undefined,
      crop_cycle_id: usageForm.crop_cycle_id || undefined,
      usage_date: new Date().toISOString().split('T')[0],
      purpose: usageForm.purpose,
      cost: quantityUsed * resource.cost_per_unit
    }

    // Update resource quantity
    const updatedResources = resources.map(r =>
      r.id === usageForm.resource_id
        ? { ...r, current_quantity: r.current_quantity - quantityUsed }
        : r
    )

    setResources(updatedResources)
    setUsage([newUsage, ...usage])
    setIsUsageDialogOpen(false)
    resetUsageForm()

    toast({
      title: language === "hi" ? "उपयोग दर्ज किया गया" : "Usage Recorded",
      description: language === "hi" ? "संसाधन उपयोग सफलतापूर्वक दर्ज किया गया" : "Resource usage recorded successfully"
    })
  }

  const resetResourceForm = () => {
    setResourceForm({
      name: "",
      category: "seeds",
      current_quantity: "",
      unit: "kg",
      min_quantity: "",
      max_quantity: "",
      cost_per_unit: "",
      supplier: "",
      notes: ""
    })
  }

  const resetUsageForm = () => {
    setUsageForm({
      resource_id: "",
      quantity_used: "",
      purpose: "",
      field_id: "",
      crop_cycle_id: ""
    })
  }

  const filteredResources = selectedCategory === "all"
    ? resources
    : resources.filter(r => r.category === selectedCategory)

  const getTotalValue = () => {
    return resources.reduce((sum, resource) => sum + (resource.current_quantity * resource.cost_per_unit), 0)
  }

  const getCriticalResources = () => {
    return resources.filter(r => r.current_quantity <= r.min_quantity)
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
          {language === "hi" ? "संसाधन ट्रैकर" : "Resource Tracker"}
        </h2>
        <div className="flex space-x-3">
          <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingDown className="mr-2 h-4 w-4" />
                {language === "hi" ? "उपयोग दर्ज करें" : "Record Usage"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {language === "hi" ? "संसाधन उपयोग दर्ज करें" : "Record Resource Usage"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUsageSubmit} className="space-y-4">
                <div>
                  <Label>{language === "hi" ? "संसाधन" : "Resource"}</Label>
                  <Select
                    value={usageForm.resource_id}
                    onValueChange={(value) => setUsageForm({ ...usageForm, resource_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === "hi" ? "संसाधन चुनें" : "Select resource"} />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.current_quantity} {resource.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{language === "hi" ? "उपयोग की मात्रा" : "Quantity Used"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={usageForm.quantity_used}
                    onChange={(e) => setUsageForm({ ...usageForm, quantity_used: e.target.value })}
                    placeholder={language === "hi" ? "उपयोग की मात्रा दर्ज करें" : "Enter quantity used"}
                    required
                  />
                </div>

                <div>
                  <Label>{language === "hi" ? "उद्देश्य" : "Purpose"}</Label>
                  <Input
                    value={usageForm.purpose}
                    onChange={(e) => setUsageForm({ ...usageForm, purpose: e.target.value })}
                    placeholder={language === "hi" ? "उपयोग का उद्देश्य" : "Purpose of usage"}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsUsageDialogOpen(false)}>
                    {language === "hi" ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {language === "hi" ? "दर्ज करें" : "Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                {language === "hi" ? "संसाधन जोड़ें" : "Add Resource"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {language === "hi" ? "नया संसाधन जोड़ें" : "Add New Resource"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <Label>{language === "hi" ? "नाम" : "Name"}</Label>
                  <Input
                    value={resourceForm.name}
                    onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                    placeholder={language === "hi" ? "संसाधन का नाम" : "Resource name"}
                    required
                  />
                </div>

                <div>
                  <Label>{language === "hi" ? "श्रेणी" : "Category"}</Label>
                  <Select
                    value={resourceForm.category}
                    onValueChange={(value: keyof typeof categories) => setResourceForm({ ...resourceForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.icon} {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === "hi" ? "वर्तमान मात्रा" : "Current Quantity"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={resourceForm.current_quantity}
                      onChange={(e) => setResourceForm({ ...resourceForm, current_quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>{language === "hi" ? "इकाई" : "Unit"}</Label>
                    <Select
                      value={resourceForm.unit}
                      onValueChange={(value) => setResourceForm({ ...resourceForm, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === "hi" ? "न्यूनतम मात्रा" : "Min Quantity"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={resourceForm.min_quantity}
                      onChange={(e) => setResourceForm({ ...resourceForm, min_quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === "hi" ? "अधिकतम मात्रा" : "Max Quantity"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={resourceForm.max_quantity}
                      onChange={(e) => setResourceForm({ ...resourceForm, max_quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>{language === "hi" ? "प्रति इकाई लागत" : "Cost per Unit"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={resourceForm.cost_per_unit}
                    onChange={(e) => setResourceForm({ ...resourceForm, cost_per_unit: e.target.value })}
                    placeholder={language === "hi" ? "लागत दर्ज करें" : "Enter cost"}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddResourceDialogOpen(false)}>
                    {language === "hi" ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {language === "hi" ? "जोड़ें" : "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "कुल संसाधन" : "Total Resources"}
                </p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "कुल मूल्य" : "Total Value"}
                </p>
                <p className="text-2xl font-bold">₹{getTotalValue().toLocaleString()}</p>
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
                  {language === "hi" ? "कम स्टॉक" : "Low Stock"}
                </p>
                <p className="text-2xl font-bold text-red-600">{getCriticalResources().length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "आज का उपयोग" : "Today's Usage"}
                </p>
                <p className="text-2xl font-bold">
                  {usage.filter(u => u.usage_date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources">
            {language === "hi" ? "संसाधन" : "Resources"}
          </TabsTrigger>
          <TabsTrigger value="usage">
            {language === "hi" ? "उपयोग इतिहास" : "Usage History"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Category Filter */}
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              {language === "hi" ? "सभी" : "All"}
            </Button>
            {Object.entries(categories).map(([key, value]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {value.icon} {value.label}
              </Button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const status = getResourceStatus(resource)
              const percentage = (resource.current_quantity / resource.max_quantity) * 100

              return (
                <Card key={resource.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{resource.name}</h3>
                        <p className="text-sm text-gray-600">
                          {categories[resource.category].label}
                        </p>
                      </div>
                      <Badge className={`bg-${status.color}-100 text-${status.color}-800`}>
                        {status.text}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{language === "hi" ? "स्टॉक" : "Stock"}</span>
                          <span>{resource.current_quantity} / {resource.max_quantity} {resource.unit}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>

                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === "hi" ? "लागत/इकाई" : "Cost/Unit"}:</span>
                          <span>₹{resource.cost_per_unit}</span>
                        </div>
                        {resource.supplier && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{language === "hi" ? "आपूर्तिकर्ता" : "Supplier"}:</span>
                            <span>{resource.supplier}</span>
                          </div>
                        )}
                      </div>

                      {resource.last_restocked && (
                        <div className="text-xs text-gray-500">
                          {language === "hi" ? "अंतिम रिफिल:" : "Last restocked"}:{" "}
                          {new Date(resource.last_restocked).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="space-y-3">
            {usage.map((usage) => {
              const resource = resources.find(r => r.id === usage.resource_id)
              if (!resource) return null

              return (
                <Card key={usage.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{resource.name}</h4>
                        <p className="text-sm text-gray-600">{usage.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(usage.usage_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{usage.quantity_used} {resource.unit}</p>
                        <p className="text-sm text-gray-600">₹{usage.cost}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}