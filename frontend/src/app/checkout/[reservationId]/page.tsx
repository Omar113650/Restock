"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useData } from "@/lib/useData";
import { Reservation, createOrder } from "@/lib/api";
import { Loader2, CheckCircle2, ShieldCheck, CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const { data: reservation, loading } = useData<Reservation>(`/reservations/${params.reservationId}`);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const [cardNum, setCardNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const totalAmount = reservation ? (reservation.quantity * (reservation.rescueOffer?.discountPrice || 0)) : 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    
    setIsProcessing(true);
    setError("");

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const order = await createOrder({
        reservationId: reservation.id,
        totalAmount,
        status: "PAID"
      });
      setOrderId(order.id);
      setIsSuccess(true);
    } catch (err: any) {
      setError("Failed to create order. " + (err.message || ""));
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-secondary" size={40} /></div>;
  }

  if (!reservation) {
    return <div className="text-center py-20 text-white">Reservation not found.</div>;
  }

  if (isSuccess) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl mx-auto py-20 text-center">
        <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Payment Successful!</h1>
        <p className="text-slate-400 text-lg mb-8">Your order has been confirmed and is ready for pickup.</p>
        
        <div className="bg-surfaceHighlight border-2 border-dashed border-slate-700 rounded-3xl p-8 mb-8 inline-block">
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Order Number</p>
          <p className="text-4xl font-mono font-black text-white tracking-widest">ORD-{orderId.slice(-6).toUpperCase()}</p>
        </div>
        
        <p className="text-sm text-slate-500 mb-8">Please show this order number to the cashier when you arrive.</p>

        <Link href="/my-orders">
          <button className="bg-surface border border-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            View My Orders
          </button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Payment Form */}
        <div className="bg-surface border border-slate-800 rounded-3xl p-8 shadow-xl order-2 md:order-1">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="text-secondary" /> Payment Details
          </h2>
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Card Number (Mock)</label>
              <input 
                type="text" 
                required 
                value={cardNum} onChange={e => setCardNum(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className="w-full bg-background border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  required 
                  value={exp} onChange={e => setExp(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-background border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-1">CVV</label>
                <input 
                  type="text" 
                  required 
                  value={cvv} onChange={e => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full bg-background border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name on Card</label>
              <input 
                type="text" 
                required 
                placeholder="Ahmed Youssef"
                className="w-full bg-background border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-light hover:to-secondary disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex justify-center items-center gap-2 text-lg"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : `Pay $${totalAmount.toFixed(2)}`}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> This is a mock checkout for demonstration.
            </p>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="order-1 md:order-2">
          <div className="bg-surfaceHighlight/50 border border-slate-800 rounded-3xl p-8 shadow-lg sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="text-secondary-light" /> Order Summary
            </h2>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white font-bold">Rescue Offer #{reservation.rescueOfferId.slice(-6)}</p>
                <p className="text-sm text-slate-400">Qty: {reservation.quantity}</p>
              </div>
              <p className="text-white font-bold">${reservation.rescueOffer?.discountPrice} each</p>
            </div>
            
            <hr className="border-slate-800 my-4" />
            
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-400">Subtotal</p>
              <p className="text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-400">Taxes & Fees</p>
              <p className="text-green-400">Included</p>
            </div>
            
            <hr className="border-slate-800 my-4" />
            
            <div className="flex justify-between items-center text-xl font-black text-white">
              <p>Total</p>
              <p className="text-secondary-light">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
