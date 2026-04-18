"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

export default function SignupDetailsPage() {
  const { user, userData, loading: authLoading } = useAuthStore();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // If user is already approved/pending and skips this, let's redirect them
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signup");
    } else if (userData) {
      router.replace("/dashboard");
    }
    
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user, userData, authLoading, router, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError("");
    
    try {
      // Create signup_request
      await setDoc(doc(db, "signup_requests", user.uid), {
        uid: user.uid,
        name,
        email: user.email,
        dob,
        bio,
        status: "pending",
        createdAt: Date.now()
      });
      
      // Update local state by forcing a reload or just redirecting
      // The layour will still see them as not in `users` collection,
      // but we need to fetch their signup_requests status?
      // Wait, the Dashboard layout checks `userData`, which checks the `users` collection. 
      // If we are in `signup_requests`, we should probably check that in AuthProvider too!
      
      // We will handle that by redirecting to dashboard. The AuthProvider should be updated 
      // to check signup_requests if users is absent.
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to submit details");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-12 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>

      <div className="w-full max-w-md glass rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Complete your profile
          </h1>
          <p className="text-muted-foreground mt-2">Almost there! We just need a few more details.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Date of Birth</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground [color-scheme:dark]"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Why do you need access? (Optional)</label>
            <textarea
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none h-24"
              placeholder="I'm a designer looking for quick utilities..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
