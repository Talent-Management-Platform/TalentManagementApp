"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Globe, Edit, ExternalLink, Calendar, Briefcase } from "lucide-react"
import { BrandModal } from "@/components/brand-modal"
import { PermissionGate } from "@/components/rbac/PermissionGate"

interface BrandDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  brand: any
  onUpdate: () => void
}

export function BrandDetailsModal({ isOpen, onClose, brand, onUpdate }: BrandDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technology":
        return "bg-blue-100 text-blue-800"
      case "fashion":
        return "bg-pink-100 text-pink-800"
      case "food":
        return "bg-orange-100 text-orange-800"
      case "health":
        return "bg-green-100 text-green-800"
      case "finance":
        return "bg-purple-100 text-purple-800"
      case "entertainment":
        return "bg-red-100 text-red-800"
      case "education":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditSuccess = () => {
    onUpdate()
    setIsEditModalOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl">{brand.name}</DialogTitle>
                  {brand.website && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Globe className="w-3 h-3" />
                      <span>{brand.website.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {brand.website && (
                  <Button variant="outline" size="sm" onClick={() => window.open(brand.website, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                <PermissionGate permission="manage_brands">
                  <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Brand Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brand.categories && brand.categories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-700 mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {brand.categories.map((category: string) => (
                            <Badge key={category} className={getCategoryColor(category)}>
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {brand.bio && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-700 mb-2">Description</h4>
                        <p className="text-sm text-slate-600">{brand.bio}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-2">Added</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(brand.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Active Campaigns</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Campaigns</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Partnership Since</span>
                      <span className="font-medium">{new Date(brand.created_at).getFullYear()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns yet</h3>
                  <p className="text-slate-600 mb-6">Create your first campaign with this brand to get started.</p>
                  <PermissionGate permission="manage_campaigns">
                    <Button>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </PermissionGate>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics coming soon</h3>
                  <p className="text-slate-600">
                    Brand performance analytics will be available once campaigns are active.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BrandModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        brand={brand}
      />
    </>
  )
}
