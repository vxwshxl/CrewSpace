import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        fs.writeFileSync(path.join(process.cwd(), '.crewspace-data.json'), JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
    }
}
