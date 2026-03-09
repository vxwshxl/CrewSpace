import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), '.crewspace-data.json');
        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ models: [] });
        }

        const data = fs.readFileSync(dataPath, 'utf-8');
        const state = JSON.parse(data);
        const models = (state.chatflows || []).map((flow: any) => ({
            id: flow.id,
            name: flow.name
        }));
        return NextResponse.json({ models });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ models: [] });
    }
}
