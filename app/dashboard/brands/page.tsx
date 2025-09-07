"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Building2, Globe, Download, ExternalLink } from "lucide-react"
import { BrandModal } from "@/components/brand-modal"
import { BrandDetailsModal } from "@/components/brand-details-modal"
import { PermissionGate } from "@/components/rbac/PermissionGate"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BrandsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const { data: brandsData, error, mutate } = useSWR("/api/brands", fetcher)

  const brands = brandsData?.brands || []

  // Filter brands based on search and filters
  const filteredBrands = brands.filter((brand: any) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.website?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || (brand.categories && brand.categories.includes(categoryFilter))

    return matchesSearch && matchesCategory
  })

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

  const handleBrandClick = (brand: any) => {
    setSelectedBrand(brand)
    setIsDetailsModalOpen(true)
  }

  const handleBrandUpdate = () => {
    mutate()
    setIsDetailsModalOpen(false)
    setSelectedBrand(null)
  }

  const handleBrandCreate = () => {
    mutate()
    setIsCreateModalOpen(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading brands. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brands</h1>
          <p className="text-slate-600 mt-1">Manage your portfolio of brand partnerships and collaborations.</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="export_data">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <PermissionGate permission="manage_brands">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand: any) => (
            <Card
              key={brand.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleBrandClick(brand)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
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
                      <h3 className="font-semibold text-slate-900">{brand.name}</h3>
                      {brand.website && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Globe className="w-3 h-3" />
                          <span className="truncate">{brand.website.replace(/^https?:\/\//, "")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {brand.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(brand.website, "_blank")
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {brand.categories && brand.categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {brand.categories.slice(0, 2).map((category: string) => (
                        <Badge key={category} className={getCategoryColor(category)}>
                          {category}
                        </Badge>
                      ))}
                      {brand.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{brand.categories.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {brand.bio && <p className="text-sm text-slate-600 line-clamp-3">{brand.bio}</p>}

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Added {new Date(brand.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No brands found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your filters to see more brands."
                    : "Get started by adding your first brand partnership."}
                </p>
                {!searchQuery && categoryFilter === "all" && (
                  <PermissionGate permission="manage_brands">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Brand
                    </Button>
                  </PermissionGate>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <BrandModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBrandCreate}
      />

      {selectedBrand && (
        <BrandDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          brand={selectedBrand}
          onUpdate={handleBrandUpdate}
        />
      )}
    </div>
  )
}
