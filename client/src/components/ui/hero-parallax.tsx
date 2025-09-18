import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export const HeroParallax = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <motion.div style={{ y }} className="relative">
        {children}
      </motion.div>
    </div>
  );
};