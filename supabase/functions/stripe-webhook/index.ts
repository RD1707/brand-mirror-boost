// Recebe eventos da Stripe. Atualiza pedido para 'paid' e salva últimos 4 dígitos + bandeira.
// IMPORTANTE: configurar 'verify_jwt = false' nesta função (raw body necessário).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// CORREÇÃO: Usando o import npm nativo
import Stripe from "npm:stripe@14.21.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // CORREÇÃO: Usando o Fetch Client para o Deno não reclamar
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret
    );
  } catch (err) {
    return new Response(`Webhook signature error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (!orderId) return new Response("missing order_id", { status: 400 });

    let card_last4: string | null = null;
    let card_brand: string | null = null;

    if (session.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
        { expand: ["payment_method"] }
      );
      const pm = pi.payment_method as Stripe.PaymentMethod | null;
      if (pm?.card) {
        card_last4 = pm.card.last4;
        card_brand = pm.card.brand;
      }
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent: session.payment_intent as string,
        card_last4,
        card_brand,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
