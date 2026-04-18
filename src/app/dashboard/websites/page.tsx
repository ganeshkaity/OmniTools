"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2, Globe, Search, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface WebsiteDef {
  id: string;
  title: string;
  description: string;
  url: string;
  color: string;
  iconName: string;
}

export default function WebsitesDirectoryPage() {
  const [websites, setWebsites] = useState<WebsiteDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const snap = await getDocs(collection(db, "websites"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebsiteDef));
      // Sort alphabetically by title
      data.sort((a, b) => a.title.localeCompare(b.title));
      setWebsites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWebsites = websites.filter(site => 
    site.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (site.description && site.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" /> Important Websites
        </h1>
        <p className="text-muted-foreground text-lg">Curated links and resources specifically for the team.</p>
      </div>

      {/* Global Search Bar */}
      {websites.length > 0 && (
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 glass bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all shadow-sm text-lg placeholder:text-muted-foreground/70"
          />
        </div>
      )}

      <div>
        {websites.length === 0 ? (
          <div className="text-center p-12 glass rounded-xl border border-border">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No websites have been curated yet.</p>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="text-center p-12 glass rounded-xl border border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No websites found matching your search.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredWebsites.map((site) => (
              <motion.div key={site.id} variants={item}>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block h-full group"
                >
                  <div className="h-full glass p-6 rounded-2xl flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-border hover:border-transparent">
                    {/* Background Glow Effect */}
                    <div
                      className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 filter blur-2xl group-hover:opacity-30 transition-opacity duration-500"
                      style={{ backgroundColor: site.color || '#4f46e5' }}
                    />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border border-border/50" 
                          style={{ backgroundColor: `${site.color || '#4f46e5'}20`, color: site.color || '#4f46e5' }}
                        >
                          <span className="text-2xl font-bold">{site.iconName || 'W'}</span>
                        </div>
                        
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-background/50 border border-border text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors shadow-sm"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{site.title}</h3>
                      
                      <p className="text-sm text-foreground/80 flex-1 leading-relaxed mb-4">
                        {site.description}
                      </p>
                      
                      <div className="mt-auto pt-2 inline-flex items-center text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        <Globe className="w-3 h-3 mr-1" />
                        {new URL(site.url).hostname.replace(/^www\./, '')}
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
