"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Loader2, ArrowRight, Zap, Calculator, Search } from "lucide-react";
import { motion } from "framer-motion";

interface ToolDef {
  id: string;
  title: string;
  iconName: string;
  url: string;
  color: string;
  isInternal: boolean;
}

const quickTools = [
  { title: "PNG to JPG", from: "PNG", to: "JPG", href: "/dashboard/tools/converter?from=png&to=jpg", color: "#f59e0b" },
  { title: "WEBP to PNG", from: "WEBP", to: "PNG", href: "/dashboard/tools/converter?from=webp&to=png", color: "#8b5cf6" },
  { title: "JPG to WEBP", from: "JPG", to: "WEBP", href: "/dashboard/tools/converter?from=jpg&to=webp", color: "#10b981" },
  { title: "PNG to ICO", from: "PNG", to: "ICO", href: "/dashboard/tools/converter?from=png&to=ico", color: "#ec4899" },
  { title: "JPG to ICO", from: "JPG", to: "ICO", href: "/dashboard/tools/converter?from=jpg&to=ico", color: "#06b6d4" },
];

const converterTools = [
  { title: "Unit Converter", href: "/dashboard/tools/unit-converter", color: "#3b82f6" },
  { title: "Currency Converter", href: "/dashboard/tools/currency-converter", color: "#ef4444" },
];

export default function DashboardHome() {
  const [tools, setTools] = useState<ToolDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const snap = await getDocs(collection(db, "tools"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ToolDef));
      setTools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to OmniTools</h1>
        <p className="text-muted-foreground text-lg">Your personalized hub for client-side utilities.</p>
      </div>

      {/* Global Search Bar */}
      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search for tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 glass bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all shadow-sm text-lg placeholder:text-muted-foreground/70"
        />
      </div>

      {!searchQuery.trim() && (
        <>
          <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" /> Images Convert
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quickTools.map((qt) => (
            <Link key={qt.title} href={qt.href}>
              <div className="glass p-4 rounded-xl border border-border hover:bg-muted/30 transition-all flex items-center justify-between group">
                <div>
                  <h3 className="font-medium text-foreground">{qt.title}</h3>
                  <p className="text-xs text-muted-foreground">In-browser conversion</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-background transform group-hover:scale-110 transition-transform shadow-sm border border-border" style={{ color: qt.color }}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Converter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {converterTools.map((ct) => (
            <Link key={ct.title} href={ct.href}>
              <div className="glass p-4 rounded-xl border border-border hover:bg-muted/30 transition-all flex items-center justify-between group">
                <div>
                  <h3 className="font-medium text-foreground">{ct.title}</h3>
                  <p className="text-xs text-muted-foreground">Universal conversions</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-background transform group-hover:scale-110 transition-transform shadow-sm border border-border" style={{ color: ct.color }}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

        </>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery.trim() ? "Search Results" : "All Tools"}
        </h2>
        {tools.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className="text-center p-12 glass rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery.trim() ? "No tools found matching your search." : "No tools available yet. Admins can add tools from the Manage Tools panel."}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {tools.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((tool) => (
              <motion.div key={tool.id} variants={item}>
                {tool.isInternal ? (
                  <Link href={tool.url} className="block h-full">
                    <ToolCard tool={tool} />
                  </Link>
                ) : (
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <ToolCard tool={tool} />
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDef }) {
  return (
    <div className="h-full glass p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div
        className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-current transition-opacity group-hover:opacity-20 duration-500"
        style={{ color: tool.color }}
      />
      <div className="relative z-10 flex flex-col h-full">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-border/50" 
          style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
        >
          <span className="text-2xl font-bold">{tool.iconName[0]}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
        <p className="text-sm text-muted-foreground mt-auto">
          {tool.isInternal ? "Open utility" : "External link"} <ArrowRight className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </p>
      </div>
    </div>
  );
}
