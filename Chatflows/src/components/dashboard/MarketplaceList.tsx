'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function MarketplaceList() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-10rem)]">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-primary opacity-80" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                Marketplace (Coming Soon)
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl px-4">
                Browse agents created by other Captains, deploy shared AI workflows or publish your own powerful agent to the universe!
            </p>
        </div>
    );
}
