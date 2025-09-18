import { Tooltip,TooltipContent,TooltipProvider,TooltipTrigger } from "@radix-ui/react-tooltip";

export interface HintProps {
  lable: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
};

export const Hint = ({
  lable,
  children,
  side = "top",
  align = "center",
  sideOffset = 0,
  alignOffset = 0,
}: HintProps) => {

return (
  <TooltipProvider>
    <Tooltip delayDuration={100}>  
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} className="text-white bg-black border-black rounded-md items-center flex justify-center z-[100]">
        <p className="semi-bold text-sm capitalize px-2 py-1 z-[100]"> 
          {lable}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  );
};