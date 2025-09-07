"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react"

interface InsightMetric {
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "stable"
  progress?: number
}

interface CrossEntityInsightsProps {
  entityType: "talent" | "brand" | "campaign"
  entityName: string
  metrics: InsightMetric[]
}

export function CrossEntityInsights({ entityType, entityName, metrics }: CrossEntityInsightsProps) {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-chart-3" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-chart-3"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cross-Entity Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">How {entityName} performs across connected entities</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                {metric.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    {metric.change && (
                      <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.progress !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {metric.progress}%
                  </Badge>
                )}
              </div>

              {metric.progress !== undefined && <Progress value={metric.progress} className="h-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
