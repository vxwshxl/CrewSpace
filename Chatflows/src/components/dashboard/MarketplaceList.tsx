'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, CheckCircle2, Package, Globe, Plus } from 'lucide-react';
import { WORKFLOWS, CATEGORIES, Workflow } from '@/lib/marketplaceData';
import MarketplaceCard from './marketplace/MarketplaceCard';
import MarketplaceDetail from './marketplace/MarketplaceDetail';
import PaymentModal from './marketplace/PaymentModal';
import InstallModal from './marketplace/InstallModal';
import PublishModal, { PublishDetails } from './marketplace/PublishModal';
import WorkflowSelector from './marketplace/WorkflowSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MarketplaceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>(WORKFLOWS);
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowToBuy, setWorkflowToBuy] = useState<Workflow | null>(null);
  const [workflowToInstall, setWorkflowToInstall] = useState<Workflow | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Publishing State
  const [showSelector, setShowSelector] = useState(false);
  const [selectedLocalWorkflow, setSelectedLocalWorkflow] = useState<any | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // useEffect(() => {
  //   fetchMarketplaceWorkflows();
  // }, []);

  const fetchMarketplaceWorkflows = async () => {
    // try {
    //   const { data, error } = await supabase
    //     .from('marketplace_workflows')
    //     .select('*')
    //     .order('created_at', { ascending: false });

    //   if (error) throw error;

    //   if (data) {
    //     // Map database records to Workflow interface
    //     const dynamicWorkflows: Workflow[] = data.map((item: any) => ({
    //       id: item.id,
    //       name: item.name,
    //       description: item.description,
    //       category: item.category,
    //       icon: item.icon || '🤖',
    //       rating: 4.8, 
    //       reviews: 0, // Fixed: Added missing property
    //       installs: 0,
    //       creator: item.creator_name,
    //       isPremium: item.is_premium,
    //       price: item.price,
    //       features: ["Community Submitted", "Verified Logic"],
    //       templateData: item.template_data,
    //       trending: false,
    //       new: true
    //     }));

    //     setAllWorkflows([...WORKFLOWS, ...dynamicWorkflows]);
    //   }
    // } catch (err) {
    //   console.error("Error fetching dynamic workflows:", err);
    //   // Fallback to static data if table doesn't exist yet
    //   setAllWorkflows(WORKFLOWS);
    // }
    setAllWorkflows(WORKFLOWS);
  };

  const filteredWorkflows = useMemo(() => {
    return allWorkflows
      .filter(w => {
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             w.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.rating - a.rating;
        if (sortBy === 'most-installed') return b.installs - a.installs;
        if (sortBy === 'new') return (b.new ? 1 : 0) - (a.new ? 1 : 0);
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy, allWorkflows]);

  const handleInstallClick = (workflow: Workflow) => {
    if (workflow.isPremium) {
      setWorkflowToBuy(workflow);
    } else {
      setWorkflowToInstall(workflow);
    }
  };

  const handleConfirmInstall = async (name: string) => {
    if (!workflowToInstall) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to install workflows.");
        return;
      }

      const { error } = await supabase.from('chatflows').insert({
        user_id: user.id,
        name: name,
        data: workflowToInstall.templateData || { nodes: [], edges: [] }
      });

      if (error) throw error;

      setSuccessToast("Done, added to your chatflow");
      setWorkflowToInstall(null);
      setSelectedWorkflow(null);
      
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error("Installation failed:", err);
      alert("Installation failed. Please try again.");
    }
  };

  const handlePurchaseSuccess = async (workflow: Workflow) => {
    setWorkflowToBuy(null);
    setWorkflowToInstall(workflow);
  };

  const handleConfirmPublish = async (details: PublishDetails) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('marketplace_workflows').insert({
            user_id: user.id,
            name: details.name,
            description: details.description,
            category: details.category,
            price: details.price,
            is_premium: details.isPremium,
            icon: details.icon,
            template_data: selectedLocalWorkflow.data,
            creator_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
        });

        if (error) throw error;

        setSuccessToast("Workflow published to Marketplace!");
        setSelectedLocalWorkflow(null);
        fetchMarketplaceWorkflows(); // Refresh list
        
        setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
        console.error("Publishing failed:", err);
        alert("Failed to publish workflow. Ensure the marketplace table exists.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f14] text-white">
      {/* Success Toast - Minimalist */}
      {successToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-100 bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 font-semibold text-sm animate-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="px-8 pt-10 pb-6 shrink-0 border-b border-white/5 bg-white/2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-white mb-1">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              Discover and share workflows created by the community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
                onClick={() => setShowSelector(true)}
                variant="default"
                className="hidden md:flex items-center gap-2 h-10 px-6 text-xs font-bold font-mono group"
            >
                <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                Publish Your Flow
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search community..." 
                className="pl-9 h-10 w-full md:w-56 bg-black/40 border-white/10 focus:border-blue-500/50 rounded-lg text-sm transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
              <SelectTrigger className="h-10 w-32 bg-black/40 border-white/10 rounded-lg text-zinc-400 text-xs font-bold">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-white/10 text-zinc-300">
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="most-installed">Installs</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkflows.map((workflow) => (
            <MarketplaceCard 
              key={workflow.id} 
              workflow={workflow} 
              onViewDetails={setSelectedWorkflow}
              onInstall={handleInstallClick}
            />
          ))}
        </div>
        
        {filteredWorkflows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-zinc-700 border border-white/5">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-300">No results found</h3>
            <p className="text-zinc-500 text-xs mt-1">Try broadening your search or choosing another category.</p>
          </div>
        )}
      </div>

      {/* Overlays */}
      <MarketplaceDetail 
        workflow={selectedWorkflow} 
        onClose={() => setSelectedWorkflow(null)}
        onInstall={handleInstallClick}
      />
      <PaymentModal 
        workflow={workflowToBuy}
        onClose={() => setWorkflowToBuy(null)}
        onSuccess={handlePurchaseSuccess}
      />
      <InstallModal 
        workflow={workflowToInstall}
        onClose={() => setWorkflowToInstall(null)}
        onConfirm={handleConfirmInstall}
      />

      {/* Publishing Overlays */}
      {showSelector && (
          <WorkflowSelector 
            onClose={() => setShowSelector(false)}
            onSelect={(w) => {
                setSelectedLocalWorkflow(w);
                setShowSelector(false);
            }}
          />
      )}
      <PublishModal 
        workflow={selectedLocalWorkflow}
        onClose={() => setSelectedLocalWorkflow(null)}
        onConfirm={handleConfirmPublish}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
}
