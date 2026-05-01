import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Package, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
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

  const productIndex = products.findIndex(p => p.id === productId);
  const product = products[productIndex];
  const prevProductId = productIndex > 0 ? products[productIndex - 1].id : null;
  const nextProductId = productIndex < products.length - 1 ? products[productIndex + 1].id : null;

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

  // Find where the product is on the shelf
  let locationInfo = { shelfIdx: -1, slotIdx: -1 };
  gondolas.forEach(g => {
    g.shelves.forEach((shelf: Product[], sIdx: number) => {
      const pIdx = shelf.findIndex(p => p.id === product.id);
      if (pIdx !== -1) {
        locationInfo = { shelfIdx: sIdx, slotIdx: pIdx };
      }
    });
  });

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
        <h1 className="text-base font-bold truncate flex-1">{product.name}</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-4 pb-4 pt-4 md:px-12 md:pb-12 md:pt-8 max-w-lg md:max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-16 md:items-start"
        >
          {/* Image Section */}
          <div className="md:col-span-5 lg:col-span-4 aspect-square flex items-start justify-center pt-4 pb-4 px-8 relative overflow-hidden group">
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4 z-10 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 transition-all pointer-events-auto hover:bg-white active:scale-90",
                  !prevProductId && "opacity-0 pointer-events-none"
                )}
                onClick={() => prevProductId && navigate(`/product/${prevProductId}`)}
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 transition-all pointer-events-auto hover:bg-white active:scale-90",
                  !nextProductId && "opacity-0 pointer-events-none"
                )}
                onClick={() => nextProductId && navigate(`/product/${nextProductId}`)}
              >
                <ChevronRight size={24} className="text-gray-700" />
              </Button>
            </div>

            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-500 group-hover:scale-105" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-primary/30">
                <Package size={64} strokeWidth={1.5} />
                <span className="text-xl font-black uppercase tracking-widest">{product.name.substring(0, 1)}</span>
              </div>
            )}
          </div>

          <div className="md:col-span-7 lg:col-span-8 space-y-3 md:space-y-4">
            <div className="flex flex-col gap-1 px-1">
              <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Identitas Produk</span>
              <div className="flex flex-wrap items-center gap-4 p-4 md:p-5 bg-white rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                      <span className="text-base md:text-xl font-black text-gray-900 tracking-tight">
                        {locationInfo.shelfIdx + 1}<span className="text-gray-300 mx-0.5">-</span>{locationInfo.slotIdx + 1}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center gap-6 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase leading-none mb-1.5">PLU & SKU</span>
                        <div className="flex items-center gap-3 text-sm md:text-base font-black text-gray-800">
                          <span>{product.plu || '-'}</span>
                          <span className="text-gray-200 text-lg">/</span>
                          <span className="truncate">{product.sku || '-'}</span>
                        </div>
                      </div>
                      <div className="ml-auto pl-4 border-l border-gray-200 flex flex-col items-end">
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase leading-none mb-1.5">RH</span>
                        <span className="text-base md:text-xl font-black text-primary">{product.rh || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              
              <div className="px-1">
                <div className="bg-amber-50 border border-amber-100/50 rounded-[2rem] p-4 md:p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase">Target Retur</p>
                    <p className="text-lg md:text-2xl font-black text-amber-700">
                      {product.expiryDate ? (() => {
                      try {
                        const exp = parse(product.expiryDate, 'dd/MM/yyyy', new Date());
                        const target = new Date(exp.getTime() - (product.rh || 0) * 24 * 60 * 60 * 1000);
                        return format(target, 'dd/MM/yy');
                      } catch (e) {
                        return '-';
                      }
                    })() : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Expiry Date Picker Wrapper */}
              <div className="relative" ref={calendarRef}>
                <Label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-1 block">Tanggal Kedaluwarsa</Label>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between transition-all active:scale-[0.99]"
                >
                  <span className={cn("text-sm font-bold", !product.expiryDate && "text-gray-400")}>
                    {product.expiryDate || 'Pilih Tanggal...'}
                  </span>
                  <CalendarIcon size={18} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {isCalendarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 4, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full z-[120] bg-white rounded-2xl p-4 origin-top border border-gray-100"
                    >
                      <style>{`
                        .rdp {
                          margin: 0;
                          --rdp-cell-size: 40px;
                          --rdp-accent-color: #f97316;
                          --rdp-background-color: #fff7ed;
                        }
                        .rdp-months { justify-content: center; }
                        .rdp-button { border-radius: 10px !important; }
                        .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 700 !important; }
                        .rdp-caption_label { font-size: 14px; font-weight: 800; }
                      `}</style>
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
                        className="mx-auto"
                        components={{
                          Chevron: ({ orientation }) => orientation === 'left' 
                            ? <ChevronLeft size={20} /> 
                            : <ChevronRight size={20} />,
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Footer */}
              <div className="pt-2">
                <div className="flex flex-col md:flex-row md:items-stretch gap-3">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="bg-orange-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[100px]">
                      <p className="text-[10px] font-bold text-orange-600 uppercase">Exp Date</p>
                      <p className="text-sm font-black text-orange-700">{product.expiryDate || '-'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center min-w-[120px]">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Terakhir Cek</p>
                      <p className="text-[11px] font-black text-blue-700 leading-tight">{product.lastChecked || '-'}</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full md:w-auto md:px-8 h-14 md:h-auto rounded-2xl bg-primary text-white hover:bg-primary/90 text-sm font-black flex items-center justify-center gap-3 border-none transition-all active:scale-95"
                    onClick={() => {
                      const now = new Date().toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      onUpdateProduct(product.id, { lastChecked: now });
                    }}
                  >
                    <Check size={20} strokeWidth={3} />
                    <span className="md:max-w-[100px] md:leading-tight">KONFIRMASI CEK</span>
                  </Button>
                </div>
              </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
}
