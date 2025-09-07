"use client"

import { Search, Bell, Plus, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EntitySelector } from "@/components/entity-selector"

interface UnifiedDashboardHeaderProps {
  title: string
  subtitle?: string
  showEntitySelector?: boolean
  onSearch?: (query: string) => void
  onCreateNew?: () => void
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
}

export function UnifiedDashboardHeader({
  title,
  subtitle,
  showEntitySelector = false,
  onSearch,
  onCreateNew,
  viewMode = "grid",
  onViewModeChange,
}: UnifiedDashboardHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {showEntitySelector && <EntitySelector />}
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search across all entities..."
              className="pl-10 w-80"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>New Talent</DropdownMenuItem>
              <DropdownMenuItem>New Brand</DropdownMenuItem>
              <DropdownMenuItem>New Campaign</DropdownMenuItem>
              <DropdownMenuItem>New Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative bg-transparent">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">3</Badge>
          </Button>
        </div>
      </div>
    </div>
  )
}
