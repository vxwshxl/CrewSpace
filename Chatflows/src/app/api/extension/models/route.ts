import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        let { data: authData } = await supabase.auth.getUser();
        let userId = authData?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userChatflows, error } = await supabase
            .from('chatflows')
            .select('id, name')
            .eq('user_id', userId);
        
        if (error) throw error;

        return NextResponse.json({ models: userChatflows || [] });

    } catch (e) {
        console.error(e);
    }
    return NextResponse.json({ models: [] });
}
