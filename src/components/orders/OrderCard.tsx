"use client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/storage";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { useCart } from "@/context/CartContext";

interface OrderCardProps {
  order: Order;
  isLast?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast("Copied order ID!", { duration: 1500 }));
}

export function OrderCard({ order, isLast }: OrderCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleReorder = () => {
    order.items.forEach((item) => {
      addToCart({ id: item.productId, name: item.name, category: item.category as any, petType: "all", price: item.price, rating: 0, reviewCount: 0, inStock: true, description: "", image: item.image });
    });
    toast.success("Items added to cart! 🛒", { duration: 2000 });
  };

  const previewImages = order.items.slice(0, 3);
  const extraCount = order.items.length - 3;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-card border border-card-border rounded-2xl p-5 space-y-4 ${!isLast ? "mb-4" : ""}`}
      data-testid={`card-order-${order.orderId}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-muted-foreground block">Order</span>
          <button onClick={() => copyToClipboard(order.orderId)} title="Click to copy" className="font-semibold text-sm hover:text-[#F5A623] transition-colors">
            {order.orderId}
          </button>
        </div>
        <StatusBadge status={order.status} type="order" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {previewImages.map((item, i) => (
            <div key={item.productId} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-muted" style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: previewImages.length - i }}>
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=64&q=60"; }} />
            </div>
          ))}
          {extraCount > 0 && <span className="ml-1 text-xs text-muted-foreground font-medium">+{extraCount} more</span>}
        </div>
        <div>
          <p className="font-semibold text-sm">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
          <p className="text-[#F5A623] font-bold text-base">₹{order.total.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Placed: {formatDate(order.placedAt)}</span>
        {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
          <span>Est. delivery: {formatDate(order.estimatedDelivery)}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/orders/${order.orderId}`)} data-testid={`button-view-order-${order.orderId}`} className="text-sm text-[#29ABE2] hover:underline">
          View Details →
        </button>
        {order.status === "delivered" && (
          <button onClick={handleReorder} data-testid={`button-reorder-${order.orderId}`} className="border border-[#F5A623] text-[#F5A623] rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#F5A623] hover:text-[#111111] transition-all active:scale-95">
            Reorder
          </button>
        )}
      </div>
    </motion.div>
  );
}
