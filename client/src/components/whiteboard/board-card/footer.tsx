// import { cn } from "@/lib/utils";
// import { Star } from "lucide-react";
// import React from "react";

// interface FooterProps{
//   title:string
//   authorLable:string
//   createdAtLable:string
//   onClick:()=>void
//   isFavorite:boolean
//   disabled:boolean
// }

// export const Footer=({
//   title,
//   authorLable,
//   createdAtLable,
//   onClick,
//   isFavorite,
//   disabled,
// }:FooterProps)=>{

//   const handleClick = (
//     event:React.MouseEvent<HTMLButtonElement, MouseEvent>
//   )=>{
//     event.stopPropagation();
//     event.preventDefault();
//     onClick();
//   }

//   return (
//     <div className="relative bg-white p-3">
//       <p className="text-[13px] truncate mx-w-[100%-20px]">
//         {title}
//       </p>
//       <p className="opacity-0 group-hover:opacity-100 
//         transition-opacity text-[11px] text-muted-foreground">
//         {authorLable},{createdAtLable}
//       </p>
//       <button 
//         disabled={disabled}
//         onClick={handleClick}
//         className={cn("opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600",
//           disabled && "cursor-not-allowed opacity-75")}
//       >
//         <Star
//           className={cn(
//             "h-4 w-4",
//             isFavorite && "fill-blue-600 text-blue-600"
//           )}
//         />
//       </button>
//     </div>
//   )
// }

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import React from "react";

interface FooterProps {
  title: string;
  authorLable: string;
  createdAtLable: string;
  onClick: () => void;
  isFavorite: boolean;
  disabled: boolean;
}

export const Footer = ({
  title,
  authorLable,
  createdAtLable,
  onClick,
  isFavorite,
  disabled,
}: FooterProps) => {
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    onClick();
  };

  return (
    <div className={cn(
      "relative p-3 bg-white dark:bg-gray-800 dark:text-white"
    )}>
      <p className="text-[13px] truncate mx-w-[100%-20px]">
        {title}
      </p>
      <p className="opacity-0 group-hover:opacity-100 
        transition-opacity text-[11px] text-muted-foreground dark:text-gray-400">
        {authorLable}, {createdAtLable}
      </p>
      <button 
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400",
          disabled && "cursor-not-allowed opacity-75"
        )}
      >
        <Star
          className={cn(
            "h-4 w-4",
            isFavorite && "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"
          )}
        />
      </button>
    </div>
  );
};