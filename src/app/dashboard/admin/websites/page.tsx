"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Loader2, Plus, Trash2, Edit, Globe } from "lucide-react";
import { useAlertStore } from "../../../../store/alertStore";

interface WebsiteDef {
  id: string;
  title: string;
  description: string;
  url: string;
  color: string;
  iconName: string;
}

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<WebsiteDef[]>([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm } = useAlertStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newColor, setNewColor] = useState("#22c55e");
  const [newIconName, setNewIconName] = useState("G");

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const snap = await getDocs(collection(db, "websites"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WebsiteDef));
      setWebsites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingSiteId(null);
    setNewTitle("");
    setNewDescription("");
    setNewUrl(""); 
    setNewColor("#22c55e");
    setNewIconName("G");
  };

  const handleEditClick = (site: WebsiteDef) => {
    setEditingSiteId(site.id);
    setNewTitle(site.title);
    setNewDescription(site.description || "");
    setNewUrl(site.url);
    setNewColor(site.color);
    setNewIconName(site.iconName);
    setIsAdding(true);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const siteId = editingSiteId || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const docRef = doc(db, "websites", siteId);
      const siteData = {
        id: siteId,
        title: newTitle,
        description: newDescription,
        url: newUrl,
        iconName: newIconName,
        color: newColor
      };
      await setDoc(docRef, siteData);
      
      if (editingSiteId) {
        setWebsites(websites.map(s => s.id === editingSiteId ? siteData : s));
      } else {
        setWebsites([...websites, siteData]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save website", err);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({ message: "Delete this website?", intent: "danger" });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "websites", id));
      setWebsites(websites.filter(s => s.id !== id));
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Websites</h1>
          <p className="text-muted-foreground">Add or remove external websites from the directory.</p>
        </div>
        <button
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Website</>}
        </button>
      </div>

      {isAdding && (
        <div className="glass p-6 rounded-xl border border-border animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-xl font-semibold mb-4">{editingSiteId ? "Edit Website" : "Add New Website"}</h2>
          <form onSubmit={handleSaveSite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Website Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. GitHub"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://github.com"
                />
              </div>
              
              {/* Description spans both columns */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Short Description</label>
                <textarea
                  required
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground resize-none h-20"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="The world's largest software development platform."
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Brand Color (Hex)</label>
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
                <label className="text-sm font-medium">Icon Character</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  className="w-full px-3 py-2 bg-background/50 border border-border rounded-md text-foreground uppercase"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value.substring(0,2).toUpperCase())}
                  placeholder="GH"
                />
              </div>
            </div>

            <button type="submit" className="mt-4 px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-md">
              Save Website
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((site) => (
          <div key={site.id} className="glass p-6 rounded-xl flex flex-col relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-current transition-opacity group-hover:opacity-20"
              style={{ color: site.color }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-border/50 shadow-sm" style={{ backgroundColor: `${site.color}33`, color: site.color }}>
                <div className="font-bold text-xl">{site.iconName}</div>
              </div>
              <h3 className="text-lg font-bold">{site.title}</h3>
              <p className="text-sm text-foreground/80 mt-1 mb-3 line-clamp-2 min-h-[2.5rem]">{site.description}</p>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground truncate my-2 hover:text-primary transition-colors hover:underline flex items-center gap-1">
                <Globe className="w-3 h-3" /> {new URL(site.url).hostname.replace('www.', '')}
              </a>
              
              <div className="flex items-center justify-end mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(site)}
                    className="p-2 text-accent hover:bg-accent/10 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {websites.length === 0 && !isAdding && (
          <div className="col-span-full text-center p-12 glass rounded-xl border border-border">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No websites configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
