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

  useEffect(() => {
    if (!authLoading && !user) {
      // Not logged in at all — go back to signup
      router.replace("/signup");
      return;
    }
    // Only redirect if the user is already APPROVED (has a doc in `users` collection)
    // Pending users (in signup_requests) should still be able to re-submit or wait
    if (userData?.status === "approved") {
      router.replace("/dashboard");
      return;
    }
    // Pre-fill name from Google/any provider displayName
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
      // Check if there's already a pending request
      const requestRef = doc(db, "signup_requests", user.uid);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists() && requestSnap.data()?.status === "pending") {
        // Already submitted — just go to dashboard to show waiting screen
        window.location.href = "/dashboard";
        return;
      }

      // Determine identifier — phone auth users have null email
      const identifier = user.email ?? user.phoneNumber ?? "unknown";

      // Create signup_request document
      await setDoc(requestRef, {
        uid: user.uid,
        name,
        email: user.email ?? null,
        phoneNumber: user.phoneNumber ?? null,
        identifier,       // whichever is available
        dob,
        bio,
        status: "pending",
        createdAt: Date.now(),
        provider: user.providerData?.[0]?.providerId ?? "unknown",
      });

      // Hard reload so AuthProvider re-fetches and shows pending screen
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to submit details");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already pending — show waiting message instead of blank flash
  if (userData?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-8 max-w-md text-center rounded-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Request Already Submitted
          </h2>
          <p className="text-muted-foreground mb-6">
            Your account is under review. An admin will approve your access soon.
          </p>
          <button
            onClick={() => auth.signOut().then(() => router.replace("/login"))}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-90"
          >
            Sign Out
          </button>
        </div>
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
