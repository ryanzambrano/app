import { createClient } from 'https://esm.sh/@supabase/supabase-js';

Deno.serve(async (_req) => {
  
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Adjust this as per your requirements
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
const values = [0, 1, 3, 6, 12];

const paymentLinks = {
  1: {
    1: "https://buy.stripe.com/5kAaFVdZ3b3u0py28a",
    3: "https://buy.stripe.com/00g7tJ8EJ0oQ3BKdQT",
    6: "https://buy.stripe.com/3cs15l5sxc7ygow6os",
    12: `https://buy.stripe.com/eVa3dtaMR3B2gow3ch`,

    // ... other durations for tier 1
  },
  2: {
    1: "https://stripe-link-tier2-1month",
    3: "https://stripe-link-tier2-3months",
    6: "https://stripe-link-tier2-6months",
    12: "https://stripe-link-tier2-12months",

    // ... other durations for tier 1
  },
  3: {
    1: "https://stripe-link-tier3-1month",
    3: "https://stripe-link-tier3-3months",
    6: "https://stripe-link-tier3-6months",
    12: "https://stripe-link-tier3-12months",

    // ... other durations for tier 1
  },
  4: {
    1: "https://stripe-link-tier4-1month",
    3: "https://stripe-link-tier4-3months",
    6: "https://stripe-link-tier4-6months",
    12: "https://stripe-link-tier4-12months",

    // ... other durations for tier 1
  },
  5: {
    1: "https://stripe-link-tier5-1month",
    3: "https://stripe-link-tier5-3months",
    6: "https://stripe-link-tier5-6months",
    12: "https://stripe-link-tier5-12months",

    // ... other durations for tier 1
  },
  // ... other tiers
};

        

        const payload = await _req.json();

       

        console.log(payload);
        
        const clientReferenceId = crypto.randomUUID();


        const timestamp = new Date().toISOString();

        let paymentLinkUrl = paymentLinks[payload.tier][values[payload.duration]];

        console.log(paymentLinkUrl);

        const filename = `${payload.college}/${timestamp}`;

        const formattedFilename = filename.replace(/ /g, "_");

        console.log(formattedFilename);

        const adUrl = `https://jaupbyhwvfulpvkfxmgm.supabase.co/storage/v1/object/public/advertisements/${formattedFilename}`;

            // Calculate the end date based on the durationValue
        const endDate = new Date();

        endDate.setMonth(endDate.getMonth() + values[payload.duration]);

            // Format the end date in ISO 8601 format
        const formattedEndDate = endDate.toISOString();

            //alert(formattedFilename + " " + formattedEndDate);
            //alert(adImage);
        
              /*const { data: imageData, error: uploadError } = await supabase.storage
                .from("advertisements")
                .upload(formattedFilename, adImage, {
                  contentType: "image/jpeg",
                });*/
      
          const { data, error } = await supabase.from("advertisements").insert({
                person: clientReferenceId,
                tier: payload.tier,
                duration: values[payload.duration],
                url: adUrl,
                end_date: formattedEndDate,
                college: payload.college,
          });
      
          if (error) {
                console.log(error);
          } else {
                // Convert the amount to cents and send it to the backend
          }
           
        


        return new Response(JSON.stringify({payLink: `${paymentLinkUrl}?client_reference_id=${clientReferenceId}`}), {
          headers: corsHeaders,
        });
      } catch (err) {
      return new Response(String(err?.message ?? err), {
        status: 500,
        headers: corsHeaders
        });   
      }
});