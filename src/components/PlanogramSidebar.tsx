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
    <aside className="w-full md:w-80 flex flex-col h-full overflow-hidden z-20 bg-white">
      <div className="px-1.5 pt-1 mb-1">
        <div className="bg-gray-100 p-1 rounded-2xl flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1 w-full">
            {[
              { id: 'products', icon: LayoutGrid, title: 'Catalog' },
              { id: 'rak', icon: Layers, title: 'Rak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.title}
                className={cn(
                  "flex-1 h-7 md:h-8 flex items-center justify-center transition-all rounded-xl",
                  activeTab === tab.id 
                    ? "bg-white text-primary" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                )}
              >
                <tab.icon size={15} strokeWidth={2.5} className="shrink-0" />
              </button>
            ))}

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "flex-1 h-7 md:h-8 text-[7px] md:text-[8px] font-bold flex items-center justify-center transition-all rounded-xl",
                showSearch 
                  ? "bg-white text-primary" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              )}
              title="Search Catalog"
            >
              <Search size={14} strokeWidth={2.5} />
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
                    placeholder={activeTab === 'rak' ? "Cari rak..." : "Cari katalog..."} 
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                    }}
                    onBlur={() => !searchTerm && setShowSearch(false)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-white rounded-xl border-none transition-all placeholder:text-gray-400 font-bold outline-none"
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
                  <Label className="text-[10px] font-display font-bold text-gray-500 uppercase tracking-widest">Daftar Rak</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg"
                    onClick={() => onAddGondola()}
                  >
                    <Plus size={12} className="mr-1" /> Tambah Rak
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 px-1">
                  {filteredGondolas.map(g => {
                    const allProducts = g.shelves.flat();
                    const hasProducts = allProducts.length > 0;
                    const isCompleted = hasProducts && allProducts.every(p => p.soChecked);

                    return (
                      <div 
                        key={g.id}
                        onClick={() => onSelectGondola(g.id)}
                        className={cn(
                          "aspect-square p-3 cursor-pointer transition-all rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2 group",
                          activeGondolaId === g.id 
                            ? "bg-gray-100/80 text-gray-900 shadow-none z-10" 
                            : "hover:bg-gray-50 text-gray-600 bg-white border border-gray-100 hover:border-gray-200"
                        )}
                      >
                        {isCompleted && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                          activeGondolaId === g.id 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-primary/60"
                        )}>
                          <LayoutGrid size={20} strokeWidth={activeGondolaId === g.id ? 2.5 : 2} />
                        </div>
                        <div className="text-center w-full">
                          <p className={cn(
                            "text-[10px] font-black tracking-tight uppercase truncate",
                            activeGondolaId === g.id ? "text-gray-900" : "text-gray-600"
                          )}>
                            {g.settings.name}
                          </p>
                          <p className={cn(
                            "text-[8px] font-bold opacity-50",
                            activeGondolaId === g.id ? "text-gray-500" : "text-gray-400"
                          )}>
                            {allProducts.length || 0} Terisi
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
            <div className="space-y-2 animate-in fade-in duration-500">
              <div className="space-y-2">
                {isFormOpen && (
                  <div className="bg-gray-50 p-4 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
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
                            "p-1 cursor-pointer transition-all rounded-lg relative overflow-hidden",
                            selectedProductId === p.id 
                              ? "bg-gray-200 text-gray-900" 
                              : "hover:bg-gray-100"
                          )}
                        >
                        <div className="flex items-start gap-1">
                          <div className={cn(
                            "w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[9px] font-bold overflow-hidden mt-0.5 transition-colors",
                            selectedProductId === p.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                          )}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              (p.plu || 'P').substring(0, 1)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[10px] font-bold leading-tight truncate flex-1">{p.name}</p>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                  className="p-1 rounded-md text-primary hover:bg-white/50"
                                >
                                  <Pencil size={10} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
                                  className="p-1 rounded-md text-primary hover:bg-white/50"
                                >
                                  <ExternalLink size={10} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[8px] font-bold text-gray-400 tabular-nums">{p.sku}</span>
                              <span className="text-[8px] font-bold text-gray-500 opacity-60">• {p.facing}F</span>
                            </div>
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
