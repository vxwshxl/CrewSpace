'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Search, MoreVertical, Calendar } from 'lucide-react';
import gsap from 'gsap';


interface Squad {
    id: string;
    name: string;
    members: number;
    workflows: number;
    lastActive: string;
    colors: string[];
}

const DUMMY_SQUADS: Squad[] = [
    {
        id: '1',
        name: 'Core System Ops',
        members: 4,
        workflows: 12,
        lastActive: '10 mins ago',
        colors: ['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-gray-500']
    },
    {
        id: '2',
        name: 'Data Scraping Crew',
        members: 2,
        workflows: 5,
        lastActive: '2 hours ago',
        colors: ['bg-green-500', 'bg-teal-500']
    },
    {
        id: '3',
        name: 'Marketing Automations',
        members: 6,
        workflows: 8,
        lastActive: '1 day ago',
        colors: ['bg-orange-500', 'bg-yellow-500', 'bg-red-500']
    }
];

export default function SquadsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isSearchFocused || searchQuery) {
            gsap.to(searchContainerRef.current, {
                width: 230, // expanded width
                duration: 0.4,
                ease: 'power3.out'
            });
        } else {
            gsap.to(searchContainerRef.current, {
                width: 160, // structurally 25-30% smaller
                duration: 0.4,
                ease: 'power3.out'
            });
        }
    }, [isSearchFocused, searchQuery]);

    const filteredSquads = DUMMY_SQUADS.filter(squad =>
        squad.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Collaborative Squads
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage groups of Captains to build workflows simultaneously.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                    <div ref={searchContainerRef} className="relative flex-none" style={{ width: 200 }}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Find a squad..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full h-11 pl-10 pr-5 bg-muted/50 border border-border rounded-full text-sm focus:outline-none caret-primary text-white transition-shadow"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-secondary text-secondary-foreground h-11 px-5 rounded-full text-sm font-semibold hover:bg-[#D8D8D8] transition-all shadow-sm whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        Create Squad
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSquads.map((squad) => (
                    <div key={squad.id} className="group bg-card border border-border rounded-none p-6 hover:border-border/80 transition-all shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {squad.colors.slice(0, 3).map((color, idx) => (
                                        <div key={idx} className={`w-8 h-8 rounded-full border-2 border-card ${color} flex items-center justify-center`}>
                                            <span className="text-[10px] font-bold text-white uppercase">{squad.name.charAt(idx)}</span>
                                        </div>
                                    ))}
                                    {squad.members > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-white">
                                            +{squad.members - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="text-muted-foreground hover:text-white p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors cursor-pointer">
                            {squad.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-6">
                            <Calendar className="w-3.5 h-3.5" /> Active {squad.lastActive}
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Captains</p>
                                <p className="text-lg font-semibold text-white">{squad.members}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Workflows</p>
                                <p className="text-lg font-semibold text-white">{squad.workflows}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSquads.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-none">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-1">No Squads Found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Could not find any collaborative squads matching your search terms. Check the spelling or create a new squad to invite others!
                    </p>
                </div>
            )}
        </div>
    );
}
