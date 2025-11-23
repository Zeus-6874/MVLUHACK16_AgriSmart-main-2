import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, MapPin } from "lucide-react"
import Image from "next/image"

interface Crop {
  id: number
  name: string
  area: number
  health: number
  daysToHarvest: number
  expectedYield: number
  image: string
}

interface CropCardProps {
  crop: Crop
  language: string
}

export default function CropCard({ crop, language }: CropCardProps) {
  const getHealthColor = (health: number) => {
    if (health >= 90) return "bg-green-500"
    if (health >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getHealthStatus = (health: number) => {
    if (health >= 90) return language === "hi" ? "उत्कृष्ट" : "Excellent"
    if (health >= 75) return language === "hi" ? "अच्छा" : "Good"
    return language === "hi" ? "चिंताजनक" : "Concerning"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <Image src={crop.image || "/placeholder.svg"} alt={crop.name} fill className="object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{crop.name}</h3>
              <Badge variant="secondary" className="ml-2">
                {getHealthStatus(crop.health)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {crop.area} {language === "hi" ? "एकड़" : "acres"}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {crop.daysToHarvest} {language === "hi" ? "दिन बचे" : "days left"}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>
                  {crop.expectedYield} {language === "hi" ? "किलो अपेक्षित" : "kg expected"}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{language === "hi" ? "स्वास्थ्य" : "Health"}</span>
                <span className="font-medium">{crop.health}%</span>
              </div>
              <Progress value={crop.health} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
