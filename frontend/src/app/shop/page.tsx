"use client";
import { motion } from "framer-motion";
import { useData } from "@/lib/useData";
import { RescueOffer, Batch, Product } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Clock, Percent, AlertCircle, ShoppingBag, Loader2 } from "lucide-react";

export default function ShopPage() {
  const { user } = useAuth();
  const { data: offers, loading } = useData<RescueOffer[]>("/rescue-offers");
  
  // We need to fetch batches and products if the API doesn't populate them deeply
  const { data: batches } = useData<Batch[]>("/batches");
  const { data: products } = useData<Product[]>("/products");

  const activeOffers = offers?.filter(o => o.status === 'ACTIVE') || [];

  const getFullOfferData = (offer: RescueOffer) => {
    // If backend already populates, use it. Otherwise link manually.
    const batch = offer.batch || batches?.find(b => b.id === offer.batchId);
    const product = batch?.product || products?.find(p => p.id === batch?.productId);
    return { ...offer, batch, product };
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-secondary">{user?.name?.split(' ')[0] || 'Customer'}</span>!
        </h1>
        <p className="text-text-muted text-lg max-w-2xl">
          Today's rescue offers — save money and prevent food waste by buying perfectly good items near their expiration date at a steep discount.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-secondary mb-4" size={40} />
          <p className="text-secondary-light font-medium">Finding the best deals...</p>
        </div>
      ) : activeOffers.length === 0 ? (
        <div className="text-center py-20 bg-surfaceHighlight/20 rounded-3xl border border-slate-800/50 backdrop-blur-md">
          <ShoppingBag className="mx-auto text-slate-600 mb-6" size={64} />
          <h3 className="text-2xl font-bold text-slate-300">All caught up!</h3>
          <p className="text-slate-500 mt-2 text-lg">There are no active rescue offers at the moment. Check back later.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOffers.map((offer) => {
            const { batch, product } = getFullOfferData(offer);
            const discountPercent = Math.round(((offer.originalPrice - offer.discountPrice) / offer.originalPrice) * 100);
            
            return (
              <motion.div 
                key={offer.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-surfaceHighlight/40 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col group relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-colors" />
                
                <div className="p-6 flex-1 flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-secondary/30">
                      <Percent size={14} /> {discountPercent}% OFF
                    </div>
                    {batch && (
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                        batch.riskLevel === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        batch.riskLevel === 'AT_RISK' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        <Clock size={12} /> {batch.riskLevel === 'URGENT' ? 'Expires Very Soon' : 'Expires Soon'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1 line-clamp-2">
                      {product?.name || `Batch #${offer.batchId.slice(-6)}`}
                    </h3>
                    {batch && (
                      <p className="text-sm text-slate-400 mb-6 flex items-center gap-1">
                        <AlertCircle size={14} /> Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-4xl font-black text-white">${offer.discountPrice}</span>
                      <span className="text-lg text-slate-500 line-through font-bold">${offer.originalPrice}</span>
                    </div>
                    
                    <p className="text-sm text-secondary-light font-medium mb-4">
                      {offer.quantityAvailable} items left
                    </p>

                    <Link href={`/shop/${offer.id}`} className="block">
                      <button className="w-full bg-surface border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
