"use client";

import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useAlertStore } from "../../../store/alertStore";
import { auth, db } from "../../../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  sendPasswordResetEmail, 
  deleteUser, 
  verifyBeforeUpdateEmail, 
  linkWithPopup, 
  GoogleAuthProvider, 
  updatePassword 
} from "firebase/auth";
import { Loader2, Save, ShieldAlert, Key, Mail, Lock, PlusCircle } from "lucide-react";

export default function AccountPage() {
  const { user, userData } = useAuthStore();
  const { showAlert, showConfirm, showPrompt } = useAlertStore();
  const [name, setName] = useState(userData?.name || "");
  const [dob, setDob] = useState(userData?.dob || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [authActionLoading, setAuthActionLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        dob
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      await showAlert({ message: "Failed to update profile.", intent: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userData) return;
    try {
      setAuthActionLoading(true);
      await sendPasswordResetEmail(auth, userData.email);
      await showAlert({ message: "Password reset email has been sent to " + userData.email, intent: "success" });
    } catch (e: any) {
      await showAlert({ message: "Error sending password reset email: " + e.message, intent: "danger" });
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!auth.currentUser) return;
    const newEmail = await showPrompt({ message: "Enter your new email address:", intent: "info" });
    if (!newEmail) return;

    try {
      setAuthActionLoading(true);
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      await showAlert({ message: `Verification email sent to ${newEmail}. Please click the link to confirm your email change.`, intent: "success" });
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        await showAlert({ message: "Security requirement: Please sign out and sign back in to perform this action.", intent: "warning" });
      } else {
        await showAlert({ message: "Error changing email: " + e.message, intent: "danger" });
      }
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!auth.currentUser) return;
    try {
      setAuthActionLoading(true);
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      await showAlert({ message: "Google Account successfully linked!", intent: "success" });
      window.location.reload();
    } catch (e: any) {
      await showAlert({ message: "Error linking Google account: " + e.message, intent: "danger" });
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleAddPassword = async () => {
    if (!auth.currentUser) return;
    const newPassword = await showPrompt({ message: "Enter a strong password to add to your account:", intent: "info", inputType: "password" });
    if (!newPassword || newPassword.length < 6) {
      if (newPassword) await showAlert({ message: "Password must be at least 6 characters.", intent: "warning" });
      return;
    }
    
    try {
      setAuthActionLoading(true);
      await updatePassword(auth.currentUser, newPassword);
      await showAlert({ message: "Password successfully added! You can now sign in using your email and password.", intent: "success" });
      window.location.reload();
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        await showAlert({ message: "Security requirement: Please sign out and sign back in to perform this action.", intent: "warning" });
      } else {
        await showAlert({ message: "Error adding password: " + e.message, intent: "danger" });
      }
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    const confirmDelete = await showConfirm({ message: "Are you ABSOLUTELY sure? This will delete all your data and cannot be undone.", intent: "danger" });
    if (!confirmDelete) return;

    try {
      setAuthActionLoading(true);
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
      // User will be automatically signed out and redirected by auth listener
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        await showAlert({ message: "Security requirement: Please sign out and sign back in to perform this action.", intent: "warning" });
      } else {
        await showAlert({ message: "Error deleting account: " + e.message, intent: "danger" });
      }
      setAuthActionLoading(false); // only reset if failed
    }
  };

  if (!userData || !auth.currentUser) return null;

  // Check providers
  const providerData = auth.currentUser.providerData;
  const hasGoogle = providerData.some(p => p.providerId === 'google.com');
  const hasPassword = providerData.some(p => p.providerId === 'password');

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your personalized settings.</p>
      </div>

      {/* Profile Details */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-border">
        <h2 className="text-xl font-semibold mb-6">Profile Details</h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-md text-muted-foreground cursor-not-allowed"
                value={userData.email}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow [color-scheme:dark]"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-border pt-6 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            {success && <span className="text-sm text-green-500 font-medium">Profile updated successfully!</span>}
          </div>
        </form>
      </div>

      {/* Security & Authentication */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-border">
        <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
          <Key className="w-5 h-5 text-accent" />
          <h2>Security & Login</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background/40 rounded-xl border border-border">
            <div>
              <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> Change Email</p>
              <p className="text-sm text-muted-foreground">Send a verification link to update your email</p>
            </div>
            <button 
              onClick={handleChangeEmail}
              disabled={authActionLoading}
              className="mt-3 md:mt-0 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-medium disabled:opacity-50"
            >
              Change Email
            </button>
          </div>

          {!hasGoogle && (
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background/40 rounded-xl border border-border">
              <div>
                <p className="font-medium flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Link Google Account</p>
                <p className="text-sm text-muted-foreground">Allow signing in with your Google account</p>
              </div>
              <button 
                onClick={handleLinkGoogle}
                disabled={authActionLoading}
                className="mt-3 md:mt-0 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-medium disabled:opacity-50"
              >
                Link Google
              </button>
            </div>
          )}

          {!hasPassword && (
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background/40 rounded-xl border border-border">
              <div>
                <p className="font-medium flex items-center gap-2"><Lock className="w-4 h-4" /> Set Password</p>
                <p className="text-sm text-muted-foreground">Add a password so you can login with Email/Password</p>
              </div>
              <button 
                onClick={handleAddPassword}
                disabled={authActionLoading}
                className="mt-3 md:mt-0 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-medium disabled:opacity-50"
              >
                Set Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 md:p-8 rounded-2xl border-2 border-red-500/50 bg-red-500/10 dark:bg-red-500/5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-red-500 font-semibold text-xl">
          <ShieldAlert className="w-6 h-6" />
          <h2>Danger Zone</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-500/20 pb-4">
            <div>
              <p className="font-medium text-foreground">Reset Password</p>
              <p className="text-sm text-muted-foreground">Send a password reset email to your current email address</p>
            </div>
            <button 
              onClick={handleResetPassword}
              disabled={authActionLoading || !hasPassword}
              className="mt-2 md:mt-0 px-4 py-2 border border-foreground/20 rounded-md hover:bg-foreground/5 font-medium disabled:opacity-50"
            >
              Reset Password
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between pt-2">
            <div>
              <p className="font-medium text-red-500">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              disabled={authActionLoading}
              className="mt-2 md:mt-0 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
