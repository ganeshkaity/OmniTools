"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

interface ToolDef {
  id: string;
  title: string;
  iconName: string; // Storing as string representing the lucid-icon or custom svg route
  url: string;
  color: string;
  isInternal: boolean;
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolDef[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newColor, setNewColor] = useState("#4f46e5");
  const [newIconName, setNewIconName] = useState("Link");
  const [isInternal, setIsInternal] = useState(false);

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

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newId = newTitle.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, "tools", newId);
      const newTool = {
        id: newId,
        title: newTitle,
        url: newUrl,
        iconName: newIconName,
        color: newColor,
        isInternal
      };
      await setDoc(docRef, newTool);
      setTools([...tools, newTool]);
      setIsAdding(false);
      setNewTitle(""); setNewUrl(""); setIsInternal(false);
    } catch (err) {
      console.error("Failed to add tool", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tool?")) return;
    try {
      await deleteDoc(doc(db, "tools", id));
      setTools(tools.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Tools</h1>
          <p className="text-muted-foreground">Add or remove utilities from the dashboard.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Tool</>}
        </button>
      </div>

      {isAdding && (
        <div className="glass p-6 rounded-xl border border-border">
          <h2 className="text-xl font-semibold mb-4">Add New Tool</h2>
          <form onSubmit={handleAddTool} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tool Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Image Converter"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">URL Route / External Link</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="/dashboard/tools/converter or https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Color Accent (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 border-0 rounded cursor-pointer"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground uppercase"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Icon Name (Lucide)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  placeholder="Link, Image, Headphones"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isInternal"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="isInternal" className="text-sm font-medium">This is an internal app route</label>
            </div>

            <button type="submit" className="mt-4 px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-md">
              Save Tool
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className="glass p-6 rounded-xl flex flex-col relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-current transition-opacity group-hover:opacity-20"
              style={{ color: tool.color }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${tool.color}33`, color: tool.color }}>
                {/* Fallback to simple icon UI, since dynamic lucide loading requires more work */}
                <div className="font-bold text-xl">{tool.iconName[0]}</div>
              </div>
              <h3 className="text-lg font-bold">{tool.title}</h3>
              <p className="text-sm text-muted-foreground truncate my-2">{tool.url}</p>
              
              <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
                <span className={`text-xs px-2 py-1 rounded-full border ${tool.isInternal ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {tool.isInternal ? "Internal" : "External"}
                </span>
                
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {tools.length === 0 && !isAdding && (
          <div className="col-span-full text-center p-12 glass rounded-xl border border-border">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No tools configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure proper import since Wrench isn't imported from lucide-react above
import { Wrench } from "lucide-react";
