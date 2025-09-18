
export const Whiteboard = () =>{
  return (
    <DashboardLayout>
      <DashboardPage/>
    </DashboardLayout>
    
  )
}

import React from "react";
import { useParams } from "react-router-dom";
import { BoardList } from "./board-list";
import { EmptyBoard } from "./empty-board";
import { OrgSidebar } from "./org-sidebar";
import { ModalProvider } from "../providers/modal-provider";

const DashboardLayout = ({ children }:React.PropsWithChildren) => {
  return (
    <main className="h-full">
        <div className="flex gap-x-3 h-full">
          <OrgSidebar />
          <div className="h-full flex-1">
           <ModalProvider/>
            {children}
          </div>
      </div>
    </main>
  );
};


const DashboardPage = () => {
  const { groupId } = useParams();
  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6">
      {!groupId ? <EmptyBoard /> : <BoardList groupId={groupId} />}
    </div>
  );
};

