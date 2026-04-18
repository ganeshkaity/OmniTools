"use client";

import { useState, useRef } from "react";
import { auth } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {Mail, Lock, Globe, Loader2, Phone, ArrowLeft} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const router = useRouter();

  // Phone Auth State
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const getRecaptchaVerifier = () => {
    // Clear any stale verifier whose DOM element may have been removed
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSignupPrompt(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setShowSignupPrompt(true);
      } else {
        setError(err.message || "Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setShowSignupPrompt(false);
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/signup/details");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const verifier = getRecaptchaVerifier();
      const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      // Clear so next attempt gets a fresh verifier
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError("");
    try {
      await confirmationResult.confirm(otp);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setOtpSent(false);
    setOtp("");
    setConfirmationResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-12 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-1/3 -right-12 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md glass rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            OmniTools
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
            {error}
          </div>
        )}

        {/* "Want to create an account?" inline modal */}
        {showSignupPrompt && (
          <div className="mb-4 p-4 rounded-xl border border-primary/40 bg-primary/10 backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground mb-1">No account found</p>
            <p className="text-xs text-muted-foreground mb-3">
              No account exists for <span className="text-primary font-semibold">{email}</span>. Want to create one?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="flex-1 py-1.5 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Create Account"}
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                disabled={loading}
                className="flex-1 py-1.5 px-3 bg-background border border-border text-sm text-muted-foreground rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div id="recaptcha-container"></div>

        {authMode === "email" ? (
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px bg-border flex-1"></div>
              <span className="text-xs text-muted-foreground uppercase">OR CONTINUE WITH</span>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setAuthMode("phone")}
                disabled={loading}
                className="w-full py-2 px-4 bg-background border border-border text-foreground font-semibold rounded-md hover:bg-muted flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2 px-4 bg-background border border-border text-foreground font-semibold rounded-md hover:bg-muted flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                Google
              </button>
            </div>
          </>
        ) : (
          <>
            {!otpSent ? (
               <form onSubmit={handlePhoneLogin} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-foreground">Phone Number</label>
                   <div className="relative flex items-center">
                     <div className="absolute left-0 pl-3 flex items-center pointer-events-none">
                       <Phone className="h-5 w-5 text-muted-foreground" />
                       <span className="ml-2 text-foreground font-medium">+91</span>
                     </div>
                     <input
                       type="tel"
                       required
                       className="w-full pl-20 pr-4 py-2 bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       placeholder="9876543210"
                       value={phoneNumber}
                       maxLength={10}
                       onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                     />
                   </div>
                 </div>
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                 </button>
               </form>
            ) : (
               <form onSubmit={handleVerifyOtp} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-foreground">Enter OTP Code</label>
                   <p className="text-xs text-muted-foreground mb-2">Code sent to {phoneNumber}</p>
                   <div className="relative">
                     <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                     <input
                       type="text"
                       required
                       maxLength={6}
                       className="w-full pl-10 pr-4 py-2 tracking-widest bg-background/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       placeholder="123456"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                     />
                   </div>
                 </div>
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                 </button>
               </form>
            )}

            <button
               onClick={() => {
                 setAuthMode("email");
                 resetPhoneAuth();
               }}
               disabled={loading}
               className="mt-6 w-full py-2 px-4 bg-transparent text-muted-foreground font-medium rounded-md hover:text-foreground flex items-center justify-center gap-2 transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to Email
            </button>
          </>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
