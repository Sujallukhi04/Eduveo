import DeveloperSection from "@/components/DeveloperSection";
import { FeatureCard } from "@/components/feature-card";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/providers/auth";
import { Button } from "@/components/ui/button";
import { HeroParallax } from "@/components/ui/hero-parallax";
import LoadingScreen from "@/Loading";
import {
  BookOpen,
  BrainCircuit,
  Calendar,
  FileText,
  MessageSquare,
  PenTool,
  Rocket,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function Home() {
  // const quotes = [
  //   { text: "Alone we can do so little; together we can do so much.", author: "- Helen Keller" },
  //   { text: "The strength of the team is each individual member. The strength of each member is the team.", author: "- Phil Jackson" },
  //   { text: "Study with purpose, work with passion, and learn together for success.", author: "- Unknown" },
  //   { text: "Great things in business are never done by one person. They're done by a team of people.", author: "- Steve Jobs" },
  //   { text: "If everyone is moving forward together, then success takes care of itself.", author: "- Henry Ford" },
  //   { text: "Success is best when it's shared.", author: "- Howard Schultz" },
  //   { text: "Two heads are better than one, especially when it comes to studying.", author: "- Unknown" },
  //   { text: "Collaboration is the key to success in group studies and beyond.", author: "- Unknown" },
  // ];

  // const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated,login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/groups");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroParallax>
          <section className="relative px-4 py-20 md:py-32">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
              <div className="container mx-auto text-center">
                <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Study Together,{" "}
                  <span className="text-primary">Achieve Together</span>
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Join a community of learners. Form study groups, share notes,
                  and collaborate in real-time with our comprehensive learning
                  platform.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row justify-center">
                  <Button size="lg" className="text-lg" onClick={login}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </HeroParallax>

        {/* Features Section */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Everything You Need to Excel
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  title="Study Groups"
                  description="Create or join study groups based on your courses, interests, or goals."
                  icon={<Users className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Note Sharing"
                  description="Share and access course notes, summaries, and study materials."
                  icon={<BookOpen className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Real-time Chat"
                  description="Communicate with your study group members instantly through integrated chat."
                  icon={<MessageSquare className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Session Scheduling"
                  description="Plan study sessions and get automatic reminders for upcoming meetings."
                  icon={<Calendar className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Virtual Whiteboard"
                  description="Brainstorm ideas and explain concepts using our collaborative whiteboard."
                  icon={<PenTool className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Document Sharing"
                  description="Share and collaborate on documents in real-time with version control."
                  icon={<FileText className="h-6 w-6" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-16">
          <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                How It Works
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Create Your Group
                  </h3>
                  <p className="text-muted-foreground">
                    Start a study group or join existing ones that match your
                    interests
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <BrainCircuit className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
                  <p className="text-muted-foreground">
                    Share notes, use the whiteboard, and chat with group members
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Rocket className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Excel Together</h3>
                  <p className="text-muted-foreground">
                    Achieve your academic goals through collaborative learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <DeveloperSection />
      </div>
    </>
  );
}

export default Home;

// import React from 'react';
// import Navbar from "@/components/Navbar";
// import { Button } from "@/components/ui/button";
// import { HeroParallax } from "@/components/ui/hero-parallax";
// import { FeatureCard } from "@/components/feature-card";
// import {
//   Users,
//   BookOpen,
//   MessageSquare,
//   Calendar,
//   PenTool,
//   FileText,
//   BrainCircuit,
//   Rocket,
//   GraduationCap,
//   Target,
//   Sparkles
// } from "lucide-react";

// function Home() {
//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-background">
//         {/* Hero Section with Updated Design */}
//         <HeroParallax>
//           <section className="relative px-4 py-16 md:py-24">
//             <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 pointer-events-none" />
//             <div className="mx-auto max-w-screen-xl p-4">
//               <div className="text-center">
//                 <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5">
//                   <span className="flex items-center gap-2 text-sm font-medium text-primary">
//                     <Sparkles className="h-4 w-4" />
//                     Welcome to Your Learning Journey
//                   </span>
//                 </div>
//                 <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
//                   Learn Smarter, Not Harder{" "}
//                   <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Together</span>
//                 </h1>
//                 <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
//                   Join thousands of students who are transforming their study experience through collaborative learning, smart note-sharing, and interactive study sessions.
//                 </p>
//                 <div className="flex flex-col gap-4 sm:flex-row justify-center">
//                   <Button size="lg" className="text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
//                     Start Learning Now
//                   </Button>
//                   <Button size="lg" variant="outline" className="text-lg border-primary hover:bg-primary/10">
//                     Join Study Groups
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </HeroParallax>

//         {/* Quick Stats Section */}
//         <section className="py-12 bg-muted/30">
//           <div className="container mx-auto px-4">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-primary mb-2">10k+</div>
//                 <div className="text-muted-foreground">Active Students</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-primary mb-2">500+</div>
//                 <div className="text-muted-foreground">Study Groups</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-primary mb-2">50+</div>
//                 <div className="text-muted-foreground">Subjects</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-primary mb-2">95%</div>
//                 <div className="text-muted-foreground">Success Rate</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section with Animation */}
//         <section className="px-4 py-16">
//           <div className="container mx-auto">
//             <div className="text-center mb-12">
//               <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 mb-4">
//                 <span className="text-sm font-medium text-primary">Features</span>
//               </div>
//               <h2 className="text-3xl font-bold mb-4">Tools for Success</h2>
//               <p className="text-muted-foreground max-w-2xl mx-auto">
//                 Everything you need to excel in your studies and collaborate effectively with peers.
//               </p>
//             </div>
//             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//               <FeatureCard
//                 title="Interactive Study Groups"
//                 description="Join topic-specific study groups, collaborate with peers, and learn together in real-time."
//                 icon={<Users className="h-6 w-6" />}
//               />
//               <FeatureCard
//                 title="Smart Notes"
//                 description="Create, share, and organize notes with AI-powered suggestions and formatting."
//                 icon={<BookOpen className="h-6 w-6" />}
//               />
//               <FeatureCard
//                 title="Live Discussions"
//                 description="Engage in real-time discussions, ask questions, and get instant help from peers."
//                 icon={<MessageSquare className="h-6 w-6" />}
//               />
//               <FeatureCard
//                 title="Study Planner"
//                 description="Plan your study sessions, set goals, and track your progress with smart reminders."
//                 icon={<Target className="h-6 w-6" />}
//               />
//               <FeatureCard
//                 title="Interactive Tools"
//                 description="Use virtual whiteboards, flashcards, and practice quizzes for better learning."
//                 icon={<PenTool className="h-6 w-6" />}
//               />
//               <FeatureCard
//                 title="Resource Library"
//                 description="Access a vast library of study materials, guides, and practice problems."
//                 icon={<GraduationCap className="h-6 w-6" />}
//               />
//             </div>
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="px-4 py-16 bg-gradient-to-r from-primary to-purple-600">
//           <div className="container mx-auto text-center text-white">
//             <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning?</h2>
//             <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
//               Join thousands of students who are already experiencing the power of collaborative learning.
//             </p>
//             <Button
//               size="lg"
//               variant="secondary"
//               className="text-lg bg-white text-primary hover:bg-white/90"
//             >
//               Get Started Free
//             </Button>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }

// export default Home;
