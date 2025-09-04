"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ExternalLink, Calendar, TrendingUp } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PRPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  const { data: prData, error } = useSWR("/api/pr-items", fetcher)
  const { data: actorsData } = useSWR("/api/actors", fetcher)

  const prItems = prData?.prItems || []
  const actors = actorsData?.actors || []

  // Filter PR items
  const filteredPRItems = prItems.filter((item: any) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.publication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actors?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || item.type === typeFilter
    const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter

    return matchesSearch && matchesType && matchesSentiment
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-green-100 text-green-800"
      case "podcast":
        return "bg-purple-100 text-purple-800"
      case "video":
        return "bg-red-100 text-red-800"
      case "social_post":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading PR items. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PR & Media</h1>
          <p className="text-slate-600 mt-1">Track media coverage and public relations activities.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add PR Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search PR items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social_post">Social Post</SelectItem>
                  <SelectItem value="press_release">Press Release</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PR Items List */}
      <div className="space-y-4">
        {filteredPRItems.length > 0 ? (
          filteredPRItems.map((item: any) => (
            <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <Badge className={getTypeColor(item.type)}>{item.type.replace("_", " ")}</Badge>
                      {item.sentiment && <Badge className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>}
                    </div>

                    {item.description && <p className="text-slate-600 mb-3 line-clamp-2">{item.description}</p>}

                    <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                      <span>{item.actors?.name}</span>
                      {item.publication && <span>{item.publication}</span>}
                      {item.author && <span>by {item.author}</span>}
                      {item.published_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.published_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {item.reach_estimate && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Reach: {item.reach_estimate.toLocaleString()}</span>
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1">
                          {item.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && <span className="text-xs">+{item.tags.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No PR items found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || typeFilter !== "all" || sentimentFilter !== "all"
                  ? "Try adjusting your filters to see more items."
                  : "Get started by adding your first PR item."}
              </p>
              {!searchQuery && typeFilter === "all" && sentimentFilter === "all" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add PR Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
