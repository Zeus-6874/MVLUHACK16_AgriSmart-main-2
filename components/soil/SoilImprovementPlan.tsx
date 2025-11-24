"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, TrendingUp, Leaf, AlertTriangle, Target, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"

interface SoilAnalysis {
  id: string
  nitrogen_level: number
  phosphorus_level: number
  potassium_level: number
  ph_level: number
  organic_matter?: number
}

interface FarmerProfile {
  location?: string
  land_size?: number
}

interface SoilImprovementPlanProps {
  farmerId: string
  latestAnalysis?: SoilAnalysis
  profile: FarmerProfile
}

interface ImprovementTask {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "fertilizer" | "organic" | "ph" | "microbial"
  estimatedCost: number
  timeToImplement: string
  expectedImpact: string
  status: "pending" | "in-progress" | "completed"
  dueDate?: string
}

export default function SoilImprovementPlan({ farmerId, latestAnalysis, profile }: SoilImprovementPlanProps) {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [improvementPlan, setImprovementPlan] = useState<ImprovementTask[]>([])
  const [selectedPriority, setSelectedPriority] = useState<string>("all")

  useEffect(() => {
    if (latestAnalysis) {
      generateImprovementPlan()
    }
  }, [latestAnalysis])

  const generateImprovementPlan = () => {
    if (!latestAnalysis) return

    const tasks: ImprovementTask[] = []

    // Nitrogen deficiency
    if (latestAnalysis.nitrogen_level < 150) {
      tasks.push({
        id: "nitrogen-deficiency",
        title: language === "hi" ? "नाइट्रोजन की कमी" : "Nitrogen Deficiency",
        description: language === "hi"
          ? "मिट्टी में नाइट्रोजन की स्तर कम है। यूरिया या अन्य नाइट्रोजन युक्त उर्वरक का उपयोग करें।"
          : "Soil nitrogen levels are low. Apply urea or other nitrogen-rich fertilizers.",
        priority: "high",
        category: "fertilizer",
        estimatedCost: Math.ceil((150 - latestAnalysis.nitrogen_level) * 0.65 * (profile.land_size || 1)),
        timeToImplement: "1-2 weeks",
        expectedImpact: "Improves leaf growth and plant vigor",
        status: "pending",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    // Phosphorus deficiency
    if (latestAnalysis.phosphorus_level < 15) {
      tasks.push({
        id: "phosphorus-deficiency",
        title: language === "hi" ? "फॉस्फोरस की कमी" : "Phosphorus Deficiency",
        description: language === "hi"
          ? "मिट्टी में फॉस्फोरस की स्तर कम है। DAP या SSP उर्वरक लगाएं।"
          : "Soil phosphorus levels are low. Apply DAP or SSP fertilizers.",
        priority: "high",
        category: "fertilizer",
        estimatedCost: Math.ceil((15 - latestAnalysis.phosphorus_level) * 2.17 * (profile.land_size || 1)),
        timeToImplement: "1 week",
        expectedImpact: "Enhances root development and flowering",
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    // Potassium deficiency
    if (latestAnalysis.potassium_level < 120) {
      tasks.push({
        id: "potassium-deficiency",
        title: language === "hi" ? "पोटैशियम की कमी" : "Potassium Deficiency",
        description: language === "hi"
          ? "मिट्टी में पोटैशियम की स्तर कम है। MOP या पोटैश उर्वरक लगाएं।"
          : "Soil potassium levels are low. Apply MOP or potash fertilizers.",
        priority: "medium",
        category: "fertilizer",
        estimatedCost: Math.ceil((120 - latestAnalysis.potassium_level) * 1.67 * (profile.land_size || 1)),
        timeToImplement: "1-2 weeks",
        expectedImpact: "Improves disease resistance and stress tolerance",
        status: "pending",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    // pH correction
    if (latestAnalysis.ph_level < 6.0) {
      tasks.push({
        id: "ph-acidic",
        title: language === "hi" ? "pH सुधार (अम्लीय मिट्टी)" : "pH Correction (Acidic Soil)",
        description: language === "hi"
          ? "मिट्टी बहुत अम्लीय है। कृषिक चूना या डोलोमाइट लागू करें।"
          : "Soil is too acidic. Apply agricultural lime or dolomite.",
        priority: "high",
        category: "ph",
        estimatedCost: Math.ceil((6.5 - latestAnalysis.ph_level) * 500 * (profile.land_size || 1)),
        timeToImplement: "2-3 weeks",
        expectedImpact: "Improves nutrient availability and microbial activity",
        status: "pending",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    } else if (latestAnalysis.ph_level > 8.0) {
      tasks.push({
        id: "ph-alkaline",
        title: language === "hi" ? "pH सुधार (क्षारीय मिट्टी)" : "pH Correction (Alkaline Soil)",
        description: language === "hi"
          ? "मिट्टी बहुत क्षारीय है। गंधक या कार्बनिक पदार्थ लागू करें।"
          : "Soil is too alkaline. Apply elemental sulfur or organic matter.",
        priority: "medium",
        category: "ph",
        estimatedCost: Math.ceil((latestAnalysis.ph_level - 8.0) * 400 * (profile.land_size || 1)),
        timeToImplement: "3-4 weeks",
        expectedImpact: "Reduces nutrient lock-up and improves availability",
        status: "pending",
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    // Organic matter improvement
    if (!latestAnalysis.organic_matter || latestAnalysis.organic_matter < 2) {
      tasks.push({
        id: "organic-matter",
        title: language === "hi" ? "कार्बनिक पदार्थ सुधार" : "Organic Matter Improvement",
        description: language === "hi"
          ? "मिट्टी में कार्बनिक पदार्थ कम है। गोबर, कंपोस्ट, या हरी खाद लगाएं।"
          : "Soil organic matter is low. Apply farmyard manure, compost, or green manure.",
        priority: "medium",
        category: "organic",
        estimatedCost: Math.ceil(3000 * (profile.land_size || 1)),
        timeToImplement: "4-6 weeks",
        expectedImpact: "Improves soil structure, water retention, and nutrient availability",
        status: "pending",
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    // Microbial activity boost
    if (latestAnalysis.organic_matter && latestAnalysis.organic_matter < 1.5) {
      tasks.push({
        id: "microbial-activity",
        title: language === "hi" ? "सूक्ष्मजीवी गतिविधि बढ़ाना" : "Boost Microbial Activity",
        description: language === "hi"
          ? "मिट्टी स्वास्थ्य में सुधार के लिए जैविक उर्वरक या जैव संवर्धक लगाएं।"
          : "Apply biofertilizers or microbial inoculants to improve soil health.",
        priority: "low",
        category: "microbial",
        estimatedCost: Math.ceil(1500 * (profile.land_size || 1)),
        timeToImplement: "2-3 weeks",
        expectedImpact: "Enhances nutrient cycling and soil structure",
        status: "pending",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    setImprovementPlan(tasks)
  }

  const handleTaskComplete = (taskId: string) => {
    setImprovementPlan(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: "completed" as const }
          : task
      )
    )

    toast({
      title: language === "hi" ? "कार्य पूर्ण" : "Task Completed",
      description: language === "hi" ? "सुधार कार्य सफलतापूर्वक पूरा किया गया" : "Improvement task marked as completed"
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fertilizer": return <Leaf className="h-4 w-4" />
      case "organic": return <Leaf className="h-4 w-4" />
      case "ph": return <AlertTriangle className="h-4 w-4" />
      case "microbial": return <TrendingUp className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress": return <Clock className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const filteredTasks = selectedPriority === "all"
    ? improvementPlan
    : improvementPlan.filter(task => task.priority === selectedPriority)

  const totalEstimatedCost = improvementPlan.reduce((sum, task) => sum + task.estimatedCost, 0)
  const completedTasks = improvementPlan.filter(task => task.status === "completed").length
  const completionPercentage = improvementPlan.length > 0 ? (completedTasks / improvementPlan.length) * 100 : 0

  if (!latestAnalysis) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === "hi" ? "कोई डेटा उपलब्ध नहीं" : "No Data Available"}
        </h3>
        <p className="text-gray-600">
          {language === "hi"
            ? "सुधार योजना बनाने के लिए पहले मिट्टी विश्लेषण करें"
            : "Analyze your soil to generate an improvement plan"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {language === "hi" ? "मिट्टी सुधार योजना" : "Soil Improvement Plan"}
        </h3>
        <div className="text-sm text-gray-600">
          {language === "hi" ? "अनुमानित लागत:" : "Estimated Cost"}: ₹{totalEstimatedCost.toLocaleString()}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{language === "hi" ? "प्रगति अवलोकन" : "Progress Overview"}</span>
            <span className="text-sm font-normal">
              {completedTasks}/{improvementPlan.length} {language === "hi" ? "पूर्ण" : "completed"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-2 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                {language === "hi" ? "उच्च प्राथमिकता:" : "High Priority"}:{" "}
                {improvementPlan.filter(t => t.priority === "high").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>
                {language === "hi" ? "मध्यम प्राथमिकता:" : "Medium Priority"}:{" "}
                {improvementPlan.filter(t => t.priority === "medium").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>
                {language === "hi" ? "निम्न प्राथमिकता:" : "Low Priority"}:{" "}
                {improvementPlan.filter(t => t.priority === "low").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedPriority("all")}>
            {language === "hi" ? "सभी कार्य" : "All Tasks"} ({improvementPlan.length})
          </TabsTrigger>
          <TabsTrigger value="high" onClick={() => setSelectedPriority("high")}>
            {language === "hi" ? "उच्च प्राथमिकता" : "High"} ({improvementPlan.filter(t => t.priority === "high").length})
          </TabsTrigger>
          <TabsTrigger value="medium" onClick={() => setSelectedPriority("medium")}>
            {language === "hi" ? "मध्यम प्राथमिकता" : "Medium"} ({improvementPlan.filter(t => t.priority === "medium").length})
          </TabsTrigger>
          <TabsTrigger value="low" onClick={() => setSelectedPriority("low")}>
            {language === "hi" ? "निम्न प्राथमिकता" : "Low"} ({improvementPlan.filter(t => t.priority === "low").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPriority} className="mt-6">
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {selectedPriority === "all"
                    ? (language === "hi" ? "कोई सुधार कार्य नहीं" : "No improvement tasks needed")
                    : (language === "hi" ? "इस प्राथमिकता के कोई कार्य नहीं" : `No ${selectedPriority} priority tasks`)
                  }
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className={task.status === "completed" ? "opacity-75" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(task.category)}
                            {task.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">{language === "hi" ? "लागत:" : "Cost"}:</span>
                            <p className="font-semibold">₹{task.estimatedCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">{language === "hi" ? "समय:" : "Time"}:</span>
                            <p className="font-semibold">{task.timeToImplement}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">{language === "hi" ? "प्रभाव:" : "Impact"}:</span>
                            <p className="font-semibold">{task.expectedImpact}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">{language === "hi" ? "समाप्ति:" : "Due"}:</span>
                            <p className="font-semibold">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        {getStatusIcon(task.status)}
                        {task.status !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskComplete(task.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {language === "hi" ? "पूर्ण करें" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === "hi" ? "कार्यान्वयन समयरेखा" : "Implementation Timeline"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {language === "hi"
                ? "अनुशंसित कार्यान्वयन क्रम (सबसे महत्वपूर्ण पहले):"
                : "Recommended implementation order (most critical first):"}
            </div>
            {improvementPlan
              .filter(task => task.status !== "completed")
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map((task, index) => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-600">
                      {task.timeToImplement} • ₹{task.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}