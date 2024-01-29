import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { decode as base64Decode } from 'https://deno.land/std@0.166.0/encoding/base64.ts';

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
    1: "https://buy.stripe.com/8wM01h5sxfjK5JSfZ4",
    3: "https://buy.stripe.com/6oEdS74ot9Zqdck7sz",
    6: "https://buy.stripe.com/bIY29pbQVc7ydck9AI",
    12: "https://buy.stripe.com/8wM01haMR3B23BKbIR",

    // ... other durations for tier 1
  },
  3: {
    1: "https://buy.stripe.com/6oEdS7g7b2wYb4c4gq",
    3: "https://buy.stripe.com/bIYeWbaMR0oQ4FO14f",
    6: "https://buy.stripe.com/4gweWb8EJ2wYc8geV6",
    12: "https://buy.stripe.com/4gw8xN4ot8Vmego7sF",

    // ... other durations for tier 1
  },
  4: {
    1: "https://buy.stripe.com/6oE7tJ5sxgnOa08aES",
    3: "https://buy.stripe.com/3csbJZ5sx6Ne3BKaET",
    6: "https://buy.stripe.com/14k5lBg7b6Nea0814k",
    12: "https://buy.stripe.com/9AQeWb08d7Ri1tC6oF",

    // ... other durations for tier 1
  },
  5: {
    1: "https://buy.stripe.com/eVa4hx5sx7Rib4cdR8",
    3: "https://buy.stripe.com/eVa5lB08d9Zq6NW14n",
    6: "https://buy.stripe.com/dR64hxaMR3B2a088wQ",
    12: "https://buy.stripe.com/8wM5lBcUZb3ufks8wR",

    // ... other durations for tier 1
  },
  // ... other tiers
};

        

        const payload = await _req.json();

       

        //console.log(payload);
        
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
            
            
            // In your edge function
            console.log(payload.image.substring(0, 30));
            
            const base64String = payload.image;

// Check and remove any data URI scheme prefix
const base64Data = base64String.split(';base64,').pop();

// Decode the base64 string
const binaryData = base64Decode(base64Data);

// Convert the binary data to a Uint8Array (which is a type of ArrayBuffer)
const arrayBuffer = new Uint8Array(binaryData);


// Convert binary data to a buffer
//const buffer = new Deno.Buffer(binaryData);

            console.log("worked")
        
              const { data: imageData, error: uploadError } = await supabase.storage
                .from("advertisements")
                .upload(formattedFilename, arrayBuffer, {
                  contentType: "image/jpeg",
                });
      
          const { data, error } = await supabase.from("advertisements").insert({
                person: clientReferenceId,
                tier: payload.tier,
                duration: values[payload.duration],
                url: adUrl,
                end_date: formattedEndDate,
                college: payload.college,
                ad_link: payload.ad_link
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