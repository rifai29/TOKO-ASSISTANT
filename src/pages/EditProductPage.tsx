import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Gondola } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, Package, Search, Calendar, Hash, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface EditProductPageProps {
  products: Product[];
  gondolas: Gondola[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onRemoveProduct: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  isNew?: boolean;
}

export default function EditProductPage({ products, gondolas, onUpdateProduct, onRemoveProduct, onAddProduct, isNew }: EditProductPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = isNew ? null : products.find(p => p.id === productId);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    plu: '',
    facing: 1,
    rh: 0,
    shelf: undefined,
    slot: undefined,
    gondolaId: gondolas[0]?.id || '',
    expiryDate: '',
    image: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else if (isNew && gondolas.length > 0) {
      setFormData(prev => ({ ...prev, gondolaId: gondolas[0].id }));
    }
  }, [product, isNew, gondolas]);

  if (!isNew && !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F2F2F7]">
        <p className="text-gray-500 mb-4">Produk tidak ditemukan</p>
        <Button onClick={() => navigate('/')}>Kembali</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (isNew) {
      onAddProduct(formData as Omit<Product, 'id'>);
    } else if (product) {
      onUpdateProduct(product.id, formData);
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (confirm('Hapus produk ini?')) {
      onRemoveProduct(product.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans antialiased pb-10">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <span className="text-base font-bold text-gray-900">{isNew ? 'Tambah Produk' : 'Edit Produk'}</span>
        </div>
        {!isNew && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="rounded-full text-red-500 hover:bg-red-50"
          >
            <Trash2 size={20} />
          </Button>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm space-y-8"
        >
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-3xl flex items-center justify-center overflow-hidden group transition-all">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <Package size={40} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Produk</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold text-base"
                placeholder="Masukkan nama produk..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Rak (Gondola)</Label>
                <div className="relative">
                  <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <select 
                    value={formData.gondolaId}
                    onChange={e => setFormData({ ...formData, gondolaId: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-primary/10 appearance-none transition-all"
                  >
                    {gondolas.map(g => (
                      <option key={g.id} value={g.id}>{g.settings.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kategori</Label>
                <Input 
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">SKU</Label>
                <Input 
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PLU</Label>
                <Input 
                  value={formData.plu}
                  onChange={e => setFormData({ ...formData, plu: e.target.value })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Facing</Label>
                <Input 
                  type="number"
                  value={formData.facing}
                  onChange={e => setFormData({ ...formData, facing: parseInt(e.target.value) || 1 })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white text-center font-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">RH</Label>
                <Input 
                  type="number"
                  value={formData.rh}
                  onChange={e => setFormData({ ...formData, rh: parseInt(e.target.value) || 0 })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white text-center font-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Selving</Label>
                <Input 
                  type="number"
                  value={formData.shelf || ''}
                  onChange={e => setFormData({ ...formData, shelf: parseInt(e.target.value) || undefined })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white text-center font-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Baris</Label>
                <Input 
                  type="number"
                  value={formData.slot || ''}
                  onChange={e => setFormData({ ...formData, slot: parseInt(e.target.value) || undefined })}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white text-center font-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Gambar</Label>
              <Input 
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-mono text-xs"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-6">
            <Button 
              onClick={handleSave}
              className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Save size={24} />
              {isNew ? 'Simpan Produk' : 'Update Produk'}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
