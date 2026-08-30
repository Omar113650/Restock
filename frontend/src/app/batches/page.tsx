"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Calendar, AlertCircle, Loader2, AlertTriangle, X, Plus } from "lucide-react";
import { useData } from "@/lib/useData";
import { Batch, Product, fetcher } from "@/lib/api";

export default function BatchesPage() {
  const { data: batches, loading, error, mutate } = useData<Batch[]>("/batches");
  const { data: products } = useData<Product[]>("/products");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetcher("/batches", {
        method: "POST",
        body: JSON.stringify({ 
          productId, 
          quantity: parseInt(quantity, 10),
          expiryDate: new Date(expiryDate).toISOString() 
        }),
      });
      setIsModalOpen(false);
      setProductId("");
      setQuantity("");
      setExpiryDate("");
      mutate();
    } catch (err) {
      alert("Failed to create batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm("Delete this batch?")) return;
    try {
      await fetcher(`/batches/${id}`, { method: "DELETE" });
      mutate();
    } catch (err) {
      alert("Failed to delete batch");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Batches</h1>
          <p className="text-text-muted">Track production batches and expiration timelines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2 rounded-lg hover:scale-105 transition-all flex items-center gap-2 font-bold"
        >
          <Plus size={18} /> Add Batch
        </button>
      </div>

      <motion.div variants={itemVariants} className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative min-h-[300px]">
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-primary-light font-medium">Loading Batches...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10 text-red-400">
            <AlertTriangle size={32} className="mb-2" />
            <p className="font-medium">Failed to load data from backend.</p>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surfaceHighlight/50 text-text-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Batch ID</th>
              <th className="p-4 font-bold">Product</th>
              <th className="p-4 font-bold">Quantity</th>
              <th className="p-4 font-bold">EXP Date</th>
              <th className="p-4 font-bold">Risk Level</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {!loading && batches?.map((batch) => (
              <motion.tr 
                key={batch.id}
                whileHover={{ backgroundColor: "rgba(17, 24, 39, 0.8)" }}
                className="transition-colors group"
              >
                <td className="p-4 text-primary-light font-mono font-medium flex items-center gap-2 text-sm">
                  <Layers size={16} /> {batch.id.slice(-6)}
                </td>
                <td className="p-4 text-white font-medium text-sm font-mono">{batch.product?.name || batch.productId}</td>
                <td className="p-4 text-slate-300">{batch.quantity} units</td>
                <td className="p-4 text-white text-sm flex items-center gap-2">
                  <Calendar size={14} className="text-slate-500" /> {new Date(batch.expiryDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    batch.riskLevel === 'NORMAL' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    batch.riskLevel === 'AT_RISK' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 
                    'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  }`}>
                    {(batch.riskLevel === 'AT_RISK' || batch.riskLevel === 'URGENT') && <AlertCircle size={12} className="inline mr-1" />}
                    {batch.riskLevel}
                  </span>
                </td>
                <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleDeleteBatch(batch.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors text-sm">Delete</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              <h2 className="text-2xl font-bold text-white mb-6">Create New Batch</h2>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Product</label>
                  <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary">
                    <option value="">Select a product...</option>
                    {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Quantity</label>
                  <input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Expiry Date</label>
                  <input type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors font-medium flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save Batch"}
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
