"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Clock, User, CheckCircle2, XCircle, Plus, Loader2, AlertTriangle, X } from "lucide-react";
import { useData } from "@/lib/useData";
import { Reservation, Customer, RescueOffer, fetcher } from "@/lib/api";

export default function ReservationsPage() {
  const { data: reservations, loading, error, mutate } = useData<Reservation[]>("/reservations");
  const { data: customers } = useData<Customer[]>("/customers");
  const { data: offers } = useData<RescueOffer[]>("/rescue-offers");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customerId, setCustomerId] = useState("");
  const [rescueOfferId, setRescueOfferId] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Typically reservations expire in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await fetcher("/reservations", {
        method: "POST",
        body: JSON.stringify({ 
          customerId,
          rescueOfferId,
          quantity: parseInt(quantity, 10),
          expiresAt: expiresAt.toISOString()
        }),
      });
      setIsModalOpen(false);
      setCustomerId("");
      setRescueOfferId("");
      setQuantity("");
      mutate();
    } catch (err) {
      alert("Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async (reservation: Reservation) => {
    if (!confirm("Confirm this reservation and create an Order?")) return;
    try {
      await fetcher("/orders", {
        method: "POST",
        body: JSON.stringify({
          reservationId: reservation.id,
          totalAmount: (reservation.rescueOffer?.discountPrice || 0) * reservation.quantity,
          status: "PAID"
        })
      });
      mutate();
      alert("Order created successfully!");
    } catch (err) {
      alert("Failed to confirm order");
    }
  };

  // Compute "expires in X hours" for RESERVED status
  const expiresIn = (expiresAt: string): string => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `Expires in ${hours}h ${mins}m`;
    return `Expires in ${mins}m`;
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { scale: 0.95, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reservations</h1>
          <p className="text-text-muted">Manage customer claims on rescue offers before pickup.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105">
          <Plus size={18} /> New Reservation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[300px]">
        {loading && <div className="absolute inset-0 flex items-center justify-center col-span-full"><Loader2 className="animate-spin text-primary" size={32} /></div>}
        {error && <div className="absolute inset-0 flex items-center justify-center flex-col text-red-400 col-span-full"><AlertTriangle size={32} /> Failed to load</div>}

        {!loading && reservations?.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted gap-3 col-span-full">
            <CalendarCheck size={48} className="opacity-20" />
            <p className="font-semibold text-lg">No reservations yet</p>
          </div>
        )}

        {!loading && reservations?.map((res) => (
          <motion.div key={res.id} variants={itemVariants} whileHover={{ y: -5 }} className="bg-surfaceHighlight/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            {res.status === 'PAID' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 blur-2xl rounded-full" />}
            {res.status === 'RESERVED' && <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-2xl rounded-full" />}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-primary-light font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded-md">
                RES-{res.id.slice(-5)}
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                res.status === 'PAID' ? 'text-green-400 bg-green-400/10' :
                res.status === 'RESERVED' ? 'text-orange-400 bg-orange-400/10' :
                'text-red-400 bg-red-400/10'
              }`}>
                {res.status === 'PAID' && <CheckCircle2 size={12} />}
                {res.status === 'RESERVED' && <Clock size={12} />}
                {res.status === 'EXPIRED' && <XCircle size={12} />}
                {res.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Offer #{res.rescueOfferId.slice(-6)} (Qty: {res.quantity})</h3>
            
            <div className="space-y-2 mt-6 relative z-10">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User size={16} className="text-slate-500" />
                {res.customer?.name ?? `Customer ...${res.customerId.slice(-6)}`}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarCheck size={16} className="text-slate-500" /> {new Date(res.reservedAt).toLocaleDateString()}
              </div>
              {res.status === 'RESERVED' && (
                <div className="flex items-center gap-2 text-xs text-orange-400/80 font-semibold mt-1">
                  <Clock size={13} className="text-orange-500" />
                  {expiresIn(res.expiresAt)}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex gap-2">
              <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary-light text-sm font-bold py-2 rounded-lg transition-colors">
                View Details
              </button>
              {res.status === 'RESERVED' && (
                <button onClick={() => handleConfirmOrder(res)} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold py-2 rounded-lg transition-colors">
                  Create Order
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-surface border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
              <h2 className="text-2xl font-bold text-white mb-6">Create Reservation</h2>
              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Customer</label>
                  <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:border-primary focus:outline-none">
                    <option value="">Select a customer...</option>
                    {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Rescue Offer</label>
                  <select required value={rescueOfferId} onChange={(e) => setRescueOfferId(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:border-primary focus:outline-none">
                    <option value="">Select an offer...</option>
                    {offers?.filter(o => o.status === "ACTIVE").map(o => <option key={o.id} value={o.id}>Offer #{o.id.slice(-6)} (${o.discountPrice})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Quantity</label>
                  <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:border-primary focus:outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800/50 text-white px-4 py-2 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white px-4 py-2 rounded-xl flex justify-center items-center">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Reserve"}
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
