import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })
import { readFileSync } from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

interface CropRecord {
  common_name: string
  local_name?: string
  scientific_name?: string
  category: string
  climate?: string
  soil_type?: string
  optimal_ph_range?: string
  water_requirements?: string
  fertilizer_requirements?: string
  planting_season?: string
  harvest_time?: string
  average_yield?: string
  diseases?: string[]
  disease_management?: string
  market_demand?: string
  image_url?: string
  source?: string
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }
  return createClient(url, key)
}

async function ensureCropCategory(name: string, supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.from("crop_categories").select("*").eq("name", name).maybeSingle()
  if (error) throw error
  if (data) return data.id

  const { data: inserted, error: insertError } = await supabase
    .from("crop_categories")
    .insert({ name })
    .select()
    .single()

  if (insertError) throw insertError
  return inserted.id
}

async function seedCrops(file = "data/crops.sample.json") {
  const jsonPath = path.resolve(process.cwd(), file)
  const payload = JSON.parse(readFileSync(jsonPath, "utf8")) as CropRecord[]

  const supabase = getSupabaseClient()

  for (const record of payload) {
    const categoryId = await ensureCropCategory(record.category, supabase)

    const { error } = await supabase
      .from("crops")
      .upsert(
        {
          common_name: record.common_name,
          local_name: record.local_name,
          scientific_name: record.scientific_name,
          category_id: categoryId,
          climate: record.climate,
          soil_type: record.soil_type,
          optimal_ph_range: record.optimal_ph_range,
          water_requirements: record.water_requirements,
          fertilizer_requirements: record.fertilizer_requirements,
          planting_season: record.planting_season,
          harvest_time: record.harvest_time,
          average_yield: record.average_yield,
          diseases: record.diseases,
          disease_management: record.disease_management,
          market_demand: record.market_demand,
          image_url: record.image_url,
          source: record.source,
        },
        { onConflict: "common_name,scientific_name" },
      )

    if (error) {
      console.error(`Failed to upsert crop ${record.common_name}`, error.message)
    } else {
      console.log(`Upserted crop: ${record.common_name}`)
    }
  }
}

seedCrops(process.argv[2]).catch((error) => {
  console.error(error)
  process.exit(1)
})

