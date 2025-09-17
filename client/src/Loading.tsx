import React from 'react';
import { BookOpen, Users, BrainCircuit, Sparkles, GraduationCap, Pencil, Calculator, Globe } from 'lucide-react';

const LoadingScreen = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 20 - 10,
      y: (e.clientY / window.innerHeight) * 20 - 10
    });
  };

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {[BookOpen, Users, BrainCircuit, Sparkles, GraduationCap, Pencil, Calculator, Globe].map((Icon, index) => (
          <div
            key={index}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 4}s infinite`,
              opacity: 0.1,
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          >
            <Icon className="w-12 h-12 text-primary" />
          </div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* Main Logo Animation */}
        <div className="mb-8 relative">
          <div className="flex items-center justify-center gap-4">
            <BookOpen className="w-12 h-12 text-primary animate-bounce" />
            <Users className="w-12 h-12 text-primary animate-pulse" />
            <BrainCircuit className="w-12 h-12 text-primary animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Animated Title */}
        <h1 className="text-4xl font-bold mb-6 text-center relative">
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Study
          </span>
          Together
          <div className="absolute -top-1 -right-4">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
        </h1>

        {/* Interactive Loading Bar */}
        <div className="w-72 h-3 bg-muted rounded-full overflow-hidden mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary animate-[loading_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
        </div>

        {/* Animated Loading Messages */}
        <LoadingMessage />

        {/* Fun Facts Ticker */}
        <div className="mt-8 text-sm text-muted-foreground">
          <FactsTicker />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// Enhanced Loading Messages with Fade Effects
const LoadingMessage = () => {
  const messages = [
    "👥 Building your study dream team...",
    "📚 Unlocking knowledge together...",
    "🧠 Preparing your collaborative workspace...",
    "💡 Generating brilliant ideas...",
    "🎯 Setting up for success...",
    "🌟 Creating your perfect study environment..."
  ];
  
  const [messageIndex, setMessageIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 flex items-center justify-center">
      <p className="text-lg transition-all duration-500 ease-in-out transform">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

// Fun Facts Ticker
const FactsTicker = () => {
  const facts = [
    "💫 Did you know? Group study improves retention by 50%",
    "🎯 Students who study together are 2.5x more likely to succeed",
    "🌟 90% of our users improved their grades",
    "📚 Join thousands of successful students"
  ];
  
  const [factIndex, setFactIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden">
      <div className="transition-all duration-500 ease-in-out">
        {facts[factIndex]}
      </div>
    </div>
  );
};

export default LoadingScreen;