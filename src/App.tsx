import { useState, useEffect } from 'react';
import { Sidebar } from './components/PlanogramSidebar';
import { PlanogramCanvas } from './components/PlanogramCanvas';
import { Product, GondolaSettings, PlanogramState, Gondola } from './types';
import { Button } from '@/components/ui/button';
import { Menu, X as CloseIcon, Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

const INITIAL_SETTINGS: GondolaSettings = {
  name: "PLANOGRAM AA4",
  store: "RIFAKHI RINDHOI SETIAWAN",
  date: new Date().toISOString().split('T')[0],
  category: "Beverages",
  notes: "",
  shelfCount: 4,
  width: 120,
  height: 180,
  pogId: "POG-2024-001",
  supplier: "Global Distribution"
};

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'extra-joss', 
    name: 'Extra Joss Ultimate Minuman Energi Kaleng 250ml', 
    sku: '899305830970', 
    plu: '466032', 
    facing: 1, 
    rh: 0,
    shelf: 1,
    slot: 1
  },
  { id: '1', name: 'Aqua 600ml', sku: 'AQU001', plu: 'Aqua', facing: 2, rh: 30 },
  { 
    id: 'red-bull', 
    name: 'Red bull minuman energi kaleng 250ml', 
    sku: '900249020726', 
    plu: '112898', 
    facing: 1, 
    rh: 0,
    shelf: 1,
    slot: 2
  },
  { id: '2', name: 'Teh Botol Sosro', sku: 'TBS002', plu: 'Sosro', facing: 2, rh: 30 },
  { id: '3', name: 'Pocari Sweat', sku: 'POC003', plu: 'Otsuka', facing: 1, rh: 30 },
  { id: '4', name: 'Indomilk UHT', sku: 'IND004', plu: 'Indomilk', facing: 2, rh: 30 },
  { id: '5', name: 'Sprite 500ml', sku: 'SPR005', plu: 'Coca-Cola', facing: 1, rh: 30 },
];

export default function App() {
  const [state, setState] = useState<PlanogramState>(() => {
    const saved = localStorage.getItem('planogram_state_v9');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    
    const initialGondola: Gondola = {
      id: 'g1',
      settings: INITIAL_SETTINGS,
      shelves: [
        [INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[2]],
        [],
        [],
        []
      ]
    };

    return {
      products: INITIAL_PRODUCTS,
      gondolas: [initialGondola],
      activeGondolaId: 'g1'
    };
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('planogram_state_v9', JSON.stringify(state));
  }, [state]);

  const activeGondola = state.gondolas.find(g => g.id === state.activeGondolaId) || state.gondolas[0];

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddProduct = (p: Omit<Product, 'id'>) => {
    const product: Product = {
      ...p,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => {
      const newProducts = [...prev.products, product];
      const targetGondolaId = p.gondolaId || prev.activeGondolaId;
      
      const newGondolas = prev.gondolas.map(g => {
        if (g.id !== targetGondolaId) return g;
        
        const newShelves = [...g.shelves];
        if (product.shelf && product.shelf > 0 && product.shelf <= newShelves.length) {
          const sIdx = product.shelf - 1;
          const currentShelf = [...newShelves[sIdx]];
          if (product.slot && product.slot > 0 && product.slot <= currentShelf.length) {
            currentShelf.splice(product.slot - 1, 0, { ...product });
          } else {
            currentShelf.push({ ...product });
          }
          newShelves[sIdx] = currentShelf;
        }
        return { ...g, shelves: newShelves };
      });
      
      return {
        ...prev,
        products: newProducts,
        gondolas: newGondolas,
        activeGondolaId: targetGondolaId // Switch to the target gondola to see the added product
      };
    });
    toast.success(`Product "${product.name}" added to Rak`);
  };

  const handleRemoveProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
      gondolas: prev.gondolas.map(g => ({
        ...g,
        shelves: g.shelves.map(shelf => shelf.filter(p => p.id !== id))
      }))
    }));
    if (selectedProductId === id) setSelectedProductId(null);
    toast.info("Product removed from catalog and shelves");
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p),
      gondolas: prev.gondolas.map(g => ({
        ...g,
        shelves: g.shelves.map(shelf => shelf.map(p => p.id === id ? { ...p, ...updates } : p))
      }))
    }));
  };

  const handleUpdateSettings = (settings: GondolaSettings) => {
    setState(prev => {
      const newGondolas = prev.gondolas.map(g => {
        if (g.id !== prev.activeGondolaId) return g;
        
        let newShelves = [...g.shelves];
        if (settings.shelfCount > g.settings.shelfCount) {
          const diff = settings.shelfCount - g.settings.shelfCount;
          newShelves = [...newShelves, ...Array.from({ length: diff }, () => [])];
        } else if (settings.shelfCount < g.settings.shelfCount) {
          newShelves = newShelves.slice(0, settings.shelfCount);
        }
        return { ...g, settings, shelves: newShelves };
      });
      return { ...prev, gondolas: newGondolas };
    });
  };

  const handlePlaceProduct = (shelfIdx: number) => {
    if (!selectedProductId) {
      toast.error("Please select a product from the sidebar first");
      return;
    }
    const product = state.products.find(p => p.id === selectedProductId);
    if (!product) return;

    setState(prev => {
      const newGondolas = prev.gondolas.map(g => {
        if (g.id !== prev.activeGondolaId) return g;
        const newShelves = [...g.shelves];
        newShelves[shelfIdx] = [...newShelves[shelfIdx], { ...product }];
        return { ...g, shelves: newShelves };
      });
      return { ...prev, gondolas: newGondolas };
    });
  };

  const handleRemoveFromShelf = (shelfIdx: number, slotIdx: number) => {
    setState(prev => {
      const newGondolas = prev.gondolas.map(g => {
        if (g.id !== prev.activeGondolaId) return g;
        const newShelves = [...g.shelves];
        newShelves[shelfIdx] = newShelves[shelfIdx].filter((_, i) => i !== slotIdx);
        return { ...g, shelves: newShelves };
      });
      return { ...prev, gondolas: newGondolas };
    });
  };

  const handleAddGondola = (name?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newGondola: Gondola = {
      id,
      settings: { ...INITIAL_SETTINGS, name: name || `NEW RAK ${state.gondolas.length + 1}` },
      shelves: Array.from({ length: INITIAL_SETTINGS.shelfCount }, () => [])
    };
    setState(prev => ({
      ...prev,
      gondolas: [...prev.gondolas, newGondola],
      activeGondolaId: id
    }));
    toast.success("New Rak added");
  };

  const handleRemoveGondola = (id: string) => {
    if (state.gondolas.length <= 1) {
      toast.error("Cannot remove the last Rak");
      return;
    }
    setState(prev => {
      const newGondolas = prev.gondolas.filter(g => g.id !== id);
      const newActiveId = prev.activeGondolaId === id ? newGondolas[0].id : prev.activeGondolaId;
      return { ...prev, gondolas: newGondolas, activeGondolaId: newActiveId };
    });
    toast.info("Rak removed");
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const formatImageForExcel = (img?: string) => {
      if (!img) return '';
      if (img.startsWith('data:image') && img.length > 30000) {
        return '[Base64 Image - Too large for Excel]';
      }
      return img;
    };

    state.gondolas.forEach(g => {
      const sheetData: any[] = [];
      g.shelves.forEach((shelf, sIdx) => {
        shelf.forEach((p, pIdx) => {
          sheetData.push({
            'Kategori': g.settings.category,
            'Selving': sIdx + 1,
            'Baris': pIdx + 1,
            'Nama Produk': p.name,
            'SKU': p.sku,
            'PLU': p.plu,
            'Facing': p.facing,
            'RH': p.rh,
            'Image URL': formatImageForExcel(p.image)
          });
        });
      });
      
      const ws = XLSX.utils.json_to_sheet(sheetData);
      // Sheet names must be <= 31 chars and no special chars
      const safeName = (g.settings.name || 'Rak').substring(0, 31).replace(/[\[\]\*\?\/\\]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    XLSX.writeFile(wb, `Planogram_Full.xlsx`);
    toast.success("Excel exported successfully with separate sheets for each Rak.");
  };

  const handleImportExcel = (file: File) => {
    const convertGDriveLink = (url: string) => {
      if (!url.includes('drive.google.com')) return url;
      let fileId = '';
      try {
        if (url.includes('/d/')) fileId = url.split('/d/')[1].split('/')[0];
        else if (url.includes('id=')) fileId = url.split('id=')[1].split('&')[0];
        if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
      } catch (e) {}
      return url;
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const newProducts: Product[] = [];
        const gondolaMap: Record<string, Gondola> = {};

        // Helper to find value in object regardless of key case
        const getVal = (obj: any, keys: string[]) => {
          const foundKey = Object.keys(obj).find(k => 
            keys.some(target => k.toLowerCase().trim() === target.toLowerCase())
          );
          return foundKey ? obj[foundKey] : undefined;
        };

        workbook.SheetNames.forEach((sheetName, sIdx) => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return;

          const json = XLSX.utils.sheet_to_json(worksheet) as any[];
          if (json.length === 0) return;

          // Use sheet name as Rak name
          const rakName = sheetName;
          
          if (!gondolaMap[rakName]) {
            gondolaMap[rakName] = {
              id: Math.random().toString(36).substr(2, 9) + sIdx,
              settings: { ...INITIAL_SETTINGS, name: rakName },
              shelves: Array.from({ length: 12 }, () => [])
            };
          }

          json.forEach((item, index) => {
            const productName = getVal(item, ['Nama Produk', 'Product Name', 'Nama']);
            const sku = getVal(item, ['SKU', 'Barcode']);
            
            if (!productName && !sku) return;

            // Optional: override category if present in sheet rows
            const category = String(getVal(item, ['Kategori', 'Category']) || INITIAL_SETTINGS.category);
            gondolaMap[rakName].settings.category = category;

            let imageUrl = getVal(item, ['Image URL', 'Foto', 'Gambar']);
            if (imageUrl) imageUrl = convertGDriveLink(String(imageUrl).trim());

            const shelfNum = Number(getVal(item, ['Selving', 'Shelf', 'Rak Nomor'])) || undefined;
            const slotNum = Number(getVal(item, ['Baris', 'Slot', 'Posisi'])) || undefined;

            const product: Product = {
              id: Math.random().toString(36).substr(2, 9) + index + sIdx,
              name: String(productName || 'Unnamed Product'),
              sku: String(sku || ''),
              plu: String(getVal(item, ['PLU']) || ''),
              facing: Number(getVal(item, ['Facing', 'Lebar'])) || 1,
              rh: Number(getVal(item, ['RH', 'Retur'])) || 0,
              image: imageUrl,
              shelf: shelfNum,
              slot: slotNum,
              gondolaId: gondolaMap[rakName].id
            };

            newProducts.push(product);

            if (product.shelf && product.shelf > 0 && product.shelf <= 12) {
              gondolaMap[rakName].shelves[product.shelf - 1].push({ ...product });
            }
          });
        });

        const newGondolas = Object.values(gondolaMap).map(g => {
          // Find max shelf used
          let maxShelf = 4;
          g.shelves.forEach((s, idx) => {
            if (s.length > 0) maxShelf = Math.max(maxShelf, idx + 1);
          });
          return {
            ...g,
            settings: { ...g.settings, shelfCount: maxShelf },
            shelves: g.shelves.slice(0, maxShelf).map(s => s.sort((a, b) => (a.slot || 999) - (b.slot || 999)))
          };
        });

        if (newGondolas.length === 0) {
          toast.error("No valid data found in Excel");
          return;
        }

        setState({
          products: newProducts,
          gondolas: newGondolas,
          activeGondolaId: newGondolas[0].id
        });
        setActiveTab('rak');
        toast.success(`Imported ${newGondolas.length} Raks successfully`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#F2F2F7] text-foreground selection:bg-primary/20 font-sans antialiased overflow-hidden">
      <Toaster position="top-right" theme="light" expand={true} richColors />
      
      <header className="h-16 glass flex items-center justify-between px-3 md:px-8 shrink-0 z-40 sticky top-0 border-b border-white/20">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer overflow-hidden">
            <div className="flex flex-col overflow-hidden">
              <h1 className="font-bold text-sm md:text-lg tracking-tight leading-none truncate uppercase">PLANOGRAM ASSISTANT</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                  ACTIVE: {activeGondola.settings.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setActiveTab('products');
            setIsFormOpen(true);
            setIsSidebarOpen(true);
          }}
          className="h-9 px-2 md:px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] md:text-xs"
        >
          <Plus size={14} className="md:mr-2" /> 
          <span className="hidden md:inline">Add Product</span>
          <span className="md:hidden ml-1">Add</span>
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden relative p-2 md:p-4 gap-2 md:gap-4">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        <div className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-500 transform md:translate-x-0 w-[85%] max-w-[320px] md:w-80 h-full md:h-full shadow-2xl md:shadow-none p-2 md:p-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
        )}>
          <Sidebar 
            products={state.products}
            selectedProductId={selectedProductId}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={activeGondola.settings}
            onUpdateSettings={handleUpdateSettings}
            onUpdateProduct={handleUpdateProduct}
            onExportExcel={handleExportExcel}
            onImportExcel={handleImportExcel}
            onCloseMobile={() => setIsSidebarOpen(false)}
            gondolas={state.gondolas}
            activeGondolaId={state.activeGondolaId}
            onSelectGondola={(id) => setState(prev => ({ ...prev, activeGondolaId: id }))}
            onAddGondola={handleAddGondola}
            onRemoveGondola={handleRemoveGondola}
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
          />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <PlanogramCanvas 
            shelves={activeGondola.shelves}
            settings={activeGondola.settings}
            selectedProductId={selectedProductId}
            onPlaceProduct={handlePlaceProduct}
            onRemoveFromShelf={handleRemoveFromShelf}
            products={state.products}
            onUpdateProduct={handleUpdateProduct}
          />
        </div>
      </div>
    </div>
  );
}


const Separator = ({ orientation = 'vertical', className = '' }: { orientation?: 'vertical' | 'horizontal', className?: string }) => (
  <div className={cn(
    orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full',
    'bg-border',
    className
  )} />
);


