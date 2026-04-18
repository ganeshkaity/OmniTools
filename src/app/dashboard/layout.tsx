"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { useAuthStore } from "../../store/authStore";
import { auth } from "../../lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, userData, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  if (user && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-8 max-w-md text-center rounded-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Setup Required
          </h2>
          <p className="text-muted-foreground mb-6">
            You need to complete your profile before proceeding.
          </p>
          <button onClick={() => router.replace("/signup/details")} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  if (userData?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-8 max-w-md text-center rounded-xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Waiting for Approval
          </h2>
          <p className="text-muted-foreground mb-4">
            Your account is currently under review by an administrator. Please check back later.
          </p>
          <button onClick={() => auth.signOut()} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-90">
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  
  if (userData?.status === 'banned') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass p-8 max-w-md text-center rounded-xl border border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Account Blocked
          </h2>
          <p className="text-muted-foreground mb-4">
            Your access has been restricted. Contact support for more info.
          </p>
          <button onClick={() => auth.signOut()} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-90">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col md:flex-row">
      {/* 
        Background gradients for aesthetics 
      */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
