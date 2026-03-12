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
            .select('id, name, data')
            .eq('user_id', userId);
        
        if (error) throw error;

        // Check if the chatflow contains the File Upload tool
        const processedModels = (userChatflows || []).map(cf => {
            let hasFileUpload = false;
            try {
                if (cf.data && typeof cf.data === 'object' && Array.isArray(cf.data.nodes)) {
                    hasFileUpload = cf.data.nodes.some((n: any) => 
                        n.type === 'tool' && n.data?.agentConfig?.id === 'file-upload'
                    ) || cf.data.nodes.some((n: any) => 
                        n.data?.agentConfig?.name === 'File Upload'
                    );
                }
            } catch (err) {
                // Ignore parse errors
            }
            
            return {
                id: cf.id,
                name: cf.name,
                hasFileUpload
            };
        });

        const response = NextResponse.json({ models: processedModels });
        
        // Add CORS headers for the extension
        response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

    } catch (e) {
        console.error(e);
        return NextResponse.json({ models: [] }, { status: 500 });
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*'); // Or specific origin
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}
