// import { useApiMutation } from "@/hooks/use-api-mutation";
// import { useParams } from "react-router";
// import { useNavigate } from "react-router";
// import { toast } from "sonner";
// import { Button } from "../ui/button";
// import { useLocation } from "react-router";
// import { useBoards } from "@/store/use-rename-modal";

// export const EmptyBoard = () => {
//   const navigate = useNavigate();
//   const { groupId } = useParams();
//   const { mutate, isLoading } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/create`);
//   const location = useLocation();
//   const {addBoard}=useBoards();

//   const onClick = () => {
//       mutate({ title: "Untitled" })
//           .then((id) => {
//               toast.success("Board created");
//               const currentPath = location.pathname;
//               const boardPath = `${currentPath}/board/${id.id}`;
//               addBoard({
//                 id: id.id,
//                 title: id.title,
//                 imageurl: id.imageUrl,
//                 authorId: id.authorId,
//                 authorName: id.authorName,
//                 createdAt: id.createdAt,
//                 groupId: id.groupId,
//                 isFavorite: id.isFavorited
//               });
//               navigate(boardPath);
//           })
//           .catch((e) => {
//               console.log("Error :",e);
//               toast.error("Failed to create board");
//           });
//   };

//   return (
//       <div className="h-full flex flex-col items-center justify-center">
//           <img src="/notes.svg" alt="Empty" width={140} height={140} />
//           <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
//           <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization</p>
//           <div className="mt-6">
//               <Button disabled={isLoading} size="lg" onClick={onClick}>
//                   Create board
//               </Button>
//           </div>
//       </div>
//   );
// };


// export const EmptySearch = () => {
//   return (
//       <div className="h-full flex flex-col items-center justify-center">
//           <img src="/empty-search.svg" alt="Empty" width={140} height={140} />
//           <h2 className="text-2xl font-semibold mt-6">No results found!</h2>
//           <p className="text-muted-foreground text-sm mt-2">Try searching for something else</p>
//       </div>
//   );
// };

// export const EmptyFavorites = () => {
//   return (
//       <div className="h-full flex flex-col items-center justify-center">
//           <img src="/empty-favorites.svg" alt="Empty" width={140} height={140} />
//           <h2 className="text-2xl font-semibold mt-6">No favorite boards!</h2>
//           <p className="text-muted-foreground text-sm mt-2">Try favoriting some boards</p>
//       </div>
//   );
// };

import { useApiMutation } from "@/hooks/use-api-mutation";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useLocation } from "react-router";
import { useBoards } from "@/store/use-rename-modal";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export const EmptyBoard = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { mutate, isLoading } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/create`);
  const location = useLocation();
  const { addBoard } = useBoards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCreateBoard = () => {
    mutate({ title })
      .then((id) => {
        toast.success("Board created");
        const currentPath = location.pathname;
        const boardPath = `${currentPath}/board/${id.id}`;
        addBoard({
          id: id.id,
          title: id.title,
          imageurl: id.imageUrl,
          authorId: id.authorId,
          authorName: id.authorName,
          createdAt: id.createdAt,
          groupId: id.groupId,
          isFavorite: id.isFavorited
        });
        setIsDialogOpen(false);
        navigate(boardPath);
      })
      .catch((e) => {
        console.log("Error :", e);
        toast.error("Failed to create board");
      });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <img src="/notes.svg" alt="Empty" width={140} height={140} />
      <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
      <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization</p>
      <div className="mt-6">
        <Button 
          disabled={isLoading} 
          size="lg" 
          onClick={openDialog}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create board
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold">Create your first board</h2>
          </div>
          <div className="p-6 space-y-6 pt-0">
            <div className="space-y-2">
              <div className="font-medium">Title</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-visible:ring-blue-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                placeholder="Untitled"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBoard} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const EmptySearch = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <img src="/empty-search.svg" alt="Empty" width={140} height={140} />
      <h2 className="text-2xl font-semibold mt-6">No results found!</h2>
      <p className="text-muted-foreground text-sm mt-2">Try searching for something else</p>
    </div>
  );
};

export const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <img src="/empty-favorites.svg" alt="Empty" width={140} height={140} />
      <h2 className="text-2xl font-semibold mt-6">No favorite boards!</h2>
      <p className="text-muted-foreground text-sm mt-2">Try favoriting some boards</p>
    </div>
  );
};