"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Users, Building2, X } from "lucide-react"
import { useEntitySelection } from "@/hooks/useEntitySelection"
import { fetchEntities, type Entity } from "@/lib/entities"

export function EntitySelector() {
  const { selection, setSelection, clearSelection } = useEntitySelection()
  const [talents, setTalents] = useState<Entity[]>([])
  const [brands, setBrands] = useState<Entity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadEntities = async () => {
      setIsLoading(true)
      try {
        const [talentsData, brandsData] = await Promise.all([fetchEntities("talent"), fetchEntities("brand")])
        setTalents(talentsData)
        setBrands(brandsData)
      } catch (error) {
        console.error("Error loading entities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEntities()
  }, [])

  const handleEntitySelect = (entity: Entity) => {
    setSelection({
      kind: entity.kind,
      id: entity.id,
      name: entity.name,
    })
  }

  const getEntityIcon = (kind: "talent" | "brand") => {
    return kind === "talent" ? Users : Building2
  }

  const getEntityColor = (kind: "talent" | "brand") => {
    return kind === "talent" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  return (
    <div className="flex items-center gap-2">
      {selection.kind && selection.name && (
        <div className="flex items-center gap-2">
          <Badge className={getEntityColor(selection.kind)}>
            {React.createElement(getEntityIcon(selection.kind), { className: "w-3 h-3 mr-1" })}
            {selection.name}
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearSelection} className="h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {selection.kind ? "Switch Entity" : "Select Entity"}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {talents.length > 0 && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Talents
              </DropdownMenuLabel>
              {talents.map((talent) => (
                <DropdownMenuItem key={talent.id} onClick={() => handleEntitySelect(talent)} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {talent.logo ? (
                      <img
                        src={talent.logo || "/placeholder.svg"}
                        alt={talent.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-2 h-2 text-purple-600" />
                      </div>
                    )}
                    <span>{talent.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {brands.length > 0 && (
            <>
              {talents.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Brands
              </DropdownMenuLabel>
              {brands.map((brand) => (
                <DropdownMenuItem key={brand.id} onClick={() => handleEntitySelect(brand)} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {brand.logo ? (
                      <img
                        src={brand.logo || "/placeholder.svg"}
                        alt={brand.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-2 h-2 text-blue-600" />
                      </div>
                    )}
                    <span>{brand.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {talents.length === 0 && brands.length === 0 && !isLoading && (
            <DropdownMenuItem disabled>No entities available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
