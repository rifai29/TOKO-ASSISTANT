import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/PlanogramSidebar';
import { PlanogramCanvas } from './components/PlanogramCanvas';
import { Product, GondolaSettings, PlanogramState, Gondola } from './types';
import { Button } from '@/components/ui/button';
import { Menu, X as CloseIcon, Plus, FileSpreadsheet, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import ProductDetailPage from './pages/ProductDetailPage';

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

function MainLayout({ 
  state, 
  setState, 
  handleImportExcel, 
  handleExportExcel, 
  handleAddProduct, 
  handleRemoveProduct, 
  handleUpdateProduct, 
  handleUpdateSettings, 
  handlePlaceProduct, 
  handleRemoveFromShelf, 
  handleSelectGondola, 
  handleAddGondola, 
  handleRemoveGondola,
  selectedProductId,
  setSelectedProductId,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  isFormOpen,
  setIsFormOpen
}: any) {
  const activeGondola = state.gondolas.find((g: any) => g.id === state.activeGondolaId) || state.gondolas[0];

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#F8F9FA] text-foreground selection:bg-primary/20 font-sans antialiased overflow-hidden">
      
      <header className="h-14 md:h-16 bg-white flex items-center justify-between px-3 md:px-8 shrink-0 z-40 sticky top-0 border-b border-gray-100">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-gray-600 hover:bg-gray-100 shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
          </Button>
          <div className="flex flex-col">
            <h2 className="text-xs md:text-sm font-display font-black text-gray-900 uppercase tracking-tight whitespace-nowrap">
              {activeGondola?.settings?.name || '---'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="relative">
            <input 
              type="file" 
              id="excel-import-header" 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportExcel(file);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById('excel-import-header')?.click()}
              className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-blue-600 hover:bg-blue-50 shrink-0 border-none flex items-center justify-center p-0 transition-all active:scale-95 shadow-none"
              title="Import Excel"
            >
              <Upload size={18} className="md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportExcel}
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-green-600 hover:bg-green-50 shrink-0 border-none flex items-center justify-center p-0 transition-all active:scale-95 shadow-none"
            title="Export Excel"
          >
            <FileSpreadsheet size={18} className="md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActiveTab('products');
              setIsFormOpen(true);
              setIsSidebarOpen(true);
            }}
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-black hover:bg-gray-100 shrink-0 border-none flex items-center justify-center p-0 transition-all active:scale-95 shadow-none"
            title="Add Product"
          >
            <Plus size={22} className="md:w-[24px] md:h-[24px]" strokeWidth={3} />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative p-0 md:p-1 gap-1">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        <div className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 transition-all duration-500 transform w-[60%] md:w-80 h-full bg-white md:bg-transparent",
          isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full md:w-0 opacity-0 md:pointer-events-none"
        )}>
          <Sidebar 
            products={state.products}
            selectedProductId={selectedProductId}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onSelectProduct={(id: string) => {
              setSelectedProductId(id);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={activeGondola.settings}
            onUpdateSettings={handleUpdateSettings}
            onUpdateProduct={handleUpdateProduct}
            onCloseMobile={() => setIsSidebarOpen(false)}
            gondolas={state.gondolas}
            activeGondolaId={state.activeGondolaId}
            onSelectGondola={handleSelectGondola}
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
            lastUpdated={activeGondola.lastUpdated}
          />
        </div>
      </div>
    </div>
  );
}

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
      ],
      lastUpdated: new Date().toLocaleString('id-ID')
    };

    return {
      products: INITIAL_PRODUCTS,
      gondolas: [initialGondola],
      activeGondolaId: 'g1'
    };
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('planogram_state_v9', JSON.stringify(state));
  }, [state]);

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
        return { 
          ...g, 
          shelves: newShelves,
          lastUpdated: new Date().toLocaleString('id-ID')
        };
      });
      
      return {
        ...prev,
        products: newProducts,
        gondolas: newGondolas,
        activeGondolaId: targetGondolaId
      };
    });
  };

  const handleRemoveProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
      gondolas: prev.gondolas.map(g => ({
        ...g,
        shelves: g.shelves.map(shelf => shelf.filter(p => p.id !== id)),
        lastUpdated: new Date().toLocaleString('id-ID')
      }))
    }));
    if (selectedProductId === id) setSelectedProductId(null);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    const isMetadataOnly = Object.keys(updates).every(key => ['expiryDate', 'lastChecked'].includes(key));
    
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p),
      gondolas: prev.gondolas.map(g => ({
        ...g,
        shelves: g.shelves.map(shelf => shelf.map(p => p.id === id ? { ...p, ...updates } : p)),
        lastUpdated: isMetadataOnly ? g.lastUpdated : new Date().toLocaleString('id-ID')
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
        return { 
          ...g, 
          settings, 
          shelves: newShelves,
          lastUpdated: new Date().toLocaleString('id-ID')
        };
      });
      return { ...prev, gondolas: newGondolas };
    });
  };

  const handlePlaceProduct = (shelfIdx: number) => {
    if (!selectedProductId) return;
    const product = state.products.find(p => p.id === selectedProductId);
    if (!product) return;

    setState(prev => {
      const newGondolas = prev.gondolas.map(g => {
        if (g.id !== prev.activeGondolaId) return g;
        const newShelves = [...g.shelves];
        newShelves[shelfIdx] = [...newShelves[shelfIdx], { ...product }];
        return { 
          ...g, 
          shelves: newShelves,
          lastUpdated: new Date().toLocaleString('id-ID')
        };
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
        return { 
          ...g, 
          shelves: newShelves,
          lastUpdated: new Date().toLocaleString('id-ID')
        };
      });
      return { ...prev, gondolas: newGondolas };
    });
  };

  const handleAddGondola = (name?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newGondola: Gondola = {
      id,
      settings: { ...INITIAL_SETTINGS, name: name || `NEW RAK ${state.gondolas.length + 1}` },
      shelves: Array.from({ length: INITIAL_SETTINGS.shelfCount }, () => []),
      lastUpdated: new Date().toLocaleString('id-ID')
    };
    setState(prev => ({
      ...prev,
      gondolas: [...prev.gondolas, newGondola],
      activeGondolaId: id
    }));
  };

  const handleRemoveGondola = (id: string) => {
    if (state.gondolas.length <= 1) return;
    setState(prev => {
      const newGondolas = prev.gondolas.filter(g => g.id !== id);
      const newActiveId = prev.activeGondolaId === id ? newGondolas[0].id : prev.activeGondolaId;
      return { ...prev, gondolas: newGondolas, activeGondolaId: newActiveId };
    });
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const formatImageForExcel = (img?: string) => {
      if (!img) return '';
      if (img.startsWith('data:image') && img.length > 30000) return '[Base64 Image - Too large for Excel]';
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
      const safeName = (g.settings.name || 'Rak').substring(0, 31).replace(/[\[\]\*\?\/\\]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });
    XLSX.writeFile(wb, `Planogram_Full.xlsx`);
  };

  const handleImportExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const newProducts: Product[] = [];
        const gondolaMap: Record<string, Gondola> = {};
        const getVal = (obj: any, keys: string[]) => {
          const foundKey = Object.keys(obj).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
          return foundKey ? obj[foundKey] : undefined;
        };
        workbook.SheetNames.forEach((sheetName, sIdx) => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return;
          const json = XLSX.utils.sheet_to_json(worksheet) as any[];
          if (json.length === 0) return;
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
            const category = String(getVal(item, ['Kategori', 'Category']) || INITIAL_SETTINGS.category);
            gondolaMap[rakName].settings.category = category;
            let imageUrl = getVal(item, ['Image URL', 'Foto', 'Gambar']);
            const shelfNum = Number(getVal(item, ['Selving', 'Shelf', 'Rak Nomor'])) || undefined;
            const slotNum = Number(getVal(item, ['Baris', 'Slot', 'Posisi'])) || undefined;
            const product: Product = {
              id: Math.random().toString(36).substr(2, 9) + index + sIdx,
              name: String(productName || 'Unnamed Product'),
              sku: String(sku || ''),
              plu: String(getVal(item, ['PLU']) || ''),
              facing: Number(getVal(item, ['Facing', 'Lebar'])) || 1,
              rh: Number(getVal(item, ['RH', 'Retur'])) || 0,
              image: imageUrl ? String(imageUrl).trim() : undefined,
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
          let maxShelf = 4;
          g.shelves.forEach((s, idx) => { if (s.length > 0) maxShelf = Math.max(maxShelf, idx + 1); });
          return {
            ...g,
            settings: { ...g.settings, shelfCount: maxShelf },
            shelves: g.shelves.slice(0, maxShelf).map(s => s.sort((a: any, b: any) => (a.slot || 999) - (b.slot || 999)))
          };
        });
        if (newGondolas.length === 0) return;
        setState({ products: newProducts, gondolas: newGondolas, activeGondolaId: newGondolas[0].id });
        setActiveTab('rak');
      } catch (error) { console.error("Import error:", error); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout 
              state={state}
              setState={setState}
              handleImportExcel={handleImportExcel}
              handleExportExcel={handleExportExcel}
              handleAddProduct={handleAddProduct}
              handleRemoveProduct={handleRemoveProduct}
              handleUpdateProduct={handleUpdateProduct}
              handleUpdateSettings={handleUpdateSettings}
              handlePlaceProduct={handlePlaceProduct}
              handleRemoveFromShelf={handleRemoveFromShelf}
              handleSelectGondola={(id: string) => setState(prev => ({ ...prev, activeGondolaId: id }))}
              handleAddGondola={handleAddGondola}
              handleRemoveGondola={handleRemoveGondola}
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isFormOpen={isFormOpen}
              setIsFormOpen={setIsFormOpen}
            />
          } 
        />
        <Route 
          path="/product/:productId" 
          element={
            <ProductDetailPage 
              products={state.products} 
              onUpdateProduct={handleUpdateProduct}
              gondolas={state.gondolas}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}



const Separator = ({ orientation = 'vertical', className = '' }: { orientation?: 'vertical' | 'horizontal', className?: string }) => (
  <div className={cn(
    orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full',
    'bg-border',
    className
  )} />
);


