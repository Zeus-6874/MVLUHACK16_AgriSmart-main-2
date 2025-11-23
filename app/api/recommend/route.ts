import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { nitrogen, phosphorus, potassium, ph, location, season, rainfall, temperature } = await request.json()

    // Validate input parameters
    if (!nitrogen || !phosphorus || !potassium || !ph) {
      return NextResponse.json({ error: "Missing required soil parameters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Generate enhanced crop recommendations
    const recommendations = await generateEnhancedCropRecommendations({
      nitrogen: Number.parseFloat(nitrogen),
      phosphorus: Number.parseFloat(phosphorus),
      potassium: Number.parseFloat(potassium),
      ph: Number.parseFloat(ph),
      location: location || "Unknown",
      season: season || "all",
      rainfall: rainfall ? Number.parseFloat(rainfall) : null,
      temperature: temperature ? Number.parseFloat(temperature) : null,
      supabase, // Pass supabase for market data fetching
    })

    // Store enhanced soil analysis in database
    const { data: analysisData, error: analysisError } = await supabase
      .from("soil_analysis")
      .insert({
        nitrogen_level: Number.parseFloat(nitrogen),
        phosphorus_level: Number.parseFloat(phosphorus),
        potassium_level: Number.parseFloat(potassium),
        ph_level: Number.parseFloat(ph),
        recommendations: recommendations.fertilizer_recommendations,
        suitable_crops: recommendations.crop_recommendations.map((c) => c.name),
        location: location,
        season: season,
        rainfall: rainfall ? Number.parseFloat(rainfall) : null,
        temperature: temperature ? Number.parseFloat(temperature) : null,
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Database error:", analysisError)
    }

    return NextResponse.json({
      success: true,
      analysis_id: analysisData?.id,
      soil_health: recommendations.soil_health,
      crop_recommendations: recommendations.crop_recommendations,
      fertilizer_recommendations: recommendations.fertilizer_recommendations,
      risk_assessment: recommendations.risk_assessment,
      market_insights: recommendations.market_insights,
      soil_parameters: {
        nitrogen,
        phosphorus,
        potassium,
        ph,
        location,
        season,
        rainfall,
        temperature,
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateEnhancedCropRecommendations(params: {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  location: string
  season: string
  rainfall: number | null
  temperature: number | null
  supabase: any
}) {
  const { nitrogen, phosphorus, potassium, ph, location, season, rainfall, temperature } = params

  // Enhanced soil health assessment
  let soil_health_score = 100
  const issues = []

  // NPK assessment with more nuanced scoring
  if (nitrogen < 150) {
    issues.push("Low nitrogen content")
    soil_health_score -= 15
  } else if (nitrogen > 400) {
    issues.push("Excessive nitrogen - risk of lodging")
    soil_health_score -= 10
  }

  if (phosphorus < 15) {
    issues.push("Phosphorus deficiency")
    soil_health_score -= 20
  } else if (phosphorus > 50) {
    issues.push("High phosphorus - may affect micronutrient uptake")
    soil_health_score -= 5
  }

  if (potassium < 120) {
    issues.push("Potassium deficiency")
    soil_health_score -= 15
  } else if (potassium > 300) {
    issues.push("High potassium levels")
    soil_health_score -= 5
  }

  // pH assessment
  if (ph < 5.5) {
    issues.push("Highly acidic soil - nutrient availability affected")
    soil_health_score -= 25
  } else if (ph > 8.5) {
    issues.push("Highly alkaline soil - micronutrient deficiency risk")
    soil_health_score -= 20
  } else if (ph < 6.0 || ph > 8.0) {
    issues.push("pH slightly outside optimal range")
    soil_health_score -= 10
  }

  const soil_health =
    soil_health_score >= 85 ? "Excellent" : soil_health_score >= 70 ? "Good" : soil_health_score >= 50 ? "Fair" : "Poor"

  // Enhanced crop recommendations with confidence scores
  const crop_recommendations = generateMLBasedCropRecommendations(params)

  // Enhanced fertilizer recommendations
  const fertilizer_recommendations = generatePrecisionFertilizerRecommendations(params)

  // Risk assessment
  const risk_assessment = generateRiskAssessment(params, issues)

  // Market insights - fetch real data from database
  const market_insights = await generateMarketInsights(crop_recommendations, params.supabase)

  return {
    soil_health,
    soil_health_score,
    crop_recommendations,
    fertilizer_recommendations,
    risk_assessment,
    market_insights,
    issues,
  }
}

function generateMLBasedCropRecommendations(params: {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  location: string
  season: string
  rainfall: number | null
  temperature: number | null
}) {
  const { nitrogen, phosphorus, potassium, ph, season, rainfall, temperature } = params

  // Comprehensive crop database with requirements
  const cropDatabase = [
    {
      name: "Rice",
      nameHi: "चावल",
      requirements: {
        ph: { min: 5.5, max: 7.0, optimal: 6.2 },
        nitrogen: { min: 120, optimal: 180 },
        phosphorus: { min: 15, optimal: 25 },
        potassium: { min: 100, optimal: 150 },
        rainfall: { min: 1000, optimal: 1500 },
        temperature: { min: 20, max: 35, optimal: 28 },
      },
      seasons: ["kharif"],
      yield_potential: "High",
      market_demand: "Stable",
      water_requirement: "High",
      duration: 120,
    },
    {
      name: "Wheat",
      nameHi: "गेहूं",
      requirements: {
        ph: { min: 6.0, max: 7.5, optimal: 6.8 },
        nitrogen: { min: 100, optimal: 150 },
        phosphorus: { min: 20, optimal: 30 },
        potassium: { min: 80, optimal: 120 },
        rainfall: { min: 300, optimal: 600 },
        temperature: { min: 15, max: 25, optimal: 20 },
      },
      seasons: ["rabi"],
      yield_potential: "High",
      market_demand: "High",
      water_requirement: "Medium",
      duration: 150,
    },
    {
      name: "Maize",
      nameHi: "मक्का",
      requirements: {
        ph: { min: 6.0, max: 7.0, optimal: 6.5 },
        nitrogen: { min: 150, optimal: 200 },
        phosphorus: { min: 25, optimal: 35 },
        potassium: { min: 120, optimal: 180 },
        rainfall: { min: 500, optimal: 800 },
        temperature: { min: 18, max: 32, optimal: 25 },
      },
      seasons: ["kharif", "rabi"],
      yield_potential: "High",
      market_demand: "Growing",
      water_requirement: "Medium",
      duration: 100,
    },
    {
      name: "Cotton",
      nameHi: "कपास",
      requirements: {
        ph: { min: 5.8, max: 8.0, optimal: 6.5 },
        nitrogen: { min: 100, optimal: 140 },
        phosphorus: { min: 20, optimal: 30 },
        potassium: { min: 150, optimal: 200 },
        rainfall: { min: 500, optimal: 750 },
        temperature: { min: 20, max: 35, optimal: 28 },
      },
      seasons: ["kharif"],
      yield_potential: "Medium",
      market_demand: "High",
      water_requirement: "Medium",
      duration: 180,
    },
    {
      name: "Sugarcane",
      nameHi: "गन्ना",
      requirements: {
        ph: { min: 6.0, max: 7.5, optimal: 6.8 },
        nitrogen: { min: 200, optimal: 280 },
        phosphorus: { min: 25, optimal: 40 },
        potassium: { min: 150, optimal: 220 },
        rainfall: { min: 1000, optimal: 1500 },
        temperature: { min: 20, max: 35, optimal: 30 },
      },
      seasons: ["annual"],
      yield_potential: "Very High",
      market_demand: "Stable",
      water_requirement: "Very High",
      duration: 365,
    },
    {
      name: "Tomato",
      nameHi: "टमाटर",
      requirements: {
        ph: { min: 6.0, max: 7.0, optimal: 6.5 },
        nitrogen: { min: 80, optimal: 120 },
        phosphorus: { min: 30, optimal: 50 },
        potassium: { min: 100, optimal: 150 },
        rainfall: { min: 400, optimal: 600 },
        temperature: { min: 18, max: 30, optimal: 24 },
      },
      seasons: ["rabi", "summer"],
      yield_potential: "High",
      market_demand: "Very High",
      water_requirement: "Medium",
      duration: 90,
    },
    {
      name: "Potato",
      nameHi: "आलू",
      requirements: {
        ph: { min: 5.5, max: 6.5, optimal: 6.0 },
        nitrogen: { min: 100, optimal: 150 },
        phosphorus: { min: 25, optimal: 40 },
        potassium: { min: 120, optimal: 180 },
        rainfall: { min: 400, optimal: 600 },
        temperature: { min: 15, max: 25, optimal: 20 },
      },
      seasons: ["rabi"],
      yield_potential: "High",
      market_demand: "High",
      water_requirement: "Medium",
      duration: 90,
    },
    {
      name: "Soybean",
      nameHi: "सोयाबीन",
      requirements: {
        ph: { min: 6.0, max: 7.0, optimal: 6.5 },
        nitrogen: { min: 50, optimal: 80 }, // Lower due to nitrogen fixation
        phosphorus: { min: 20, optimal: 35 },
        potassium: { min: 100, optimal: 150 },
        rainfall: { min: 600, optimal: 900 },
        temperature: { min: 20, max: 30, optimal: 25 },
      },
      seasons: ["kharif"],
      yield_potential: "Medium",
      market_demand: "Growing",
      water_requirement: "Medium",
      duration: 100,
    },
  ]

  // Calculate suitability scores for each crop
  const recommendations = cropDatabase.map((crop) => {
    let suitability_score = 100
    const factors = []

    // pH suitability
    const ph_score = calculateParameterScore(ph, crop.requirements.ph)
    suitability_score *= ph_score / 100
    if (ph_score < 70) factors.push(`pH ${ph_score < 50 ? "highly" : "moderately"} unsuitable`)

    // NPK suitability
    const n_score = calculateNutrientScore(nitrogen, crop.requirements.nitrogen)
    const p_score = calculateNutrientScore(phosphorus, crop.requirements.phosphorus)
    const k_score = calculateNutrientScore(potassium, crop.requirements.potassium)

    suitability_score *= (n_score + p_score + k_score) / 300

    if (n_score < 70) factors.push("Nitrogen levels suboptimal")
    if (p_score < 70) factors.push("Phosphorus levels suboptimal")
    if (k_score < 70) factors.push("Potassium levels suboptimal")

    // Season suitability
    let season_score = 100
    if (season !== "all" && !crop.seasons.includes(season)) {
      season_score = 30 // Penalty for wrong season
      factors.push("Not ideal season for this crop")
    }
    suitability_score *= season_score / 100

    // Climate suitability (if data available)
    if (rainfall !== null) {
      const rainfall_score = calculateParameterScore(rainfall, crop.requirements.rainfall)
      suitability_score *= rainfall_score / 100
      if (rainfall_score < 70) factors.push("Rainfall not optimal")
    }

    if (temperature !== null) {
      const temp_score = calculateParameterScore(temperature, crop.requirements.temperature)
      suitability_score *= temp_score / 100
      if (temp_score < 70) factors.push("Temperature not optimal")
    }

    return {
      name: crop.name,
      nameHi: crop.nameHi,
      suitability_score: Math.round(suitability_score),
      confidence: suitability_score >= 80 ? "High" : suitability_score >= 60 ? "Medium" : "Low",
      yield_potential: crop.yield_potential,
      market_demand: crop.market_demand,
      water_requirement: crop.water_requirement,
      duration_days: crop.duration,
      limiting_factors: factors,
      expected_yield_per_acre: calculateExpectedYield(crop.name, suitability_score),
    }
  })

  // Sort by suitability score and return top recommendations
  return recommendations.sort((a, b) => b.suitability_score - a.suitability_score).slice(0, 6) // Top 6 recommendations
}

function calculateParameterScore(value: number, requirement: any) {
  if (requirement.optimal) {
    // Distance from optimal value
    const distance = Math.abs(value - requirement.optimal)
    const tolerance = (requirement.max - requirement.min) / 4
    return Math.max(0, 100 - (distance / tolerance) * 20)
  } else {
    // Within range scoring
    if (value >= requirement.min && value <= requirement.max) {
      return 100
    } else if (value < requirement.min) {
      const deficit = requirement.min - value
      return Math.max(0, 100 - deficit * 2)
    } else {
      const excess = value - requirement.max
      return Math.max(0, 100 - excess * 1.5)
    }
  }
}

function calculateNutrientScore(value: number, requirement: any) {
  if (value >= requirement.optimal) {
    return 100
  } else if (value >= requirement.min) {
    const ratio = (value - requirement.min) / (requirement.optimal - requirement.min)
    return 60 + ratio * 40 // Scale from 60-100
  } else {
    const deficit = requirement.min - value
    return Math.max(0, 60 - deficit * 0.5)
  }
}

function calculateExpectedYield(cropName: string, suitabilityScore: number) {
  const baseYields: Record<string, number> = {
    Rice: 2500,
    Wheat: 3000,
    Maize: 3500,
    Cotton: 1200,
    Sugarcane: 45000,
    Tomato: 25000,
    Potato: 20000,
    Soybean: 1800,
  }

  const baseYield = baseYields[cropName] || 2000
  return Math.round(baseYield * (suitabilityScore / 100))
}

function generatePrecisionFertilizerRecommendations(params: {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
}) {
  const { nitrogen, phosphorus, potassium, ph } = params
  const recommendations = []

  // Nitrogen recommendations
  if (nitrogen < 150) {
    const deficit = 150 - nitrogen
    const urea_needed = Math.ceil((deficit / 46) * 100) // Urea is 46% N
    recommendations.push({
      nutrient: "Nitrogen",
      fertilizer: "Urea",
      quantity: `${urea_needed} kg/acre`,
      timing: "Split application - 50% at sowing, 25% at tillering, 25% at flowering",
      priority: "High",
    })
  } else if (nitrogen > 300) {
    recommendations.push({
      nutrient: "Nitrogen",
      fertilizer: "None",
      quantity: "Reduce nitrogen application",
      timing: "Skip nitrogen fertilizer this season",
      priority: "Important",
    })
  }

  // Phosphorus recommendations
  if (phosphorus < 20) {
    const deficit = 20 - phosphorus
    const dap_needed = Math.ceil((deficit / 46) * 100) // DAP is 46% P2O5
    recommendations.push({
      nutrient: "Phosphorus",
      fertilizer: "DAP (Diammonium Phosphate)",
      quantity: `${dap_needed} kg/acre`,
      timing: "Apply at sowing time",
      priority: "High",
    })
  }

  // Potassium recommendations
  if (potassium < 120) {
    const deficit = 120 - potassium
    const mop_needed = Math.ceil((deficit / 60) * 100) // MOP is 60% K2O
    recommendations.push({
      nutrient: "Potassium",
      fertilizer: "MOP (Muriate of Potash)",
      quantity: `${mop_needed} kg/acre`,
      timing: "Apply at sowing or early growth stage",
      priority: "Medium",
    })
  }

  // pH correction
  if (ph < 6.0) {
    const lime_needed = Math.ceil((6.5 - ph) * 500) // Rough calculation
    recommendations.push({
      nutrient: "pH Correction",
      fertilizer: "Agricultural Lime",
      quantity: `${lime_needed} kg/acre`,
      timing: "Apply 2-3 weeks before sowing",
      priority: "High",
    })
  } else if (ph > 8.0) {
    const gypsum_needed = Math.ceil((ph - 7.5) * 400)
    recommendations.push({
      nutrient: "pH Correction",
      fertilizer: "Gypsum",
      quantity: `${gypsum_needed} kg/acre`,
      timing: "Apply and incorporate before sowing",
      priority: "High",
    })
  }

  // Micronutrient recommendations
  recommendations.push({
    nutrient: "Micronutrients",
    fertilizer: "Micronutrient Mix (Zn, Fe, Mn, B)",
    quantity: "5-10 kg/acre",
    timing: "Apply with basal fertilizer",
    priority: "Low",
  })

  return recommendations
}

function generateRiskAssessment(params: any, issues: string[]) {
  const risks = []
  let overall_risk = "Low"

  if (issues.length > 3) {
    overall_risk = "High"
    risks.push("Multiple soil health issues detected")
  } else if (issues.length > 1) {
    overall_risk = "Medium"
  }

  // pH-related risks
  if (params.ph < 5.5) {
    risks.push("Aluminum toxicity risk in acidic soil")
    risks.push("Reduced nutrient availability")
  } else if (params.ph > 8.5) {
    risks.push("Iron and zinc deficiency risk")
    risks.push("Reduced phosphorus availability")
  }

  // Nutrient imbalance risks
  if (params.nitrogen > 300 && params.potassium < 150) {
    risks.push("N-K imbalance may cause lodging")
  }

  // Climate risks (if data available)
  if (params.rainfall && params.rainfall < 300) {
    risks.push("Drought stress risk - consider drought-tolerant varieties")
    overall_risk = overall_risk === "Low" ? "Medium" : "High"
  }

  return {
    overall_risk,
    risk_factors: risks,
    mitigation_strategies: [
      "Regular soil testing every 6 months",
      "Implement precision fertilizer application",
      "Consider soil amendments based on pH",
      "Use organic matter to improve soil structure",
    ],
  }
}

async function generateMarketInsights(cropRecommendations: any[], supabase: any) {
  // Fetch real market prices from database
  const cropNames = cropRecommendations.slice(0, 3).map((c) => c.name)
  
  const { data: pricesData, error } = await supabase
    .from("market_prices")
    .select("commodity, modal_price, min_price, max_price, arrival_date, state, district")
    .in("commodity", cropNames)
    .order("arrival_date", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching market prices:", error)
  }

  // Group prices by crop and calculate trends
  const priceMap = new Map<string, any[]>()
  pricesData?.forEach((price) => {
    const crop = price.commodity
    if (!priceMap.has(crop)) {
      priceMap.set(crop, [])
    }
    priceMap.get(crop)!.push(price)
  })

  return cropRecommendations.slice(0, 3).map((crop) => {
    const cropPrices = priceMap.get(crop.name) || []
    const latestPrice = cropPrices[0]
    
    // Calculate trend from price history
    let price_trend = "stable"
    let current_price = 2000 // Default fallback
    
    if (latestPrice) {
      current_price = latestPrice.modal_price || latestPrice.max_price || latestPrice.min_price || 2000
      
      if (cropPrices.length > 1) {
        const recent = cropPrices.slice(0, 3)
        const older = cropPrices.slice(3, 6)
        if (recent.length > 0 && older.length > 0) {
          const recentAvg = recent.reduce((sum, p) => sum + (p.modal_price || p.max_price || 0), 0) / recent.length
          const olderAvg = older.reduce((sum, p) => sum + (p.modal_price || p.max_price || 0), 0) / older.length
          if (recentAvg > olderAvg * 1.05) price_trend = "rising"
          else if (recentAvg < olderAvg * 0.95) price_trend = "falling"
        }
      }
    }

    // Determine market demand based on price and availability
    const market_demand = current_price > 3000 ? "high" : current_price > 1500 ? "medium" : "low"

    return {
      crop_name: crop.name,
      current_price: Math.round(current_price),
      price_trend,
      market_demand,
      profit_potential: crop.suitability_score >= 80 ? "High" : crop.suitability_score >= 60 ? "Medium" : "Low",
      investment_required: calculateInvestmentRequired(crop.name),
      latest_market: latestPrice ? `${latestPrice.district || latestPrice.state || "N/A"}` : "N/A",
    }
  })
}

function calculateInvestmentRequired(cropName: string) {
  const investments: Record<string, number> = {
    Rice: 25000,
    Wheat: 20000,
    Maize: 22000,
    Cotton: 30000,
    Sugarcane: 45000,
    Tomato: 35000,
    Potato: 40000,
    Soybean: 18000,
  }

  return investments[cropName] || 25000
}
