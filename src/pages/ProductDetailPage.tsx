import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Package, Calendar as CalendarIcon, Check, ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';
import { id } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface ProductDetailPageProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  gondolas: any[]; // Using any for simplicity in this context, but ideally Gondola[]
}

export default function ProductDetailPage({ products, onUpdateProduct, gondolas }: ProductDetailPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const product = products.find(p => p.id === productId);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F2F2F7]">
        <p className="text-gray-500 mb-4">Produk tidak ditemukan</p>
        <Button onClick={() => navigate('/')}>Kembali ke Planogram</Button>
      </div>
    );
  }

  // Find location info for active product and its parent gondola
  const activeGondola = gondolas.find(g => 
    g.shelves.some((shelf: Product[]) => shelf.some(p => p.id === product.id))
  );

  // Get all unique products in the same gondola 
  // We use a Map to ensure unique products by ID
  const siblingProductsMap = new Map<string, Product>();
  if (activeGondola) {
    activeGondola.shelves.forEach((shelf: Product[]) => {
      shelf.forEach(p => {
        if (!siblingProductsMap.has(p.id)) {
          siblingProductsMap.set(p.id, p);
        }
      });
    });
  }
  
  const siblingProducts = Array.from(siblingProductsMap.values());
  if (siblingProducts.length === 0) siblingProducts.push(product);

  const siblingIndex = siblingProducts.findIndex(p => p.id === product.id);
  const visibleProductCount = 10;
  const startIdx = Math.max(0, Math.min(siblingIndex - 5, Math.max(0, siblingProducts.length - visibleProductCount)));
  const productsToShow = siblingProducts.slice(startIdx, Math.min(startIdx + visibleProductCount, siblingProducts.length));
  
  // Find specific coordinates in the current gondola for display labels
  let activeLoc = { shelfIdx: -1, slotIdx: -1 };
  if (activeGondola) {
    activeGondola.shelves.forEach((shelf: Product[], sIdx: number) => {
      const foundIdx = shelf.findIndex(prod => prod.id === product.id);
      if (foundIdx !== -1) activeLoc = { shelfIdx: sIdx, slotIdx: foundIdx };
    });
  }

  const currentExpiryDate = product.expiryDate 
    ? parse(product.expiryDate, 'dd/MM/yyyy', new Date())
    : undefined;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 px-4 h-14 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-base font-bold truncate flex-1">
          Detail Produk
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto flex flex-col max-w-6xl mx-auto w-full">
        {/* Top Section: Horizontal Scrollable Cards */}
        <div className="px-4 pt-0 pb-0 relative group">
          <div className="relative flex items-center">
            <div className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth flex flex-row gap-6 px-4 pt-4 pb-4">
              {productsToShow.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className={cn(
                    "flex-shrink-0 w-40 h-40 md:w-64 md:h-64 aspect-square bg-white border-0 border-none rounded-2xl flex items-center justify-center p-0 relative overflow-hidden transition-all duration-500 outline-none",
                    product.id === p.id 
                      ? "z-10 shadow-lg" 
                      : "opacity-30 hover:opacity-100"
                  )}
                >
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className={cn(
                        "w-full h-full object-contain transition-all duration-700",
                        product.id !== p.id && "grayscale"
                      )}
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-primary/30">
                      <Package size={32} strokeWidth={1.5} />
                      <span className="text-xs font-black uppercase tracking-widest">{p.name.substring(0, 1)}</span>
                    </div>
                  )}

                  {/* Indicators Badge Container */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[11]">
                    {/* SO Indicator */}
                    {p.soChecked && (
                      <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <span className="text-[7px] font-black leading-none">SO</span>
                      </div>
                    )}
                    {/* EXP Indicator */}
                    {p.lastChecked && (
                      <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <span className="text-[7px] font-black leading-none">EXP</span>
                      </div>
                    )}
                    {/* Kerapian Indicator */}
                    {p.tidyChecked && (
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <span className="text-[7px] font-black leading-none">RP</span>
                      </div>
                    )}
                    {/* Harga Indicator */}
                    {p.priceChecked && (
                      <div className="w-5 h-5 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <span className="text-[7px] font-black leading-none">HR</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Information Section */}
        <div className="px-4 pb-12 pt-0">
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 px-4 md:px-8"
          >
            {/* Title & Badge */}
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-black text-gray-900 leading-tight tracking-tighter px-2">
                {product.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Identity Column */}
              <div className="md:col-span-7 space-y-4">
                {/* Technical Information Dotted List */}
                <div className="space-y-4 px-2">
                  {[
                    { label: 'Baris', value: String(activeLoc.shelfIdx + 1).padStart(2, '0') },
                    { label: 'Selving', value: String(activeLoc.slotIdx + 1).padStart(2, '0') },
                    { label: 'Barcode/PLU', value: product.plu || '-' },
                    { label: 'Internal SKU', value: product.sku || '-' },
                    { label: 'RH', value: String(product.rh || '0') },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-end gap-2 group">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex-shrink-0">
                        {item.label}
                      </span>
                      <div className="flex-1 border-b-2 border-dotted border-gray-200 mb-1 group-hover:border-primary/30 transition-colors"></div>
                      <span className="text-sm font-black text-gray-900 tracking-tight tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Expiry Column */}
              <div className="md:col-span-5 space-y-6">
                {/* Expiry Picker & Confirmation Column */}
                <div className="space-y-4">
                  <div className="space-y-6">
                    {/* Expiry Picker Row */}
                    <div className="relative" ref={calendarRef}>
                      <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="w-full h-14 px-5 bg-gray-50 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] hover:bg-white border border-transparent hover:border-gray-100 shadow-sm"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tanggal Kedaluwarsa</span>
                          <span className={cn("text-base font-black tracking-tight", !product.expiryDate && "text-gray-300")}>
                            {product.expiryDate || 'Pilih Tanggal...'}
                          </span>
                        </div>
                        <CalendarIcon size={18} className="text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {isCalendarOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 bottom-full mb-4 z-[120] bg-white rounded-3xl p-4 origin-bottom-left border border-gray-100 shadow-2xl shadow-black/10 w-[310px]"
                          >
                            <div className="flex flex-col items-center">
                              <DayPicker
                                mode="single"
                                selected={currentExpiryDate}
                                onSelect={(date) => {
                                  if (date) {
                                    onUpdateProduct(product.id, { expiryDate: format(date, 'dd/MM/yyyy') });
                                    setIsCalendarOpen(false);
                                  }
                                }}
                                locale={id}
                                className="m-0"
                                showOutsideDays
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Button 
                          className={cn(
                            "w-full h-12 rounded-2xl flex items-center justify-center border-none transition-all active:scale-95 shadow-lg text-[11px] font-black",
                            product.lastChecked 
                              ? "bg-primary text-white shadow-primary/30" 
                              : "bg-gray-100 text-gray-400"
                          )}
                          onClick={() => {
                            const now = new Date().toLocaleString('id-ID', { 
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            });
                            onUpdateProduct(product.id, { lastChecked: product.lastChecked ? undefined : now });
                          }}
                        >
                          EXP
                        </Button>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight">Produk</span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Button 
                          className={cn(
                            "w-full h-12 rounded-2xl flex items-center justify-center border-none transition-all active:scale-95 shadow-lg text-[11px] font-black",
                            activeGondola?.shelves[activeLoc.shelfIdx]?.every((p: any) => p.tidyChecked)
                              ? "bg-green-500 text-white shadow-green-500/30"
                              : "bg-gray-100 text-gray-400"
                          )}
                          onClick={() => {
                            if (!activeGondola || activeLoc.shelfIdx === -1) return;
                            const currentShelf = activeGondola.shelves[activeLoc.shelfIdx];
                            const anyMissing = currentShelf.some((p: any) => !p.tidyChecked);
                            currentShelf.forEach((p: any) => {
                              onUpdateProduct(p.id, { tidyChecked: anyMissing ? true : false });
                            });
                          }}
                        >
                          RP
                        </Button>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight">Selving</span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Button 
                          className={cn(
                            "w-full h-12 rounded-2xl flex items-center justify-center border-none transition-all active:scale-95 shadow-lg text-[11px] font-black",
                            activeGondola?.shelves.flat().every((p: any) => p.priceChecked)
                              ? "bg-yellow-500 text-gray-900 shadow-yellow-500/30"
                              : "bg-gray-100 text-gray-400"
                          )}
                          onClick={() => {
                            if (!activeGondola) return;
                            const allProducts = activeGondola.shelves.flat();
                            const anyMissing = allProducts.some((p: any) => !p.priceChecked);
                            allProducts.forEach((p: any) => {
                              onUpdateProduct(p.id, { priceChecked: anyMissing ? true : false });
                            });
                          }}
                        >
                          HR
                        </Button>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight">Rak</span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Button 
                          className={cn(
                            "w-full h-12 rounded-2xl flex items-center justify-center border-none transition-all active:scale-95 shadow-xl text-[11px] font-black uppercase",
                            activeGondola?.shelves.flat().every((p: any) => p.soChecked)
                              ? "bg-orange-500 text-white shadow-orange-500/30"
                              : "bg-gray-100 text-gray-400"
                          )}
                          onClick={() => {
                            if (!activeGondola) return;
                            const allProducts = activeGondola.shelves.flat();
                            const anyMissing = allProducts.some((p: any) => !p.soChecked);
                            const now = new Date().toLocaleString('id-ID', { 
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            });
                            
                            allProducts.forEach((p: any) => {
                              onUpdateProduct(p.id, { soChecked: anyMissing ? now : null });
                            });
                          }}
                        >
                          SO
                        </Button>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight">Semua</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      {product.lastChecked ? `Terakhir: ${product.lastChecked}` : 'Belum dicek'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
