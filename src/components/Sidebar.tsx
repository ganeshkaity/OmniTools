"use client";

import { Home, User, Users, ShieldAlert, Wrench, Settings, X, PlusCircle, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { name: "Home Tools", href: "/dashboard", icon: Home },
  { name: "Websites", href: "/dashboard/websites", icon: Globe },
  { name: "My Account", href: "/dashboard/account", icon: User },
];

const adminItems = [
  { name: "Signup Requests", href: "/dashboard/admin/requests", icon: ShieldAlert },
  { name: "Users", href: "/dashboard/admin/users", icon: Users },
  { name: "Manage Tools", href: "/dashboard/admin/tools", icon: Wrench },
  { name: "Manage Websites", href: "/dashboard/admin/websites", icon: Globe },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { userData } = useAuthStore();
  const isAdmin = userData?.role === 'admin'; 

  const NavContent = () => (
    <div className="flex flex-col h-full bg-background/50 glass border-r border-border backdrop-blur-xl">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="OmniTools Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-xl tracking-tight">
            OmniTools
          </span>
        </Link>
        <button className="md:hidden ml-auto p-2" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto w-full px-4 space-y-8">
        <div>
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</p>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      active 
                        ? "bg-accent/10 text-accent" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", active ? "text-accent" : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <NavContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 max-w-[80vw] z-50 md:hidden shadow-xl"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
