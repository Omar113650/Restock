"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Package, Edit, Trash2, Loader2, AlertCircle, X } from "lucide-react";
import { Product, fetcher } from "@/lib/api";
import { useData } from "@/lib/useData";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  const { data: products, loading, error, mutate } = useData<Product[]>("/products");

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetcher("/products", {
        method: "POST",
        body: JSON.stringify({ name, unit }),
      });
      setIsModalOpen(false);
      setName("");
      setUnit("");
      mutate(); // Refresh the list
    } catch (err) {
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetcher(`/products/${id}`, { method: "DELETE" });
      mutate();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-text-muted">Manage your core product catalog.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-surfaceHighlight/30 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-surface/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by product name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-primary mb-2" size={32} />
              <p className="text-primary-light font-medium">Loading Products...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10 text-red-400">
              <AlertCircle size={32} className="mb-2" />
              <p className="font-medium">Failed to load data from backend.</p>
              <p className="text-sm text-red-500/80">{error.message}</p>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/80 text-text-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Unit</th>
                <th className="p-4 font-medium">ID (DB)</th>
                <th className="p-4 font-medium">Added On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {!loading && filteredProducts.map((product) => (
                <motion.tr 
                  key={product.id}
                  whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                  className="transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-primary-light shadow-inner">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-white tracking-wide">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{product.unit}</td>
                  <td className="p-4 text-text-muted font-mono text-xs">{product.id}</td>
                  <td className="p-4 text-text-muted text-sm">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-primary-light transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No products found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

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
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Add New Product</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. Organic Milk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Measurement Unit</label>
                  <input 
                    type="text" 
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-background border border-slate-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. Liter, kg, piece"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors font-medium flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save Product"}
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
