
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface AuthRequest {
  email: string
  password: string
  nickname?: string
  referralCode?: string
}

interface LoginRequest {
  email: string
  password: string
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

    // Register new user
    if (path === '/auth/register' && req.method === 'POST') {
      const { email, password, nickname, referralCode }: AuthRequest = await req.json()

      // Hash password
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Insert user
      const { data: user, error: userError } = await supabaseClient
        .from('nextmetal.users')
        .insert({
          email,
          password_hash,
          nickname,
          referred_by: referralCode
        })
        .select()
        .single()

      if (userError) {
        return new Response(JSON.stringify({ error: userError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Award referral points if applicable
      if (referralCode) {
        await supabaseClient
          .from('nextmetal.points_core')
          .insert({
            user_id: user.id,
            type: 'referral',
            delta: 100,
            meta: { referral_code: referralCode }
          })
      }

      return new Response(JSON.stringify({ 
        message: 'User registered successfully',
        user_id: user.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Login user
    if (path === '/auth/login' && req.method === 'POST') {
      const { email, password }: LoginRequest = await req.json()

      // Hash password for comparison
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Find user
      const { data: user, error: userError } = await supabaseClient
        .from('nextmetal.users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password_hash)
        .single()

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create API session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await supabaseClient
        .from('nextmetal.api_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        })

      return new Response(JSON.stringify({
        session_token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          is_verified: user.is_verified
        },
        expires_at: expiresAt.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate magic link for native apps
    if (path === '/auth/magic-link' && req.method === 'POST') {
      const { email }: { email: string } = await req.json()

      const { data: user } = await supabaseClient
        .from('nextmetal.users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const linkToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      await supabaseClient
        .from('nextmetal.magic_links')
        .insert({
          user_id: user.id,
          link_token: linkToken,
          expires_at: expiresAt.toISOString()
        })

      const magicLink = `${req.headers.get('origin')}/auth/verify?token=${linkToken}`

      return new Response(JSON.stringify({
        magic_link: magicLink,
        expires_at: expiresAt.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
