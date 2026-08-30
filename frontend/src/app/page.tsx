"use client";
import { motion } from "framer-motion";
import { Box, TrendingUp, AlertTriangle, ArrowRight, Activity, Zap, ShoppingCart, Truck, Loader2, CheckCircle } from "lucide-react";
import { useData } from "@/lib/useData";
import { Product, Batch, RescueOffer, Order } from "@/lib/api";
import Link from "next/link";

export default function Dashboard() {
  const { data: products, loading: pLoading } = useData<Product[]>("/products");
  const { data: batches, loading: bLoading } = useData<Batch[]>("/batches");
  const { data: offers, loading: oLoading } = useData<RescueOffer[]>("/rescue-offers");
  const { data: orders, loading: orLoading } = useData<Order[]>("/orders");

  const isLoading = pLoading || bLoading || oLoading || orLoading;

  const activeOffers = offers?.filter(o => o.status === 'ACTIVE') || [];
  const urgentBatches = batches?.filter(b => b.riskLevel === 'URGENT') || [];
  const recentOrders = orders ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) : [];
  const atRiskBatches = batches?.filter(b => b.riskLevel !== 'NORMAL') || [];

  const stats = [
    { name: "Total Products", value: products?.length || 0, icon: Box, glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]", bg: "bg-blue-500/10", border: "border-blue-500/30", color: "text-blue-400" },
    { name: "Active Offers", value: activeOffers.length, icon: Zap, glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]", bg: "bg-purple-500/10", border: "border-purple-500/30", color: "text-purple-400" },
    { name: "Expiring Soon", value: urgentBatches.length, icon: AlertTriangle, glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]", bg: "bg-rose-500/10", border: "border-rose-500/30", color: "text-rose-400" },
    { name: "Total Orders", value: orders?.length || 0, icon: ShoppingCart, glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]", bg: "bg-green-500/10", border: "border-green-500/30", color: "text-green-400" },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0, filter: "blur(5px)" }, show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 100 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-dark/30 border border-primary/30 text-primary-light text-sm font-semibold mb-4">
            <Activity size={16} /> Live System Status
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Command Center
          </motion.h1>
          <motion.p variants={itemVariants} className="text-text-muted text-lg">
            Monitor inventory health, rescue offers, and real-time restock metrics.
          </motion.p>
        </div>
        <Link href="/rescue-offers">
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-primary-dark border border-primary-light/50 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
          >
            Create Rescue Offer <ArrowRight size={18} />
          </motion.button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-surfaceHighlight/50 backdrop-blur-xl p-6 rounded-2xl border ${stat.border} ${stat.glow} transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border} border shrink-0`}>
                  <Icon className={stat.color} size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{stat.name}</p>
                  <p className="text-4xl font-black text-white mt-1 tracking-tight">
                    {isLoading ? <Loader2 className="animate-spin text-slate-500 mt-2" size={24} /> : stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surfaceHighlight/40 backdrop-blur-lg p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-light to-secondary" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-primary-light" /> Recent Orders
            </h2>
            <Link href="/orders" className="text-sm font-medium text-primary-light hover:text-white transition-colors">View All</Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {orLoading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="bg-surface/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold font-mono text-sm">ORD-{order.id.slice(-6).toUpperCase()}</h4>
                    <p className="text-sm text-slate-400">${order.totalAmount}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="bg-surfaceHighlight/40 backdrop-blur-lg p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-purple-500" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="text-secondary" /> At-Risk Batches
            </h2>
            <Link href="/batches" className="text-sm font-medium text-secondary hover:text-white transition-colors">View Inventory</Link>
          </div>
          
          <div className="flex-1 space-y-4">
             {bLoading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-secondary" /></div>
             ) : atRiskBatches.length > 0 ? (
               atRiskBatches.slice(0, 5).map((batch) => (
                <div key={batch.id} className="bg-surface/50 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${batch.riskLevel === 'URGENT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'}`} />
                  <div>
                    <h4 className="text-white font-semibold">Batch #{batch.id.slice(-6)} <span className="text-slate-400 font-normal text-sm ml-2">({batch.quantity} units)</span></h4>
                    <p className="text-sm text-text-muted mt-1">Expires: {new Date(batch.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                 <CheckCircle className="mb-2 text-green-500/50" size={32} />
                 <p>All inventory is healthy.</p>
               </div>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
