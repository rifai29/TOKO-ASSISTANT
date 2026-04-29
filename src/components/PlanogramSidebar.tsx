import React, { useState } from 'react';
import { Product, Gondola } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Check, Package, X, Pencil, Layers, LayoutGrid, Calendar, Clock, ExternalLink } from 'lucide-react';
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    plu: '',
    facing: 1,
    rh: 30,
    image: '' as string | undefined,
    shelf: undefined as number | undefined,
    slot: undefined as number | undefined,
    gondolaId: activeGondolaId,
    expiryDate: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Update newProduct when activeGondolaId changes if not editing
  React.useEffect(() => {
    if (!editingProductId) {
      setNewProduct(prev => ({ ...prev, gondolaId: activeGondolaId }));
    }
  }, [activeGondolaId, editingProductId]);

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

  const handleAdd = () => {
    if (!newProduct.name) return;
    
    if (editingProductId) {
      onUpdateProduct(editingProductId, newProduct);
      setEditingProductId(null);
    } else {
      onAddProduct(newProduct);
    }

    setNewProduct({
      ...newProduct,
      name: '',
      sku: '',
      plu: '',
      rh: 30,
      image: undefined,
      shelf: undefined,
      slot: undefined,
      gondolaId: activeGondolaId,
      expiryDate: ''
    });
    setIsFormOpen(false);
  };

  const handleEdit = (p: Product) => {
    setEditingProductId(p.id);
    setIsFormOpen(true);
    setNewProduct({
      name: p.name,
      sku: p.sku || '',
      plu: p.plu || '',
      facing: p.facing,
      rh: p.rh,
      image: p.image,
      shelf: p.shelf,
      slot: p.slot,
      gondolaId: p.gondolaId || activeGondolaId,
      expiryDate: p.expiryDate || ''
    });
    // Scroll to top of sidebar to see the form
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setIsFormOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      plu: '',
      facing: 1,
      rh: 30,
      image: '' as string | undefined,
      shelf: undefined,
      slot: undefined,
      gondolaId: activeGondolaId,
      expiryDate: ''
    });
  };

  return (
    <aside className="w-full md:w-80 flex flex-col h-full overflow-hidden z-20">
      {/* Mobile Header */}
      <div className="flex items-center justify-end px-4 pt-2 pb-1 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCloseMobile}
          className="h-8 w-8 rounded-xl bg-gray-100 text-gray-500"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="px-4 mt-0 md:mt-2 mb-2">
        <div className="bg-gray-200/50 p-1 rounded-2xl flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1 w-full">
            {[
              { id: 'products', icon: LayoutGrid, title: 'Catalog' },
              { id: 'rak', icon: LayoutGrid, title: 'Rak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.title}
                className={cn(
                  "flex-1 h-8 md:h-10 px-0.5 flex items-center justify-center transition-all rounded-xl",
                  activeTab === tab.id 
                    ? "bg-white text-primary" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <tab.icon size={16} strokeWidth={2.5} className="shrink-0" />
              </button>
            ))}

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "flex-1 h-8 md:h-10 px-0.5 text-[9px] md:text-[10px] font-bold flex items-center justify-center transition-all rounded-xl",
                showSearch 
                  ? "bg-white text-primary" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
              title="Search Catalog"
            >
              <Search size={14} strokeWidth={2.5} />
            </button>
            
            <div className="flex-1 flex items-center justify-center px-1 h-8 md:h-10 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shrink-0">
              <span className="text-[9px] md:text-[10px] font-black text-gray-900 uppercase tracking-tighter truncate">
                {settings.name}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSearch && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-1 pb-1"
              >
                <div className="relative group mt-1">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors shrink-0" />
                  <input 
                    autoFocus
                    placeholder="Cari katalog..." 
                    value={searchTerm}
                    onChange={e => {
                      setActiveTab('products');
                      setSearchTerm(e.target.value);
                    }}
                    onBlur={() => !searchTerm && setShowSearch(false)}
                    className="w-full h-8 md:h-10 pl-8 pr-3 text-[10px] md:text-xs bg-white/80 rounded-xl border-none transition-all placeholder:text-gray-400 font-bold outline-none focus:bg-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        <div className="space-y-4 pb-4">
          {activeTab === 'rak' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Daftar Rak</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg"
                    onClick={() => onAddGondola()}
                  >
                    <Plus size={12} className="mr-1" /> Tambah Rak
                  </Button>
                </div>

                <div className="space-y-3">
                  {gondolas.map(g => (
                      <div 
                        onClick={() => onSelectGondola(g.id)}
                        className={cn(
                          "p-4 cursor-pointer transition-all rounded-[1.5rem] relative overflow-hidden group/rak",
                          activeGondolaId === g.id 
                            ? "bg-gray-200 text-gray-900" 
                            : "hover:bg-gray-200/50 text-gray-600"
                        )}
                      >
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                            activeGondolaId === g.id 
                              ? "bg-gray-300/50 text-gray-900 rotate-3" 
                              : "bg-gray-50 text-gray-400 group-hover/rak:bg-primary/10 group-hover/rak:text-primary"
                          )}>
                            <LayoutGrid size={22} strokeWidth={activeGondolaId === g.id ? 2.5 : 2} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm font-black tracking-tight truncate",
                                activeGondolaId === g.id ? "text-gray-900" : "text-gray-900"
                              )}>{g.settings.name}</p>
                            </div>
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                              activeGondolaId === g.id ? "text-gray-500" : "text-gray-400"
                            )}>
                              {g.settings.shelfCount} Shelves · {g.shelves.flat().length} Items
                            </p>
                            {g.lastUpdated && (
                              <p className={cn(
                                "text-[8px] font-medium flex items-center gap-1 mt-1",
                                activeGondolaId === g.id ? "text-gray-900/50" : "text-gray-300"
                              )}>
                                <Clock size={8} /> Update: {g.lastUpdated}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {activeGondolaId === g.id && (
                            <div className="bg-white/20 p-1.5 rounded-full">
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {activeGondolaId === g.id && (
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="space-y-4">
                {isFormOpen && (
                  <div className="bg-gray-50/50 p-4 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <select 
                          value={newProduct.gondolaId}
                          onChange={e => setNewProduct({...newProduct, gondolaId: e.target.value})}
                          className="w-full h-10 text-sm bg-white rounded-xl px-3 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>-- Pilih Rak (Gondola) --</option>
                          {gondolas.map(g => (
                            <option key={g.id} value={g.id}>{g.settings.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Input 
                          placeholder="Product Name" 
                          value={newProduct.name}
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          className="h-10 text-sm bg-white rounded-xl focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Input 
                            placeholder="SKU (e.g. REF-001)" 
                            value={newProduct.sku}
                            onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Input 
                            placeholder="PLU" 
                            value={newProduct.plu}
                            onChange={e => setNewProduct({...newProduct, plu: e.target.value})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Input 
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Facing (Lebar)"
                            value={newProduct.facing}
                            onChange={e => setNewProduct({...newProduct, facing: parseInt(e.target.value) || 1})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Input 
                            type="number"
                            placeholder="RH (Hari Retur)" 
                            value={newProduct.rh}
                            onChange={e => setNewProduct({...newProduct, rh: parseInt(e.target.value) || 0})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Input 
                            type="number"
                            placeholder="Selving (Rak #)"
                            value={newProduct.shelf || ''}
                            onChange={e => setNewProduct({...newProduct, shelf: parseInt(e.target.value) || undefined})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Input 
                            type="number"
                            placeholder="Baris (Posisi #)"
                            value={newProduct.slot || ''}
                            onChange={e => setNewProduct({...newProduct, slot: parseInt(e.target.value) || undefined})}
                            className="h-10 text-sm bg-white rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-gray-500 ml-1">Expiry Date (Optional)</Label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={newProduct.expiryDate}
                            onChange={e => setNewProduct({...newProduct, expiryDate: e.target.value})}
                            className="h-10 pl-10 text-sm bg-white rounded-xl focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {editingProductId && (
                          <Button 
                            onClick={cancelEdit} 
                            variant="secondary"
                            className="flex-1 h-10 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 border-none shadow-none"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          onClick={handleAdd} 
                          className={cn(
                            "h-10 font-bold rounded-xl bg-primary hover:bg-primary/90",
                            editingProductId ? "flex-[2]" : "w-full"
                          )}
                        >
                          {editingProductId ? 'Update Product' : 'Add Product'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  {filteredProducts.map(p => (
                    <div key={p.id}>
                        <div 
                          onClick={() => onSelectProduct(selectedProductId === p.id ? null : p.id)}
                          className={cn(
                            "p-3 cursor-pointer transition-all rounded-2xl relative overflow-hidden",
                            selectedProductId === p.id 
                              ? "bg-gray-200 text-gray-900" 
                              : "hover:bg-gray-200/50"
                          )}
                        >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden mt-0.5 transition-colors",
                            selectedProductId === p.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                          )}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              (p.plu || 'P').substring(0, 1)
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className={cn(
                                "text-sm font-bold leading-tight pt-0.5",
                                "text-gray-900"
                              )}>{p.name}</p>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all", 
                                    "hover:bg-primary/10 text-primary"
                                  )}
                                  title="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all", 
                                    "hover:bg-primary/10 text-primary"
                                  )}
                                  title="Lihat Detail"
                                >
                                  <ExternalLink size={13} />
                                </button>
                              </div>
                            </div>
                            <p className={cn(
                              "text-[11px] font-medium opacity-60 flex items-center gap-2", 
                              "text-gray-500"
                            )}>
                              <span>{p.sku} · {p.facing} Facing</span>
                              {p.expiryDate && (
                                <span className="flex items-center gap-1 text-orange-500 font-bold shrink-0">
                                  <Calendar size={10} /> EXP: {p.expiryDate}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};



const Separator = () => <div className="h-px my-2" />;
