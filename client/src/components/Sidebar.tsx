import { useState } from 'react';
import { Users, MessageSquare, PenTool, Crown, Calendar, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

const Sidebar = ({ activeTab, setActiveTab  }: { activeTab: string; setActiveTab: (tab: string) => void; }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'members', icon: Users, label: 'Study Buddies' },
    { id: 'chat', icon: MessageSquare, label: 'Group Chat' },
    { id: 'sessions', icon: Calendar, label: 'Study Time' },
    { id: 'whiteboard', icon: PenTool, label: 'Brain Space' },
    { id: 'achievements', icon: Crown, label: 'Your Wins' },
    { id: 'resources', icon: BookOpen, label: 'Study Hub' }
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card transition-all duration-300 flex flex-col shadow-lg pt-16",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-primary text-primary-foreground rounded-full p-1 hover:scale-110 transition-transform"
      >
        {isCollapsed ? 
          <ChevronRight className="h-4 w-4" /> : 
          <ChevronLeft className="h-4 w-4" />
        }
      </button>

      <div className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center px-4 py-3 transition-all duration-200",
              "hover:bg-primary/10 relative group",
              activeTab === item.id && "bg-primary/15"
            )}
          >
            <div className={cn(
              "flex items-center space-x-3",
              isCollapsed && "justify-center w-full"
            )}>
              <item.icon className={cn(
                "h-5 w-5",
                activeTab === item.id ? "text-primary" : "text-muted-foreground",
                "transition-colors duration-200"
              )} />
              {!isCollapsed && (
                <span className={cn(
                  "font-medium text-sm",
                  activeTab === item.id ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </div>
            
            {/* Active indicator */}
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded-md text-sm invisible group-hover:visible whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Fun decorative element */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 p-3",
          "transition-all duration-300",
          isCollapsed ? "h-16" : "h-24"
        )}>
          <div className="animate-pulse flex items-center justify-center h-full">
            <BookOpen className="h-6 w-6 text-primary opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;