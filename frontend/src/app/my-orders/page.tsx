"use client";
import { motion } from "framer-motion";
import { useData } from "@/lib/useData";
import { Reservation } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";

export default function MyOrdersPage() {
  const { user } = useAuth();
  
  // To keep it simple, we fetch all reservations and filter. 
  // In a real app, backend would have GET /reservations?customerId=...
  const { data: allReservations, loading } = useData<Reservation[]>("/reservations");
  
  const myReservations = allReservations?.filter(r => r.customerId === user?.id).sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()) || [];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">My Orders</h1>
        <p className="text-text-muted">Track your reservations and purchase history.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-secondary" size={40} /></div>
      ) : myReservations.length === 0 ? (
        <div className="text-center py-20 bg-surfaceHighlight/20 rounded-3xl border border-slate-800/50">
          <Package className="mx-auto text-slate-600 mb-6" size={64} />
          <h3 className="text-2xl font-bold text-slate-300">No orders yet</h3>
          <p className="text-slate-500 mt-2 mb-6 text-lg">You haven't made any reservations or purchases.</p>
          <Link href="/shop">
            <button className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-xl transition-colors">
              Browse Offers
            </button>
          </Link>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
          {myReservations.map(res => {
            const total = (res.quantity * (res.rescueOffer?.discountPrice || 0)).toFixed(2);
            
            return (
              <motion.div key={res.id} variants={itemVariants} className={`bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden ${res.status === 'EXPIRED' ? 'opacity-60' : ''}`}>
                {res.status === 'PAID' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500" />}
                {res.status === 'RESERVED' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500" />}
                {res.status === 'EXPIRED' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-600" />}

                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-400 font-mono text-sm">RES-{res.id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1 ${
                      res.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      res.status === 'RESERVED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-slate-700/50 text-slate-400 border-slate-700'
                    }`}>
                      {res.status === 'PAID' && <CheckCircle size={12} />}
                      {res.status === 'RESERVED' && <Clock size={12} />}
                      {res.status === 'EXPIRED' && <XCircle size={12} />}
                      {res.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">
                    Rescue Offer #{res.rescueOfferId.slice(-6)}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {res.quantity} items • Reserved on {new Date(res.reservedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="text-sm text-slate-500 mb-1">Total</p>
                  <p className="text-2xl font-black text-white mb-4 md:mb-0">${total}</p>
                </div>

                <div className="w-full md:w-auto">
                  {res.status === 'RESERVED' && (
                    <Link href={`/checkout/${res.id}`} className="block">
                      <button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2">
                        Complete Payment <ArrowRight size={16} />
                      </button>
                    </Link>
                  )}
                  {res.status === 'PAID' && (
                    <div className="bg-green-500/10 text-green-400 px-6 py-2 rounded-xl text-center font-bold text-sm border border-green-500/20">
                      Ready for Pickup
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
