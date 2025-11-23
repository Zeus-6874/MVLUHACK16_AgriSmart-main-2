export interface TeachableMachineConfig {
  modelUrl: string
  inputSize: { width: number; height: number }
  threshold: number
}

export interface PredictionResult {
  className: string
  probability: number
}

export class TeachableMachineClient {
  private config: TeachableMachineConfig

  constructor(config: TeachableMachineConfig) {
    this.config = config
  }

  async predict(imageFile: File): Promise<PredictionResult[]> {
    try {
      // Convert image to the required format
      const processedImage = await this.preprocessImage(imageFile)

      // In a real implementation, this would call the Teachable Machine API
      // For now, we simulate the prediction
      return await this.simulatePrediction(processedImage)
    } catch (error) {
      console.error("Teachable Machine prediction failed:", error)
      throw new Error("Failed to process image with ML model")
    }
  }

  private async preprocessImage(imageFile: File): Promise<ImageData> {
    const canvas = new OffscreenCanvas(this.config.inputSize.width, this.config.inputSize.height)
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to create canvas context")
    }

    // Create image from file
    const imageBuffer = await imageFile.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: imageFile.type })
    const imageBitmap = await createImageBitmap(imageBlob)

    // Draw and resize image
    ctx.drawImage(imageBitmap, 0, 0, this.config.inputSize.width, this.config.inputSize.height)

    return ctx.getImageData(0, 0, this.config.inputSize.width, this.config.inputSize.height)
  }

  private async simulatePrediction(imageData: ImageData): Promise<PredictionResult[]> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500))

    // Simulate realistic prediction results
    const mockResults: PredictionResult[] = [
      { className: "Healthy", probability: Math.random() * 0.3 },
      { className: "Disease_A", probability: 0.4 + Math.random() * 0.4 },
      { className: "Disease_B", probability: Math.random() * 0.3 },
      { className: "Disease_C", probability: Math.random() * 0.2 },
    ]

    // Normalize probabilities to sum to 1
    const total = mockResults.reduce((sum, result) => sum + result.probability, 0)
    mockResults.forEach((result) => {
      result.probability = result.probability / total
    })

    // Sort by probability (highest first)
    return mockResults.sort((a, b) => b.probability - a.probability)
  }
}

export function createCropDiseaseDetector(cropName: string): TeachableMachineClient {
  const modelConfigs: Record<string, TeachableMachineConfig> = {
    Rice: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_RICE_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
    Wheat: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_WHEAT_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
    Tomato: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_TOMATO_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.75,
    },
    Potato: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_POTATO_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
    Maize: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_MAIZE_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
    Cotton: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_COTTON_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
    Sugarcane: {
      modelUrl: "https://teachablemachine.withgoogle.com/models/YOUR_SUGARCANE_MODEL_ID/",
      inputSize: { width: 224, height: 224 },
      threshold: 0.7,
    },
  }

  const config = modelConfigs[cropName] || modelConfigs["Rice"] // Default to Rice model
  return new TeachableMachineClient(config)
}
