import { useAuth } from "@/components/providers/auth";
import { useSession } from "@/contexts/SessionContext";
import { sessionFormSchema } from "@/lib/validations/session";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { SessionForm } from "./SessionForm";
import { SessionList } from "./SessionList";

// form data
interface SessionFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  prerequisites?: string;
}

// session
export interface SessionType {
  id: string;
  name: string;
  description?: string;
  time: string;
  prerequisites?: string;
  isStarted: boolean;
  startedAt?: string;
  endedAt?: string;
  groupId: string;
  creatorID: string;
  createdAt: string;
}

const Session = () => {
  const {
    sessions,
    addSession,
    fetchGroupSessions,
    deleteSession,
    editSession,
    endSession,
  } = useSession();
  const { user } = useAuth();
  console.log(user);
  console.log(sessions);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    date: new Date(),
    time: format(new Date(), "HH:mm"),
  });
  // Edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Editing session
  const [editingSession, setEditingSession] = useState<SessionType | null>(
    null
  );
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Get the groupId from the URL
  const { groupId } = useParams<{ groupId: string }>();

  // Fetch the sessions for the group
  useEffect(() => {
    if (groupId) {
      fetchGroupSessions(groupId);
    }
  }, [groupId]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    // Check for empty required fields first
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.date) {
      errors.date = "Please select a date";
    }

    if (!formData.time) {
      errors.time = "Please select a time";
    }

    // If we have any empty field errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const [hours, minutes] = formData.time.split(":");
    const sessionDate = new Date(formData.date);
    sessionDate.setHours(parseInt(hours), parseInt(minutes));

    try {
      // Validate with Zod schema
      sessionFormSchema.parse({
        title: formData.title,
        description: formData.description,
        date: sessionDate,
        time: formData.time,
        prerequisites: formData.prerequisites,
      });

      // Reset form errors
      setFormErrors({});

      //`addSession` function to create a new session
      try {
        await addSession({
          name: formData.title,
          time: sessionDate.toISOString(),
          description: formData.description,
          prerequisites: formData.prerequisites,
          groupId: groupId,
        });
      } catch (error) {
        toast.error("Failed to create session" + error);
        console.error("Error creating session:", error);
        throw error;
        return;
      }

      toast.success("Session created successfully");
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: format(new Date(), "HH:mm"),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      toast.error("Please check the form for errors");
    }
  };

  // Add function to sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sortedSessions.filter(
    (session) => new Date(session.time) > now
  );
  const pastSessions = sortedSessions.filter(
    (session) => new Date(session.time) <= now
  );

  const handleEdit = (session: SessionType) => {
    const sessionDate = new Date(session.time);
    setEditingSession(session);
    setFormData({
      title: session.name,
      description: session.description || "",
      date: sessionDate,
      time: format(sessionDate, "HH:mm"),
      prerequisites: session.prerequisites || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !editingSession) return;

    // Check for empty required fields first
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.date) {
      errors.date = "Please select a date";
    }

    if (!formData.time) {
      errors.time = "Please select a time";
    }

    // If we have any empty field errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    //if time is less than current time
    if (new Date(formData.date) < new Date()) {
      setFormErrors({ date: "Date cannot be in the past" });
      return;
    }

    try {
      // Create a new date object from the form data
      const [hours, minutes] = formData.time.split(":");
      const sessionDate = new Date(formData.date);
      sessionDate.setHours(parseInt(hours), parseInt(minutes));

      // Basic validation for date
      if (isNaN(sessionDate.getTime())) {
        setFormErrors({ date: "Invalid date selected" });
        return;
      }

      // Custom validation schema for edit
      const validationSchema = z.object({
        title: z
          .string()
          .min(3, "Title must be at least 3 characters")
          .max(50, "Title must be less than 50 characters"),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(500, "Description must be less than 500 characters"),
        time: z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Please select a valid time"
          ),
        prerequisites: z.string().optional(),
      });

      validationSchema.parse({
        title: formData.title,
        description: formData.description,
        time: formData.time,
        prerequisites: formData.prerequisites,
      });

      setFormErrors({});

      await editSession(editingSession.id, {
        name: formData.title,
        time: sessionDate.toISOString(),
        description: formData.description,
        prerequisites: formData.prerequisites,
      });

      toast.success("Session edited successfully");
      setIsEditDialogOpen(false);
      setEditingSession(null);
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: format(new Date(), "HH:mm"),
        prerequisites: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      toast.error("Please check the form for errors");
    }
  };

  // Check if the user is the creator of the session
  const isSessionCreator = (session: SessionType) => {
    return user?.id === session.creatorID;
  };

  return (
    <div className="relative pb-24">
      <Card className="max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Study Sessions</CardTitle>
              <CardDescription>Plan your study time together!</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-6 rounded-xl gap-6 z-[101] max-h-[90vh] overflow-y-auto">
                <div className="px-2">
                  <DialogHeader className="space-y-3">
                    <DialogTitle>Create Study Session</DialogTitle>
                    <DialogDescription>
                      Plan a new study session for your group
                    </DialogDescription>
                  </DialogHeader>
                  <div className="my-4">
                    <SessionForm
                      formData={formData}
                      formErrors={formErrors}
                      onSubmit={handleSubmit}
                      onChange={handleInputChange}
                      onDateChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: value || new Date(),
                        }))
                      }
                      submitLabel="Create Session"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <div className="grid grid-cols-1 gap-6">
              {upcomingSessions.length > 0 && (
                <div className="w-full">
                  <SessionList
                    title="Upcoming Sessions"
                    sessions={upcomingSessions}
                    onEdit={handleEdit}
                    onDelete={deleteSession}
                    onEndSession={endSession}
                    isSessionCreator={isSessionCreator}
                  />
                </div>
              )}

              {pastSessions.length > 0 && (
                <div className="w-full">
                  <SessionList
                    title="Past Sessions"
                    sessions={pastSessions}
                    onEdit={handleEdit}
                    onDelete={deleteSession}
                    onEndSession={endSession}
                    isSessionCreator={isSessionCreator}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-xl gap-6 z-[101] max-h-[90vh] overflow-y-auto">
          <div className="px-2">
            <DialogHeader className="space-y-3">
              <DialogTitle>Edit Study Session</DialogTitle>
              <DialogDescription>
                Update your study session details
              </DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <SessionForm
                formData={formData}
                formErrors={formErrors}
                onSubmit={handleEditSubmit}
                onChange={handleInputChange}
                onDateChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: value || new Date(),
                  }))
                }
                submitLabel="Save Changes"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Session;
