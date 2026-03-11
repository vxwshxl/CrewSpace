'use client';

import React from 'react';
import { X, Star, Download, ShoppingCart, Lock, CheckCircle2, User, Activity } from 'lucide-react';
import { Workflow } from '@/lib/marketplaceData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MarketplaceDetailProps {
  workflow: Workflow | null;
  onClose: () => void;
  onInstall: (workflow: Workflow) => void;
}

export default function MarketplaceDetail({ workflow, onClose, onInstall }: MarketplaceDetailProps) {
  if (!workflow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - darker and more solid for focus */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Modal Container - Minimal & Sharp */}
      <div className="relative w-full max-w-4xl bg-[#0b0f14] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-black/40 rounded-lg text-zinc-500 hover:text-white transition-colors border border-white/10 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info Column (Left) */}
        <div className="w-full md:w-[320px] bg-white/2 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-white/5 mb-6">
            {workflow.icon}
          </div>
          
          <h2 className="text-xl font-bold text-center text-white mb-1 tracking-tight">
            {workflow.name}
          </h2>
          <p className="text-zinc-500 text-xs font-medium mb-6">{workflow.category}</p>
          
          <div className="flex items-center gap-6 mb-8 w-full px-4">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
                {workflow.rating} <Star className="w-3 h-3 text-amber-500 fill-current" />
              </div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">Rating</div>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-white">{workflow.installs > 1000 ? (workflow.installs/1000).toFixed(1) + 'k' : workflow.installs}</div>
              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">Installs</div>
            </div>
          </div>

          <Button 
            className={cn(
              "w-full h-12 rounded-full font-bold transition-all text-sm",
              workflow.isPremium 
                ? "bg-primary text-primary-foreground hover:bg-[#A6E63F] active:scale-95" 
                : "bg-primary text-primary-foreground hover:bg-[#A6E63F] active:scale-95"
            )}
            onClick={() => onInstall(workflow)}
          >
            {workflow.isPremium ? (
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Buy for ₹{workflow.price}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install Now
              </span>
            )}
          </Button>
          
          <div className="mt-10 flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 border-t border-white/5 pt-4">
              <span className="uppercase tracking-widest font-bold">Creator</span>
              <span className="text-zinc-400 font-medium">{workflow.creator}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-600 border-t border-white/5 pt-4">
              <span className="uppercase tracking-widest font-bold">Release</span>
              <span className="text-zinc-400 font-medium">v1.2.4</span>
            </div>
          </div>
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar relative">
           {/* Close Button Desktop */}
           <button 
            onClick={onClose}
            className="hidden md:flex absolute top-6 right-6 p-1.5 text-zinc-600 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-2xl">
            <section className="mb-10">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Overview</h4>
              <p className="text-zinc-400 leading-relaxed text-base">
                {workflow.longDescription || workflow.description}
              </p>
            </section>

            <section className="mb-10">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Workflow Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workflow.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/2 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/80 shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {workflow.exampleOutput && (
              <section className="mb-10">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Sample Output</h4>
                <div className="bg-black/40 border border-white/5 p-5 rounded-lg font-mono text-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="outline" className="text-[9px] border-white/10 text-zinc-600 uppercase bg-black">Response</Badge>
                  </div>
                  <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed">
                    {workflow.exampleOutput}
                  </div>
                </div>
              </section>
            )}

            <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-[10px] text-zinc-600 uppercase tracking-tight font-bold">
               <Activity className="w-3.5 h-3.5 text-primary" />
               Compatible with Gemini 1.5 Pro & Pro (Vision)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
