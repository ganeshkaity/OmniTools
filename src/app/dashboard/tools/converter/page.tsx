"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Download, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";

const IMAGE_FORMATS = ["PNG", "JPG", "WEBP"];

export default function ConverterPage() {
  const searchParams = useSearchParams();
  const initFrom = searchParams.get("from")?.toUpperCase() || "PNG";
  const initTo = searchParams.get("to")?.toUpperCase() || "JPG";

  const [fromFormat, setFromFormat] = useState(IMAGE_FORMATS.includes(initFrom) ? initFrom : "PNG");
  const [toFormat, setToFormat] = useState(IMAGE_FORMATS.includes(initTo) ? initTo : "JPG");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setDownloadUrl(null);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const executeConversion = async () => {
    if (!selectedFile || !previewUrl) return;
    setConverting(true);
    setDownloadUrl(null);

    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // Draw white background mainly for PNG to JPG which loses transparency
      if (toFormat === "JPG") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      const mimeType = toFormat === "JPG" ? "image/jpeg" : toFormat === "WEBP" ? "image/webp" : "image/png";
      const quality = toFormat === "PNG" ? undefined : 0.9; // Webp and JPG quality

      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      setDownloadUrl(dataUrl);
      
      // Compute new filename
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || "converted";
      setDownloadName(`${baseName}.${toFormat.toLowerCase()}`);

    } catch (err) {
      console.error("Conversion failed:", err);
      alert("Failed to convert image.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universal Image Converter</h1>
        <p className="text-muted-foreground mt-2">Convert between PNG, JPG, and WEBP entirely in your browser.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-border">
        {/* Format Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center mb-10">
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</label>
            <select 
              className="bg-background/80 border border-border rounded-lg px-4 py-2 text-foreground font-medium focus:ring-2 focus:ring-primary outline-none min-w-[120px]"
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value)}
            >
              {IMAGE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <ArrowRight className="text-muted-foreground w-6 h-6 hidden sm:block mt-6" />

          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
            <select 
              className="bg-background/80 border border-border rounded-lg px-4 py-2 text-foreground font-medium focus:ring-2 focus:ring-accent outline-none min-w-[120px]"
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value)}
            >
              {IMAGE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer mb-8 overflow-hidden group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={`image/${fromFormat.toLowerCase()}`}
            onChange={handleFileChange}
          />
          
          {previewUrl ? (
            <div className="absolute inset-0 z-0">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-20 blur-sm scale-110" />
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col items-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Selected" className="max-w-[200px] max-h-[200px] rounded-lg shadow-lg mb-4" />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            <h3 className="text-lg font-semibold">{selectedFile ? selectedFile.name : "Click to select file"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedFile ? `Ready to convert to ${toFormat}` : `Upload ${fromFormat} image`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {selectedFile && !downloadUrl && (
          <div className="flex justify-center">
            <button
              onClick={executeConversion}
              disabled={converting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
            >
              {converting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {converting ? "Processing..." : `Convert to ${toFormat}`}
            </button>
          </div>
        )}

        {/* Download Result */}
        {downloadUrl && (
          <div className="flex justify-center mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <a 
              href={downloadUrl} 
              download={downloadName}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              <Download className="w-5 h-5" />
              Download Converted Image
            </a>
          </div>
        )}

        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
