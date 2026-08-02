import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay API keys are missing on the server. Please check .env.local" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();
    const { items } = body as { items: Array<{ productId: string; quantity: number }> };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Calculate authoritative total server-side
    // Fetch products from DB
    const { data: dbProducts } = await supabase.from("products").select("id, price");
    const dbPriceMap = new Map<string, number>();

    if (dbProducts) {
      dbProducts.forEach((p) => dbPriceMap.set(p.id, Number(p.price)));
    }
    // Static fallback
    PRODUCTS.forEach((p) => {
      if (!dbPriceMap.has(p.id)) dbPriceMap.set(p.id, p.price);
    });

    let subtotal = 0;
    for (const item of items) {
      const price = dbPriceMap.get(item.productId) || 0;
      subtotal += price * item.quantity;
    }

    const gst = 0;
    const totalINR = subtotal;

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(totalINR * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `dtx_rcpt_${Date.now()}`,
      notes: {
        store: "The Dog Thingx",
      },
    };

    const rzpOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
