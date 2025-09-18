import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface AIChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AIChatButton = ({ onClick, isOpen }: AIChatButtonProps) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-24 right-4 sm:right-6 z-50"
    >
      <Button
        size="lg"
        className={`rounded-full p-3 sm:p-4 shadow-lg ${
          isOpen ? "bg-primary/90" : "bg-primary"
        } hover:bg-primary/90`}
        onClick={onClick}
      >
        <Bot className="h-5 w-5 sm:h-12 sm:w-12" />
      </Button>
    </motion.div>
  );
}; 