"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2, AlertTriangle, ShieldAlert, X } from "lucide-react";
import { useAlertStore } from "../store/alertStore";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

const intentColors = {
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  success: "text-green-500 bg-green-500/10 border-green-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  danger: "text-red-500 bg-red-500/10 border-red-500/20",
};

const intentIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: ShieldAlert,
};

export function AlertModal() {
  const { isOpen, type, config, resolveAndClose } = useAlertStore();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(config.defaultValue || "");
      if (type === "prompt") {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, type, config]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleConfirm = () => {
    if (type === "prompt") {
      resolveAndClose(inputValue);
    } else if (type === "confirm") {
      resolveAndClose(true);
    } else {
      resolveAndClose(undefined);
    }
  };

  const handleCancel = () => {
    if (type === "prompt") {
      resolveAndClose(null);
    } else if (type === "confirm") {
      resolveAndClose(false);
    } else {
      resolveAndClose(undefined);
    }
  };

  const Icon = intentIcons[config.intent || "info"];
  const colorClass = intentColors[config.intent || "info"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md glass border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex gap-4">
                <div className={clsx("p-3 rounded-full flex-shrink-0 h-fit border", colorClass)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-lg leading-none tracking-tight mb-2">
                    {config.title || (config.intent ? config.intent.charAt(0).toUpperCase() + config.intent.slice(1) : "Notification")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {config.message}
                  </p>

                  {type === "prompt" && (
                    <div className="mt-4">
                      <input
                        ref={inputRef}
                        type={config.inputType || "text"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={config.placeholder || "Enter value..."}
                        className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirm();
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 border-t border-border flex justify-end gap-3">
              {type !== "alert" && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors shadow-sm",
                  config.intent === "danger" ? "bg-red-500 hover:bg-red-600 border-red-600 text-white" : 
                  config.intent === "warning" ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white" :
                  config.intent === "success" ? "bg-green-500 hover:bg-green-600 border-green-600 text-white" :
                  "bg-primary hover:bg-primary/90 border-primary text-primary-foreground"
                )}
              >
                {type === "alert" ? "OK" : type === "confirm" ? "Confirm" : "Submit"}
              </button>
            </div>
            
            {/* Close button top right */}
            <button 
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
