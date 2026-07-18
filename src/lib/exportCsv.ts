import type { Order } from "./storage";
import type { Product } from "./products";
import { getStockQty, getStockLastUpdated } from "./storage";

export function exportOrdersCSV(orders: Order[]): void {
  const header = ["Order ID", "Customer Email", "Placed At", "Items", "Total", "Status"];
  const rows = orders.map((o) => [
    o.orderId,
    o.userEmail,
    new Date(o.placedAt).toLocaleDateString("en-IN"),
    String(o.items.reduce((s, i) => s + i.quantity, 0)),
    String(o.total),
    o.status,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = url;
  a.download = `dtx-orders-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportInventoryCSV(products: Product[]): void {
  const header = ["ID", "Name", "Category", "Price", "Stock Qty", "Status", "Last Updated"];
  const rows = products.map((p) => {
    const qty = getStockQty(p.id);
    const lastUpdated = getStockLastUpdated(p.id);
    const status = qty === 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock";
    const updatedStr = lastUpdated
      ? new Date(lastUpdated).toLocaleDateString("en-IN")
      : "Never";
    return [p.id, p.name, p.category, String(p.price), String(qty), status, updatedStr];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = url;
  a.download = `dtx-inventory-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
