import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Users,
  BookOpen
} from "lucide-react";
import { GroupData } from '@/type';

const Member = ({ groupData }: { groupData: GroupData }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-2 dark:border-gray-600">
              <BookOpen className="h-4 w-4" />
              {groupData.subject}
            </Badge>
            <Badge variant="outline" className="flex gap-2 dark:border-gray-600">
              <Users className="h-4 w-4" />
              {groupData.members.length}
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-semibold">
            Study Group
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] sm:h-[400px] pr-4">
          <div className="space-y-4 sm:space-y-6">
            {/* Group Creator */}
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/50 shadow-sm">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                  <AvatarImage
                    src={groupData.creator.avatarUrl}
                    alt={groupData.creator.name}
                  />
                  <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 text-xs sm:text-sm">
                    {getInitials(groupData.creator.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-amber-900 dark:text-amber-100 truncate">
                      {groupData.creator.name}
                    </p>
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-0.5 truncate">
                    {groupData.creator.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Members */}
            {groupData.members
              .filter(member => member.id !== groupData.creator.id)
              .map((member) => (
                <div
                  key={member.id}
                  className="p-3 sm:p-4 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-1 ring-gray-200 dark:ring-gray-700 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {member.email}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className="hidden sm:flex bg-gray-100/50 dark:bg-gray-800/50 flex-shrink-0 ml-2"
                        >
                          Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Member;