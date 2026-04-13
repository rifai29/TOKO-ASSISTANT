import React from 'react';
import { Product, GondolaSettings, SHELF_LEVELS } from '../types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProductDetailModal } from './ProductDetailModal';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import Barcode from 'react-barcode';

interface CanvasProps {
  shelves: Product[][];
  settings: GondolaSettings;
  selectedProductId: string | null;
  onPlaceProduct: (shelfIdx: number) => void;
  onRemoveFromShelf: (shelfIdx: number, slotIdx: number) => void;
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

export const PlanogramCanvas: React.FC<CanvasProps> = ({
  shelves,
  settings,
  selectedProductId,
  onPlaceProduct,
  onRemoveFromShelf,
  products,
  onUpdateProduct
}) => {
  const [detailInfo, setDetailInfo] = React.useState<{ product: Product, si: number, pi: number } | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const totalFacing = shelves.flat().reduce((acc, p) => acc + p.facing, 0);

  return (
    <div className="flex-1 h-full p-3 md:p-8 overflow-auto relative custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-gray-200 pb-4 md:pb-8 gap-3 md:gap-4 print:hidden">
          <div className="space-y-1 w-full md:w-auto">
            <h2 className="text-xl md:text-4xl font-bold tracking-tight text-gray-900 break-words line-clamp-2 leading-tight">{settings.name}</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-sm font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md">{settings.category}</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300" />
              <span className="bg-gray-100 px-2 py-0.5 rounded-md">{settings.store || 'No Store'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-2 mt-1 md:mt-0">
            <div className="flex items-center gap-2">
              <div className="hidden md:block w-px h-8 bg-gray-200 mx-1 md:mx-2" />
              <div className="text-right shrink-0">
                <p className="text-2xl md:text-5xl font-bold tracking-tighter text-primary leading-none">{totalFacing}</p>
                <p className="text-[8px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 md:mt-1">Total Units</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={canvasRef}
          className="bg-white/70 backdrop-blur-sm rounded-[1.2rem] md:rounded-[2.5rem] ios-shadow p-3 md:p-10 relative overflow-hidden border border-white print:shadow-none print:border-none print:bg-white"
        >
          <div className="flex items-center justify-between mb-4 md:mb-12">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 h-5 md:w-1.5 md:h-8 bg-primary rounded-full" />
              <div>
                <h3 className="font-bold text-base md:text-xl tracking-tight">Gondola Layout</h3>
                <p className="text-[9px] md:text-xs text-gray-400 font-medium tracking-wide">Interactive Schematic</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {Array.from({ length: settings.shelfCount }).map((_, si) => {
              const shelf = shelves[si] || [];
              const levelName = SHELF_LEVELS[si] || `Selving ${si + 1}`;
              
              return (
                <div key={si} className="flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-8 group">
                  <div className="w-full md:w-24 shrink-0 text-left md:text-right pb-0 md:pb-4">
                    <p className="text-[9px] md:text-[11px] font-bold text-gray-400 group-hover:text-primary transition-colors uppercase tracking-widest">
                      {levelName}
                    </p>
                  </div>
                  
                  <div className="w-full relative overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex items-end gap-2 md:gap-3 min-h-[120px] md:min-h-[140px] px-2 md:px-6 w-max">
                      <AnimatePresence mode="popLayout">
                        {shelf.map((p, pi) => (
                          <motion.div
                            key={`${si}-${pi}-${p.id}`}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="relative group/product cursor-pointer"
                          >
                            <div 
                              onClick={() => setDetailInfo({ product: p, si, pi })}
                              className={cn(
                                "rounded-xl shadow-lg flex flex-col items-center justify-center p-2 md:p-3 text-center transition-all border border-white/20 overflow-hidden relative",
                                p.facing >= 3 ? "w-24 md:w-32" : p.facing >= 2 ? "w-20 md:w-24" : "w-14 md:w-16",
                                !p.image && "bg-primary/20"
                              )}
                              style={{ 
                                height: `${window.innerWidth < 768 ? 80 + (settings.shelfCount - si) * 5 : 100 + (settings.shelfCount - si) * 8}px`,
                                backgroundImage: p.image ? 'none' : 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)'
                              }}
                            >
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] font-bold text-primary leading-tight drop-shadow-sm relative z-10">
                                  {p.name}
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/0 group-hover/product:bg-black/10 transition-colors" />
                              
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/product:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg ios-shadow">
                                  <Maximize2 size={14} className="text-primary" />
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={(e) => { e.stopPropagation(); onRemoveFromShelf(si, pi); }}
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 md:w-7 md:h-7 bg-white text-red-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover/product:opacity-100 transition-all ios-shadow border border-gray-100 scale-90 md:scale-75 group-hover/product:scale-100 z-30 hover:bg-red-50"
                            >
                              <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                            </button>

                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                              F:{p.facing}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPlaceProduct(si)}
                        className={cn(
                          "w-14 md:w-16 h-20 md:h-24 border-2 border-dashed rounded-xl flex items-center justify-center transition-all shrink-0",
                          selectedProductId 
                            ? "border-primary/40 bg-primary/5 text-primary animate-pulse" 
                            : "border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400"
                        )}
                      >
                        <Plus size={20} className="md:w-[24px] md:h-[24px]" strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ProductDetailModal 
        product={detailInfo?.product || null} 
        shelfIdx={detailInfo?.si ?? 0}
        slotIdx={detailInfo?.pi ?? 0}
        onClose={() => setDetailInfo(null)} 
        onUpdateProduct={onUpdateProduct}
      />
    </div>
  );
};

