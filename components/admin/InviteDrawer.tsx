"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { X, Send } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface InviteDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInviteSent: () => void
}

interface Talent {
  id: string
  name: string
  type: string
}

export function InviteDrawer({ open, onOpenChange, onInviteSent }: InviteDrawerProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("")
  const [selectedTalents, setSelectedTalents] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: talents = [] } = useSWR<Talent[]>("/api/talents", fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          talent_ids: selectedTalents,
        }),
      })

      if (response.ok) {
        toast.success("Invitation sent successfully")
        setEmail("")
        setRole("")
        setSelectedTalents([])
        onInviteSent()
        onOpenChange(false)
      } else {
        const error = await response.text()
        toast.error(error || "Failed to send invitation")
      }
    } catch (error) {
      toast.error("Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTalent = (talentId: string) => {
    if (!selectedTalents.includes(talentId)) {
      setSelectedTalents([...selectedTalents, talentId])
    }
  }

  const removeTalent = (talentId: string) => {
    setSelectedTalents(selectedTalents.filter((id) => id !== talentId))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "assistant":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription>Send an invitation to join the talent management platform</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full access</SelectItem>
                <SelectItem value="manager">Manager - Manage talents and tasks</SelectItem>
                <SelectItem value="assistant">Assistant - View and basic editing</SelectItem>
              </SelectContent>
            </Select>
            {role && <Badge className={getRoleColor(role)}>{role}</Badge>}
          </div>

          <div className="space-y-2">
            <Label>Talent Access (Optional)</Label>
            <Select onValueChange={addTalent}>
              <SelectTrigger>
                <SelectValue placeholder="Add talent access" />
              </SelectTrigger>
              <SelectContent>
                {talents
                  .filter((talent) => !selectedTalents.includes(talent.id))
                  .map((talent) => (
                    <SelectItem key={talent.id} value={talent.id}>
                      {talent.name} ({talent.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedTalents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Selected Talents:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTalents.map((talentId) => {
                    const talent = talents.find((t) => t.id === talentId)
                    return talent ? (
                      <Badge key={talentId} variant="secondary" className="flex items-center gap-1">
                        {talent.name}
                        <button
                          type="button"
                          onClick={() => removeTalent(talentId)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
