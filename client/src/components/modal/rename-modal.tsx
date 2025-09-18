import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBoards, useRenameModal } from "@/store/use-rename-modal";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { useParams } from "react-router";


export const RenameModal = () => {
  const { groupId } = useParams<{ groupId: string }>();
  
  const {isOpen,onClose,initialValues} = useRenameModal();
  const {updatetitle} = useBoards();
  const {mutate,isLoading} = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/rename/${initialValues.id}`);
  const [title,setTitle] = useState(initialValues.title); 

  useEffect(() => { 
    setTitle(initialValues.title);
  },[initialValues.title]);

  const onSubmit : FormEventHandler<HTMLFormElement>= (e) => {
    e.preventDefault();

    mutate({
      title
    }).then(()=>{
      updatetitle(initialValues.id,title);
      toast.success("Board title updated");
      onClose();
    }).catch(()=>{
      toast.error("Failed to update board title");
    })
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit board title
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter a new title for the board
        </DialogDescription>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            disabled={isLoading}
            required
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
          />
          <DialogFooter>
              <DialogClose>
                <Button type="button" variant={"outline"}>
                  Cancle
                </Button>
              </DialogClose>
              <Button disabled={isLoading} type="submit">
                Save
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}