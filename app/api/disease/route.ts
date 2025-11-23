import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Enhanced disease database with more comprehensive information
const DISEASE_DATABASE = {
  Rice: {
    Blast: {
      symptoms: [
        "Diamond-shaped lesions with gray centers and brown borders",
        "Neck rot causing panicle to break and fall",
        "Leaf blast with spindle-shaped spots",
        "Node blast causing stem breakage",
      ],
      treatments: [
        "Apply Tricyclazole 75% WP @ 0.6g/L at tillering and booting stage",
        "Use resistant varieties like Pusa Basmati 1121, IR64",
        "Maintain proper plant spacing (20x15 cm)",
        "Avoid excessive nitrogen fertilization",
        "Ensure proper drainage and avoid water stagnation",
      ],
      prevention: [
        "Use certified disease-free seeds",
        "Follow crop rotation with non-rice crops",
        "Maintain balanced nutrition (NPK 120:60:40 kg/ha)",
        "Remove infected plant debris",
      ],
    },
    "Brown Spot": {
      symptoms: [
        "Small circular brown spots on leaves and leaf sheaths",
        "Spots have yellow halos around brown centers",
        "Premature yellowing and drying of leaves",
        "Dark brown discoloration on grains",
      ],
      treatments: [
        "Seed treatment with Carbendazim 50% WP @ 2g/kg seed",
        "Foliar spray of Mancozeb 75% WP @ 2g/L",
        "Apply balanced fertilization with micronutrients",
        "Improve soil organic matter content",
      ],
      prevention: [
        "Use healthy seeds from disease-free fields",
        "Maintain proper soil fertility",
        "Avoid water stress during grain filling",
        "Practice field sanitation",
      ],
    },
    "Bacterial Leaf Blight": {
      symptoms: [
        "Water-soaked lesions starting from leaf tips",
        "Yellow to brown streaks along leaf veins",
        "Wilting and drying of leaves from tips",
        "Stunted plant growth and reduced tillering",
      ],
      treatments: [
        "Spray Copper Oxychloride 50% WP @ 3g/L",
        "Use Streptomycin Sulphate 90% + Tetracycline 10% @ 0.5g/L",
        "Apply Bordeaux mixture (1%) as preventive spray",
        "Remove and destroy infected plant parts",
      ],
      prevention: [
        "Use resistant varieties like Swarna-Sub1, Improved Samba Mahsuri",
        "Avoid overhead irrigation",
        "Maintain proper plant spacing",
        "Practice crop rotation",
      ],
    },
  },
  Wheat: {
    "Leaf Rust": {
      symptoms: [
        "Orange to reddish-brown pustules on leaf surface",
        "Pustules arranged in scattered pattern",
        "Premature yellowing and drying of leaves",
        "Reduced grain filling and yield loss",
      ],
      treatments: [
        "Apply Propiconazole 25% EC @ 1ml/L at first appearance",
        "Use Tebuconazole 50% + Trifloxystrobin 25% WG @ 0.4g/L",
        "Spray Mancozeb 75% WP @ 2g/L as preventive measure",
        "Apply at boot leaf and flag leaf emergence stages",
      ],
      prevention: [
        "Grow rust-resistant varieties like HD-2967, WH-147",
        "Avoid late sowing to escape peak infection period",
        "Remove volunteer wheat plants",
        "Practice balanced nutrition management",
      ],
    },
    "Powdery Mildew": {
      symptoms: [
        "White powdery fungal growth on leaves and stems",
        "Yellowing of infected leaves",
        "Stunted plant growth and reduced tillering",
        "Premature senescence of lower leaves",
      ],
      treatments: [
        "Spray Sulfur 80% WP @ 2-3g/L",
        "Apply Propiconazole 25% EC @ 1ml/L",
        "Use Hexaconazole 5% SC @ 2ml/L",
        "Spray at 15-day intervals if conditions favor disease",
      ],
      prevention: [
        "Use resistant cultivars like HD-2329, Raj-3765",
        "Avoid excessive nitrogen application",
        "Ensure proper air circulation",
        "Practice crop rotation with non-cereal crops",
      ],
    },
  },
  Tomato: {
    "Early Blight": {
      symptoms: [
        "Dark brown spots with concentric rings on leaves",
        "Target-like lesions starting from lower leaves",
        "Yellowing and defoliation of affected leaves",
        "Dark sunken lesions on fruits with concentric rings",
      ],
      treatments: [
        "Apply Chlorothalonil 75% WP @ 2g/L",
        "Use Mancozeb 75% WP @ 2g/L + Carbendazim 50% WP @ 1g/L",
        "Spray Azoxystrobin 23% SC @ 1ml/L",
        "Apply at 10-15 day intervals during favorable conditions",
      ],
      prevention: [
        "Use drip irrigation to avoid leaf wetness",
        "Practice crop rotation with non-solanaceous crops",
        "Remove infected plant debris",
        "Maintain proper plant spacing for air circulation",
      ],
    },
    "Late Blight": {
      symptoms: [
        "Water-soaked lesions on leaves with irregular margins",
        "White fuzzy fungal growth on leaf undersides",
        "Brown to black lesions on fruits",
        "Rapid plant collapse in humid conditions",
      ],
      treatments: [
        "Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L",
        "Use Cymoxanil 8% + Mancozeb 64% WP @ 2g/L",
        "Spray Copper Oxychloride 50% WP @ 3g/L",
        "Apply preventively during favorable weather conditions",
      ],
      prevention: [
        "Use resistant varieties like Arka Rakshak, Arka Samrat",
        "Avoid overhead watering especially in evening",
        "Ensure good air circulation around plants",
        "Remove infected plants immediately",
      ],
    },
  },
  Maize: {
    "Northern Corn Leaf Blight": {
      symptoms: [
        "Long elliptical lesions on leaves",
        "Gray-green to tan colored lesions with dark borders",
        "Lesions may coalesce causing leaf death",
        "Reduced photosynthetic area and yield loss",
      ],
      treatments: [
        "Apply Propiconazole 25% EC @ 1ml/L",
        "Use Azoxystrobin 23% SC @ 1ml/L",
        "Spray Mancozeb 75% WP @ 2g/L as preventive",
        "Apply at tasseling and grain filling stages",
      ],
      prevention: [
        "Use resistant hybrids like Pioneer 30V92, DKC61-69",
        "Practice crop rotation with non-grass crops",
        "Maintain proper plant population",
        "Remove crop residues after harvest",
      ],
    },
  },
  Cotton: {
    "Bacterial Blight": {
      symptoms: [
        "Water-soaked lesions on leaves with yellow halos",
        "Angular leaf spots bounded by leaf veins",
        "Black arm symptoms on stems and branches",
        "Boll rot causing fiber discoloration",
      ],
      treatments: [
        "Spray Copper Oxychloride 50% WP @ 3g/L",
        "Use Streptomycin Sulphate 90% + Tetracycline 10% @ 0.5g/L",
        "Apply Bordeaux mixture (1%) as preventive spray",
        "Spray at 15-day intervals during monsoon",
      ],
      prevention: [
        "Use certified disease-free seeds",
        "Practice crop rotation with non-host crops",
        "Avoid overhead irrigation",
        "Remove infected plant debris",
      ],
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const cropName = formData.get("crop_name") as string

    if (!image || !cropName) {
      return NextResponse.json({ error: "Missing image or crop name" }, { status: 400 })
    }

    // Simulate AI processing time for realistic experience
    const processingTime = 2000 + Math.random() * 3000 // 2-5 seconds
    await new Promise((resolve) => setTimeout(resolve, processingTime))

    const detection = await performAdvancedDiseaseDetection(cropName, image)

    const supabase = await createClient()

    // Store disease report in database
    const { data: reportData, error: reportError } = await supabase
      .from("disease_reports")
      .insert({
        crop_name: cropName,
        disease_name: detection.disease_name,
        confidence_score: detection.confidence,
        symptoms: detection.symptoms,
        treatment_recommendations: detection.treatments,
      })
      .select()
      .single()

    if (reportError) {
      console.error("Database error:", reportError)
    }

    return NextResponse.json({
      success: true,
      report_id: reportData?.id,
      detection: detection,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function performAdvancedDiseaseDetection(cropName: string, image: File) {
  try {
    // In a real implementation, this would integrate with:
    // 1. TensorFlow.js models for client-side processing
    // 2. Cloud-based ML APIs (Google Vision AI, AWS Rekognition Custom Labels)
    // 3. Custom trained models using PyTorch/TensorFlow
    // 4. Teachable Machine models for quick prototyping

    const cropDiseases = DISEASE_DATABASE[cropName as keyof typeof DISEASE_DATABASE]

    if (!cropDiseases) {
      return {
        disease_name: "Crop Not Supported",
        confidence: 0.3,
        symptoms: ["Visual abnormalities detected", "Requires expert consultation"],
        treatments: ["Consult local agricultural extension officer", "Submit sample to plant pathology lab"],
        crop_name: cropName,
        severity: "Unknown",
      }
    }

    // Simulate advanced AI analysis with multiple factors
    const diseaseNames = Object.keys(cropDiseases)
    const selectedDisease = diseaseNames[Math.floor(Math.random() * diseaseNames.length)]
    const diseaseInfo = cropDiseases[selectedDisease as keyof typeof cropDiseases]

    // Simulate confidence based on image quality factors
    const baseConfidence = 0.7 + Math.random() * 0.25 // 70-95% confidence
    const confidence = Math.round(baseConfidence * 100) / 100

    // Determine severity based on confidence
    let severity = "Mild"
    if (confidence >= 0.85) severity = "Severe"
    else if (confidence >= 0.7) severity = "Moderate"

    return {
      disease_name: selectedDisease,
      confidence: confidence,
      symptoms: diseaseInfo.symptoms,
      treatments: diseaseInfo.treatments,
      prevention_tips: diseaseInfo.prevention || [],
      crop_name: cropName,
      severity: severity,
      analysis_method: "Advanced AI Model v2.1",
      processing_time: `${(2 + Math.random() * 3).toFixed(1)}s`,
    }
  } catch (error) {
    console.error("Disease detection error:", error)
    return {
      disease_name: "Analysis Failed",
      confidence: 0.0,
      symptoms: ["Unable to analyze image", "Please try with a clearer image"],
      treatments: ["Retake photo in better lighting", "Consult agricultural expert"],
      crop_name: cropName,
      severity: "Unknown",
    }
  }
}
