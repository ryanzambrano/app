import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const RESEND_API_KEY = 're_jNnBargm_JuzHcoW8LqT5Gyybyh86eiue';

const handler = async (_request: Request): Promise<Response> => {
  const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

try {
  const { data: advertisements, error } = await supabase
      .from('advertisements')
      .select('*');

  if (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Error fetching advertisements' }), { status: 500 });
  }
  console.log(advertisements);

  if (advertisements && advertisements.length > 0) {
      for (const advertisement of advertisements) {
          try {
            const impressions = advertisement.impressions;
            const CTR = (advertisement.clicks/impressions)*100;
              const res = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${RESEND_API_KEY}`
                  },
                  body: JSON.stringify({
                      from: 'team@thecabanaapp.com',
                      to: [`${advertisement.ad_email}`],
                      subject: 'Weekly Ad Performance Report',
                      html: `<div style="color: black;">
                      Hello,<br>
                      <br>
                      Here's your weekly performance report for your advertisement on Cabana:<br>
                      <br>
                      Ad Performance Overview:<br>
                      Impressions: ${impressions}<br>
                      Redirects: ${advertisement.clicks}<br>
                      Click-Through Rate (CTR): ${CTR}%<br>
                      <br>
                      Thank you for choosing Cabana for your advertising needs. If you have any questions or need further assistance, please feel free to reach out to our support team.<br>
                      <br>
                      Best regards,<br>
                      Cabana Team
                  </div>`
                  })
              });

              const data = await res.json();
              console.log(`Email sent for advertisement ID ${advertisement.id}:`, data);
          } catch (emailError) {
              console.error(`Error sending email for advertisement ID ${advertisement.id}:`, emailError);
              // Continue with the next advertisement even if there's an issue with the current one
              continue;
          }
      }
  } else {
      console.log('No advertisements found');
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
} catch (handlerError) {
  console.error('Handler error:', handlerError);
  return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
}
};

serve(handler); // Change the port as needed