"use client";

import { motion } from "framer-motion";

export function ModernLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-background">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
        }}
      >
        <div className="h-16 w-16 rounded-full border-4 border-muted border-t-primary shadow-lg" />
        <motion.span
          className="absolute text-sm font-medium text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        ></motion.span>
      </motion.div>
    </div>
  );
}
