"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Navbar from "@/components/Navbar"
import {
  Search,
  Filter,
  FileText,
  Users,
  IndianRupee,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

interface Scheme {
  id: string
  scheme_name: string
  description: string
  eligibility: string
  benefits: string
  application_process: string
  contact_info: string
  state: string
  category: string
  is_active: boolean
  created_at: string
  application_deadline?: string
  budget_allocation?: string
  beneficiaries_count?: number
  website_url?: string
}

export default function SchemesPage() {
  const [language, setLanguage] = useState("en")
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)

  useEffect(() => {
    fetchSchemes()
  }, [])

  useEffect(() => {
    filterSchemes()
  }, [schemes, searchTerm, selectedState, selectedCategory])

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/schemes")
      const data = await response.json()

      if (data.success && data.schemes && data.schemes.length > 0) {
        setSchemes(data.schemes)
      } else {
        // No schemes available - show empty state
        setSchemes([])
      }
    } catch (error) {
      console.error("Failed to fetch schemes:", error)
      setSchemes([])
    } finally {
      setLoading(false)
    }
  }

  const filterSchemes = () => {
    let filtered = schemes

    if (searchTerm) {
      filtered = filtered.filter(
        (scheme) =>
          scheme.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedState !== "all") {
      filtered = filtered.filter((scheme) => scheme.state === selectedState || scheme.state === "All India")
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((scheme) => scheme.category === selectedCategory)
    }

    setFilteredSchemes(filtered)
  }

  const states = [
    { value: "all", label: language === "hi" ? "सभी राज्य" : "All States" },
    { value: "All India", label: language === "hi" ? "अखिल भारतीय" : "All India" },
    { value: "Maharashtra", label: language === "hi" ? "महाराष्ट्र" : "Maharashtra" },
    { value: "Punjab", label: language === "hi" ? "पंजाब" : "Punjab" },
    { value: "Uttar Pradesh", label: language === "hi" ? "उत्तर प्रदेश" : "Uttar Pradesh" },
    { value: "Gujarat", label: language === "hi" ? "गुजरात" : "Gujarat" },
    { value: "Rajasthan", label: language === "hi" ? "राजस्थान" : "Rajasthan" },
  ]

  const categories = [
    { value: "all", label: language === "hi" ? "सभी श्रेणियां" : "All Categories" },
    { value: "Income Support", label: language === "hi" ? "आय सहायता" : "Income Support" },
    { value: "Insurance", label: language === "hi" ? "बीमा" : "Insurance" },
    { value: "Credit", label: language === "hi" ? "ऋण" : "Credit" },
    { value: "Soil Health", label: language === "hi" ? "मिट्टी स्वास्थ्य" : "Soil Health" },
    { value: "Pension", label: language === "hi" ? "पेंशन" : "Pension" },
    { value: "Marketing", label: language === "hi" ? "विपणन" : "Marketing" },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      "Income Support": "bg-green-100 text-green-800",
      Insurance: "bg-blue-100 text-blue-800",
      Credit: "bg-purple-100 text-purple-800",
      "Soil Health": "bg-orange-100 text-orange-800",
      Pension: "bg-pink-100 text-pink-800",
      Marketing: "bg-teal-100 text-teal-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "hi" ? "सरकारी योजनाएं" : "Government Schemes"}
          </h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "किसानों के लिए सरकारी योजनाओं और सब्सिडी की जानकारी प्राप्त करें"
              : "Explore government schemes and subsidies available for farmers"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredSchemes.length}</div>
              <div className="text-sm text-gray-600">{language === "hi" ? "कुल योजनाएं" : "Total Schemes"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredSchemes.filter((s) => s.state === "All India").length}
              </div>
              <div className="text-sm text-gray-600">{language === "hi" ? "राष्ट्रीय योजनाएं" : "National Schemes"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredSchemes.map((s) => s.category)).size}
              </div>
              <div className="text-sm text-gray-600">{language === "hi" ? "श्रेणियां" : "Categories"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredSchemes.reduce((sum, s) => sum + (s.beneficiaries_count || 0), 0) / 1000000)}M
              </div>
              <div className="text-sm text-gray-600">{language === "hi" ? "लाभार्थी" : "Beneficiaries"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === "hi" ? "खोज और फ़िल्टर" : "Search & Filter"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={language === "hi" ? "योजना खोजें..." : "Search schemes..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg leading-tight">{scheme.scheme_name}</CardTitle>
                    <Badge className={getCategoryColor(scheme.category)}>{scheme.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{scheme.state}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{scheme.description}</p>

                  {scheme.beneficiaries_count && (
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>
                        {(scheme.beneficiaries_count / 1000000).toFixed(1)}M{" "}
                        {language === "hi" ? "लाभार्थी" : "beneficiaries"}
                      </span>
                    </div>
                  )}

                  {scheme.budget_allocation && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <IndianRupee className="h-4 w-4 text-green-500" />
                      <span>{scheme.budget_allocation}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedScheme(scheme)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          {language === "hi" ? "विवरण" : "Details"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center justify-between">
                            <span>{selectedScheme?.scheme_name}</span>
                            <Badge className={getCategoryColor(selectedScheme?.category || "")}>
                              {selectedScheme?.category}
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>
                        {selectedScheme && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {language === "hi" ? "विवरण" : "Description"}
                              </h4>
                              <p className="text-gray-600">{selectedScheme.description}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {language === "hi" ? "पात्रता" : "Eligibility"}
                              </h4>
                              <p className="text-gray-600">{selectedScheme.eligibility}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                {language === "hi" ? "लाभ" : "Benefits"}
                              </h4>
                              <p className="text-gray-600">{selectedScheme.benefits}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {language === "hi" ? "आवेदन प्रक्रिया" : "Application Process"}
                              </h4>
                              <p className="text-gray-600">{selectedScheme.application_process}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {language === "hi" ? "संपर्क जानकारी" : "Contact Information"}
                              </h4>
                              <p className="text-gray-600">{selectedScheme.contact_info}</p>
                            </div>

                            {selectedScheme.website_url && (
                              <div className="pt-4 border-t">
                                <Button asChild className="w-full">
                                  <a
                                    href={selectedScheme.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    {language === "hi" ? "आधिकारिक वेबसाइट पर जाएं" : "Visit Official Website"}
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {scheme.website_url && (
                      <Button asChild size="sm" variant="default">
                        <a href={scheme.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSchemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "hi" ? "कोई योजना नहीं मिली" : "No schemes found"}
            </h3>
            <p className="text-gray-600">
              {language === "hi" ? "अपने खोज मापदंड को समायोजित करने का प्रयास करें" : "Try adjusting your search criteria"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
