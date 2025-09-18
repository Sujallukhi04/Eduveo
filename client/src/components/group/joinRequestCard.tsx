import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { acceptRequest, rejectRequest } from '../../lib/group-api'
import { UserAvatar } from '../UserAvatar'
import { toast } from 'sonner'

interface JoinRequestCardProps {
  id: string
  name: string
  avatar: string
  email: string
}

export function JoinRequestCard({ id, name, avatar, email }: JoinRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true)
    try {
      if (action === 'accept') {
        await acceptRequest(id)
        toast.success('Request accepted', { duration: 3000 })
      } else {
        await rejectRequest(id)
        toast.success('Request rejected', { duration: 3000 })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm transition-all duration-300 hover:shadow-lg">
      <CardContent className="pt-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <UserAvatar
            user={{
              name: name || "User",
              avatar: avatar || undefined,
              userId: email || "default",
            }}
            size={48}
            className="shrink-0"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground mt-1">Wants to join your group</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end px-4 sm:px-6 pb-6">
        <Button 
          variant="outline" 
          onClick={() => handleAction('reject')} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Reject
        </Button>
        <Button 
          onClick={() => handleAction('accept')} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}

