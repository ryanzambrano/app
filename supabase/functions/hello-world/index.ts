import { createClient } from 'https://esm.sh/@supabase/supabase-js';

Deno.serve(async (_req) => {
    try {
        const payload = await _req.json();
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { data, error } = await supabase.from('Group_Chats').select('*').eq('Group_ID', payload.record.Group_ID_Sent_To);

        const UUID: string[] = data[0].User_ID;

        let silenced: string[] | null = data[0].Silenced;

        if (silenced === null) {
            silenced = [];
        }

        const updatedUserdata = UUID.filter((uuid: string) => uuid !== payload.record.Sent_From);

        const { data: datasender, error: sendererror } = await supabase.from('UGC').select('*').eq('user_id', payload.record.Sent_From);

        const { data: userdata, error: usererror } = await supabase.from('UGC').select('*').in('user_id', updatedUserdata);

        const notif_token: string[] = userdata.map(user => user.notification_token).flat();
        const user_id: string[] = userdata.map(user => user.user_id).flat();

        const numberOfNotifications = notif_token.length;

        const acseestoken: string = 'o5ttnVzo8Q56jPHyVpmMtRvxMmhYcN0XZljY5ET1';

        if (error) {
            throw error;
        }

        const responses: any[] = [];
        let title: string;

        // Example: Set different titles based on a condition
        if (numberOfNotifications > 1) {
            if (data[0].Group_Name.length > 0) {
                title = data[0].Group_Name;
            } else {
                title = 'Group';
            }
        } else {
            // Default title if no condition is met
            title = datasender[0].name;
        }

        for (let i = 0; i < numberOfNotifications; i++) {
            if (!silenced.includes(user_id[i])) {
                let res = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${acseestoken}`,
                    },
                    body: JSON.stringify({
                        to: notif_token[i],
                        title: title,
                        body: payload.record.Message_Content,
                        sound: 'default',
                    }),
                }).then((res) => res.json());

                // Push each response to the array
                responses.push(res);
            }
        }

        return new Response(JSON.stringify(responses), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(String(err?.message ?? err), { status: 500 });
    }
});