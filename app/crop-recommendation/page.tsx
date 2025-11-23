"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/Navbar"
import {
  Sprout,
  TrendingUp,
  Loader2,
  Target,
  DollarSign,
  Calendar,
  Droplets,
  Thermometer,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CropRecommendation {
  name: string
  nameHi: string
  suitability_score: number
  confidence: string
  yield_potential: string
  market_demand: string
  water_requirement: string
  duration_days: number
  limiting_factors: string[]
  expected_yield_per_acre: number
}

interface RecommendationResult {
  soil_health: string
  soil_health_score: number
  crop_recommendations: CropRecommendation[]
  fertilizer_recommendations: any[]
  risk_assessment: any
  market_insights: any[]
}

export default function CropRecommendation() {
  const [language, setLanguage] = useState("en")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    location: "",
    season: "all",
    rainfall: "",
    temperature: "",
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    // Validate required inputs
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium || !formData.ph) {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "कृपया सभी आवश्यक फ़ील्ड भरें" : "Please fill all required fields",
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
        setResult(data)
        toast({
          title: language === "hi" ? "विश्लेषण पूर्ण" : "Analysis Complete",
          description: language === "hi" ? "फसल सिफारिशें तैयार हैं" : "Crop recommendations are ready",
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "hi" ? "AI फसल सिफारिश प्रणाली" : "AI Crop Recommendation System"}
          </h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "मिट्टी और जलवायु डेटा के आधार पर व्यक्तिगत फसल सुझाव प्राप्त करें"
              : "Get personalized crop suggestions based on soil and climate data"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  {language === "hi" ? "फार्म डेटा दर्ज करें" : "Enter Farm Data"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Soil Parameters */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">
                    {language === "hi" ? "मिट्टी परीक्षण डेटा" : "Soil Test Data"} *
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                {/* Location and Season */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">
                    {language === "hi" ? "स्थान और मौसम" : "Location & Season"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">{language === "hi" ? "स्थान" : "Location"}</Label>
                      <Input
                        id="location"
                        placeholder={language === "hi" ? "जिला/राज्य" : "District/State"}
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "hi" ? "मौसम" : "Season"}</Label>
                      <Select value={formData.season} onValueChange={(value) => handleInputChange("season", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "hi" ? "मौसम चुनें" : "Select season"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === "hi" ? "सभी मौसम" : "All Seasons"}</SelectItem>
                          <SelectItem value="kharif">{language === "hi" ? "खरीफ" : "Kharif"}</SelectItem>
                          <SelectItem value="rabi">{language === "hi" ? "रबी" : "Rabi"}</SelectItem>
                          <SelectItem value="summer">{language === "hi" ? "गर्मी" : "Summer"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Climate Data (Optional) */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-800">
                    {language === "hi" ? "जलवायु डेटा (वैकल्पिक)" : "Climate Data (Optional)"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rainfall" className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        {language === "hi" ? "वार्षिक वर्षा" : "Annual Rainfall"} (mm)
                      </Label>
                      <Input
                        id="rainfall"
                        type="number"
                        placeholder="300-2000"
                        value={formData.rainfall}
                        onChange={(e) => handleInputChange("rainfall", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        {language === "hi" ? "औसत तापमान" : "Average Temperature"} (°C)
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        placeholder="15-35"
                        value={formData.temperature}
                        onChange={(e) => handleInputChange("temperature", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full" size="lg">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "hi" ? "AI विश्लेषण हो रहा है..." : "AI Analysis in Progress..."}
                    </>
                  ) : (
                    <>
                      <Sprout className="mr-2 h-4 w-4" />
                      {language === "hi" ? "फसल सिफारिशें प्राप्त करें" : "Get Crop Recommendations"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <>
                {/* Crop Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-green-600" />
                      {language === "hi" ? "सुझाई गई फसलें" : "Recommended Crops"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.crop_recommendations.map((crop, index) => (
                        <Card key={index} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-lg">{language === "hi" ? crop.nameHi : crop.name}</h3>
                              <Badge className={getConfidenceColor(crop.confidence)}>
                                {crop.confidence} {language === "hi" ? "विश्वास" : "Confidence"}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span>{language === "hi" ? "उपयुक्तता स्कोर" : "Suitability Score"}</span>
                                <span className={`font-semibold ${getSuitabilityColor(crop.suitability_score)}`}>
                                  {crop.suitability_score}/100
                                </span>
                              </div>
                              <Progress value={crop.suitability_score} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>
                                  {language === "hi" ? "उत्पादन:" : "Yield:"} {crop.yield_potential}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>
                                  {language === "hi" ? "मांग:" : "Demand:"} {crop.market_demand}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                <span>
                                  {language === "hi" ? "पानी:" : "Water:"} {crop.water_requirement}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {crop.duration_days} {language === "hi" ? "दिन" : "days"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                              <strong>{language === "hi" ? "अपेक्षित उत्पादन:" : "Expected Yield:"}</strong>{" "}
                              {crop.expected_yield_per_acre} kg/acre
                            </div>

                            {crop.limiting_factors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-orange-600 mb-1">
                                  {language === "hi" ? "सीमित कारक:" : "Limiting Factors:"}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {crop.limiting_factors.map((factor, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      {language === "hi" ? "बाजार अंतर्दृष्टि" : "Market Insights"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.market_insights.map((insight, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{insight.crop_name}</h4>
                            <Badge variant="outline">₹{insight.current_price}/quintal</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">
                                {language === "hi" ? "मूल्य प्रवृत्ति:" : "Price Trend:"}
                              </span>
                              <p className="font-medium capitalize">{insight.price_trend}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                {language === "hi" ? "बाजार मांग:" : "Market Demand:"}
                              </span>
                              <p className="font-medium capitalize">{insight.market_demand}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                {language === "hi" ? "लाभ क्षमता:" : "Profit Potential:"}
                              </span>
                              <p className="font-medium">{insight.profit_potential}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">{language === "hi" ? "निवेश:" : "Investment:"}</span>
                              <p className="font-medium">₹{insight.investment_required}/acre</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Soil Health Score */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {language === "hi" ? "मिट्टी स्वास्थ्य स्कोर" : "Soil Health Score"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold mb-2 text-green-600">{result.soil_health_score}/100</div>
                  <Badge
                    className={
                      result.soil_health === "Excellent"
                        ? "bg-green-100 text-green-800"
                        : result.soil_health === "Good"
                          ? "bg-blue-100 text-blue-800"
                          : result.soil_health === "Fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }
                  >
                    {result.soil_health}
                  </Badge>
                  <div className="mt-4">
                    <Progress value={result.soil_health_score} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    {language === "hi" ? "जोखिम मूल्यांकन" : "Risk Assessment"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{language === "hi" ? "समग्र जोखिम:" : "Overall Risk:"}</span>
                      <Badge
                        className={
                          result.risk_assessment.overall_risk === "Low"
                            ? "bg-green-100 text-green-800"
                            : result.risk_assessment.overall_risk === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {result.risk_assessment.overall_risk}
                      </Badge>
                    </div>

                    {result.risk_assessment.risk_factors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          {language === "hi" ? "जोखिम कारक:" : "Risk Factors:"}
                        </p>
                        <div className="space-y-1">
                          {result.risk_assessment.risk_factors.map((risk: string, index: number) => (
                            <Alert key={index} className="py-2">
                              <AlertTriangle className="h-3 w-3" />
                              <AlertDescription className="text-xs">{risk}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "उपयोग निर्देश" : "How to Use"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <p className="text-sm">{language === "hi" ? "मिट्टी परीक्षण डेटा दर्ज करें" : "Enter soil test data"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <p className="text-sm">
                    {language === "hi" ? "स्थान और मौसम की जानकारी दें" : "Provide location and season info"}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <p className="text-sm">{language === "hi" ? "AI विश्लेषण के लिए प्रतीक्षा करें" : "Wait for AI analysis"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <p className="text-sm">
                    {language === "hi" ? "व्यक्तिगत सुझाव प्राप्त करें" : "Get personalized recommendations"}
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
