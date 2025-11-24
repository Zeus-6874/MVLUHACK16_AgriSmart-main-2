"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Sprout,
  AlertTriangle,
  TrendingUp,
  Database,
  LogOut,
  Settings,
  BarChart3,
  FileText,
  Globe,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Eye,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface AdminDashboardProps {
  user: User
}

interface DashboardStats {
  totalFarmers: number
  totalCrops: number
  diseaseReports: number
  soilAnalyses: number
  marketPrices: number
  schemes: number
}

interface Farmer {
  id: string
  name: string
  phone?: string
  location?: string
  farm_size?: number
  created_at: string
}

interface CropData {
  id: string
  crop_name: string
  scientific_name?: string
  description?: string
  planting_season?: string
  harvest_time?: string
  created_at: string
}

interface DiseaseReport {
  id: string
  crop_name: string
  disease_name?: string
  confidence_score?: number
  reported_date: string
  farmer_id?: string
}

interface MarketPrice {
  id: string
  commodity: string
  commodity_hi?: string
  market_name: string
  state: string
  district?: string
  arrival_date: string
  min_price?: number
  max_price?: number
  modal_price: number
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { language, setLanguage } = useI18n()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalCrops: 0,
    diseaseReports: 0,
    soilAnalyses: 0,
    marketPrices: 0,
    schemes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [crops, setCrops] = useState<CropData[]>([])
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>([])
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")

  // Form states
  const [newFarmer, setNewFarmer] = useState({ name: "", phone: "", location: "", farm_size: "" })
  const [newCrop, setNewCrop] = useState({
    crop_name: "",
    scientific_name: "",
    description: "",
    planting_season: "",
    harvest_time: "",
  })
  const [newMarketPrice, setNewMarketPrice] = useState({
    commodity: "",
    market_name: "",
    modal_price: "",
    min_price: "",
    max_price: "",
    state: "",
    district: "",
  })

  useEffect(() => {
    fetchDashboardStats()
    fetchAllData()
  }, [])

  const fetchDashboardStats = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const [farmers, encyclopedia, diseaseReports, soilAnalyses, marketPrices, schemes] = await Promise.all([
        supabase.from("farmers").select("*", { count: "exact", head: true }),
        supabase.from("encyclopedia").select("*", { count: "exact", head: true }),
        supabase.from("disease_reports").select("*", { count: "exact", head: true }),
        supabase.from("soil_analysis").select("*", { count: "exact", head: true }),
        supabase.from("market_prices").select("*", { count: "exact", head: true }),
        supabase.from("schemes").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalFarmers: farmers.count || 0,
        totalCrops: encyclopedia.count || 0,
        diseaseReports: diseaseReports.count || 0,
        soilAnalyses: soilAnalyses.count || 0,
        marketPrices: marketPrices.count || 0,
        schemes: schemes.count || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllData = async () => {
    const supabase = createClient()

    try {
      const [farmersData, cropsData, reportsData, pricesData] = await Promise.all([
        supabase.from("farmers").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("encyclopedia").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("disease_reports").select("*").order("reported_date", { ascending: false }).limit(50),
        supabase.from("market_prices").select("*").order("arrival_date", { ascending: false }).limit(50),
      ])

      if (farmersData.data) setFarmers(farmersData.data)
      if (cropsData.data) setCrops(cropsData.data)
      if (reportsData.data) setDiseaseReports(reportsData.data)
      if (pricesData.data) setMarketPrices(pricesData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleAddFarmer = async () => {
    if (!newFarmer.name) {
      toast({
        title: "Error",
        description: "Farmer name is required",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("farmers").insert([
      {
        name: newFarmer.name,
        phone: newFarmer.phone || null,
        location: newFarmer.location || null,
        farm_size: newFarmer.farm_size ? Number.parseFloat(newFarmer.farm_size) : null,
      },
    ])

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add farmer",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Farmer added successfully",
      })
      setNewFarmer({ name: "", phone: "", location: "", farm_size: "" })
      fetchAllData()
      fetchDashboardStats()
    }
  }

  const handleAddCrop = async () => {
    if (!newCrop.crop_name) {
      toast({
        title: "Error",
        description: "Crop name is required",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("encyclopedia").insert([newCrop])

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add crop",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Crop added successfully",
      })
      setNewCrop({ crop_name: "", scientific_name: "", description: "", planting_season: "", harvest_time: "" })
      fetchAllData()
      fetchDashboardStats()
    }
  }

  const handleAddMarketPrice = async () => {
    if (!newMarketPrice.commodity || !newMarketPrice.market_name || !newMarketPrice.modal_price) {
      toast({
        title: "Error",
        description: "Commodity, market name, and modal price are required",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("market_prices").insert([
      {
        commodity: newMarketPrice.commodity,
        market_name: newMarketPrice.market_name,
        state: newMarketPrice.state || "Unknown",
        district: newMarketPrice.district || null,
        modal_price: Number.parseFloat(newMarketPrice.modal_price),
        min_price: newMarketPrice.min_price ? Number.parseFloat(newMarketPrice.min_price) : null,
        max_price: newMarketPrice.max_price ? Number.parseFloat(newMarketPrice.max_price) : null,
        arrival_date: new Date().toISOString().split("T")[0],
      },
    ])

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add market price",
        variant: "destructive",
      })
      console.error("Market price insert error:", error)
    } else {
      toast({
        title: "Success",
        description: "Market price added successfully",
      })
      setNewMarketPrice({ commodity: "", market_name: "", modal_price: "", min_price: "", max_price: "", state: "", district: "" })
      fetchAllData()
      fetchDashboardStats()
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en")
  }

  const exportData = async (tableName: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.from(tableName).select("*")

    if (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
      return
    }

    const csv = convertToCSV(data)
    downloadCSV(csv, `${tableName}_export.csv`)
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
    ].join("\n")

    return csvContent
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const statCards = [
    {
      title: language === "hi" ? "कुल किसान" : "Total Farmers",
      value: stats.totalFarmers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      trend: "+12%",
    },
    {
      title: language === "hi" ? "फसल डेटा" : "Crop Data",
      value: stats.totalCrops,
      icon: <Sprout className="h-6 w-6 text-green-600" />,
      color: "bg-green-50 border-green-200",
      trend: "+8%",
    },
    {
      title: language === "hi" ? "रोग रिपोर्ट" : "Disease Reports",
      value: stats.diseaseReports,
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      color: "bg-red-50 border-red-200",
      trend: "+25%",
    },
    {
      title: language === "hi" ? "मिट्टी विश्लेषण" : "Soil Analyses",
      value: stats.soilAnalyses,
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
      trend: "+15%",
    },
    {
      title: language === "hi" ? "बाजार मूल्य" : "Market Prices",
      value: stats.marketPrices,
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-200",
      trend: "+5%",
    },
    {
      title: language === "hi" ? "सरकारी योजनाएं" : "Government Schemes",
      value: stats.schemes,
      icon: <FileText className="h-6 w-6 text-teal-600" />,
      color: "bg-teal-50 border-teal-200",
      trend: "+3%",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === "hi" ? "एग्रीस्मार्ट एडमिन" : "AgriSmart Admin"}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === "hi" ? `स्वागत, ${user.email}` : `Welcome, ${user.email}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>{language === "en" ? "हिं" : "EN"}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <Settings className="h-4 w-4 mr-2" />
                {language === "hi" ? "साइट देखें" : "View Site"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {language === "hi" ? "लॉगआउट" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-2 hover:shadow-lg transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : stat.value.toLocaleString()}
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">{language === "hi" ? "अवलोकन" : "Overview"}</TabsTrigger>
            <TabsTrigger value="farmers">{language === "hi" ? "किसान" : "Farmers"}</TabsTrigger>
            <TabsTrigger value="crops">{language === "hi" ? "फसलें" : "Crops"}</TabsTrigger>
            <TabsTrigger value="reports">{language === "hi" ? "रिपोर्ट" : "Reports"}</TabsTrigger>
            <TabsTrigger value="data">{language === "hi" ? "डेटा" : "Data"}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>{language === "hi" ? "सिस्टम अवलोकन" : "System Overview"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {language === "hi" ? "डेटाबेस स्थिति" : "Database Status"}
                      </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {language === "hi" ? "सक्रिय" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{language === "hi" ? "कुल रिकॉर्ड" : "Total Records"}</span>
                      <span className="font-medium">
                        {(
                          stats.totalFarmers +
                          stats.totalCrops +
                          stats.diseaseReports +
                          stats.soilAnalyses +
                          stats.marketPrices +
                          stats.schemes
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{language === "hi" ? "अंतिम अपडेट" : "Last Updated"}</span>
                      <span className="font-medium">
                        {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{language === "hi" ? "त्वरित कार्य" : "Quick Actions"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setSelectedTab("farmers")} variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    {language === "hi" ? "नया किसान जोड़ें" : "Add New Farmer"}
                  </Button>
                  <Button onClick={() => setSelectedTab("crops")} variant="outline" className="w-full justify-start">
                    <Sprout className="h-4 w-4 mr-2" />
                    {language === "hi" ? "नई फसल जोड़ें" : "Add New Crop"}
                  </Button>
                  <Button onClick={() => setSelectedTab("data")} variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {language === "hi" ? "बाजार मूल्य अपडेट करें" : "Update Market Prices"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {language === "hi" ? "किसान प्रबंधन" : "Farmer Management"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "hi" ? "नया किसान" : "Add Farmer"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{language === "hi" ? "नया किसान जोड़ें" : "Add New Farmer"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">{language === "hi" ? "नाम" : "Name"} *</Label>
                            <Input
                              id="name"
                              value={newFarmer.name}
                              onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                              placeholder={language === "hi" ? "किसान का नाम" : "Farmer's name"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">{language === "hi" ? "फोन" : "Phone"}</Label>
                            <Input
                              id="phone"
                              value={newFarmer.phone}
                              onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
                              placeholder={language === "hi" ? "फोन नंबर" : "Phone number"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">{language === "hi" ? "स्थान" : "Location"}</Label>
                            <Input
                              id="location"
                              value={newFarmer.location}
                              onChange={(e) => setNewFarmer({ ...newFarmer, location: e.target.value })}
                              placeholder={language === "hi" ? "गांव, जिला" : "Village, District"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="farm_size">
                              {language === "hi" ? "खेत का आकार (एकड़)" : "Farm Size (Acres)"}
                            </Label>
                            <Input
                              id="farm_size"
                              type="number"
                              value={newFarmer.farm_size}
                              onChange={(e) => setNewFarmer({ ...newFarmer, farm_size: e.target.value })}
                              placeholder="0.0"
                            />
                          </div>
                          <Button onClick={handleAddFarmer} className="w-full">
                            {language === "hi" ? "जोड़ें" : "Add Farmer"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => exportData("farmers")}>
                      <Download className="h-4 w-4 mr-2" />
                      {language === "hi" ? "निर्यात" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={language === "hi" ? "किसान खोजें..." : "Search farmers..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "hi" ? "नाम" : "Name"}</TableHead>
                        <TableHead>{language === "hi" ? "फोन" : "Phone"}</TableHead>
                        <TableHead>{language === "hi" ? "स्थान" : "Location"}</TableHead>
                        <TableHead>{language === "hi" ? "खेत का आकार" : "Farm Size"}</TableHead>
                        <TableHead>{language === "hi" ? "जुड़ने की तारीख" : "Joined Date"}</TableHead>
                        <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmers
                        .filter(
                          (farmer) =>
                            farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (farmer.location && farmer.location.toLowerCase().includes(searchTerm.toLowerCase())),
                        )
                        .slice(0, 10)
                        .map((farmer) => (
                          <TableRow key={farmer.id}>
                            <TableCell className="font-medium">{farmer.name}</TableCell>
                            <TableCell>
                              {farmer.phone ? (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {farmer.phone}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {farmer.location ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {farmer.location}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>{farmer.farm_size ? `${farmer.farm_size} acres` : "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(farmer.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crops">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    {language === "hi" ? "फसल डेटा प्रबंधन" : "Crop Data Management"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "hi" ? "नई फसल" : "Add Crop"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{language === "hi" ? "नई फसल जोड़ें" : "Add New Crop"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="crop_name">{language === "hi" ? "फसल का नाम" : "Crop Name"} *</Label>
                              <Input
                                id="crop_name"
                                value={newCrop.crop_name}
                                onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: चावल" : "e.g., Rice"}
                              />
                            </div>
                            <div>
                              <Label htmlFor="scientific_name">
                                {language === "hi" ? "वैज्ञानिक नाम" : "Scientific Name"}
                              </Label>
                              <Input
                                id="scientific_name"
                                value={newCrop.scientific_name}
                                onChange={(e) => setNewCrop({ ...newCrop, scientific_name: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: Oryza sativa" : "e.g., Oryza sativa"}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="description">{language === "hi" ? "विवरण" : "Description"}</Label>
                            <Textarea
                              id="description"
                              value={newCrop.description}
                              onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
                              placeholder={language === "hi" ? "फसल का विवरण..." : "Crop description..."}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="planting_season">
                                {language === "hi" ? "बुआई का मौसम" : "Planting Season"}
                              </Label>
                              <Input
                                id="planting_season"
                                value={newCrop.planting_season}
                                onChange={(e) => setNewCrop({ ...newCrop, planting_season: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: खरीफ" : "e.g., Kharif"}
                              />
                            </div>
                            <div>
                              <Label htmlFor="harvest_time">{language === "hi" ? "कटाई का समय" : "Harvest Time"}</Label>
                              <Input
                                id="harvest_time"
                                value={newCrop.harvest_time}
                                onChange={(e) => setNewCrop({ ...newCrop, harvest_time: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: 3-4 महीने" : "e.g., 3-4 months"}
                              />
                            </div>
                          </div>
                          <Button onClick={handleAddCrop} className="w-full">
                            {language === "hi" ? "जोड़ें" : "Add Crop"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => exportData("encyclopedia")}>
                      <Download className="h-4 w-4 mr-2" />
                      {language === "hi" ? "निर्यात" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "hi" ? "फसल का नाम" : "Crop Name"}</TableHead>
                        <TableHead>{language === "hi" ? "वैज्ञानिक नाम" : "Scientific Name"}</TableHead>
                        <TableHead>{language === "hi" ? "बुआई का मौसम" : "Planting Season"}</TableHead>
                        <TableHead>{language === "hi" ? "कटाई का समय" : "Harvest Time"}</TableHead>
                        <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crops.slice(0, 10).map((crop) => (
                        <TableRow key={crop.id}>
                          <TableCell className="font-medium">{crop.crop_name}</TableCell>
                          <TableCell className="italic text-gray-600">{crop.scientific_name || "-"}</TableCell>
                          <TableCell>{crop.planting_season || "-"}</TableCell>
                          <TableCell>{crop.harvest_time || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "hi" ? "रोग रिपोर्ट और विश्लेषण" : "Disease Reports & Analytics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "hi" ? "फसल" : "Crop"}</TableHead>
                        <TableHead>{language === "hi" ? "रोग" : "Disease"}</TableHead>
                        <TableHead>{language === "hi" ? "विश्वसनीयता" : "Confidence"}</TableHead>
                        <TableHead>{language === "hi" ? "रिपोर्ट की तारीख" : "Report Date"}</TableHead>
                        <TableHead>{language === "hi" ? "स्थिति" : "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diseaseReports.slice(0, 10).map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.crop_name}</TableCell>
                          <TableCell>{report.disease_name || "Unknown"}</TableCell>
                          <TableCell>
                            {report.confidence_score ? (
                              <Badge
                                variant="secondary"
                                className={
                                  report.confidence_score >= 0.8
                                    ? "bg-green-100 text-green-800"
                                    : report.confidence_score >= 0.6
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {Math.round(report.confidence_score * 100)}%
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{new Date(report.reported_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{language === "hi" ? "समीक्षाधीन" : "Under Review"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {language === "hi" ? "बाजार मूल्य प्रबंधन" : "Market Price Management"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "hi" ? "नया मूल्य" : "Add Price"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{language === "hi" ? "नया बाजार मूल्य जोड़ें" : "Add New Market Price"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="commodity">{language === "hi" ? "फसल का नाम" : "Commodity Name"} *</Label>
                              <Input
                                id="commodity"
                                value={newMarketPrice.commodity}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, commodity: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: चावल" : "e.g., Rice"}
                              />
                            </div>
                            <div>
                              <Label htmlFor="market_name">
                                {language === "hi" ? "बाजार का नाम" : "Market Name"} *
                              </Label>
                              <Input
                                id="market_name"
                                value={newMarketPrice.market_name}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, market_name: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: दिल्ली मंडी" : "e.g., Delhi Mandi"}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="min_price">
                                {language === "hi" ? "न्यूनतम मूल्य (₹)" : "Min Price (₹)"}
                              </Label>
                              <Input
                                id="min_price"
                                type="number"
                                step="0.01"
                                value={newMarketPrice.min_price}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, min_price: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal_price">
                                {language === "hi" ? "मुख्य मूल्य (₹)" : "Modal Price (₹)"} *
                              </Label>
                              <Input
                                id="modal_price"
                                type="number"
                                step="0.01"
                                value={newMarketPrice.modal_price}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, modal_price: e.target.value })}
                                placeholder="0.00"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="max_price">
                                {language === "hi" ? "अधिकतम मूल्य (₹)" : "Max Price (₹)"}
                              </Label>
                              <Input
                                id="max_price"
                                type="number"
                                step="0.01"
                                value={newMarketPrice.max_price}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, max_price: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="state">{language === "hi" ? "राज्य" : "State"} *</Label>
                              <Input
                                id="state"
                                value={newMarketPrice.state}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, state: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: महाराष्ट्र" : "e.g., Maharashtra"}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="district">{language === "hi" ? "जिला" : "District"}</Label>
                              <Input
                                id="district"
                                value={newMarketPrice.district}
                                onChange={(e) => setNewMarketPrice({ ...newMarketPrice, district: e.target.value })}
                                placeholder={language === "hi" ? "जैसे: पुणे" : "e.g., Pune"}
                              />
                            </div>
                          </div>
                          <Button onClick={handleAddMarketPrice} className="w-full">
                            {language === "hi" ? "जोड़ें" : "Add Price"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => exportData("market_prices")}>
                      <Download className="h-4 w-4 mr-2" />
                      {language === "hi" ? "निर्यात" : "Export"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === "hi" ? "फसल" : "Commodity"}</TableHead>
                        <TableHead>{language === "hi" ? "बाजार" : "Market"}</TableHead>
                        <TableHead>{language === "hi" ? "मूल्य रेंज (₹)" : "Price Range (₹)"}</TableHead>
                        <TableHead>{language === "hi" ? "स्थान" : "Location"}</TableHead>
                        <TableHead>{language === "hi" ? "तारीख" : "Date"}</TableHead>
                        <TableHead>{language === "hi" ? "कार्य" : "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketPrices.slice(0, 10).map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.commodity}</TableCell>
                          <TableCell>{price.market_name}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {price.min_price && price.max_price ?
                              `₹${price.min_price.toFixed(0)}-${price.max_price.toFixed(0)}` :
                              `₹${price.modal_price.toFixed(0)}`
                            }
                          </TableCell>
                          <TableCell>
                            {price.district && price.state
                              ? `${price.district}, ${price.state}`
                              : price.state || "-"}
                          </TableCell>
                          <TableCell>{new Date(price.arrival_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
