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
      <div className="max-w-7xl mx-auto relative z-10 pt-24 pb-8 md:pt-28 px-4">
        <div 
          ref={canvasRef}
          className="relative print:shadow-none print:border-none"
        >

          <div className="space-y-6">
            {Array.from({ length: settings.shelfCount }).map((_, si) => {
              const shelf = shelves[si] || [];
              const isLastUsedShelf = shelves.slice(si + 1).every(s => !s || s.length === 0);
              const isShelfEmpty = shelf.length === 0;
              
              // Only show empty shelves if they are not trailing OR if we are in placement mode
              if (!selectedProductId && isShelfEmpty && isLastUsedShelf && si > 0) return null;
              
              return (
                <div 
                  key={si} 
                  className="w-full relative overflow-x-auto custom-scrollbar group pb-3"
                  onClick={() => selectedProductId && onPlaceProduct(si)}
                >
                  <div className={cn(
                    "flex items-end gap-1.5 md:gap-3 min-h-[110px] md:min-h-[160px] lg:min-h-[180px] px-3 md:px-5 w-max transition-all pb-1",
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
                                "rounded-xl flex flex-col items-center justify-center p-1 md:p-1.5 text-center transition-all overflow-hidden relative shadow-sm border border-gray-100 bg-white",
                                p.facing >= 3 ? "w-24 md:w-36 lg:w-44" : p.facing >= 2 ? "w-20 md:w-28 lg:w-34" : "w-14 md:w-20 lg:w-24",
                                "h-[110px] md:h-[150px] lg:h-[170px]",
                                !p.image && "bg-primary",
                                selectedProductId === p.id && "ring-2 ring-blue-500"
                              )}
                            >
                              {p.image ? (
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="absolute inset-0 w-full h-full object-contain p-1.5" 
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

                    {/* Realistic Steel Shelf Ground Line */}
                    <div className="w-full h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 border-t border-b border-gray-400/30 rounded-sm shadow-sm relative flex items-center justify-between px-3 md:px-6 select-none shrink-0">
                      <span className="text-[8px] md:text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">
                        SELVING {String(si + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[7.5px] md:text-[9.5px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                        {shelf.length} ITEM • FACING: {shelf.reduce((acc, p) => acc + (p.facing || 1), 0)}F
                      </span>
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


