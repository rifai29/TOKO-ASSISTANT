import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, GondolaSettings, SHELF_LEVELS } from '../types';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CanvasProps {
  shelves: Product[][];
  settings: GondolaSettings;
  selectedProductId: string | null;
  onPlaceProduct: (shelfIdx: number) => void;
  onRemoveFromShelf: (shelfIdx: number, slotIdx: number) => void;
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  lastUpdated?: string;
}

export const PlanogramCanvas: React.FC<CanvasProps> = ({
  shelves,
  settings,
  selectedProductId,
  onPlaceProduct,
  onRemoveFromShelf,
}) => {
  const navigate = useNavigate();
  const canvasRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 h-full overflow-auto relative custom-scrollbar bg-white">
      <div className="max-w-6xl mx-auto relative z-10 pt-16 pb-8 md:pt-20 px-2">
        <div 
          ref={canvasRef}
          className="relative print:shadow-none print:border-none"
        >

          <div className="space-y-0">
            {Array.from({ length: settings.shelfCount }).map((_, si) => {
              const shelf = shelves[si] || [];
              const isLastUsedShelf = shelves.slice(si + 1).every(s => !s || s.length === 0);
              const isShelfEmpty = shelf.length === 0;
              
              // Only show empty shelves if they are not trailing OR if we are in placement mode
              if (!selectedProductId && isShelfEmpty && isLastUsedShelf && si > 0) return null;
              
              return (
                <div 
                  key={si} 
                  className="w-full relative overflow-x-auto custom-scrollbar group"
                  onClick={() => selectedProductId && onPlaceProduct(si)}
                >
                  <div className={cn(
                    "flex items-end gap-1 md:gap-2 min-h-[100px] md:min-h-[130px] px-2 md:px-4 w-max transition-all",
                    selectedProductId && "bg-gray-100/50 cursor-pointer hover:bg-gray-100"
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
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/product/${p.id}`);
                              }}
                              className={cn(
                                "rounded-xl flex flex-col items-center justify-center p-0.5 md:p-1 text-center transition-all overflow-hidden relative shadow-sm border border-gray-100 bg-white",
                                p.facing >= 3 ? "w-24 md:w-32" : p.facing >= 2 ? "w-20 md:w-24" : "w-14 md:w-16",
                                "h-[100px] md:h-[130px]",
                                !p.image && "bg-primary",
                                selectedProductId === p.id && "ring-2 ring-blue-500"
                              )}
                            >
                              {p.image ? (
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="absolute inset-0 w-full h-full object-contain p-1" 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    const parent = img.parentElement;
                                    if (!parent) return;
                                    
                                    img.src = '';
                                    parent.classList.add('bg-primary');
                                    
                                    if (!parent.querySelector('.fallback-text')) {
                                      const span = document.createElement('span');
                                      span.className = "fallback-text text-[10px] font-bold text-white px-1 leading-tight relative z-10 break-words";
                                      span.innerText = p.name;
                                      parent.appendChild(span);
                                    }
                                    img.classList.add('hidden');
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-white px-1 leading-tight relative z-10 break-words">
                                  {p.name}
                                </span>
                              )}

                              <div className="absolute inset-0 group-hover/product:bg-black/5 transition-colors" />
                              
                              <div className="absolute inset-x-0 bottom-0 p-1 flex justify-center opacity-0 group-hover/product:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-white/90 backdrop-blur shadow-sm p-1 rounded-lg">
                                  <Maximize2 size={12} className="text-gray-600" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
};


