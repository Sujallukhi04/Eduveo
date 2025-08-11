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
import { PlusCircle } from "lucide-react";

const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
});

// Define the type for the form values
type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

// Define prop types
interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (values: CreateGroupFormValues) => {
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "An unknown error occurred.");
      
      toast.success("Group created successfully!");
      onGroupCreated();
      setIsOpen(false);
      reset();
    } catch (error) {
      // Add a type check for the error object
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to create group", { description: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>Fill in the details below. A unique join code will be generated automatically.</DialogDescription>
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
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}