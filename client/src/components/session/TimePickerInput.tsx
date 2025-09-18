import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerInput({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLDivElement>(null);
  const hourRef = React.useRef<HTMLDivElement>(null);
  const [hour, setHour] = React.useState(date.getHours());
  const [, setMinute] = React.useState(date.getMinutes());
  const [isPM, setIsPM] = React.useState(hour >= 12);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourChange = (newHour: number) => {
    const adjustedHour = isPM ? (newHour === 12 ? 12 : newHour + 12) : (newHour === 12 ? 0 : newHour);
    setHour(adjustedHour);
    const newDate = new Date(date);
    newDate.setHours(adjustedHour);
    setDate(newDate);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    const newDate = new Date(date);
    newDate.setMinutes(newMinute);
    setDate(newDate);
  };

  const toggleMeridiem = () => {
    const newIsPM = !isPM;
    setIsPM(newIsPM);
    const adjustedHour = newIsPM ? hour + 12 : hour - 12;
    setHour(adjustedHour);
    const newDate = new Date(date);
    newDate.setHours(adjustedHour);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full sm:w-[160px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "hh:mm a")
          ) : (
            <span>Pick a time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 rounded-xl z-[102]">
        <div className="flex items-center justify-center space-x-2 p-2">
          <div className="grid gap-1 text-center">
            <Label htmlFor="hours" className="text-xs">
              Hours
            </Label>
            <div
              ref={hourRef}
              className="scrollbar-none h-[120px] overflow-y-auto overflow-x-hidden"
            >
              <div className="space-y-1">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => handleHourChange(hour)}
                    className={cn(
                      "cursor-pointer rounded-md px-4 py-2 hover:bg-primary/10",
                      hour === (isPM ? (date.getHours() === 12 ? 12 : date.getHours() - 12) : (date.getHours() === 0 ? 12 : date.getHours())) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {hour.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-1 text-center">
            <Label htmlFor="minutes" className="text-xs">
              Minutes
            </Label>
            <div
              ref={minuteRef}
              className="scrollbar-none h-[120px] overflow-y-auto overflow-x-hidden"
            >
              <div className="space-y-1">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    onClick={() => handleMinuteChange(minute)}
                    className={cn(
                      "cursor-pointer rounded-md px-4 py-2 hover:bg-primary/10",
                      minute === date.getMinutes() &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {minute.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-1 text-center">
            <Label className="text-xs">AM/PM</Label>
            <div className="flex flex-col gap-1">
              <div
                onClick={toggleMeridiem}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-2 hover:bg-primary/10",
                  !isPM && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                AM
              </div>
              <div
                onClick={toggleMeridiem}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-2 hover:bg-primary/10",
                  isPM && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                PM
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 