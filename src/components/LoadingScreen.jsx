import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";

/**
 * Premium loading screen with typing animation for "PrivyLens"
 * and tagline in Dancing Script. Professional and authoritative.
 */
export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=name, 2=tagline, 3=done

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => onComplete?.(), 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />

          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Shield className="w-20 h-20 text-accent" strokeWidth={1.5} />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Eye className="w-8 h-8 text-cyan-accent mt-1" strokeWidth={1.5} />
              </motion.div>
            </div>

            {/* Glow ring */}
            <motion.div
              className="absolute inset-[-12px] rounded-full border border-accent/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Typing text: "PrivyLens" */}
          {phase >= 1 && (
            <div className="mb-4">
              <h1
                className="text-4xl md:text-5xl font-bold text-text-primary overflow-hidden whitespace-nowrap border-r-2 border-accent tracking-tight"
                style={{ animation: "typing 2.8s steps(9) both, blink-caret 0.75s step-end infinite" }}
              >
                PrivyLens
              </h1>
            </div>
          )}

          {/* Tagline in Dancing Script */}
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-lg md:text-xl text-text-secondary text-center max-w-md px-4"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Protect your private images from leaks and deepfakes using AI
            </motion.p>
          )}

          {/* Security indicators */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 mt-10 text-text-muted text-xs tracking-widest uppercase"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                End-to-End Encrypted
              </span>
              <span className="w-1 h-1 rounded-full bg-text-dim" />
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Zero Retention
              </span>
            </motion.div>
          )}

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-12 w-48 h-[2px] bg-surface-elevated rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-linear-to-r from-accent to-cyan-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
