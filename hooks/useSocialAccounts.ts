"use client"

import { useState, useEffect } from "react"

interface SocialAccount {
  id: string
  talent_id: string
  platform: string
  handle: string | null
  external_id: string | null
  page_name: string | null
  website_url: string | null
  is_connected: boolean
  created_at: string
}

export function useSocialAccounts(talentId: string | null) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    if (!talentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/social/accounts?talentId=${talentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch social accounts")
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addAccount = async (platform: string, handle?: string, website_url?: string) => {
    if (!talentId) return

    try {
      const response = await fetch("/api/social/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          talent_id: talentId,
          platform,
          handle,
          website_url,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add social account")
      }

      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [talentId])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    addAccount,
  }
}
