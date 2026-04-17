// Cria uma Stripe Checkout Session a partir de um pedido (já criado no banco como 'pending').
// Body esperado: { order_id: string }
// Retorna: { url: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Busca pedido + itens
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (orderErr || !order) throw new Error("Pedido não encontrado");

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);
    if (itemsErr) throw itemsErr;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const origin = req.headers.get("origin") ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.buyer_email,
      line_items: (items ?? []).map((it: any) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: it.product_name,
            images: it.product_image ? [it.product_image] : undefined,
          },
          unit_amount: Math.round(Number(it.unit_price) * 100),
        },
        quantity: it.quantity,
      })),
      metadata: { order_id },
      success_url: `${origin}/checkout/success?order_id=${order_id}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${order_id}`,
    });

    // Salva session id no pedido
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
