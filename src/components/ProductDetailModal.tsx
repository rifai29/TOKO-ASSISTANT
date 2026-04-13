import React from 'react';
import { Product } from '../types';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Package, Tag, Hash, Info, Camera, Upload, QrCode, Barcode as BarcodeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [codeType, setCodeType] = React.useState<'sku' | 'plu' | 'qr'>('sku');
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
          className="relative w-full max-w-[280px] bg-white rounded-[1.5rem] ios-shadow overflow-hidden p-1.5"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm ios-shadow hover:bg-gray-100"
          >
            <X size={14} />
          </Button>

          <div className="bg-gray-50/50 p-3 rounded-[1.2rem] space-y-2">
            <div 
              className="w-full aspect-square max-w-[100px] mx-auto rounded-[1rem] bg-white ios-shadow border border-white overflow-hidden flex items-center justify-center relative group cursor-pointer"
              onClick={() => document.getElementById('modal-image-upload')?.click()}
            >
              {product.image ? (
                <>
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Selving</span>
                  <span className="text-xs font-black text-primary">{(shelfIdx + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Baris</span>
                  <span className="text-xs font-black text-primary">{(slotIdx + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PLU</span>
                  <span className="text-xs font-black text-gray-900 truncate max-w-full">{product.plu || '-'}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">RH</span>
                  <span className="text-xs font-black text-gray-900">{product.rh || '0'}</span>
                </div>
              </div>

              <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100/50 flex flex-col items-center">
                <p className="text-[7px] font-bold text-amber-600 uppercase tracking-[0.1em] mb-0.5">Estimasi Batas Retur</p>
                <p className="text-[10px] font-black text-amber-700">
                  {new Date(Date.now() + (product.rh || 0) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-[1.2rem] border-2 border-gray-50 space-y-2 overflow-hidden">
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-full">
                  <button 
                    onClick={() => setCodeType('sku')}
                    className={cn(
                      "flex-1 py-1 rounded-md text-[7px] font-bold flex items-center justify-center gap-1 transition-all",
                      codeType === 'sku' ? "bg-white text-primary shadow-sm" : "text-gray-400"
                    )}
                  >
                    SKU
                  </button>
                  <button 
                    onClick={() => setCodeType('plu')}
                    className={cn(
                      "flex-1 py-1 rounded-md text-[7px] font-bold flex items-center justify-center gap-1 transition-all",
                      codeType === 'plu' ? "bg-white text-primary shadow-sm" : "text-gray-400"
                    )}
                  >
                    PLU
                  </button>
                  <button 
                    onClick={() => setCodeType('qr')}
                    className={cn(
                      "flex-1 py-1 rounded-md text-[7px] font-bold flex items-center justify-center gap-1 transition-all",
                      codeType === 'qr' ? "bg-white text-primary shadow-sm" : "text-gray-400"
                    )}
                  >
                    QR
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[6px] font-black text-primary uppercase tracking-[0.1em] mb-0.5">
                    {codeType === 'sku' ? 'Product SKU Barcode' : codeType === 'plu' ? 'Product PLU Barcode' : 'Product QR Code'}
                  </p>
                  <p className="text-[8px] font-bold text-gray-400">
                    {codeType === 'sku' ? (product.sku || 'No SKU') : codeType === 'plu' ? (product.plu || 'No PLU') : (product.sku || 'No SKU')}
                  </p>
                </div>

                <div className="bg-white p-0.5 flex items-center justify-center min-h-[80px] w-full">
                  {codeType === 'sku' || codeType === 'plu' ? (
                    <Barcode 
                      value={(codeType === 'sku' ? product.sku : product.plu) || '0000000000000'} 
                      width={1.5} 
                      height={40} 
                      fontSize={12}
                      background="#ffffff"
                      lineColor="#000000"
                      margin={5}
                      format="CODE128"
                      displayValue={false}
                    />
                  ) : (
                    <div className="p-1.5 bg-white rounded-lg border border-gray-50">
                      <QRCodeCanvas 
                        value={product.sku || '0000000000000'}
                        size={80}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-gray-900 tracking-[0.02em]">
                    {codeType === 'sku' ? product.sku : codeType === 'plu' ? product.plu : product.sku}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
