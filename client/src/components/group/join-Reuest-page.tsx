import { JoinRequestCard } from "./joinRequestCard"

export default async function GroupRequestsPage( joinRequests : any) {
  
    // const joinRequests = await joinRequest()

    console.log("joinRequests: ", joinRequests);
    
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Group Join Requests</h1>
      {joinRequests.length === 0 ? (
        <p className="text-muted-foreground">No pending join requests.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {joinRequests.map((request : any) => (
            <JoinRequestCard
              key={request.id}
              id={request.id}
              name={request.name}
              avatar={request.avatar}
              email={request.email}
            />
          ))}
        </div>
      )}
    </div>
  )
}

