import React from 'react';
import { Product } from '../types';
import Barcode from 'react-barcode';
import { X, Package, Tag, Hash, Info, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface ProductDetailModalProps {
  product: Product | null;
  shelfIdx: number;
  slotIdx: number;
  onClose: () => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  shelfIdx, 
  slotIdx, 
  onClose, 
  onUpdateProduct 
}) => {
  if (!product) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProduct(product.id, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[300px] bg-white rounded-[2rem] ios-shadow overflow-hidden p-3"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-6 right-6 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm ios-shadow hover:bg-gray-100"
          >
            <X size={16} />
          </Button>

          <div className="bg-gray-50/50 p-6 rounded-[1.5rem] space-y-4">
            <div 
              className="w-full aspect-square max-w-[140px] mx-auto rounded-[1.2rem] bg-white ios-shadow border border-white overflow-hidden flex items-center justify-center relative group cursor-pointer"
              onClick={() => document.getElementById('modal-image-upload')?.click()}
            >
              {product.image ? (
                <>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-primary/10">
                  <Package size={40} className="text-primary/40" />
                  <span className="text-4xl font-bold text-primary drop-shadow-sm">
                    {product.name.substring(0, 1)}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100">
                    <Upload size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                id="modal-image-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 px-2">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Selving</span>
                  <span className="text-xs font-bold text-gray-900">{(shelfIdx + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Baris</span>
                  <span className="text-xs font-bold text-gray-900">{(slotIdx + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">PLU</span>
                  <span className="text-xs font-bold text-gray-900 truncate max-w-full">{product.plu || '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">RH</span>
                  <span className="text-xs font-bold text-gray-900">{product.rh || '0'}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-[1rem] ios-shadow border border-white space-y-2 overflow-hidden">
                <div className="text-center">
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Estimasi Batas Retur</p>
                  <p className="text-[10px] font-bold text-gray-900">
                    {new Date(Date.now() + (product.rh || 0) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <Barcode 
                    value={product.sku || '0000000000000'} 
                    width={1.8} 
                    height={70} 
                    fontSize={14}
                    background="#ffffff"
                    lineColor="#000000"
                    margin={0}
                    format={product.sku?.length === 13 ? "EAN13" : product.sku?.length === 8 ? "EAN8" : "CODE128"}
                    displayValue={true}
                    fontOptions="bold"
                    textMargin={4}
                  />
                </div>
                <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">Retail Standard Barcode</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
