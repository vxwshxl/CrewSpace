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
      className="group relative bg-card border border-border rounded-none overflow-hidden transition-all duration-200 shadow-sm flex flex-col h-full cursor-pointer"
      onClick={() => onViewDetails(workflow)}
    >
      {/* Top Section: Icon (left) | (Premium badge OR Rating) (right) */}
      <div className="p-6 pb-3 flex items-start justify-between">
        <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-xl shadow-inner border border-border">
          {workflow.icon}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {workflow.isPremium && (
            <div className="px-2 py-0.5 border border-primary/30 bg-primary/5 rounded-full text-[10px] font-bold text-primary uppercase tracking-tight">
              Premium
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground font-medium text-xs">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500/80" />
            <span>{workflow.rating}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Title, Description */}
      <div className="px-6 flex-1 flex flex-col pb-4">
        <h3 className="text-xl font-bold text-white mb-1 transition-colors line-clamp-1">
          {workflow.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {workflow.description}
        </p>

        {/* Tags row: Category + Trending */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full border border-border">
            {workflow.category}
          </span>
          {workflow.trending && (
            <span className="px-2 py-0.5 border border-border text-white text-[10px] font-bold uppercase tracking-tight leading-none bg-muted rounded flex items-center">
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section: Creator & Action */}
      <div className="mx-6 py-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Creator</span>
          <span className="text-xs text-white font-medium truncate max-w-[100px]">{workflow.creator}</span>
        </div>
        
        <Button 
          size="sm" 
          variant={workflow.isPremium ? "outline" : "default"}
          className={cn(
            "rounded-full px-4 font-bold h-8 text-[11px] transition-all",
            workflow.isPremium 
              ? "border-border hover:bg-muted text-zinc-300" 
              : "bg-primary text-primary-foreground hover:opacity-90 border-none"
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
