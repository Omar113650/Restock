"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function CustomerLogin() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await login({ type: "customer", phone });
      router.push("/shop");
    } catch (err: any) {
      setError(err.message || "Invalid phone number");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary-light" />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-primary to-secondary tracking-tighter mb-2">
            Restock
          </h1>
          <p className="text-text-muted">Customer Portal</p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
            <input 
              type="text" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="+201012345678"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-light hover:to-secondary text-white font-bold py-3 rounded-xl shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Access My Orders"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">Admin? </span>
          <Link href="/login" className="text-secondary-light hover:text-white transition-colors">
            Admin Login →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
