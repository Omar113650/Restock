"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle, Package, Loader2, AlertTriangle, Truck } from "lucide-react";
import { useData } from "@/lib/useData";
import { Order, fetcher } from "@/lib/api";

export default function OrdersPage() {
  const { data: orders, loading, error, mutate } = useData<Order[]>("/orders");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMarkPickedUp = async (id: string) => {
    setProcessingId(id);
    try {
      await fetcher(`/orders/${id}/pickup`, { method: 'PATCH' });
      mutate();
    } catch {
      alert('Failed to update order');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders?.length ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: ShoppingBag },
    { label: 'Paid', value: orders?.filter(o => o.status === 'PAID').length ?? 0, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
    { label: 'Picked Up', value: orders?.filter(o => o.status === 'PICKED_UP').length ?? 0, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Truck },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-text-muted">Track customer purchases and manage pickups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={`p-6 rounded-2xl border ${stat.border} bg-surface shadow-xl flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-white">{loading ? "-" : stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10 text-red-400">
            <AlertTriangle size={32} className="mb-2" />
            <p className="font-medium">Failed to load orders.</p>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surfaceHighlight/50 text-text-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Order ID</th>
              <th className="p-4 font-bold">Amount</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {!loading && orders?.map((order) => (
              <motion.tr key={order.id} whileHover={{ backgroundColor: "rgba(17, 24, 39, 0.8)" }} className="transition-colors group">
                <td className="p-4 text-primary-light font-mono font-medium text-sm">
                  ORD-{order.id.slice(-6).toUpperCase()}
                </td>
                <td className="p-4 text-white font-medium text-sm">
                  ${order.totalAmount}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-slate-300 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {order.status === 'PAID' && (
                    <button 
                      onClick={() => handleMarkPickedUp(order.id)}
                      disabled={processingId === order.id}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                      Mark Picked Up
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
            {!loading && orders?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
