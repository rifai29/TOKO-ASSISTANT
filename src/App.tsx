import { useState, useEffect } from 'react';
import { Sidebar } from './components/PlanogramSidebar';
import { PlanogramCanvas } from './components/PlanogramCanvas';
import { Product, GondolaSettings, PlanogramState } from './types';
import { Button } from '@/components/ui/button';
import { Download, Printer, RotateCcw, LayoutGrid, Zap, Menu, X as CloseIcon } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_SETTINGS: GondolaSettings = {
  name: "Gondola A – Beverages",
  store: "Main Street Market",
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
  { id: '1', name: 'Aqua 600ml', sku: 'AQU001', plu: 'Aqua', color: '#378ADD', facing: 2, rh: 30 },
  { id: '2', name: 'Teh Botol Sosro', sku: 'TBS002', plu: 'Sosro', color: '#D85A30', facing: 2, rh: 30 },
  { id: '3', name: 'Pocari Sweat', sku: 'POC003', plu: 'Otsuka', color: '#4d9de0', facing: 1, rh: 30 },
  { id: '4', name: 'Indomilk UHT', sku: 'IND004', plu: 'Indomilk', color: '#1D9E75', facing: 2, rh: 30 },
  { id: '5', name: 'Sprite 500ml', sku: 'SPR005', plu: 'Coca-Cola', color: '#639922', facing: 1, rh: 30 },
];

export default function App() {
  const [state, setState] = useState<PlanogramState>(() => {
    const saved = localStorage.getItem('planogram_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      products: INITIAL_PRODUCTS,
      shelves: Array.from({ length: 4 }, () => []),
      settings: INITIAL_SETTINGS
    };
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('planogram_state', JSON.stringify(state));
  }, [state]);

  const handleAddProduct = (p: Omit<Product, 'id'>) => {
    const product: Product = {
      ...p,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
    toast.success(`Product "${product.name}" added`);
  };

  const handleRemoveProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
      shelves: prev.shelves.map(shelf => shelf.filter(p => p.id !== id))
    }));
    if (selectedProductId === id) setSelectedProductId(null);
    toast.info("Product removed from catalog and shelves");
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p),
      shelves: prev.shelves.map(shelf => shelf.map(p => p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const handleUpdateSettings = (settings: GondolaSettings) => {
    setState(prev => {
      let newShelves = [...prev.shelves];
      if (settings.shelfCount > prev.settings.shelfCount) {
        const diff = settings.shelfCount - prev.settings.shelfCount;
        newShelves = [...newShelves, ...Array.from({ length: diff }, () => [])];
      } else if (settings.shelfCount < prev.settings.shelfCount) {
        newShelves = newShelves.slice(0, settings.shelfCount);
      }
      return { ...prev, settings, shelves: newShelves };
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
      const newShelves = [...prev.shelves];
      newShelves[shelfIdx] = [...newShelves[shelfIdx], { ...product }];
      return { ...prev, shelves: newShelves };
    });
  };

  const handleRemoveFromShelf = (shelfIdx: number, slotIdx: number) => {
    setState(prev => {
      const newShelves = [...prev.shelves];
      newShelves[shelfIdx] = newShelves[shelfIdx].filter((_, i) => i !== slotIdx);
      return { ...prev, shelves: newShelves };
    });
  };

  const handleClearShelves = () => {
    if (confirm("Are you sure you want to clear all products from the shelves?")) {
      setState(prev => ({
        ...prev,
        shelves: prev.shelves.map(() => [])
      }));
      toast.info("Shelves cleared");
    }
  };

  const handleFillDemo = () => {
    const demo = [
      [0, 1, 2, 3, 4],
      [1, 1, 0, 0, 3],
      [2, 2, 3, 3, 4],
      [0, 1, 1, 2, 3, 4],
    ];
    setState(prev => ({
      ...prev,
      shelves: demo.map(row => 
        row.map(i => prev.products[i] ? { ...prev.products[i] } : null).filter(Boolean) as Product[]
      ).slice(0, prev.settings.shelfCount)
    }));
    toast.success("Demo planogram loaded");
  };

  const handleExport = () => {
    const data = {
      planogram: state,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.settings.pogId || 'planogram'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported successfully");
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#F2F2F7] text-foreground selection:bg-primary/20 font-sans antialiased overflow-hidden">
      <Toaster position="top-right" theme="light" expand={true} richColors />
      
      {/* Header */}
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
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <LayoutGrid size={18} className="md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="font-bold text-sm md:text-lg tracking-tight leading-none truncate">Planogram <span className="text-primary">Studio</span></h1>
              <span className="hidden md:inline text-[10px] font-medium text-muted-foreground tracking-wide uppercase">Version 2.4</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <div className="hidden sm:flex items-center bg-muted/50 p-1 rounded-xl mr-1">
            <Button variant="ghost" size="sm" onClick={handleClearShelves} className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg">
              <RotateCcw size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFillDemo} className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg">
              <Zap size={14} />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden xs:flex h-8 md:h-9 px-2 md:px-4 text-[10px] md:text-[11px] font-semibold border-none bg-white hover:bg-gray-50 rounded-xl ios-shadow">
              <Printer size={14} className="md:mr-2" /> <span className="hidden md:inline">Print</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleExport} className="h-8 md:h-9 px-3 md:px-5 text-[10px] md:text-[11px] font-semibold rounded-xl shadow-lg shadow-primary/20">
              <Download size={14} className="md:mr-2" /> <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative p-2 md:p-4 gap-2 md:gap-4">
        {/* Mobile Sidebar Overlay */}
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

        {/* Sidebar with Mobile Support */}
        <div className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-500 transform md:translate-x-0 w-[300px] md:w-80 h-full shadow-2xl md:shadow-none",
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
            settings={state.settings}
            onUpdateSettings={handleUpdateSettings}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <PlanogramCanvas 
            shelves={state.shelves}
            settings={state.settings}
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


