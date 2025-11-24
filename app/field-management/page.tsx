import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import FieldManager from "@/components/field/FieldManager"
import CropCalendar from "@/components/field/CropCalendar"
import ResourceTracker from "@/components/field/ResourceTracker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Package, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"

interface FarmerProfile {
  id: string
  full_name: string
  location?: string
  land_size?: number
}

export default async function FieldManagementPage() {
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

  // Fetch field statistics
  const { data: fields } = await supabase
    .from("fields")
    .select("area_hectares")
    .eq("farmer_id", userId)

  const totalArea = fields?.reduce((sum, field) => sum + (field.area_hectares || 0), 0) || 0

  // Fetch active crop cycles
  const { data: activeCrops } = await supabase
    .from("crop_cycles")
    .select(`
      id,
      crop_name,
      status,
      fields (
        field_name,
        area_hectares
      )
    `)
    .eq("fields.farmer_id", userId)
    .in("status", ["planted", "growing"])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Field Management
          </h1>
          <p className="text-gray-600">
            Manage your fields, crop cycles, and agricultural resources
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fields?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered fields
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Area</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArea.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Hectares under cultivation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCrops?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently growing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Types of resources tracked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Fields
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="mt-6">
            <FieldManager farmerId={userId} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CropCalendar farmerId={userId} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <ResourceTracker farmerId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}