
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

async function validateSession(authHeader: string | null, supabaseClient: any) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header')
  }

  const token = authHeader.substring(7)
  
  const { data: session } = await supabaseClient
    .from('nextmetal.api_sessions')
    .select('user_id')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) {
    throw new Error('Invalid or expired session')
  }

  return session.user_id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname
    const authHeader = req.headers.get('authorization')

    // Get user profile and stats
    if (path === '/user-data/profile' && req.method === 'GET') {
      const userId = await validateSession(authHeader, supabaseClient)

      // Get user data
      const { data: user } = await supabaseClient
        .from('nextmetal.users')
        .select('*')
        .eq('id', userId)
        .single()

      // Get points balance
      const { data: pointsData } = await supabaseClient
        .from('nextmetal.points_core')
        .select('delta')
        .eq('user_id', userId)

      const totalPoints = pointsData?.reduce((sum: number, p: any) => sum + p.delta, 0) || 0

      // Get quests
      const { data: quests } = await supabaseClient
        .from('nextmetal.user_quests')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Get referral code
      const { data: referralCode } = await supabaseClient
        .from('nextmetal.referral_codes')
        .select('code, uses_left')
        .eq('owner_id', userId)
        .single()

      return new Response(JSON.stringify({
        user,
        points: totalPoints,
        quests,
        referral_code: referralCode?.code,
        referral_uses_left: referralCode?.uses_left
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add points
    if (path === '/user-data/add-points' && req.method === 'POST') {
      const userId = await validateSession(authHeader, supabaseClient)
      const { type, delta, meta } = await req.json()

      await supabaseClient
        .from('nextmetal.points_core')
        .insert({
          user_id: userId,
          type,
          delta,
          meta: meta || {}
        })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create referral code
    if (path === '/user-data/create-referral' && req.method === 'POST') {
      const userId = await validateSession(authHeader, supabaseClient)
      const { code } = await req.json()

      const { error } = await supabaseClient
        .from('nextmetal.referral_codes')
        .insert({
          owner_id: userId,
          code
        })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
