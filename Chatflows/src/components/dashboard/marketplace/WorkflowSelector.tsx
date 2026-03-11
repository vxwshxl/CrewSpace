'use client';

import React, { useEffect, useState } from 'react';
import { X, Layout, Search, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';

interface WorkflowSelectorProps {
  onClose: () => void;
  onSelect: (workflow: any) => void;
}

export default function WorkflowSelector({ onClose, onSelect }: WorkflowSelectorProps) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchUserWorkflows();
  }, []);

  const fetchUserWorkflows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chatflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      console.error("Error fetching workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0b0f14] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-500" />
            Select a Workflow
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white transition-colors border border-white/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input 
              placeholder="Search your chatflows..." 
              className="pl-9 bg-black/40 border-white/10 focus:border-blue-500/50 h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs font-medium uppercase tracking-widest">Scanning CrewSpace...</span>
              </div>
            ) : filteredWorkflows.length > 0 ? (
              filteredWorkflows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onSelect(w)}
                  className="w-full flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-lg transition-all group"
                >
                  <div className="text-left">
                    <div className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{w.name}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5 capitalize">
                        {w.data?.nodes?.length || 0} Nodes • {w.data?.edges?.length || 0} Connections
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))
            ) : (
              <div className="text-center py-12 bg-white/2 rounded-lg border border-dashed border-white/5">
                <p className="text-zinc-600 text-sm">No chatflows found</p>
                <p className="text-zinc-700 text-[10px] mt-1 uppercase font-bold tracking-widest">Create one in your dashboard first</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white/2 border-t border-white/5">
          <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
            Select one of your existing workflows to start the publishing process. You'll be able to add a description and pricing on the next step.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
