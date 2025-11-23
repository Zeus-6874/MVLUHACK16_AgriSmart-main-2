"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/Navbar"
import { Beaker, TrendingUp, CheckCircle, Loader2, Sprout } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface SoilAnalysisResult {
  soil_health: string
  crop_recommendations: Array<{
    name: string
    nameHi: string
    suitability_score: number
    confidence: string
    yield_potential: string
    market_demand: string
  }>
  fertilizer_recommendations: Array<{
    nutrient: string
    fertilizer: string
    quantity: string
    timing: string
    priority: string
  }>
  soil_parameters: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
}

export default function SoilHealth() {
  const { language, t } = useI18n()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null)
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    // Validate inputs
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium || !formData.ph) {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "कृपया सभी फ़ील्ड भरें" : "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        const mappedResult: SoilAnalysisResult = {
          soil_health: data.soil_health,
          crop_recommendations: data.crop_recommendations || [],
          fertilizer_recommendations: data.fertilizer_recommendations || [],
          soil_parameters: {
            nitrogen: Number.parseFloat(formData.nitrogen),
            phosphorus: Number.parseFloat(formData.phosphorus),
            potassium: Number.parseFloat(formData.potassium),
            ph: Number.parseFloat(formData.ph),
          },
        }
        setAnalysisResult(mappedResult)
        toast({
          title: language === "hi" ? "विश्लेषण पूर्ण" : "Analysis Complete",
          description: language === "hi" ? "मिट्टी का विश्लेषण सफलतापूर्वक पूरा हुआ" : "Soil analysis completed successfully",
        })
      } else {
        throw new Error(data.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "विश्लेषण में त्रुटि हुई" : "Error occurred during analysis",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent":
      case "good":
        return "text-green-600 bg-green-100"
      case "fair":
        return "text-yellow-600 bg-yellow-100"
      case "poor":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getHealthScore = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent":
        return 95
      case "good":
        return 85
      case "fair":
        return 65
      case "poor":
        return 35
      default:
        return 50
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "hi" ? "मिट्टी स्वास्थ्य विश्लेषण" : "Soil Health Analysis"}
          </h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "अपनी मिट्टी के पोषक तत्वों का विश्लेषण करें और फसल की सिफारिशें प्राप्त करें"
              : "Analyze your soil nutrients and get crop recommendations"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Soil Analysis Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-blue-600" />
                  {language === "hi" ? "मिट्टी परीक्षण डेटा दर्ज करें" : "Enter Soil Test Data"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">{language === "hi" ? "नाइट्रोजन (N)" : "Nitrogen (N)"} (mg/kg)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      placeholder="0-400"
                      value={formData.nitrogen}
                      onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">{language === "hi" ? "फास्फोरस (P)" : "Phosphorus (P)"} (mg/kg)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      placeholder="0-50"
                      value={formData.phosphorus}
                      onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="potassium">{language === "hi" ? "पोटेशियम (K)" : "Potassium (K)"} (mg/kg)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      placeholder="0-300"
                      value={formData.potassium}
                      onChange={(e) => handleInputChange("potassium", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph">{language === "hi" ? "pH स्तर" : "pH Level"}</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      placeholder="4.0-9.0"
                      value={formData.ph}
                      onChange={(e) => handleInputChange("ph", e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full md:w-auto">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "hi" ? "विश्लेषण हो रहा है..." : "Analyzing..."}
                      </>
                    ) : (
                      <>
                        <Beaker className="mr-2 h-4 w-4" />
                        {language === "hi" ? "मिट्टी का विश्लेषण करें" : "Analyze Soil"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-green-600" />
                      {language === "hi" ? "उपयुक्त फसलें" : "Suitable Crops"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {analysisResult.crop_recommendations.slice(0, 6).map((crop, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{language === "hi" ? crop.nameHi : crop.name}</h3>
                            <p className="text-sm text-gray-500">
                              {language === "hi" ? "उपयुक्तता" : "Suitability"}: {crop.suitability_score}%
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                crop.confidence === "High"
                                  ? "default"
                                  : crop.confidence === "Medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {crop.confidence}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{crop.yield_potential}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {language === "hi" ? "उर्वरक सिफारिशें" : "Fertilizer Recommendations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.fertilizer_recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium">{rec.fertilizer}</div>
                            <div className="text-sm text-gray-600">
                              {language === "hi" ? "मात्रा" : "Quantity"}: {rec.quantity} |{" "}
                              {language === "hi" ? "समय" : "Timing"}: {rec.timing}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Health Score */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {language === "hi" ? "मिट्टी स्वास्थ्य स्कोर" : "Soil Health Score"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold mb-2">{getHealthScore(analysisResult.soil_health)}/100</div>
                  <Badge className={getHealthColor(analysisResult.soil_health)}>{analysisResult.soil_health}</Badge>
                  <div className="mt-4">
                    <Progress value={getHealthScore(analysisResult.soil_health)} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soil Parameters Display */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === "hi" ? "परीक्षण परिणाम" : "Test Results"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{language === "hi" ? "नाइट्रोजन" : "Nitrogen"}</span>
                    <span className="text-sm">{analysisResult.soil_parameters.nitrogen} mg/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{language === "hi" ? "फास्फोरस" : "Phosphorus"}</span>
                    <span className="text-sm">{analysisResult.soil_parameters.phosphorus} mg/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{language === "hi" ? "पोटेशियम" : "Potassium"}</span>
                    <span className="text-sm">{analysisResult.soil_parameters.potassium} mg/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">pH</span>
                    <span className="text-sm">{analysisResult.soil_parameters.ph}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "त्वरित सुझाव" : "Quick Tips"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">
                    {language === "hi" ? "नियमित परीक्षण" : "Regular Testing"}
                  </h4>
                  <p className="text-sm text-blue-600">
                    {language === "hi"
                      ? "बेहतर फसल के लिए साल में दो बार मिट्टी की जांच कराएं"
                      : "Test your soil twice a year for better crop yields"}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">
                    {language === "hi" ? "जैविक खाद" : "Organic Matter"}
                  </h4>
                  <p className="text-sm text-green-600">
                    {language === "hi"
                      ? "मिट्टी की उर्वरता बढ़ाने के लिए कंपोस्ट का उपयोग करें"
                      : "Use compost to improve soil fertility naturally"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
