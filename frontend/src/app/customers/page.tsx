"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Calendar, Plus, Loader2, X, AlertTriangle } from "lucide-react";
import { useData } from "@/lib/useData";
import { Customer, fetcher } from "@/lib/api";

export default function CustomersPage() {
  const { data: customers, loading, error, mutate } = useData<Customer[]>("/customers");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetcher("/customers", {
        method: "POST",
        body: JSON.stringify({ name, phone }),
      });
      setIsModalOpen(false);
      setName("");
      setPhone("");
      mutate();
    } catch (err) {
      alert("Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
          <p className="text-text-muted">View and manage your platform users.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="bg-surfaceHighlight/30 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative min-h-[300px]">
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-surfaceHighlight/10"><Loader2 className="animate-spin text-primary" size={32} /></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center flex-col text-red-400"><AlertTriangle size={32} /> Failed to load</div>}
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/80 text-text-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Contact</th>
              <th className="p-4 font-bold">Joined Date</th>
              <th className="p-4 font-bold">Customer ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {!loading && customers?.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <span className="font-bold text-white tracking-wide">{customer.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-300">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /> {customer.phone}</div>
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-sm flex items-center gap-2 mt-2">
                  <Calendar size={14} /> {new Date(customer.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-text-muted font-mono text-xs">{customer.id.slice(-8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-surface border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-2xl font-bold text-white mb-6">Add Customer</h2>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800/50 text-white px-4 py-2 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white px-4 py-2 rounded-xl flex justify-center items-center">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save Customer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
