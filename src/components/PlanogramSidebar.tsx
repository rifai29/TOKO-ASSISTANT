import React, { useState } from 'react';
import { Product, DEFAULT_PALETTE } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Check, Package, Settings2, BarChart3, Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

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
  onCloseMobile?: () => void;
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
  onCloseMobile
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    plu: '',
    facing: 2,
    rh: 30,
    color: DEFAULT_PALETTE[0],
    image: '' as string | undefined
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.plu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newProduct.name) return;
    onAddProduct(newProduct);
    setNewProduct({
      ...newProduct,
      name: '',
      sku: '',
      plu: '',
      rh: 30,
      image: undefined
    });
  };

  return (
    <aside className="w-full md:w-80 bg-white/90 backdrop-blur-md rounded-[2rem] flex flex-col h-full overflow-hidden ios-shadow border border-white/40 z-20">
      <div className="p-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Editor</h1>
        {onCloseMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCloseMobile}
            className="md:hidden h-9 w-9 rounded-xl bg-gray-100/50"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className="bg-gray-100/80 p-1 rounded-xl flex">
          {[
            { id: 'products', label: 'Catalog', icon: Package },
            { id: 'gondola', label: 'Config', icon: Settings2 },
            { id: 'summary', label: 'Analysis', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 px-1 text-[11px] font-semibold flex items-center justify-center gap-2 transition-all rounded-lg",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon size={14} strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-6 pb-6">
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 ml-1">Product Image</Label>
                    <div className="flex gap-3 items-center">
                      <div 
                        className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {newProduct.image ? (
                          <>
                            <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera size={16} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <Camera size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input 
                          type="file" 
                          id="image-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] w-full rounded-lg border-none ios-shadow"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload size={12} className="mr-2" /> Upload Photo
                        </Button>
                        {newProduct.image && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] w-full text-destructive hover:bg-destructive/5"
                            onClick={() => setNewProduct(prev => ({ ...prev, image: undefined }))}
                          >
                            <X size={12} className="mr-2" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 ml-1">Product Name</Label>
                    <Input 
                      placeholder="e.g. Aqua 600ml" 
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      className="h-10 text-sm bg-white border-none rounded-xl ios-shadow focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">SKU</Label>
                      <Input 
                        placeholder="REF-001" 
                        value={newProduct.sku}
                        onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">PLU</Label>
                      <Input 
                        placeholder="PLU" 
                        value={newProduct.plu}
                        onChange={e => setNewProduct({...newProduct, plu: e.target.value})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">Facing (Width)</Label>
                      <Input 
                        type="number"
                        min={1}
                        max={5}
                        value={newProduct.facing}
                        onChange={e => setNewProduct({...newProduct, facing: parseInt(e.target.value) || 1})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">RH (Hari Retur)</Label>
                      <Input 
                        type="number"
                        placeholder="30" 
                        value={newProduct.rh}
                        onChange={e => setNewProduct({...newProduct, rh: parseInt(e.target.value) || 0})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 ml-1">Color</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DEFAULT_PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewProduct({...newProduct, color})}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            newProduct.color === color ? "border-primary scale-110 shadow-md" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAdd} className="w-full h-10 font-bold rounded-xl bg-primary hover:bg-primary/90 mt-2">
                    Add Product
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-semibold text-gray-500">Catalog</Label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {filteredProducts.length} Items
                  </span>
                </div>

                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search name, PLU, or SKU..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="h-9 pl-9 text-xs bg-gray-50/50 border-none rounded-xl ios-shadow focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  {filteredProducts.map(p => (
                        <div key={p.id}>
                          <Card 
                            onClick={() => onSelectProduct(selectedProductId === p.id ? null : p.id)}
                            className={cn(
                              "p-3 cursor-pointer transition-all border-none rounded-2xl relative overflow-hidden",
                              selectedProductId === p.id 
                                ? "bg-primary text-white ios-shadow" 
                                : "bg-white hover:bg-gray-50 ios-shadow"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl shrink-0 shadow-inner flex items-center justify-center text-xs font-bold overflow-hidden" style={{ backgroundColor: p.color, color: 'white' }}>
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  (p.plu || 'P').substring(0, 1)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{p.name}</p>
                                <p className={cn("text-[11px] font-medium opacity-60", selectedProductId === p.id ? "text-white" : "text-gray-500")}>
                                  {p.sku} · {p.facing} Facing
                                </p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveProduct(p.id); }}
                                className={cn("p-2 rounded-xl transition-all", selectedProductId === p.id ? "hover:bg-white/20 text-white" : "hover:bg-red-50 text-red-500")}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
              </div>
            </div>
          )}

          {activeTab === 'gondola' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 ml-1">Gondola Name</Label>
                    <Input 
                      value={settings.name}
                      onChange={e => onUpdateSettings({...settings, name: e.target.value})}
                      className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">Levels</Label>
                      <Input 
                        type="number"
                        min={1}
                        max={8}
                        value={settings.shelfCount}
                        onChange={e => onUpdateSettings({...settings, shelfCount: parseInt(e.target.value) || 1})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 ml-1">Category</Label>
                      <Input 
                        value={settings.category}
                        onChange={e => onUpdateSettings({...settings, category: e.target.value})}
                        className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 ml-1">Store</Label>
                    <Input 
                      value={settings.store}
                      onChange={e => onUpdateSettings({...settings, store: e.target.value})}
                      className="h-10 text-sm bg-white border-none rounded-xl ios-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl ios-shadow">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">Levels</p>
                  <p className="text-2xl font-bold text-primary">{settings.shelfCount}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl ios-shadow">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">SKUs</p>
                  <p className="text-2xl font-bold text-primary">{products.length}</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl ios-shadow space-y-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Market Share</p>
                <div className="space-y-4">
                  {Array.from(new Set(products.map(p => p.plu || 'Unknown'))).map(plu => {
                    const count = products.filter(p => (p.plu || 'Unknown') === plu).length;
                    const percentage = Math.round((count / products.length) * 100);
                    return (
                      <div key={plu} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{plu}</span>
                          <span className="text-primary">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};



const Separator = () => <div className="h-px bg-border my-2" />;
