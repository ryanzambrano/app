import { createClient } from 'https://esm.sh/@supabase/supabase-js'
Deno.serve(async (_req) => {
  try {
    const payload = await _req.json()
    const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
    const { data, error } = await supabase.from('Group_Chats').select('*').eq('Group_ID', payload.record.Group_ID_Sent_To)
   
  
    const UUID = data[0].User_ID
    
    const updatedUserdata = UUID.filter((uuid: string) => uuid == payload.record.Sent_From)
  
    const {data: userdata, error: usererror } = await supabase.from('UGC').select('notification_token').eq('user_id', updatedUserdata[0])
    console.log(userdata[0].notification_token)
    const notif_token = userdata[0].notification_token
    console.log(notif_token)

    const acseestoken = 'o5ttnVzo8Q56jPHyVpmMtRvxMmhYcN0XZljY5ET1'

    if (error) {
      throw error
    }
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${acseestoken}`,
      },
      body: JSON.stringify({
        to: notif_token,
        sound: 'default',
        body: 'Test',
      }),
    }).then((res) => res.json())

    console.log('Expo API response:', res)
    
    return new Response(JSON.stringify(res), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})