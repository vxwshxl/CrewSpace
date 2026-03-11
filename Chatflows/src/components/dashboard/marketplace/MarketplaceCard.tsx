'use client';

import React from 'react';
import { Star, Download, ShoppingCart, Lock } from 'lucide-react';
import { Workflow } from '@/lib/marketplaceData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MarketplaceCardProps {
  workflow: Workflow;
  onViewDetails: (workflow: Workflow) => void;
  onInstall: (workflow: Workflow) => void;
}

export default function MarketplaceCard({ workflow, onViewDetails, onInstall }: MarketplaceCardProps) {
  return (
    <div 
      className="group relative bg-[#161b22] border border-white/5 rounded-[12px] overflow-hidden hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col h-full cursor-pointer"
      onClick={() => onViewDetails(workflow)}
    >
      {/* Top Section: Icon (left) | (Premium badge OR Rating) (right) */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-xl shadow-inner border border-white/5">
          {workflow.icon}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {workflow.isPremium && (
            <div className="px-2 py-0.5 border border-orange-500/30 bg-orange-500/5 rounded-full text-[10px] font-bold text-orange-400 uppercase tracking-tight">
              Premium
            </div>
          )}
          <div className="flex items-center gap-1 text-zinc-400 font-medium text-xs">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500/80" />
            <span>{workflow.rating}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Title, Description */}
      <div className="px-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {workflow.name}
        </h3>
        <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed">
          {workflow.description}
        </p>

        {/* Tags row: Category + Trending */}
        <div className="flex flex-wrap gap-2 mt-auto pb-4">
          <span className="px-2 py-0.5 bg-white/5 text-zinc-400 text-[10px] font-medium rounded border border-white/5">
            {workflow.category}
          </span>
          {workflow.trending && (
            <span className="px-2 py-0.5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-tight leading-none bg-white/5 rounded flex items-center">
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section: Creator & Action */}
      <div className="px-5 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Creator</span>
          <span className="text-xs text-zinc-400 font-medium truncate max-w-[100px]">{workflow.creator}</span>
        </div>
        
        <Button 
          size="sm" 
          variant={workflow.isPremium ? "outline" : "default"}
          className={cn(
            "rounded-full px-4 font-bold h-8 text-[11px] transition-all",
            workflow.isPremium 
              ? "border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-300" 
              : "border-none"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onInstall(workflow);
          }}
        >
          {workflow.isPremium ? (
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              ₹{workflow.price}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Download className="w-3 h-3" />
              Install
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
