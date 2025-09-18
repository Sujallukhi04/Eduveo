'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinGroup } from "@/lib/group-api"
import { toast } from "sonner"

export function JoinGroupDialog() {
  const [groupCode, setGroupCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinGroup = async () => {
    setIsJoining(true)
    setError(null)
    try {
      await joinGroup(groupCode)
      toast.success("Successfully joined group")
      window.location.reload() // Refresh to show new group
    } catch (error) {
      console.error("Error joining group:", error)
      toast.error("Failed to join group. Please check the code and try again.")
      setError("Failed to join group. Please check the code and try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Study Group</DialogTitle>
          <DialogDescription>
            Enter the group code to join an existing study group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="groupCode">Group Code</Label>
            <Input
              id="groupCode"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Enter group code"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleJoinGroup}
            disabled={isJoining || !groupCode}
          >
            {isJoining ? "Joining..." : "Join Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

