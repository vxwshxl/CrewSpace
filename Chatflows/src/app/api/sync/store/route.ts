import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userId = authData.user.id;
        const data = await req.json();

        // 1. Delete existing for user to perform full replace (like old json sync behavior)
        await supabase.from('chatflows').delete().eq('user_id', userId);
        await supabase.from('apiKeys').delete().eq('user_id', userId);

        // 2. Insert new apiKeys
        if (data.apiKeys && data.apiKeys.length > 0) {
            await supabase.from('apiKeys').insert(
                data.apiKeys.map((k: any) => ({
                    id: k.id || crypto.randomUUID(), 
                    user_id: userId,
                    provider: k.provider,
                    name: k.name,
                    key: k.key,
                }))
            );
        }

        // 3. Insert new chatflows
        if (data.chatflows && data.chatflows.length > 0) {
            await supabase.from('chatflows').insert(
                data.chatflows.map((f: any) => ({
                    id: f.id || crypto.randomUUID(), 
                    user_id: userId,
                    name: f.name || 'Untitled Chatflow',
                    data: f, 
                }))
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Store Sync Error:', e);
        return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
    }
}
