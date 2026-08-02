import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveOrder, generateOrderId, Order } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is missing in environment variables" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      items,
      subtotal,
      gst,
      total,
      deliveryAddress,
      notes,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256 signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch error during payment verification");
      return NextResponse.json(
        { error: "Invalid payment signature. Transaction tampering detected." },
        { status: 400 }
      );
    }

    // 2. Generate DTX Order ID & Save to Supabase DB as Paid & Confirmed
    const dtxOrderId = await generateOrderId();

    const newOrder: Order & {
      paymentStatus?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    } = {
      orderId: dtxOrderId,
      userEmail: userEmail || "guest@dtx.local",
      placedAt: new Date().toISOString(),
      items,
      subtotal,
      gst,
      total,
      deliveryAddress,
      paymentMethod: "online",
      status: "confirmed",
      statusHistory: [
        {
          status: "confirmed",
          timestamp: new Date().toISOString(),
          note: `Paid online via Razorpay (${razorpay_payment_id})`,
        },
      ],
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes,
    };

    // Save order
    await saveOrder(newOrder as any);

    return NextResponse.json({
      success: true,
      orderId: dtxOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
