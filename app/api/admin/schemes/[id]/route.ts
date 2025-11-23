import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

function assertAdmin(userId?: string | null) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
  if (!userId) {
    throw new Error("UNAUTHORIZED")
  }
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    throw new Error("FORBIDDEN")
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    assertAdmin(userId)
    const payload = await request.json()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("schemes")
      .update({
        name: payload.name,
        name_local: payload.name_local,
        category_id: payload.category_id,
        state: payload.state,
        department: payload.department,
        description: payload.description,
        eligibility: payload.eligibility,
        benefits: payload.benefits,
        subsidy_details: payload.subsidy_details,
        application_process: payload.application_process,
        official_url: payload.official_url,
        contact_info: payload.contact_info,
        is_active: payload.is_active ?? true,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update scheme", error)
      return NextResponse.json({ error: "Failed to update scheme" }, { status: 500 })
    }

    return NextResponse.json({ success: true, scheme: data })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin scheme update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    assertAdmin(userId)

    const supabase = await createClient()
    const { error } = await supabase.from("schemes").delete().eq("id", params.id)

    if (error) {
      console.error("Failed to delete scheme", error)
      return NextResponse.json({ error: "Failed to delete scheme" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin scheme delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

