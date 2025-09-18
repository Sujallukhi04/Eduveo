import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Button } from "./ui/button";
import { useBoards, useRenameModal } from "@/store/use-rename-modal";
import { ConfirModle } from "./conform-modle";
import { useParams } from "react-router";

interface ActionsProps{
  children:React.ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"]
  id:string;
  title:string;
};

export const Actions=({
  children,
  side,
  sideOffset,
  id,
  title
}:ActionsProps)=>{

  const { groupId } = useParams<{ groupId: string }>();
  const {onOpen} = useRenameModal();
  const {removeBoard} = useBoards();

  const {mutate,isLoading}=useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/delete/${id}`);

  const onCopyLink=()=>{
    navigator.clipboard.writeText(`${window.location.origin}/group/${groupId}/board/${id}`)
    .then(()=>{
      toast.success("Link Copied");
    })
    .catch(()=>{
      toast.error("Failed to copy link");
    });
  }

  const onDelete=()=>{
    mutate({})
    .then(()=>{
      console.log("Remove board",id);
      removeBoard(id);
      toast.success("Board deleted");
    })
    .catch(()=>{
      toast.error("Failed to delete board");
    });
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} sideOffset={sideOffset} 
        onClick={(e)=>e.stopPropagation()} className="w-60">
          <DropdownMenuItem
            onClick={onCopyLink}
            disabled={isLoading}
          >
            <Link2 className="h-4 w-4 mr-2"/>
            Copy board link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={()=>{onOpen(id,title)}}
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4 mr-2"/>
            Rename
          </DropdownMenuItem>
          <ConfirModle 
            header="Delete board"
            description={`Are you sure you want to delete ${title}?`}
            onConfirm={onDelete}
            desabled={isLoading}
          >
            <Button
              variant={"ghost"}
              className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
            >
              <Trash2 className="h-4 w-4 mr-2"/>
              Delete
            </Button>
          </ConfirModle>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}