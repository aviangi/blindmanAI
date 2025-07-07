"use client";

import type { DetectedObject } from "@/lib/object-detection";
import { motion, AnimatePresence } from "framer-motion";

type ObjectOverlayProps = {
  objects: DetectedObject[];
};

export function ObjectOverlay({ objects }: ObjectOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {objects.map((obj) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute border-2 border-accent shadow-lg"
            style={{
              left: `${obj.box[0] * 100}%`,
              top: `${obj.box[1] * 100}%`,
              width: `${obj.box[2] * 100}%`,
              height: `${obj.box[3] * 100}%`,
            }}
          >
            <span className="absolute -top-7 left-0 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap">
              {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
