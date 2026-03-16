"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  hoveredIndex: number | null;
  onHoverStart: (index: number) => void;
  onHoverEnd: () => void;
}

export function AnimatedCardGroup({ children }: { children: React.ReactNode }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {Array.isArray(children)
        ? children.map((child, i) => {
            if (!child) return null;
            return (
              <AnimatedCard
                key={i}
                index={i}
                hoveredIndex={hoveredIndex}
                onHoverStart={setHoveredIndex}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                {child}
              </AnimatedCard>
            );
          })
        : children}
    </div>
  );
}

function AnimatedCard({
  children,
  index,
  hoveredIndex,
  onHoverStart,
  onHoverEnd,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    onHoverEnd();
  };

  return (
    <motion.div
      ref={ref}
      className="relative block h-full w-full cursor-pointer"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHoverStart(index)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      {/* Animated glow background */}
      <AnimatePresence>
        {hoveredIndex === index && (
          <motion.span
            className="absolute -inset-1 rounded-2xl opacity-50"
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 70%)",
            }}
            layoutId="cardGlow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
          />
        )}
      </AnimatePresence>

      {/* Card with 3D tilt */}
      <motion.div
        className="relative z-10 h-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-px rounded-xl"
          style={{
            background: hoveredIndex === index
              ? "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(255,255,255,0.3))"
              : "transparent",
          }}
          animate={{
            backgroundPosition: hoveredIndex === index ? ["0% 0%", "100% 100%", "0% 0%"] : "0% 0%",
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-6 h-full transition-colors duration-200"
          style={{
            borderColor: hoveredIndex === index ? "rgba(255,255,255,0.25)" : undefined,
            boxShadow: hoveredIndex === index
              ? "0 0 30px rgba(255,255,255,0.08), 0 10px 40px rgba(0,0,0,0.3)"
              : "var(--shadow-md)",
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
