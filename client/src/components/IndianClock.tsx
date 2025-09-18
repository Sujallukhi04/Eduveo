"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const MinimalistClock = () => {
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState("");

  const quotes = [
    "Time is the best teacher ✨",
    "Every second is a chance to grow 🌱",
    "Make each moment count 💫",
    "Learning never stops 📚",
    "Time + Focus = Success 🎯",
    "Embrace the present moment 🌟",
    "Time flies, memories last 🕊️",
    "Create your own destiny ⭐",
    "Small steps lead to big changes ⏳",
    "Invest time wisely, reap success 💰",
    "The best time to start is now ⏰",
    "Time waits for no one, use it well ⏳",
    "Knowledge grows with time 📖",
    "Stay consistent, time will reward you 🏆",
    "The clock keeps ticking, keep moving 🔄",
    "Dream big, act now 🚀",
    "Moments become milestones 🌈",
    "Time is precious, don’t waste it 🕰️",
    "One second can change everything 💡",
    "Every effort adds up over time 📊",
    "Keep learning, keep growing 🌍",
    "The more you invest in learning, the richer you become 🎓",
    "Every challenge teaches something new ⚡",
    "Make today better than yesterday 🌅",
    "Success is built over time, not overnight 🏗️",
    "A focused mind wins the race 🏁",
    "Growth takes time, but it's worth it 🌳",
    "Learn, apply, and improve 🔄",
    "Use time wisely, regret nothing ⌛",
    "Every second is an opportunity 🎯",
    "Be patient, time rewards effort 🕰️",
    "Your time is your most valuable asset 💎",
    "Stay disciplined, success follows ⏳",
    "The more you practice, the better you become 🏋️‍♂️",
    "Value time like gold 🏆",
    "Keep chasing knowledge 📚",
    "Time used wisely leads to greatness 🌟",
    "The right time is always now 🚀",
    "Don't just pass time, make it count 🎯",
    "Today’s learning is tomorrow’s success 📘",
    "Keep moving, keep improving 🏃‍♂️",
    "The best investment? Your time and effort 💡",
    "Time teaches lessons that books can't 📖",
    "The future belongs to those who prepare now 🔮",
    "Smart work and time management = success 🎯",
    "A moment spent learning is never wasted ⌚",
    "Every sunrise brings new possibilities 🌅",
    "Persistence + Time = Mastery 🔥",
    "Time unlocks doors to success 🚪",
    "Great things take time, stay patient 🌍",
    "Keep going, keep growing 📈",
    "Learn something new every day 🎓",
    "Time shapes your destiny 🔄",
    "Act now, don't wait for the perfect moment ⏳",
    "Build your dreams, one moment at a time 🌠",
    "A productive today creates a successful tomorrow ☀️",
    "The journey of success starts with time well spent 🛤️",
    "Make every second a stepping stone to greatness 🏆",
    "Control your time, control your future 🚀",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    const quoteTimer = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const getIndianTime = () => {
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit" as "2-digit",
      minute: "2-digit" as "2-digit",
      hour12: true,
    };
    const timeString = time.toLocaleTimeString("en-US", options);
    return timeString.split(/[: ]/);
  };

  const getIndianDate = () => {
    const options = {
      timeZone: "Asia/Kolkata",
      weekday: "long" as "long",
      month: "long" as "long",
      day: "numeric" as "numeric",
    };
    return time.toLocaleDateString("en-US", options);
  };

  const [hours, minutes, meridian] = getIndianTime();
  const isNight = Number.parseInt(hours) >= 6 && meridian === "PM";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-xl border bg-card p-6 shadow-lg backdrop-blur-sm transition-all duration-500 dark:bg-card dark:shadow-2xl dark:shadow-primary/20">
        {/* Day/Night Icon */}
        <motion.div
          className="flex justify-end mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-2 rounded-full bg-secondary dark:bg-secondary/20">
            {isNight ? (
              <Moon className="w-6 h-6 text-blue-700" />
            ) : (
              <Sun className="w-6 h-6 text-yellow-600" />
            )}
          </div>
        </motion.div>

        {/* Time Display */}
        <motion.div
          className="flex justify-center items-baseline text-4xl md:text-6xl font-mono tracking-[0.2em] font-bold text-center mb-2 text-primary dark:text-primary"
          animate={{
            textShadow: "0 0 15px hsl(var(--primary) / 0.2)",
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <span>{hours}</span>
          <span className="animate-pulse">:</span>
          <span>{minutes}</span>
          <span className="ml-2 text-lg md:text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">
            {meridian}
          </span>
        </motion.div>

        {/* Date Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-center mb-4 tracking-wide text-muted-foreground dark:text-muted-foreground"
        >
          {getIndianDate()}
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs italic text-center p-3 rounded-xl bg-secondary/50 dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground"
        >
          {quote}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mt-4 h-1 rounded-full overflow-hidden bg-secondary dark:bg-secondary/20"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="h-full rounded-full bg-primary dark:bg-primary"
            style={{
              width: `${(Number.parseInt(minutes) / 60) * 100}%`,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MinimalistClock;
