"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, CalendarCheck, Package, Loader2 } from "lucide-react";
import { useData } from "@/lib/useData";
import { Notification, fetcher } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { data: notifications, loading, mutate } = useData<Notification[]>("/notifications");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    setProcessingId(id);
    try {
      await fetcher(`/notifications/${id}/read`, { method: 'PATCH' });
      mutate();
    } catch {
      alert('Failed to mark as read');
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BATCH_URGENT': return <AlertTriangle className="text-red-500" size={20} />;
      case 'PAYMENT_SUCCESS': return <CheckCircle className="text-green-500" size={20} />;
      case 'RESERVATION_CONFIRMED': return <CalendarCheck className="text-blue-500" size={20} />;
      case 'READY_FOR_PICKUP': return <Package className="text-purple-500" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-sm px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-text-muted">Stay updated with your inventory and orders.</p>
        </div>
      </div>

      <div className="bg-surface border border-slate-800 rounded-xl overflow-hidden shadow-xl relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surfaceHighlight/10 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {!loading && notifications?.map((note) => (
            <motion.div 
              key={note.id}
              whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
              className={`p-5 flex gap-4 transition-colors relative ${!note.isRead ? 'bg-slate-800/20' : ''}`}
            >
              {!note.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
              <div className="mt-1 flex-shrink-0">
                {getIcon(note.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base ${!note.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {note.message}
                </p>
                <p className="text-xs text-slate-500 mt-1">{timeAgo(note.createdAt)}</p>
              </div>
              {!note.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(note.id)}
                  disabled={processingId === note.id}
                  className="text-xs font-bold text-primary-light hover:text-white transition-colors h-fit px-3 py-1 bg-primary/10 rounded-lg whitespace-nowrap"
                >
                  {processingId === note.id ? <Loader2 size={12} className="animate-spin" /> : "Mark read"}
                </button>
              )}
            </motion.div>
          ))}
          {!loading && notifications?.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Bell className="mx-auto mb-2 opacity-50" size={32} />
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
