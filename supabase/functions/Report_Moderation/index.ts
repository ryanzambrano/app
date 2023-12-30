import { createClient } from 'https://esm.sh/@supabase/supabase-js';

Deno.serve(async (_req) => {
    try {
        const payload = await _req.json();
        
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

       const { data, error } = await supabase.from('Reports').select('*').eq('reported_user_id', payload.PersonReported).eq('isUserReport', true);
  
       const unique_ids = [...new Set(data.map(item => item.sender_user_id))];
       if(unique_ids.length >= 2)
       {
        const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .delete()
        .eq("user_id", payload.PersonReported);
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .delete()
        .eq("user_id", payload.PersonReported);
      const { error: groupChatsError } = await supabase
        .from("Group_Chat_Messages")
        .delete()
        .eq("Sent_From", payload.PersonReported);

      const { error: groupsError } = await supabase
        .from("Group_Chats")
        .delete()
        .contains("User_Id", [payload.PersonReported])
        .eq("Is_College", false);
      const { data: ugcData, error: ugcError } = await supabase
        .from("UGC")
        .delete()
        .eq("user_id", payload.PersonReported);
        const { data, error } = await supabase.auth.admin.deleteUser(
            payload.PersonReported
          )
       }



        return new Response(JSON.stringify(_req), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});