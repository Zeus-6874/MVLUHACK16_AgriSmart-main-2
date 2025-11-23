"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/Navbar"
import { BookOpen, Search, Tag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KnowledgeArticle {
  id: string | number
  category: string
  categoryHi?: string
  title: string
  titleHi?: string
  content: string
  tags: string[]
}

export default function KnowledgeBase() {
  const [language, setLanguage] = useState("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    setLoading(true)
    try {
      // Fetch from encyclopedia API which has crop knowledge
      const response = await fetch("/api/encyclopedia")
      const data = await response.json()

      if (data.success && data.crops && data.crops.length > 0) {
        // Convert crop data to knowledge articles
        const knowledgeArticles: KnowledgeArticle[] = data.crops.map((crop: any, index: number) => ({
          id: crop.id || index,
          category: "Crop Information",
          categoryHi: "फसल जानकारी",
          title: crop.common_name || crop.crop_name || "Crop",
          titleHi: crop.local_name,
          content: crop.description || crop.disease_management || `Information about ${crop.common_name || crop.crop_name}`,
          tags: crop.diseases || ["agriculture", "crops"],
        }))
        setArticles(knowledgeArticles)
      } else {
        setArticles([])
      }
    } catch (error) {
      console.error("Failed to fetch knowledge:", error)
      toast({
        title: "Error",
        description: "Failed to load knowledge base",
        variant: "destructive",
      })
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.titleHi && article.titleHi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{language === "hi" ? "ज्ञान केंद्र" : "Knowledge Base"}</h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "कृषि संबंधी जानकारी और सुझाव प्राप्त करें"
              : "Get agricultural information and recommendations"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={language === "hi" ? "खोजें..." : "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Articles */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">{language === "hi" ? article.categoryHi : article.category}</Badge>
                      <BookOpen className="h-4 w-4 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg">{language === "hi" ? article.titleHi || article.title : article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {article.tags && article.tags.length > 0 ? (
                        article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          agriculture
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{language === "hi" ? "कोई लेख नहीं मिला" : "No articles found"}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
