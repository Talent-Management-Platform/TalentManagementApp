export interface Entity {
  id: string
  name: string
  kind: "talent" | "brand"
  logo?: string
}

export async function fetchEntities(kind: "talent" | "brand"): Promise<Entity[]> {
  try {
    const endpoint = kind === "talent" ? "/api/actors" : "/api/brands"
    const response = await fetch(endpoint)
    const data = await response.json()

    if (kind === "talent") {
      return (data.actors || []).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        kind: "talent" as const,
        logo: actor.profile_image_url,
      }))
    } else {
      return (data.brands || []).map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        kind: "brand" as const,
        logo: brand.logo,
      }))
    }
  } catch (error) {
    console.error(`Error fetching ${kind}s:`, error)
    return []
  }
}
