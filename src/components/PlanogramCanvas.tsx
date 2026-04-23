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
    <div className="flex-1 h-full p-2 md:p-4 overflow-auto relative custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-0.5 md:space-y-2 relative z-10">
        <div 
          ref={canvasRef}
          className="bg-white/70 backdrop-blur-sm rounded-[1.2rem] md:rounded-[2.5rem] p-1 md:p-2 relative overflow-hidden print:shadow-none print:border-none print:bg-white"
        >
          <div className="space-y-1 md:space-y-2">
            {Array.from({ length: settings.shelfCount }).map((_, si) => {
              const shelf = shelves[si] || [];
              const levelName = SHELF_LEVELS[si] || `Selving ${si + 1}`;
              
              return (
                <div 
                  key={si} 
                  className="w-full relative overflow-x-auto pb-1 md:pb-2 custom-scrollbar group"
                  onClick={() => selectedProductId && onPlaceProduct(si)}
                >
                  <div className={cn(
                    "flex items-end gap-1 md:gap-2 min-h-[160px] md:min-h-[200px] px-2 md:px-4 pt-2 w-max transition-all rounded-xl",
                    selectedProductId && "bg-primary/5 cursor-pointer hover:bg-primary/10 ring-2 ring-primary/20 ring-inset"
                  )}>
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
                              onClick={(e) => { e.stopPropagation(); setDetailInfo({ product: p, si, pi }); }}
                              className={cn(
                                "rounded-xl flex flex-col items-center justify-center p-2 md:p-3 text-center transition-all overflow-hidden relative",
                                p.facing >= 3 ? "w-24 md:w-32" : p.facing >= 2 ? "w-20 md:w-24" : "w-14 md:w-16",
                                !p.image && "bg-primary/20",
                                selectedProductId === p.id && "ring-2 ring-primary ring-inset bg-primary/5"
                              )}
                              style={{ 
                                height: `${window.innerWidth < 768 ? 140 + (settings.shelfCount - si) * 5 : 180 + (settings.shelfCount - si) * 8}px`,
                                backgroundImage: p.image ? 'none' : 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)'
                              }}
                            >
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] font-bold text-primary leading-tight relative z-10">
                                  {p.name}
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/0 group-hover/product:bg-black/10 transition-colors" />
                              
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/product:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg">
                                  <Maximize2 size={14} className="text-primary" />
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={(e) => { e.stopPropagation(); onRemoveFromShelf(si, pi); }}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover/product:opacity-100 transition-all z-30 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "w-14 h-24 md:h-32 rounded-xl flex items-center justify-center shrink-0 transition-all border-2 border-dashed",
                          selectedProductId 
                            ? "border-primary bg-primary/20 text-primary animate-pulse cursor-pointer shadow-md ring-4 ring-primary/10" 
                            : "border-gray-200 bg-gray-100/30 text-black hover:border-gray-300 hover:bg-gray-100/50"
                        )}
                        onClick={() => selectedProductId && onPlaceProduct(si)}
                      >
                        <Plus size={36} strokeWidth={4} />
                      </motion.div>
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

