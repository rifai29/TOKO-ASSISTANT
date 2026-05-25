import React, { useState } from 'react';
import { Product, Gondola } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Check, Package, X, Pencil, Layers, LayoutGrid, Calendar, Clock, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';

interface SidebarProps {
  products: Product[];
  selectedProductId: string | null;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onRemoveProduct: (id: string) => void;
  onSelectProduct: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: any;
  onUpdateSettings: (settings: any) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onCloseMobile?: () => void;
  gondolas: Gondola[];
  activeGondolaId: string;
  onSelectGondola: (id: string) => void;
  onAddGondola: (name?: string) => void;
  onRemoveGondola: (id: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
}

import { Search } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({
  products,
  selectedProductId,
  onAddProduct,
  onRemoveProduct,
  onSelectProduct,
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  onUpdateProduct,
  onCloseMobile,
  gondolas,
  activeGondolaId,
  onSelectGondola,
  onAddGondola,
  onRemoveGondola,
  isFormOpen,
  setIsFormOpen
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedShelves, setExpandedShelves] = useState<Record<number, boolean>>(() => {
    // Default all shelves to expanded (true)
    return {};
  });

  const toggleShelf = (shelfNum: number) => {
    setExpandedShelves(prev => ({
      ...prev,
      [shelfNum]: prev[shelfNum] === false ? true : false
    }));
  };

  const filteredGondolas = gondolas.filter(g => 
    g.settings.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.plu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (searchTerm.trim() === '') {
      return p.gondolaId === activeGondolaId;
    }
    return matchesSearch;
  });

  return (
    <aside className="w-full md:w-96 flex flex-col h-full overflow-hidden z-20 bg-white border-r border-gray-100 shadow-sm">
      <div className="px-3 pt-3 pb-2 mb-1">
        <div className="bg-gray-100/80 p-1 rounded-2xl flex flex-col gap-1 w-full border border-gray-200/40">
          <div className="flex items-center gap-1 w-full">
            {[
              { id: 'products', icon: LayoutGrid, title: 'Katalog' },
              { id: 'rak', icon: LayoutGrid, title: 'Daftar Rak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.title}
                className={cn(
                  "flex-1 h-8 md:h-10 flex items-center justify-center gap-1.5 transition-all rounded-xl text-xs md:text-sm font-bold uppercase tracking-wide",
                  activeTab === tab.id 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                )}
              >
                <tab.icon size={15} strokeWidth={2.5} className="shrink-0" />
                <span className="hidden md:inline text-[11px] font-black">{tab.title}</span>
              </button>
            ))}

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "flex-1 h-8 md:h-10 flex items-center justify-center gap-1.5 transition-all rounded-xl text-xs md:text-sm font-bold uppercase tracking-wide",
                showSearch 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              )}
              title="Cari..."
            >
              <Search size={15} strokeWidth={2.5} className="shrink-0" />
              <span className="hidden md:inline text-[11px] font-black">Cari</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showSearch && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-0.5"
              >
                <div className="relative group mt-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors shrink-0" />
                  <input 
                    autoFocus
                    placeholder={activeTab === 'rak' ? "Cari nama rak..." : "Cari katalog..."} 
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                    }}
                    onBlur={() => !searchTerm && setShowSearch(false)}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white rounded-xl border border-gray-200/50 transition-all placeholder:text-gray-400 font-bold outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 scrollbar-hide">
        <div className="space-y-1.5 pb-4">
          {activeTab === 'rak' && (
            <div className="space-y-1.5 animate-in fade-in duration-500">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-display font-black text-gray-400 uppercase tracking-widest">Daftar Rak</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs font-black text-primary hover:bg-primary/10 rounded-xl"
                    onClick={() => onAddGondola()}
                  >
                    <Plus size={14} className="mr-1" /> Tambah Rak
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 px-1">
                  {filteredGondolas.map(g => {
                    const allProducts = g.shelves.flat();
                    const hasProducts = allProducts.length > 0;
                    const isCompleted = hasProducts && allProducts.every(p => p.soChecked);

                    return (
                      <div 
                        key={g.id}
                        onClick={() => onSelectGondola(g.id)}
                        className={cn(
                          "p-3 cursor-pointer transition-all rounded-2xl relative overflow-hidden flex items-center gap-2.5 group border",
                          activeGondolaId === g.id 
                            ? "bg-gray-100/80 text-gray-900 border-gray-200 shadow-none z-10" 
                            : "hover:bg-gray-50 text-gray-600 bg-white border-gray-100 hover:border-gray-200"
                        )}
                      >
                        {isCompleted && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                            <Check size={9} strokeWidth={4} />
                          </div>
                        )}
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border",
                          activeGondolaId === g.id 
                            ? "bg-white text-gray-900 border-gray-200/50 shadow-sm" 
                            : "bg-gray-50 text-gray-400 border-transparent group-hover:bg-gray-100 group-hover:text-primary/60"
                        )}>
                          <LayoutGrid size={16} strokeWidth={activeGondolaId === g.id ? 2.5 : 2} />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col">
                          <p className={cn(
                            "text-[10px] md:text-xs font-black tracking-tight uppercase truncate",
                            activeGondolaId === g.id ? "text-gray-900 font-extrabold" : "text-gray-700"
                          )}>
                            {g.settings.name}
                          </p>
                          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 mt-0.5">
                            {allProducts.length || 0} ITEM
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-1 animate-in fade-in duration-500 px-1">
              {(() => {
                const groupedByShelf: Record<number, Product[]> = filteredProducts.reduce((acc, p) => {
                  const shelf = p.shelf || 0;
                  if (!acc[shelf]) acc[shelf] = [];
                  acc[shelf].push(p);
                  return acc;
                }, {} as Record<number, Product[]>);

                const sortedShelves = Object.keys(groupedByShelf)
                  .map(Number)
                  .sort((a, b) => a - b);

                return sortedShelves.map((shelfNum) => {
                  const isExpanded = expandedShelves[shelfNum] !== false;
                  return (
                    <div key={shelfNum} className="space-y-0.5">
                      <div 
                        onClick={() => toggleShelf(shelfNum)}
                        className="flex items-center gap-1.5 px-1 py-1 cursor-pointer group/shelf select-none hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="h-3 w-0.5 bg-primary/60 rounded-full" />
                        <Label className="text-[9px] font-display font-black text-gray-500 uppercase tracking-wider cursor-pointer group-hover/shelf:text-primary transition-colors">
                          SELVING {shelfNum || '?'}
                        </Label>
                        <div className="flex-1 h-px bg-gray-100/60" />
                        <div className="flex items-center gap-1">
                          <span className="text-[7.5px] font-bold text-gray-400">{groupedByShelf[shelfNum].length} ITEM</span>
                          {isExpanded ? (
                            <ChevronDown size={8} className="text-gray-400 group-hover/shelf:text-primary transition-transform duration-200" />
                          ) : (
                            <ChevronRight size={8} className="text-gray-400 group-hover/shelf:text-primary transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-0.5 pb-1.5 pt-0.5 pl-2">
                              {groupedByShelf[shelfNum].map(p => (
                                <div key={p.id}>
                                  <div 
                                    onClick={() => onSelectProduct(selectedProductId === p.id ? null : p.id)}
                                    className={cn(
                                      "p-2 cursor-pointer transition-all rounded-xl relative overflow-hidden my-1",
                                      selectedProductId === p.id 
                                        ? "bg-gray-100 text-gray-900 border border-gray-200" 
                                        : "hover:bg-gray-50/80 border border-transparent"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold overflow-hidden transition-colors bg-white border border-gray-100 shadow-sm",
                                        selectedProductId === p.id ? "ring-2 ring-primary" : ""
                                      )}>
                                        {p.image ? (
                                          <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                                        ) : (
                                          <span className="text-primary font-black uppercase text-xs">{(p.plu || 'P').substring(0, 1)}</span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-[11px] md:text-xs font-bold leading-snug line-clamp-2 text-gray-800 flex-1">{p.name}</p>
                                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); navigate(`/edit-product/${p.id}`); }}
                                              className="p-1 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                                              title="Edit"
                                            >
                                              <Pencil size={12} />
                                            </button>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
                                              className="p-1 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                                              title="Detail"
                                            >
                                              <ExternalLink size={12} />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] md:text-[11px] font-semibold text-gray-400 font-mono tabular-nums bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{p.sku}</span>
                                          <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-wider">{p.facing}F</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};



const Separator = () => <div className="h-px my-2" />;
