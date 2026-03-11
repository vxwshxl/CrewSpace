import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        let { data: authData } = await supabase.auth.getUser();
        let userId = authData?.user?.id;

        if (!userId) {
             // Fallback for extension without session: get first user via custom query or just return empty for safety
             const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
             if (firstUser) userId = firstUser.id;
        }

        if (userId) {
            const { data: userChatflows, error } = await supabase
                .from('chatflows')
                .select('id, name')
                .eq('user_id', userId);
            
            if (error) throw error;

            if (userChatflows && userChatflows.length > 0) {
                 return NextResponse.json({ models: userChatflows });
            }
        }
    } catch (e) {
        console.error(e);
    }
    return NextResponse.json({ models: [] });
}
