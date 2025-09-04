"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSocialAccounts } from "@/hooks/useSocialAccounts"
import { Youtube, Instagram, Facebook, Twitter, Globe, Plus, ExternalLink } from "lucide-react"

interface SocialAccountsSectionProps {
  talentId: string
}

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  threads: Twitter,
  tiktok: Twitter,
  website: Globe,
}

const platformColors = {
  youtube: "bg-red-100 text-red-800",
  instagram: "bg-pink-100 text-pink-800",
  facebook: "bg-blue-100 text-blue-800",
  x: "bg-gray-100 text-gray-800",
  threads: "bg-gray-100 text-gray-800",
  tiktok: "bg-gray-100 text-gray-800",
  website: "bg-green-100 text-green-800",
}

export function SocialAccountsSection({ talentId }: SocialAccountsSectionProps) {
  const { accounts, loading, error, refetch, addAccount } = useSocialAccounts(talentId)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newAccountForm, setNewAccountForm] = useState({
    platform: "",
    handle: "",
    website_url: "",
  })

  const handleConnect = (platform: string) => {
    const baseUrl = window.location.origin
    window.location.href = `/api/auth/${platform}/start?talentId=${talentId}`
  }

  const handleAddWebsite = async () => {
    if (!newAccountForm.website_url) return

    await addAccount("website", undefined, newAccountForm.website_url)
    setNewAccountForm({ platform: "", handle: "", website_url: "" })
    setIsAddModalOpen(false)
  }

  const handleAddManual = async () => {
    if (!newAccountForm.platform || !newAccountForm.handle) return

    await addAccount(newAccountForm.platform, newAccountForm.handle)
    setNewAccountForm({ platform: "", handle: "", website_url: "" })
    setIsAddModalOpen(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Loading social accounts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Accounts</CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Connect via OAuth</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleConnect("youtube")}
                    className="flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4 text-red-600" />
                    Connect YouTube
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleConnect("instagram")}
                    className="flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Connect Instagram
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add Manual Account</Label>
                <div className="space-y-2">
                  <select
                    value={newAccountForm.platform}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, platform: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Platform</option>
                    <option value="x">X (Twitter)</option>
                    <option value="threads">Threads</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                  </select>
                  <Input
                    placeholder="Handle (e.g., @username)"
                    value={newAccountForm.handle}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, handle: e.target.value })}
                  />
                  <Button onClick={handleAddManual} disabled={!newAccountForm.platform || !newAccountForm.handle}>
                    Add Account
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add Website/RSS</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Website URL"
                    value={newAccountForm.website_url}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, website_url: e.target.value })}
                  />
                  <Button onClick={handleAddWebsite} disabled={!newAccountForm.website_url}>
                    Add Website
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-600 text-sm mb-4">Error: {error}</p>}

        {accounts.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No social accounts connected yet.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const IconComponent = platformIcons[account.platform as keyof typeof platformIcons] || Globe
              const colorClass =
                platformColors[account.platform as keyof typeof platformColors] || "bg-gray-100 text-gray-800"

              return (
                <div key={account.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium capitalize">{account.platform}</p>
                      <p className="text-sm text-slate-500">
                        {account.handle || account.page_name || account.website_url || "No handle"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={colorClass}>{account.is_connected ? "Connected" : "Not Connected"}</Badge>
                    {account.website_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={account.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
