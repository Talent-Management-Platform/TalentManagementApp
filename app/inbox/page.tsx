"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useRoles } from "@/hooks/useRoles"
import {
  MessageSquare,
  Send,
  Search,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  ExternalLink,
  Clock,
  User,
} from "lucide-react"

interface Comment {
  id: string
  platform: string
  external_comment_id: string
  author_name: string
  author_handle: string
  body: string
  like_count: number
  created_at_platform: string
  social_posts: {
    title: string
    url: string
    social_accounts: {
      handle: string
      talent_id: string
    }
  }
}

interface Talent {
  id: string
  name: string
}

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  website: Globe,
}

const platformColors = {
  youtube: "bg-red-100 text-red-800",
  instagram: "bg-pink-100 text-pink-800",
  facebook: "bg-blue-100 text-blue-800",
  website: "bg-green-100 text-green-800",
}

export default function InboxPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [selectedTalent, setSelectedTalent] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [replyText, setReplyText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const { hasPermission } = useRoles()
  const canReply = hasPermission("manage_content") || hasPermission("manage_users")

  useEffect(() => {
    fetchTalents()
    fetchComments()
  }, [selectedTalent, selectedPlatform])

  const fetchTalents = async () => {
    try {
      const response = await fetch("/api/actors")
      if (response.ok) {
        const data = await response.json()
        setTalents(data.actors || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching talents:", error)
    }
  }

  const fetchComments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedTalent !== "all") params.append("talentId", selectedTalent)
      if (selectedPlatform !== "all") params.append("platform", selectedPlatform)
      params.append("limit", "50")

      const response = await fetch(`/api/social/comments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedComment || !replyText.trim() || !canReply) return

    setSending(true)
    try {
      const response = await fetch("/api/social/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: selectedComment.id,
          reply_body: replyText.trim(),
          created_by: "current-user", // TODO: Get actual user ID
        }),
      })

      if (response.ok) {
        setReplyText("")
        // Show success message
        alert("Reply queued successfully!")
      } else {
        throw new Error("Failed to send reply")
      }
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const filteredComments = comments.filter(
    (comment) =>
      comment.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Unified Inbox</h1>
            <p className="text-slate-600">Manage comments and replies across all social platforms</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Select value={selectedTalent} onValueChange={setSelectedTalent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Talent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Talents</SelectItem>
                    {talents.map((talent) => (
                      <SelectItem key={talent.id} value={talent.id}>
                        {talent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search comments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({filteredComments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">Loading comments...</div>
                ) : filteredComments.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No comments found. Try adjusting your filters.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredComments.map((comment) => {
                      const IconComponent = platformIcons[comment.platform as keyof typeof platformIcons] || Globe
                      const colorClass =
                        platformColors[comment.platform as keyof typeof platformColors] || "bg-gray-100 text-gray-800"
                      const isSelected = selectedComment?.id === comment.id

                      return (
                        <div
                          key={comment.id}
                          className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-blue-50 border-blue-200" : ""
                          }`}
                          onClick={() => setSelectedComment(comment)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{comment.author_name}</p>
                                <Badge className={`${colorClass} text-xs`}>
                                  <IconComponent className="w-3 h-3 mr-1" />
                                  {comment.platform}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{comment.body}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(comment.created_at_platform)}
                                </span>
                                {comment.like_count > 0 && <span>{comment.like_count} likes</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Comment Thread & Reply */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedComment ? "Comment Thread" : "Select a comment to view details"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedComment ? (
                <div className="space-y-6">
                  {/* Original Post Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">Original Post</h4>
                      {selectedComment.social_posts.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={selectedComment.social_posts.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{selectedComment.social_posts.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      by @{selectedComment.social_posts.social_accounts.handle}
                    </p>
                  </div>

                  {/* Comment Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedComment.author_name}</p>
                        <p className="text-sm text-slate-500">@{selectedComment.author_handle}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-3">{selectedComment.body}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{formatDate(selectedComment.created_at_platform)}</span>
                      {selectedComment.like_count > 0 && <span>{selectedComment.like_count} likes</span>}
                    </div>
                  </div>

                  <Separator />

                  {/* Reply Composer */}
                  <div>
                    <h4 className="font-medium mb-3">Reply</h4>
                    {canReply ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-slate-500">Reply will be queued for {selectedComment.platform}</p>
                          <Button onClick={handleSendReply} disabled={!replyText.trim() || sending} size="sm">
                            <Send className="w-4 h-4 mr-2" />
                            {sending ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          You don't have permission to reply to comments. Contact an admin for access.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a comment from the list to view details and reply</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
