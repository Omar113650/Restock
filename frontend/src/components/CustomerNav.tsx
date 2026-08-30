"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { LogOut, ShoppingBag, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/customer/login");
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-surface/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shadow-md">
      <Link href="/shop" className="flex items-center gap-2">
        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-secondary-light to-secondary tracking-tighter">
          Restock
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/shop" className="text-text-muted hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <ShoppingBag size={18} /> Shop
        </Link>
        <Link href="/my-orders" className="text-text-muted hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <Package size={18} /> My Orders
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-300 hidden sm:block">
          {user?.name || "Customer"}
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
