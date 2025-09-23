import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../components/Nav_bar";
import { useAuth } from "@/components/providers/auth";
import { CreateGroupDialog } from "../components/group/Create-group-dialog";
import { JoinGroupDialog } from "../components/group/join-group-dialog";
import { Group, JoinRequest } from "../type";
import { fetchGroups, getjoinRequest } from "../lib/group-api";
import { GroupSection } from "@/components/group/Group-section";
import { UserGroupSection } from "@/components/group/Users-group-section";
import { Card, CardContent } from "@/components/ui/card";
import BeautifulIndianClock from "@/components/IndianClock";

const MotionCard = motion(Card);

export default function GroupsPage() {
  const { user } = useAuth();
  const [createdGroups, setCreatedGroups] = useState<Group[]>([]);
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<JoinRequest[]>([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'created', 'joined'

  useEffect(() => {
    const loadGroups = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const { createdGroups, memberGroups } = await fetchGroups();
        const requests = await getjoinRequest();
        setCreatedGroups(createdGroups || []);
        setMemberGroups(memberGroups || []);
        setRequest(requests);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, [user]);

  const filteredCreatedGroups = createdGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMemberGroups = memberGroups.filter(
    (group) =>
      (group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
      user?.id !== group.creatorId
  );

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4"
      >
        <MotionCard
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-96 text-center p-8 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <BookOpen className="mx-auto h-16 w-16 text-primary mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to Eduveo
          </h2>
          <p className="text-muted-foreground text-lg">
            Your Gateway to Collaborative Learning
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Please sign in to access your study groups
          </p>
        </MotionCard>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background/95">
      <Navbar />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-8 mt-16 space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={item} className="text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent"
          >
            Welcome to Eduveo Hub
          </motion.h1>
          <p className="text-xl text-muted-foreground">
            Collaborate, Learn, and Grow Together
          </p>

          <motion.div
            variants={item}
            className="flex items-center justify-center gap-2 text-2xl font-medium text-primary"
          >
            <Sparkles className="h-6 w-6" />
            <span>Welcome back, {user?.name || "Scholar"}!</span>
            <Sparkles className="h-6 w-6" />
          </motion.div>
        </motion.div>
        <div className="max-w-md mx-auto">
          <BeautifulIndianClock />
        </div>
        {/* Stats Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <StatsCard
            icon={<Users className="h-6 w-6 text-primary" />}
            label="Created Groups"
            value={createdGroups.length}
            bgColor="bg-primary/5"
            borderColor="border-primary/20"
          />
          <StatsCard
            icon={<BookOpen className="h-6 w-6 text-purple-500" />}
            label="Joined Groups"
            value={memberGroups.length}
            bgColor="bg-purple-500/5"
            borderColor="border-purple-500/20"
          />
          <StatsCard
            icon={<ArrowRight className="h-6 w-6 text-pink-500" />}
            label="Pending Requests"
            value={request.length}
            bgColor="bg-pink-500/5"
            borderColor="border-pink-500/20"
          />
        </motion.div>

        {/* Actions and Search Bar */}
        <motion.div
          variants={item}
          className="max-w-screen-xl mx-auto space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <CreateGroupDialog
                onCreateGroup={(newGroup) =>
                  setCreatedGroups((prevGroups) => [...prevGroups, newGroup])
                }
              />
              <JoinGroupDialog />
            </div>
            {/* <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground bg-transparent" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-background/50 backdrop-blur-sm"
              />
            </div> */}
            <div className="relative w-full md:w-64">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="text-muted-foreground h-5 w-5 mr-2" />
              </div>
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-background/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 border-b">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              All Groups
            </TabButton>
            <TabButton
              active={activeTab === "created"}
              onClick={() => setActiveTab("created")}
            >
              Created Groups
            </TabButton>
            <TabButton
              active={activeTab === "joined"}
              onClick={() => setActiveTab("joined")}
            >
              Joined Groups
            </TabButton>
          </div>
        </motion.div>

        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
          {/* Groups Display */}
          <motion.div variants={item} className="space-y-8 w-full">
            {(activeTab === "all" || activeTab === "created") && (
              <UserGroupSection
                title="Your Created Groups"
                groups={filteredCreatedGroups}
                isLoading={isLoading}
                error={error}
                request={request}
                setRequest={setRequest}
              />
            )}
            {(activeTab === "all" || activeTab === "joined") && (
              <GroupSection
                title="Groups You're a Member Of"
                groups={filteredMemberGroups}
                isLoading={isLoading}
                error={error}
                isOwner={false}
              />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const StatsCard = ({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  borderColor: string;
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card className={`${bgColor} ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const TabButton = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="ghost"
    className={`relative px-4 py-2 ${
      active
        ? "text-primary font-medium"
        : "text-muted-foreground hover:text-primary"
    }`}
    onClick={onClick}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
      />
    )}
  </Button>
);
