import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadData {
  type: 'contact' | 'collaborator' | 'lead_magnet_download' | 'company_valuation';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: LeadData = await req.json();

    // Crear cliente para la segunda base de datos
    const secondarySupabase = createClient(
      Deno.env.get('SECONDARY_SUPABASE_URL') ?? '',
      Deno.env.get('SECONDARY_SUPABASE_ANON_KEY') ?? ''
    );

    let leadData: any = {};

    // Transformar datos según el tipo
    if (type === 'contact') {
      leadData = {
        lead_type: 'contact',
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        company_size: data.company_size,
        referral: data.referral,
        status: data.status || 'new',
        source: 'capittal_website',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      };
    } else if (type === 'collaborator') {
      leadData = {
        lead_type: 'collaborator',
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        profession: data.profession,
        experience: data.experience,
        motivation: data.motivation,
        status: data.status || 'pending',
        source: 'capittal_collaborators',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      };
    } else if (type === 'lead_magnet_download') {
      leadData = {
        lead_type: 'lead_magnet_download',
        full_name: data.user_name,
        email: data.user_email,
        phone: data.user_phone,
        company: data.user_company,
        lead_magnet_id: data.lead_magnet_id,
        status: 'new',
        source: 'capittal_lead_magnets',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        referrer: data.referrer,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
      };
    } else if (type === 'company_valuation') {
      leadData = {
        lead_type: 'company_valuation',
        full_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        company: data.company_name,
        cif: data.cif,
        industry: data.industry,
        employee_range: data.employee_range,
        location: data.location,
        revenue: data.revenue,
        ebitda: data.ebitda,
        final_valuation: data.final_valuation,
        ebitda_multiple_used: data.ebitda_multiple_used,
        valuation_range_min: data.valuation_range_min,
        valuation_range_max: data.valuation_range_max,
        years_of_operation: data.years_of_operation,
        net_profit_margin: data.net_profit_margin,
        growth_rate: data.growth_rate,
        ownership_participation: data.ownership_participation,
        competitive_advantage: data.competitive_advantage,
        status: 'new',
        source: 'capittal_valuations',
        created_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      };
    }

    // Insertar en la segunda base de datos
    const { data: insertedData, error } = await secondarySupabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error insertando en segunda DB:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          leadData: leadData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Lead sincronizado exitosamente:', insertedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: insertedData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en sync-leads:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
