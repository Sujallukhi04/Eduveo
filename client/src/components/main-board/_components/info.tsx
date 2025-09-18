"use client";

import { Actions } from "@/components/action";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useBoardById } from "@/hooks/use-board-by-id";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { Menu } from "lucide-react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

interface InfoProps{
  boardId:string;
};

const TabSeparator = () => {
  return (
    <div className="text-neutral-200 px-1.5">
      |
    </div>
  )
}

export const Info = ({
  boardId,
}:InfoProps) => {
  const {onOpen} = useRenameModal();  
  const {groupId} =useParams();
  const {board:data} = useBoardById();

  if(!data) return <InfoSkeleton/>;
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
        <Hint lable="Go to boards">
        <Link to={`/groups/${groupId}`} className="items-center text-center">
          <Button className="px-2" variant={"board"}>
            <img
              src="/favicon.svg"
              alt="Logo"
              height={30}
              width={30}
              className="mt-3"
              />
            <span className={cn(
              "text-black font-semibold text-xl mt-1",
              "font-poppins"
            )}>
              Studywise
            </span>
          </Button>
        </Link>
        </Hint>
        <TabSeparator/>
        <Hint lable="Rename board">
          <Button 
            variant={"board"}
            className="text-base font-normal px-2"
            onClick={()=>{onOpen(data.id,data.title)}}
            >
            {data.title}
        </Button>
        </Hint>
        <TabSeparator/>
        <Actions 
          id={data.id}
          title={data.title}
          side="bottom"
          sideOffset={10}
        >
          <div>
            <Hint lable="Main menue" side="bottom" sideOffset={10}>
              <Button
                variant={"board"}
                size={"icon"}
              >
                <Menu />
              </Button>
            </Hint>
          </div> 
        </Actions>
      </div>
  );
} ;

export const InfoSkeleton =()=>{
  return (
    <div className="w-[300px] absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md"/>
  );
};