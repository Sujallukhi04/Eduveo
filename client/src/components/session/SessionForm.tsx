import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { TimePickerInput } from "./TimePickerInput";

interface SessionFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  prerequisites?: string;
}

interface SessionFormProps {
  formData: SessionFormData;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDateChange: (date: Date | undefined) => void;
  submitLabel: string;
}

export const SessionForm = ({
  formData,
  formErrors,
  onSubmit,
  onChange,
  onDateChange,
  submitLabel
}: SessionFormProps) => {
  const handleTimeChange = (newDate: Date) => {
    onChange({
      target: {
        name: "time",
        value: format(newDate, "HH:mm")
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="title" className={cn(formErrors.title && "text-destructive")}>
              Session Title
              <span className="text-destructive ml-1">*</span>
            </Label>
            {formErrors.title && (
              <span className="text-xs font-medium text-destructive">
                {formErrors.title}
              </span>
            )}
          </div>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="e.g., Advanced Calculus Review"
            className={cn(formErrors.title && "border-destructive focus-visible:ring-destructive")}
          />
        </div>
        {/* Date & Time */}
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="date" className={cn((formErrors.date || formErrors.time) && "text-destructive")}>
              Date & Time
              <span className="text-destructive ml-1">*</span>
            </Label>
            {(formErrors.date || formErrors.time) && (
              <span className="text-xs font-medium text-destructive">
                {formErrors.date || formErrors.time}
              </span>
            )}
          </div>
          <div className="grid sm:flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl z-[102]">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={onDateChange}
                  initialFocus
                  className="rounded-xl border-0"
                />
              </PopoverContent>
            </Popover>
            <TimePickerInput
              date={formData.date}
              setDate={(date) => {
                onDateChange(date);
                handleTimeChange(date);
              }}
            />
          </div>
        </div>
        {/* Description */}
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="description" className={cn(formErrors.description && "text-destructive")}>
              Description
              <span className="text-destructive ml-1">*</span>
            </Label>
            {formErrors.description && (
              <span className="text-xs font-medium text-destructive">
                {formErrors.description}
              </span>
            )}
          </div>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="What will you study in this session?"
            className={cn(formErrors.description && "border-destructive focus-visible:ring-destructive")}
          />
        </div>
        {/* Prerequisites */}
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <Input
            id="prerequisites"
            name="prerequisites"
            value={formData.prerequisites || ""}
            onChange={onChange}
            placeholder="e.g., Basic calculus knowledge"
            className="focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            List any background knowledge or materials needed for this session
          </p>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}; 