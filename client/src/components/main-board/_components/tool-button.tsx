import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  lable: string;
  isActive?: boolean;
  isDisabled?: boolean;
};

export const ToolButton = ({
  lable,
  icon : Icon,
  onClick,
  isActive,
  isDisabled,
}:ToolButtonProps) => {
  return (
    <Hint lable={lable} side="right" sideOffset={14}>
      <Button
        disabled={isDisabled}
        onClick={onClick}
        size={"icon"}
        variant={isActive ? "boardActive" : "board"}
      >
        <Icon className="h-5 w-5" />
      </Button>
    </Hint>
  );
};