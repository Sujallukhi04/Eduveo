// "use client";

// import { useApiMutation } from "@/hooks/use-api-mutation";
// import { cn } from "@/lib/utils";
// import { useBoards } from "@/store/use-rename-modal";
// import { Plus } from "lucide-react";
// import { useLocation } from "react-router";
// import { useNavigate } from "react-router";
// import { toast } from "sonner";

// export const NewBoardButton = ({groupId,disabled}:{groupId:string;disabled?:boolean}) => {
//   const navigate = useNavigate();
//   const { mutate, isLoading } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/create`);
//   const location = useLocation();
//   const {addBoard} =useBoards();
//   const onClick = () => {
//       mutate({ title: "Untitled" })
//           .then((id) => {
//               toast.success("Board created");
//               const currentPath = location.pathname;
//               console.log("BOARD:",{id});
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
//               const boardPath = `${currentPath}/board/${id.id}`;
              
//               navigate(boardPath);
//           })
//           .catch((e) => {
//               console.log("Error :",e);
//               toast.error("Failed to create board");
//           });
//   };
  
//   return (
//     <button
//       disabled={disabled||isLoading}
//       onClick={onClick}
//       className={cn(
//         "w-full h-full col-span-1 aspect-[100/27] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6"
//       , (disabled || isLoading)&& "hover:bg-blue-600 cursor-not-allowed opacity-75")}
//     >
//       <div />
//       <Plus className="h-12 w-12 text-white stroke-1"/>
//       <p className="text-xs text-white font-light">
//         New board
//       </p>
//     </button>
//   )
// }

"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { useBoards } from "@/store/use-rename-modal";
import { Plus, X } from "lucide-react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NewBoardButton = ({groupId, disabled}:{groupId:string; disabled?:boolean}) => {
  const navigate = useNavigate();
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
        console.log("BOARD:", {id});
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
        const boardPath = `${currentPath}/board/${id.id}`;
        setIsDialogOpen(false);
        navigate(boardPath);
      })
      .catch((e) => {
        console.log("Error :", e);
        toast.error("Failed to create board");
      });
  };
  
  return (
    <>
      <button
        disabled={disabled || isLoading}
        onClick={openDialog}
        className={cn(
          "w-full h-full col-span-1 aspect-[100/27] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
          (disabled || isLoading) && "hover:bg-blue-600 cursor-not-allowed opacity-75"
        )}
      >
        <div />
        <Plus className="h-12 w-12 text-white stroke-1"/>
        <p className="text-xs text-white font-light">
          New board
        </p>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold">Create new board</h2>
          </div>
          <div className="p-6 space-y-6 pt-0">
            <div className="space-y-2">
              <div className="font-medium">Title</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-visible:ring-blue-500"
                autoFocus
                placeholder="Untitled"
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
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
    </>
  );
};