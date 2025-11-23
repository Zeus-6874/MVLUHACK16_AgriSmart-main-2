import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })
import { readFileSync } from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

interface DistrictStatsRecord {
  district: string
  taluka?: string
  season?: string
  crop?: string
  area_ha?: number
  production_mt?: number
  yield_mt_per_ha?: number
  rainfall_mm?: number
  irrigation_coverage_percent?: number
  horticulture_area_ha?: number
  medicinal_plants_area_ha?: number
  source?: string
  recorded_year?: number
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }
  return createClient(url, key)
}

async function seedDistrictStats(file = "data/district_stats.sample.json") {
  const jsonPath = path.resolve(process.cwd(), file)
  const payload = JSON.parse(readFileSync(jsonPath, "utf8")) as DistrictStatsRecord[]

  const supabase = getSupabaseClient()

  const { error } = await supabase.from("district_statistics").upsert(
    payload.map((record) => ({
      state: "Maharashtra",
      district: record.district,
      taluka: record.taluka,
      season: record.season,
      crop: record.crop,
      area_ha: record.area_ha,
      production_mt: record.production_mt,
      yield_mt_per_ha: record.yield_mt_per_ha,
      rainfall_mm: record.rainfall_mm,
      irrigation_coverage_percent: record.irrigation_coverage_percent,
      horticulture_area_ha: record.horticulture_area_ha,
      medicinal_plants_area_ha: record.medicinal_plants_area_ha,
      source: record.source,
      recorded_year: record.recorded_year,
    })),
  )

  if (error) {
    console.error("Failed to seed district statistics", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${payload.length} district stats rows`)
}

seedDistrictStats(process.argv[2]).catch((error) => {
  console.error(error)
  process.exit(1)
})



