import { createClient } from 'https://esm.sh/@supabase/supabase-js';

Deno.serve(async (_req) => {
    try {
        const payload = await _req.json();
        
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

       const { data, error } = await supabase.from('Reports').select('*').eq('reported_user_id', payload.PersonReported).eq('isUserReport', true);
       console.log(data);
       const unique_ids = [...new Set(data.map(item => item.sender_user_id))];
       if(unique_ids.length >= 2)
       {
        console.log("User Deleted");
       }

       console.log('Unique sender_user_id values:', unique_ids.length);
        //if the length of that array is 2 or higher
        //log


        return new Response(JSON.stringify(_req), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});