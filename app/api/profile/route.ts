import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("farmer_profiles").select("*").eq("user_id", userId).maybeSingle()

    if (error) {
      console.error("Profile fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("farmer_profiles")
      .upsert(
        {
          user_id: userId,
          full_name: payload.full_name,
          phone: payload.phone,
          email: payload.email,
          state: payload.state,
          district: payload.district,
          land_area: payload.land_area ? Number(payload.land_area) : null,
          land_unit: payload.land_unit,
          primary_crop: payload.primary_crop,
          experience_years: payload.experience_years ? Number(payload.experience_years) : null,
          preferred_language: payload.preferred_language,
          irrigation: payload.irrigation,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("Profile upsert error:", error)
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Profile POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

