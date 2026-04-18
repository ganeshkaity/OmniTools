"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, userData } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const displayName = userData?.name || user?.displayName || 'User';
  const email = userData?.email || user?.email || '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between w-full">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <div className="md:hidden font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-xl">
            OmniTools
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full flex gap-2 items-center justify-center bg-primary text-primary-foreground font-bold hover:opacity-90 overflow-hidden ring-2 ring-transparent hover:ring-accent"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(displayName)
              )}
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-background border border-border z-50 glass">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                  <a href="/dashboard/account" className="block px-4 py-2 text-sm hover:bg-muted">My Account</a>
                  {userData?.role === 'admin' && (
                    <a href="/dashboard/admin/users" className="block px-4 py-2 text-sm hover:bg-muted font-medium text-accent">Admin Panel</a>
                  )}
                  <button onClick={() => { setDropdownOpen(false); auth.signOut(); }} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">Sign Out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
