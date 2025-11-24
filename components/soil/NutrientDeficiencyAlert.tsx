"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Droplets,
  Flame,
  Zap,
  Shield,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface SoilAnalysis {
  id: string
  nitrogen_level: number
  phosphorus_level: number
  potassium_level: number
  ph_level: number
  organic_matter?: number
  analysis_date: string
}

interface NutrientDeficiencyAlertProps {
  farmerId: string
  latestAnalysis?: SoilAnalysis
  analyses: SoilAnalysis[]
}

interface Deficiency {
  nutrient: string
  symbol: string
  level: number
  optimalRange: { min: number; max: number; optimal: number }
  status: "deficient" | "excessive" | "optimal"
  severity: "critical" | "moderate" | "mild" | "none"
  impact: string
  symptoms: string[]
  remedies: string[]
  preventive: string[]
}

export default function NutrientDeficiencyAlert({ farmerId, latestAnalysis, analyses }: NutrientDeficiencyAlertProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([])
  const [selectedDeficiency, setSelectedDeficiency] = useState<Deficiency | null>(null)

  useEffect(() => {
    if (latestAnalysis) {
      analyzeDeficiencies()
    }
  }, [latestAnalysis])

  const analyzeDeficiencies = () => {
    if (!latestAnalysis) return

    const nutrients = [
      {
        name: language === "hi" ? "नाइट्रोजन" : "Nitrogen",
        symbol: "N",
        level: latestAnalysis.nitrogen_level,
        optimalRange: { min: 150, max: 400, optimal: 250 },
        impact: language === "hi"
          ? "पत्तियों का पीलापन, सुस्त वृद्धि, कम पैदावार"
          : "Yellowing leaves, stunted growth, reduced yield",
        symptoms: [
          language === "hi" ? "पुराने पत्ते पीले पड़ना" : "Older leaves turn yellow",
          language === "hi" ? "पौधे सुस्त और छोटे रहना" : "Plants are stunted and small",
          language === "hi" ? "कम फूल और फल" : "Fewer flowers and fruits",
          language === "hi" ? "कम पैदावार" : "Reduced yield"
        ],
        remedies: [
          language === "hi" ? "यूरिया उर्वरक लगाएं (46% N)" : "Apply urea fertilizer (46% N)",
          language === "hi" ? "अमोनियम सल्फेट उपयोग करें" : "Use ammonium sulfate",
          language === "hi" ? "हरी खाद की सलाह लें" : "Consider green manuring",
          language === "hi" ? "फसल चक्र अपनाएं" : "Practice crop rotation"
        ],
        preventive: [
          language === "hi" ? "नाइट्रोजन-फिक्सिंग फसलें लगाएं" : "Plant nitrogen-fixing crops",
          language === "hi" ? "मिट्टी को कवर क्रॉप के साथ कवर करें" : "Cover soil with cover crops",
          language === "hi" ? "कार्बनिक पदार्थ जोड़ें" : "Add organic matter"
        ]
      },
      {
        name: language === "hi" ? "फॉस्फोरस" : "Phosphorus",
        symbol: "P",
        level: latestAnalysis.phosphorus_level,
        optimalRange: { min: 15, max: 50, optimal: 30 },
        impact: language === "hi"
          ? "कम जड़ विकास, देर से फूलना, बैंगनी पत्तियां"
          : "Poor root development, delayed flowering, purple leaves",
        symptoms: [
          language === "hi" ? "गहरे हरे या बैंगनी पत्तियां" : "Dark green or purple leaves",
          language === "hi" ? "कम जड़ विकास" : "Poor root development",
          language === "hi" ? "देर से परिपक्वता" : "Delayed maturity",
          language === "hi" ? "कम बीज निर्माण" : "Poor seed formation"
        ],
        remedies: [
          language === "hi" ? "DAP (18-46-0) उर्वरक लगाएं" : "Apply DAP (18-46-0) fertilizer",
          language === "hi" ? "सिंगल सुपर फॉस्फेट (SSP)" : "Use Single Super Phosphate (SSP)",
          language === "hi" ? "हड्डी का बुराद जोड़ें" : "Add bone meal",
          language === "hi" ? "गोबर का उपयोग करें" : "Use farmyard manure"
        ],
        preventive: [
          language === "hi" ? "वार्षिक मिट्टी परीक्षण करें" : "Conduct annual soil testing",
          language === "hi" ? "संतुलित उर्वरक उपयोग करें" : "Use balanced fertilization",
          language === "hi" ? "मिट्टी कटाव रोकें" : "Prevent soil erosion"
        ]
      },
      {
        name: language === "hi" ? "पोटैशियम" : "Potassium",
        symbol: "K",
        level: latestAnalysis.potassium_level,
        optimalRange: { min: 120, max: 300, optimal: 200 },
        impact: language === "hi"
          ? "कम रोग प्रतिरोध, सूखी तनाव, पत्ती किनारे पीलापन"
          : "Reduced disease resistance, drought stress, yellow leaf edges",
        symptoms: [
          language === "hi" ? "पत्तियों के किनारे पीले या भूरे" : "Yellow or brown leaf edges",
          language === "hi" ? "कम फल आकार" : "Small fruit size",
          language === "hi" ? "कम रोग प्रतिरोध" : "Weak disease resistance",
          language === "hi" ? "सूखी तनाव संवेदनशीलता" : "Drought stress sensitivity"
        ],
        remedies: [
          language === "hi" ? "MOP (म्यूरिएट ऑफ पोटाश) लगाएं" : "Apply MOP (Muriate of Potash)",
          language === "hi" ? "पोटैश सल्फेट उपयोग करें" : "Use potassium sulfate",
          language === "hi" ? "काष्ठ की राख जोड़ें" : "Add wood ash",
          language === "hi" ? "केला छाल कम्पोस्ट करें" : "Compost banana peels"
        ],
        preventive: [
          language === "hi" ? "गहरी जुताई अभ्यास करें" : "Practice deep tillage",
          language === "hi" ? "फसल अवशेष जलाएं" : "Mulch crop residues",
          language === "hi" ? "कार्बनिक पदार्थ बनाए रखें" : "Maintain organic matter"
        ]
      }
    ]

    const analyzedDeficiencies = nutrients.map(nutrient => {
      const { level, optimalRange } = nutrient

      let status: "deficient" | "excessive" | "optimal" = "optimal"
      let severity: "critical" | "moderate" | "mild" | "none" = "none"

      if (level < optimalRange.min) {
        status = "deficient"
        const deficiencyPercent = ((optimalRange.min - level) / optimalRange.min) * 100
        severity = deficiencyPercent > 50 ? "critical" : deficiencyPercent > 25 ? "moderate" : "mild"
      } else if (level > optimalRange.max) {
        status = "excessive"
        const excessPercent = ((level - optimalRange.max) / optimalRange.max) * 100
        severity = excessPercent > 50 ? "critical" : excessPercent > 25 ? "moderate" : "mild"
      }

      return {
        nutrient: nutrient.name,
        symbol: nutrient.symbol,
        level,
        optimalRange,
        status,
        severity,
        impact: nutrient.impact,
        symptoms: nutrient.symptoms,
        remedies: nutrient.remedies,
        preventive: nutrient.preventive
      } as Deficiency
    })

    // Add pH analysis
    const phDeficiency: Deficiency = {
      nutrient: language === "hi" ? "pH स्तर" : "pH Level",
      symbol: "pH",
      level: latestAnalysis.ph_level,
      optimalRange: { min: 6.0, max: 8.0, optimal: 7.0 },
      status: latestAnalysis.ph_level < 6.0 ? "deficient" : latestAnalysis.ph_level > 8.0 ? "excessive" : "optimal",
      severity: Math.abs(latestAnalysis.ph_level - 7.0) > 2 ? "critical" : Math.abs(latestAnalysis.ph_level - 7.0) > 1 ? "moderate" : "mild",
      impact: latestAnalysis.ph_level < 6.0
        ? language === "hi" ? "पोषक तत्व उपलब्धता कम, सूक्ष्मजीवी गतिविधि कम" : "Reduced nutrient availability, poor microbial activity"
        : language === "hi" ? "सूक्ष्मपोषक घाट, लौह तत्व की कमी" : "Micronutrient deficiencies, iron chlorosis",
      symptoms: latestAnalysis.ph_level < 6.0
        ? [
            language === "hi" ? "पत्तियों का पीलापन" : "Yellowing leaves",
            language === "hi" ? "धीमी वृद्धि" : "Slow growth",
            language === "hi" ? "कम जड़ विकास" : "Poor root development"
          ]
        : [
            language === "hi" ? "पत्तियों में लौह घाट" : "Iron chlorosis in leaves",
            language === "hi" ? "सूक्ष्मपोषक की कमी" : "Micronutrient deficiencies",
            language === "hi" ? "पानी सोखने की समस्या" : "Water absorption issues"
          ],
      remedies: latestAnalysis.ph_level < 6.0
        ? [
            language === "hi" ? "कृषिक चूना लगाएं" : "Apply agricultural lime",
            language === "hi" ? "डोलोमाइट चूना उपयोग करें" : "Use dolomitic lime",
            language === "hi" ? "कार्बनिक पदार्थ जोड़ें" : "Add organic matter"
          ]
        : [
            language === "hi" ? "गंधक लगाएं" : "Apply elemental sulfur",
            language === "hi" ? "अम्लीय कार्बनिक पदार्थ उपयोग करें" : "Use acidic organic matter",
            language === "hi" ? "पीट मॉस जोड़ें" : "Add peat moss"
          ],
      preventive: latestAnalysis.ph_level < 6.0
        ? [
            language === "hi" ? "नियमित pH परीक्षण करें" : "Regular pH testing",
            language === "hi" ? "संतुलित उर्वरक उपयोग करें" : "Use balanced fertilizers",
            language === "hi" ? "अम्लीय फसलें लगाएं" : "Plant acid-loving crops"
          ]
        : [
            language === "hi" ? "जल गुणवत्ता की जांच करें" : "Check water quality",
            language === "hi" ? "कम चूना वाले उर्वरक उपयोग करें" : "Use low-lime fertilizers"
          ]
    }

    analyzedDeficiencies.push(phDeficiency)
    setDeficiencies(analyzedDeficiencies)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100 border-red-200"
      case "moderate": return "text-orange-600 bg-orange-100 border-orange-200"
      case "mild": return "text-yellow-600 bg-yellow-100 border-yellow-200"
      default: return "text-green-600 bg-green-100 border-green-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-5 w-5" />
      case "moderate": return <AlertTriangle className="h-5 w-5" />
      case "mild": return <Info className="h-5 w-5" />
      default: return <CheckCircle className="h-5 w-5" />
    }
  }

  const getNutrientIcon = (symbol: string) => {
    switch (symbol) {
      case "N": return <Droplets className="h-6 w-6" />
      case "P": return <Flame className="h-6 w-6" />
      case "K": return <Zap className="h-6 w-6" />
      case "pH": return <Shield className="h-6 w-6" />
      default: return <Info className="h-6 w-6" />
    }
  }

  const getStatusTrend = (nutrient: string) => {
    if (analyses.length < 2) return null

    const recent = analyses[0] as any
    const older = analyses[1] as any

    const currentValue = recent[nutrient.toLowerCase() + "_level"]
    const oldValue = older[nutrient.toLowerCase() + "_level"]

    if (!currentValue || !oldValue) return null

    const change = ((currentValue - oldValue) / oldValue) * 100

    if (Math.abs(change) < 5) return "stable"

    return change > 0 ? "improving" : "declining"
  }

  const criticalDeficiencies = deficiencies.filter(d => d.severity === "critical")
  const moderateDeficiencies = deficiencies.filter(d => d.severity === "moderate")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {language === "hi" ? "पोषक तत्व की कमी अलर्ट" : "Nutrient Deficiency Alerts"}
        </h3>
        <div className="text-sm text-gray-600">
          {language === "hi" ? "अंतिम विश्लेषण:" : "Last analysis"}:{" "}
          {latestAnalysis ? new Date(latestAnalysis.analysis_date).toLocaleDateString() : "-"}
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalDeficiencies.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {language === "hi" ? "तत्काल ध्यान आवश्यक" : "Immediate Attention Required"}
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {language === "hi"
              ? `आपकी मिट्टी में ${criticalDeficiencies.length} गंभीर कमियां हैं। तत्काल कार्रवाई की आवश्यकता है।`
              : `You have ${criticalDeficiencies.length} critical deficiencies that require immediate attention.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "गंभीर" : "Critical"}
                </p>
                <p className="text-2xl font-bold text-red-600">{criticalDeficiencies.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "मध्यम" : "Moderate"}
                </p>
                <p className="text-2xl font-bold text-orange-600">{moderateDeficiencies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "हल्की" : "Mild"}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deficiencies.filter(d => d.severity === "mild").length}
                </p>
              </div>
              <Info className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === "hi" ? "इष्टत" : "Optimal"}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {deficiencies.filter(d => d.severity === "none").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutrient Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deficiencies.map((deficiency) => {
          const trend = getStatusTrend(deficiency.symbol.toLowerCase())
          const percentage = Math.min(100, Math.max(0,
            ((deficiency.level - deficiency.optimalRange.min) /
            (deficiency.optimalRange.max - deficiency.optimalRange.min)) * 100
          ))

          return (
            <Card
              key={deficiency.symbol}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDeficiency?.symbol === deficiency.symbol ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setSelectedDeficiency(deficiency)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getNutrientIcon(deficiency.symbol)}
                    <div>
                      <h4 className="font-semibold">{deficiency.nutrient}</h4>
                      <p className="text-sm text-gray-600">{deficiency.level}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getSeverityColor(deficiency.severity)} p-2 rounded-lg`}>
                    {getSeverityIcon(deficiency.severity)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{deficiency.optimalRange.min}</span>
                    <span>{deficiency.optimalRange.max}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    // Color based on status
                    style={{
                      background: `linear-gradient(to right, ${
                        deficiency.status === "optimal" ? "#10b981" :
                        deficiency.status === "deficient" ? "#ef4444" : "#f59e0b"
                      } ${percentage}%, #e5e7eb ${percentage}%)`
                    }}
                  />
                  {trend && (
                    <div className="flex items-center gap-1 text-xs">
                      {trend === "improving" ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : trend === "declining" ? (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="h-3 w-3 bg-gray-400 rounded-full" />
                      )}
                      <span className={
                        trend === "improving" ? "text-green-600" :
                        trend === "declining" ? "text-red-600" : "text-gray-600"
                      }>
                        {trend === "improving" ? (language === "hi" ? "सुधार" : "Improving") :
                         trend === "declining" ? (language === "hi" ? "गिरावट" : "Declining") :
                         (language === "hi" ? "स्थिर" : "Stable")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Deficiency Information */}
      {selectedDeficiency && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getNutrientIcon(selectedDeficiency.symbol)}
              {selectedDeficiency.nutrient} - {language === "hi" ? "विस्तृत जानकारी" : "Detailed Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">
                  {language === "hi" ? "अवलोकन" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="symptoms">
                  {language === "hi" ? "लक्षण" : "Symptoms"}
                </TabsTrigger>
                <TabsTrigger value="remedies">
                  {language === "hi" ? "उपचार" : "Remedies"}
                </TabsTrigger>
                <TabsTrigger value="prevention">
                  {language === "hi" ? "रोकथाम" : "Prevention"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        {language === "hi" ? "वर्तमान स्तर:" : "Current Level:"}
                      </span>
                      <p className="text-2xl font-bold">{selectedDeficiency.level}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        {language === "hi" ? "इष्टम सीमा:" : "Optimal Range:"}
                      </span>
                      <p className="text-lg">
                        {selectedDeficiency.optimalRange.min} - {selectedDeficiency.optimalRange.max}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {language === "hi" ? "स्थिति:" : "Status:"}
                    </span>
                    <Badge className={`ml-2 ${getSeverityColor(selectedDeficiency.severity)}`}>
                      {selectedDeficiency.status === "deficient"
                        ? (language === "hi" ? "कम" : "Deficient")
                        : selectedDeficiency.status === "excessive"
                        ? (language === "hi" ? "अधिक" : "Excessive")
                        : (language === "hi" ? "इष्ट" : "Optimal")
                      }
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {language === "hi" ? "प्रभाव:" : "Impact:"}
                    </span>
                    <p className="mt-1">{selectedDeficiency.impact}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="symptoms" className="mt-4">
                <div className="space-y-3">
                  {selectedDeficiency.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <p>{symptom}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="remedies" className="mt-4">
                <div className="space-y-3">
                  {selectedDeficiency.remedies.map((remedy, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p>{remedy}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="prevention" className="mt-4">
                <div className="space-y-3">
                  {selectedDeficiency.preventive.map((preventive, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p>{preventive}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "hi" ? "त्वरित कार्रवाई" : "Quick Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.location.href = "/soil-health"}
            >
              <span className="font-semibold mb-1">
                {language === "hi" ? "नया विश्लेषण" : "New Analysis"}
              </span>
              <span className="text-sm text-left opacity-70">
                {language === "hi" ? "मिट्टी का नया विश्लेषण करें" : "Conduct new soil analysis"}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.location.href = "/field-management"}
            >
              <span className="font-semibold mb-1">
                {language === "hi" ? "उर्वरक योजना" : "Fertilizer Plan"}
              </span>
              <span className="text-sm text-left opacity-70">
                {language === "hi" ? "उर्वरक अनुप्रयोग योजना बनाएं" : "Create fertilizer application plan"}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.location.href = "/marketplace"}
            >
              <span className="font-semibold mb-1">
                {language === "hi" ? "उर्वरक खरीदें" : "Buy Fertilizers"}
              </span>
              <span className="text-sm text-left opacity-70">
                {language === "hi" ? "आवश्यक उर्वरक खरीदें" : "Purchase required fertilizers"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}