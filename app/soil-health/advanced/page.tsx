import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SoilHealthHistory from "@/components/soil/SoilHealthHistory"
import SoilImprovementPlan from "@/components/soil/SoilImprovementPlan"
import NutrientDeficiencyAlert from "@/components/soil/NutrientDeficiencyAlert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, TrendingUp, AlertTriangle, Leaf } from "lucide-react"
import Navbar from "@/components/Navbar"

interface FarmerProfile {
  id: string
  full_name: string
  location?: string
}

export default async function AdvancedSoilHealthPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("farmer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (!profile) {
    redirect("/onboarding")
  }

  // Fetch recent soil analyses
  const { data: soilAnalyses } = await supabase
    .from("soil_analysis")
    .select(`
      id,
      nitrogen_level,
      phosphorus_level,
      potassium_level,
      ph_level,
      organic_matter,
      recommendations,
      suitable_crops,
      analysis_date,
      created_at
    `)
    .eq("farmer_id", userId)
    .order("analysis_date", { ascending: false })
    .limit(10)

  // Calculate soil health metrics
  const latestAnalysis = soilAnalyses?.[0]
  const healthScore = latestAnalysis ? calculateSoilHealthScore(latestAnalysis) : 0
  const healthStatus = getHealthStatus(healthScore)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Soil Health Monitoring
          </h1>
          <p className="text-gray-600">
            Comprehensive soil analysis, historical tracking, and improvement recommendations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soil Health Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthScore}/100</div>
              <p className="text-xs text-muted-foreground">
                {healthStatus}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soilAnalyses?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Historical records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">pH Level</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestAnalysis?.ph_level?.toFixed(1) || "-"}</div>
              <p className="text-xs text-muted-foreground">
                Current soil pH
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deficiencies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {latestAnalysis ? countDeficiencies(latestAnalysis) : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Nutrient deficiencies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Health History
            </TabsTrigger>
            <TabsTrigger value="improvement" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Improvement Plan
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Nutrient Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <SoilHealthHistory
              farmerId={userId}
              analyses={soilAnalyses || []}
              latestAnalysis={latestAnalysis}
            />
          </TabsContent>

          <TabsContent value="improvement" className="mt-6">
            <SoilImprovementPlan
              farmerId={userId}
              latestAnalysis={latestAnalysis}
              profile={profile}
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <NutrientDeficiencyAlert
              farmerId={userId}
              latestAnalysis={latestAnalysis}
              analyses={soilAnalyses || []}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function calculateSoilHealthScore(analysis: any): number {
  let score = 100

  // NPK scoring (40 points total)
  if (analysis.nitrogen_level < 150) score -= 15
  else if (analysis.nitrogen_level > 400) score -= 10

  if (analysis.phosphorus_level < 15) score -= 20
  else if (analysis.phosphorus_level > 50) score -= 5

  if (analysis.potassium_level < 120) score -= 15
  else if (analysis.potassium_level > 300) score -= 5

  // pH scoring (30 points)
  if (analysis.ph_level < 5.5) score -= 25
  else if (analysis.ph_level > 8.5) score -= 20
  else if (analysis.ph_level < 6.0 || analysis.ph_level > 8.0) score -= 10

  // Organic matter (20 points)
  if (analysis.organic_matter < 1) score -= 20
  else if (analysis.organic_matter < 2) score -= 10

  // Micronutrients (10 points)
  // This would be based on actual micronutrient tests

  return Math.max(0, Math.round(score))
}

function getHealthStatus(score: number): string {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 50) return "Fair"
  return "Poor"
}

function countDeficiencies(analysis: any): number {
  let count = 0

  if (analysis.nitrogen_level < 150) count++
  if (analysis.phosphorus_level < 15) count++
  if (analysis.potassium_level < 120) count++
  if (analysis.ph_level < 5.5 || analysis.ph_level > 8.5) count++
  if (analysis.organic_matter < 2) count++

  return count
}