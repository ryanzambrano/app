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

    const requiredFields = ['tier', 'duration', 'college', 'image', 'ad_link', 'ad_header', 'ad_content'];
    const values = [0, 1, 3, 6, 12];

const paymentLinks = {
  1: {
    1: "https://buy.stripe.com/aEUg0fg7befG6NW5kH",
    3: "https://buy.stripe.com/fZe8xN8EJ2wY4FO6oM",
    6: "https://buy.stripe.com/dR67tJ9IN5Jab4c8wV",
    12: "https://buy.stripe.com/4gwaFV4ot8Vm5JS28y",

    // ... other durations for tier 1
  },
  2: {
    1: "https://buy.stripe.com/00gcO34ot7Ri6NW00r",
    3: "https://buy.stripe.com/fZe3dt2gl3B2dck28A",
    6: "https://buy.stripe.com/8wMbJZ1ch7Ri6NW28B",
    12: "https://buy.stripe.com/6oE3dtf379Zq0py4gK",

    // ... other durations for tier 1
  },
  3: {
    1: "https://buy.stripe.com/5kA29pf373B27S0fZt",
    3: "https://buy.stripe.com/28o8xN9INfjK8W4dRm",
    6: "https://buy.stripe.com/9AQaFV5sx3B24FOfZv",
    12: "https://buy.stripe.com/5kA6pF4otefG8W46oW",

    // ... other durations for tier 1
  },
};

        

        const payload = await _req.json();

        for (const field of requiredFields) {
          console.log(payload[field]);
          console.log("loop entered");
          if (!payload[field]) {
            console.log("loop hit");
            return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
              status: 400,
              headers: corsHeaders
            });
          }
        }
        
        console.log("after loop");

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

            //console.log("worked")
        
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
                ad_link: payload.ad_link,
                ad_header: payload.ad_header,
                ad_content: payload.ad_content,
                ad_email: payload.ad_email,
          });
      
          if (error) {
                console.error(error);
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