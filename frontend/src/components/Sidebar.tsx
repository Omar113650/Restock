"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Box, Tags, Users, ShoppingCart, Bell, Layers, CalendarCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Box },
  { name: "Inventory Batches", href: "/batches", icon: Layers },
  { name: "Rescue Offers", href: "/rescue-offers", icon: Tags },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reservations", href: "/reservations", icon: CalendarCheck },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <motion.aside 
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-72 h-full bg-surface border-r border-primary-dark/30 flex flex-col shadow-[4px_0_24px_rgba(30,58,138,0.1)] z-50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-dark/20 to-transparent pointer-events-none" />
      
      <div className="p-8 relative z-10">
        <motion.h1 
          whileHover={{ scale: 1.05 }}
          className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-primary to-secondary tracking-tighter"
        >
          Restock
        </motion.h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-2 relative z-10 overflow-y-auto scrollbar-hide pb-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-dark/40 to-primary/10 border border-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className={`relative z-10 ${isActive ? "text-primary-light drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "text-slate-500"}`} />
                <span className="font-semibold relative z-10">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-primary-dark/30 bg-surfaceHighlight/50 backdrop-blur-md relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[100px]">{user?.name || "Admin"}</p>
            <p className="text-xs text-primary-light truncate max-w-[100px]">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </motion.aside>
  );
}
