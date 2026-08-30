"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Clock, Percent, ArrowRight, Plus, Loader2, X, Trash2 } from "lucide-react";
import { useData } from "@/lib/useData";
import { RescueOffer, Batch, fetcher } from "@/lib/api";

export default function RescueOffersPage() {
  const { data: offers, loading, mutate } = useData<RescueOffer[]>("/rescue-offers");
  const { data: batches } = useData<Batch[]>("/batches");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetcher("/rescue-offers", {
        method: "POST",
        body: JSON.stringify({
          batchId,
          originalPrice: parseInt(originalPrice, 10),
          discountPrice: parseInt(discountPrice, 10),
          quantityAvailable: parseInt(quantity, 10),
        }),
      });
      setIsModalOpen(false);
      mutate();
    } catch (err) {
      alert("Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Delete this rescue offer?")) return;
    try {
      await fetcher(`/rescue-offers/${id}`, { method: "DELETE" });
      mutate();
    } catch (err) {
      alert("Failed to delete offer");
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">Rescue Offers</motion.h1>
          <motion.p variants={itemVariants} className="text-text-muted">Manage discounted items nearing expiration to reduce waste.</motion.p>
        </div>
        <motion.button 
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary hover:bg-secondary-dark text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:scale-105"
        >
          <Plus size={18} /> New Offer
        </motion.button>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <div className="col-span-full flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>}
        
        {!loading && offers?.map((offer) => {
          const discountPercent = Math.round(((offer.originalPrice - offer.discountPrice) / offer.originalPrice) * 100);
          return (
            <motion.div 
              key={offer.id}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-surfaceHighlight/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group"
            >
              <div className="p-6 flex-1 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Percent size={14} /> {discountPercent}% OFF
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                    <Clock size={14} /> Expires soon
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">Batch #{offer.batchId.slice(-6)}</h3>
                <p className="text-sm text-slate-400 mb-6">{offer.quantityAvailable} items available</p>
                
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-secondary-light">${offer.discountPrice}</span>
                  <span className="text-sm text-slate-500 line-through mb-1 font-bold">${offer.originalPrice}</span>
                </div>

                <button 
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {!loading && offers?.length === 0 && (
        <div className="text-center py-20 bg-surfaceHighlight/20 rounded-2xl border border-slate-800/50 backdrop-blur-md">
          <Tag className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-300">No active rescue offers</h3>
          <p className="text-slate-500 mt-2">All inventory is fresh and selling at full price.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-surface border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              <h2 className="text-2xl font-bold text-white mb-6">Create Rescue Offer</h2>
              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Select Batch</label>
                  <select required value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-secondary">
                    <option value="">Select a batch...</option>
                    {batches?.map(b => <option key={b.id} value={b.id}>Batch #{b.id.slice(-6)} (Qty: {b.quantity})</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Original Price</label>
                    <input type="number" required value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Discount Price</label>
                    <input type="number" required value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-secondary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Quantity Available</label>
                  <input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-secondary" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-secondary hover:bg-secondary-dark disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors font-medium flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Publish Offer"}
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
