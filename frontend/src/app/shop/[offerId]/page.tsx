"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useData } from "@/lib/useData";
import { RescueOffer, Batch, Product, fetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Clock, ShoppingCart, Loader2, Info } from "lucide-react";

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: offers, loading: oLoading } = useData<RescueOffer[]>("/rescue-offers");
  const { data: batches } = useData<Batch[]>("/batches");
  const { data: products } = useData<Product[]>("/products");

  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (oLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-secondary" size={40} /></div>;
  }

  const offer = offers?.find(o => o.id === params.offerId);
  
  if (!offer) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Offer Not Found</h2>
        <p className="text-slate-400 mb-8">This offer may have been removed or sold out.</p>
        <Link href="/shop" className="text-secondary hover:text-secondary-light font-bold">← Back to Shop</Link>
      </div>
    );
  }

  const batch = offer.batch || batches?.find(b => b.id === offer.batchId);
  const product = batch?.product || products?.find(p => p.id === batch?.productId);

  const handleReserve = async () => {
    if (!user?.id) {
      setError("You must be logged in as a customer.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const reservation = await fetcher<any>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          customerId: user.id,
          rescueOfferId: offer.id,
          quantity: quantity,
          expiresAt: expiresAt.toISOString()
        })
      });
      
      router.push(`/checkout/${reservation.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to reserve items. They might be sold out.");
      setIsSubmitting(false);
    }
  };

  const discountPercent = Math.round(((offer.originalPrice - offer.discountPrice) / offer.originalPrice) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-medium">
        <ArrowLeft size={18} /> Back to Shop
      </Link>

      <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        {/* Left Side - Details */}
        <div className="p-8 md:p-12 flex-1 relative z-10">
          <div className="mb-6 flex gap-3 flex-wrap">
            <span className="bg-gradient-to-r from-secondary to-secondary-dark text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-secondary/30">
              {discountPercent}% OFF
            </span>
            {batch && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                batch.riskLevel === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {batch.riskLevel === 'URGENT' ? 'Expires Very Soon' : 'Expires Soon'}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {product?.name || `Batch #${offer.batchId.slice(-6)}`}
          </h1>
          
          <div className="flex items-center gap-2 text-slate-400 mb-8 bg-surfaceHighlight/50 w-fit px-4 py-2 rounded-xl">
            <Clock size={18} className="text-secondary-light" />
            <span className="font-medium">Expires: {batch ? new Date(batch.expiryDate).toLocaleDateString() : 'Unknown'}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Info size={18} className="text-secondary" /> Why is this discounted?
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This item is perfectly safe and high quality, but it's approaching its expiration date. 
              By purchasing it now, you get a great deal and help us reduce food waste!
            </p>
          </div>
        </div>

        {/* Right Side - Action Card */}
        <div className="bg-surfaceHighlight/80 p-8 md:p-12 md:w-80 lg:w-96 flex flex-col border-l border-slate-800 relative">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Price</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl font-black text-white">${offer.discountPrice}</span>
              <span className="text-xl text-slate-500 line-through font-bold">${offer.originalPrice}</span>
            </div>

            <hr className="border-slate-800 my-6" />

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Quantity</label>
                <span className="text-xs font-bold text-secondary-light bg-secondary/10 px-2 py-1 rounded-md">
                  {offer.quantityAvailable} available
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl bg-surface border border-slate-700 flex items-center justify-center text-white text-xl hover:bg-slate-800 transition-colors"
                >-</button>
                <div className="flex-1 text-center text-2xl font-bold text-white">{quantity}</div>
                <button 
                  onClick={() => setQuantity(Math.min(offer.quantityAvailable, quantity + 1))}
                  className="w-12 h-12 rounded-xl bg-surface border border-slate-700 flex items-center justify-center text-white text-xl hover:bg-slate-800 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-lg font-bold text-white">
              <span>Total:</span>
              <span className="text-secondary-light">${(offer.discountPrice * quantity).toFixed(2)}</span>
            </div>

            <button 
              onClick={handleReserve}
              disabled={isSubmitting || offer.quantityAvailable < 1}
              className="w-full bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-light hover:to-secondary disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex justify-center items-center gap-2 text-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><ShoppingCart size={20} /> Reserve Now</>}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              You will have 24 hours to complete payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
