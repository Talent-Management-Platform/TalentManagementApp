"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Building2, Megaphone, ExternalLink } from "lucide-react"

interface Entity {
  id: string
  name: string
  type: "talent" | "brand" | "campaign"
  status?: string
  avatar?: string
}

interface Relationship {
  from: Entity
  to: Entity
  type: "manages" | "collaborates" | "promotes" | "sponsors"
  strength: "weak" | "medium" | "strong"
}

interface RelationshipVisualizerProps {
  entity: Entity
  relationships: Relationship[]
  onEntityClick?: (entity: Entity) => void
}

export function RelationshipVisualizer({ entity, relationships, onEntityClick }: RelationshipVisualizerProps) {
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "talent":
        return <Users className="h-4 w-4" />
      case "brand":
        return <Building2 className="h-4 w-4" />
      case "campaign":
        return <Megaphone className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRelationshipColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-chart-1"
      case "medium":
        return "bg-chart-2"
      case "weak":
        return "bg-chart-3"
      default:
        return "bg-muted"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getEntityIcon(entity.type)}
          Relationships & Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relationships.map((rel, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getEntityIcon(rel.from.type)}
                  <span className="font-medium">{rel.from.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-2 w-8 rounded-full ${getRelationshipColor(rel.strength)}`} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {rel.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {getEntityIcon(rel.to.type)}
                  <span className="font-medium">{rel.to.name}</span>
                  {rel.to.status && (
                    <Badge variant="secondary" className="text-xs">
                      {rel.to.status}
                    </Badge>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => onEntityClick?.(rel.to)}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {relationships.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No relationships found</p>
              <p className="text-sm">Connect this {entity.type} to other entities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
