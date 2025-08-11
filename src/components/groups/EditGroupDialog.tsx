'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { Group } from "@/app/groups/page";

const editGroupSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

interface EditGroupDialogProps {
  group: Group;
  onGroupUpdated: () => void;
}

export function EditGroupDialog({ group, onGroupUpdated }: EditGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: { // Pre-fill the form with existing group data
      name: group.name,
      subject: group.subject,
    }
  });

  const onSubmit = async (values: EditGroupFormValues) => {
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "An unknown error occurred.");
      
      toast.success("Group updated successfully!");
      onGroupUpdated();
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to update group", { description: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex-1">
          <Settings className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the details for your group. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register("subject")} />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}