"use client";

import { useState, useRef } from "react";
import { auth } from "../../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendEmailVerification
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {Mail, Lock, Globe, Loader2, Phone, ArrowLeft} from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  // Phone Auth State
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const getRecaptchaVerifier = () => {
    // Always clear stale verifier so the DOM element is never reused after a re-render
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError("");
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        router.replace("/signup/details");
      } else {
        setError("Email not verified yet. Please check your inbox and spam folder.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check verification status");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
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
      router.replace("/signup/details");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/signup/details");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
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
          <p className="text-muted-foreground mt-2">Create a new account</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>

        {verificationSent ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Verify your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a verification email to <span className="text-foreground font-medium">{email}</span>.<br/>
              Please check your inbox (and spam folder) and click the verification link.
            </p>
            <button
              onClick={handleCheckVerification}
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "I have verified my email"}
            </button>
            <button
              onClick={() => setVerificationSent(false)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Sign Up
            </button>
          </div>
        ) : authMode === "email" ? (
          <>
            <form onSubmit={handleEmailSignup} className="space-y-4">
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
                    minLength={6}
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
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
                onClick={handleGoogleSignup}
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
               <form onSubmit={handlePhoneSignup} className="space-y-4">
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
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign Up"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
