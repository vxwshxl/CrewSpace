'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsList() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-10rem)]">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-primary opacity-80" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                Profile Settings (Coming Soon)
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl px-4">
                Change your avatar, manage your account details, access keys, and billing from the centralized Settings module!
            </p>
        </div>
    );
}
