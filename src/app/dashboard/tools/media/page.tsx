"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Loader2, Video, PlayCircle, Camera, Headphones, Music } from "lucide-react";

function MediaTool() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "youtube";
  const format = searchParams.get("format") || "mp4";

  const [url, setUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const isYoutube = provider === "youtube";
  const isMp4 = format === "mp4";

  const AccentColor = isYoutube ? "text-red-500" : "text-fuchsia-500";
  const AccentBg = isYoutube ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20";
  
  const Icon = isYoutube ? PlayCircle : Camera;
  const FormatIcon = isMp4 ? Video : Music;

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validate generic shape of URL
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      // Initiate download via browser window redirect so the browser handles the streaming file securely
      // Using query parameters for the API Route
      const apiEndpoint = `/api/media?provider=${provider}&format=${format}&url=${encodeURIComponent(url)}`;
      window.location.href = apiEndpoint;
      
      // We automatically reset downloading state after a short delay since we transition via page fetch.
      setTimeout(() => {
        setDownloading(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to initialize download.");
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${AccentBg}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            {isYoutube ? "YouTube" : "Instagram"} Downloader
            <span className="text-sm px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 font-medium">
              Beta
            </span>
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Extract and download <FormatIcon className="w-4 h-4 ml-1" /> {format.toUpperCase()} high-quality files natively.
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleDownload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              {isYoutube ? "YouTube Video URL" : "Instagram Post/Reel URL"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`w-5 h-5 ${AccentColor} opacity-70`} />
              </div>
              <input
                type="url"
                required
                className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all shadow-sm text-lg placeholder:text-muted-foreground/50"
                placeholder={`https://www.${isYoutube ? "youtube.com/watch?v=..." : "instagram.com/p/..."}`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={downloading}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={downloading || !url.trim()}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Gathering Media Stream...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" /> Download {format.toUpperCase()}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            How it works
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We securely pass your URL to our backend utilizing <code className="bg-background px-1 py-0.5 rounded">yt-dlp</code>. 
            The system negotiates with the provider to find the highest possible quality for your requested format ({format.toUpperCase()}), and pipes the stream directly to your local machine. Download times may vary based on video length and server load.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <MediaTool />
    </Suspense>
  );
}
