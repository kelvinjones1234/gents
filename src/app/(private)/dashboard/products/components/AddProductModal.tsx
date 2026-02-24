"use client";

import React, { useState, useEffect } from "react";
import {
  X, UploadCloud, ChevronDown, Plus, Trash2, Loader2, Image as ImageIcon, ArrowLeft,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { slugify } from "@/lib/slugify";
import { createProduct } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";

interface AddProductModalProps {
  onClose: () => void;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function AddProductModal({ onClose }: AddProductModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- STATE FOR CATEGORIES ---
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // --- STATE FOR MAIN PRODUCT ---
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", basePrice: "", discountPrice: "",
    stock: "", sku: "", categoryId: "", hasVariants: false,
    isFeatured: false, isHotDeal: false, isNewArrival: true, isActive: true,
  });

  const [mainImages, setMainImages] = useState<File[]>([]);
  const [mainImagePreviews, setMainImagePreviews] = useState<string[]>([]);

  const [variants, setVariants] = useState([
    {
      id: Date.now(), color: "", size: "", sku: "", price: "", stock: "",
      imageFile: null as File | null, imagePreview: null as string | null,
    },
  ]);

  // --- EFFECT: FETCH CATEGORIES ON MOUNT ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.categories) {
          setCategoryOptions(result.categories);
        } else {
          toast(result.error || "Failed to load categories.", "error");
        }
      } catch (error) {
        toast("An unexpected error occurred while fetching categories.", "error");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

  // --- HANDLERS: MAIN IMAGES ---
  const handleMainImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

      setMainImages((prev) => [...prev, ...filesArray]);
      setMainImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeMainImage = (indexToRemove: number) => {
    setMainImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setMainImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- HANDLERS: VARIANTS ---
  const addVariant = () => {
    setVariants([...variants, {
      id: Date.now(), color: "", size: "", sku: "", price: "", stock: "",
      imageFile: null, imagePreview: null,
    }]);
  };

  const removeVariant = (id: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== id));
    }
  };

  const updateVariant = (id: number, field: string, value: any) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const handleVariantImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateVariant(id, "imageFile", file);
      updateVariant(id, "imagePreview", URL.createObjectURL(file));
    }
  };

  const removeVariantImage = (id: number) => {
    updateVariant(id, "imageFile", null);
    updateVariant(id, "imagePreview", null);
  };

  // --- HANDLERS: SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      return toast("Product Name and Category are required.", "error");
    }

    // 1. PRE-VALIDATION: Check file sizes before uploading to prevent 413 limit errors
    // The Next.js default is strictly 1MB (1,048,576 bytes). 
    // We check against slightly less (e.g. 1,000,000 bytes) to leave room for the text payload.
    let totalPayloadSize = 0;
    mainImages.forEach(file => { totalPayloadSize += file.size });
    variants.forEach(v => { if (v.imageFile) totalPayloadSize += v.imageFile.size });

    if (totalPayloadSize > 1000000) {
      return toast("Total image size exceeds 1MB. Please compress your images or upload fewer files.", "error");
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("slug", formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"));
    submitData.append("description", formData.description);
    submitData.append("categoryId", formData.categoryId);
    submitData.append("hasVariants", String(formData.hasVariants));
    submitData.append("isActive", String(formData.isActive));
    submitData.append("isFeatured", String(formData.isFeatured));
    submitData.append("isHotDeal", String(formData.isHotDeal));
    submitData.append("isNewArrival", String(formData.isNewArrival));

    if (formData.discountPrice) submitData.append("discountPrice", formData.discountPrice);

    mainImages.forEach((file) => { submitData.append("images", file); });

    if (formData.hasVariants) {
      const validVariants = variants.filter((v) => v.price && v.sku);
      if (validVariants.length === 0) return toast("Please add at least one valid variation with a Price and SKU.", "error");

      const variantTextData = validVariants.map((v) => ({
        id: v.id, color: v.color, size: v.size, sku: v.sku, price: v.price, stock: v.stock,
      }));
      submitData.append("variantsData", JSON.stringify(variantTextData));

      validVariants.forEach((v) => {
        if (v.imageFile) submitData.append(`variantImage_${v.id}`, v.imageFile);
      });

      const lowestPrice = Math.min(...validVariants.map((v) => parseFloat(v.price)));
      submitData.append("basePrice", String(lowestPrice));
    } else {
      if (!formData.basePrice || !formData.sku) return toast("Base Price and Main SKU are required for simple products.", "error");
      submitData.append("basePrice", formData.basePrice);
      submitData.append("sku", formData.sku);
      submitData.append("stock", formData.stock || "0");
    }

    setIsSubmitting(true);
    try {
      const result = await createProduct(submitData);

      if (result.success) {
        toast("Product created successfully!", "success");
        onClose();
      } else {
        toast(result.error || "Failed to create product.", "error");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      
      // 2. ERROR CATCHING: Fallback if the server still throws a 413 size error
      const errorMessage = error?.message || "";
      if (errorMessage.includes("Body exceeded") || errorMessage.includes("1 MB limit") || errorMessage.includes("size limit")) {
        toast("Upload failed: File sizes exceed the server 1MB limit. Please compress your images.", "error");
      } else {
        toast("An unexpected error occurred while saving the product.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{label}</span>
      <button type="button" onClick={onChange} className={`w-9 h-4 relative border transition-colors duration-300 focus:outline-none ${checked ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
        <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border ${checked ? "border-foreground translate-x-5" : "border-gray-300 translate-x-0"} transition-transform duration-300`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-medium tracking-tight uppercase text-foreground">
            Add New Product
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Create a new product listing in your catalog
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent text-foreground border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors duration-300 group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />{" "}
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Col: Main Details & Variants */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) }); }} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Slug (URL)</label>
                    <input type="text" required value={formData.slug} onChange={(e) => { setFormData({ ...formData, slug: slugify(e.target.value) }); }} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Category *</label>
                    <div className="relative">
                      <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} disabled={isLoadingCategories} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer disabled:opacity-50">
                        <option value="" disabled>{isLoadingCategories ? "LOADING CATEGORIES..." : "SELECT CATEGORY"}</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {isLoadingCategories ? (
                        <Loader2 className="w-4 h-4 text-muted absolute right-4 top-3 animate-spin" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted absolute right-4 top-3 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Description</label>
                  <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors resize-none" />
                </div>

                {/* MULTI-IMAGE UPLOAD FOR MAIN PRODUCT */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Main Product Images</label>
                  <div className="w-full p-4 bg-[#FAFAFA] border border-dashed border-gray-300 hover:border-foreground transition-colors flex flex-col items-center justify-center relative min-h-[120px]">
                    <UploadCloud className="w-6 h-6 text-muted mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Click or drag images here</span>
                    <input type="file" multiple accept="image/*" onChange={handleMainImagesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>

                  {mainImagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                      {mainImagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square border border-gray-200 group overflow-hidden">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeMainImage(index)} className="absolute inset-0 bg-black/50 text-white text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Variations Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">Product Variations</h3>
                    <p className="text-[9px] uppercase tracking-widest text-muted mt-1">Does this product come in multiple sizes or colors?</p>
                  </div>
                  <Toggle label="" checked={formData.hasVariants} onChange={() => setFormData({ ...formData, hasVariants: !formData.hasVariants }) } />
                </div>

                {formData.hasVariants && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 overflow-x-auto pb-4">
                    <div className="grid grid-cols-12 gap-2 text-[8px] font-bold uppercase tracking-widest text-muted px-2 min-w-[750px]">
                      <div className="col-span-2">Color</div><div className="col-span-1">Size</div><div className="col-span-2">SKU</div>
                      <div className="col-span-2">Price (₦)</div><div className="col-span-1">Stock</div><div className="col-span-3 text-center">Image</div><div className="col-span-1 text-center">Act</div>
                    </div>

                    {variants.map((variant) => (
                      <div key={variant.id} className="grid grid-cols-12 gap-2 items-center min-w-[750px] bg-gray-50/50 p-2 border border-gray-100">
                        <input type="text" placeholder="RED" value={variant.color} onChange={(e) => updateVariant(variant.id, "color", e.target.value)} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase tracking-widest focus:border-foreground outline-none" />
                        <input type="text" placeholder="XL" value={variant.size} onChange={(e) => updateVariant(variant.id, "size", e.target.value)} className="col-span-1 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase tracking-widest focus:border-foreground outline-none" />
                        <input type="text" placeholder="SKU-001" value={variant.sku} onChange={(e) => updateVariant(variant.id, "sku", e.target.value)} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase tracking-widest focus:border-foreground outline-none" required={formData.hasVariants} />
                        <input type="number" placeholder="0.00" value={variant.price} onChange={(e) => updateVariant(variant.id, "price", e.target.value)} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold tabular-nums uppercase tracking-widest focus:border-foreground outline-none" required={formData.hasVariants} />
                        <input type="number" placeholder="0" value={variant.stock} onChange={(e) => updateVariant(variant.id, "stock", e.target.value)} className="col-span-1 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold tabular-nums uppercase tracking-widest focus:border-foreground outline-none" />

                        <div className="col-span-3 flex justify-center">
                          {variant.imagePreview ? (
                            <div className="relative w-8 h-8 border border-gray-200 group">
                              <img src={variant.imagePreview} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeVariantImage(variant.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2" /></button>
                            </div>
                          ) : (
                            <div className="relative w-full py-2 bg-white border border-dashed border-gray-300 flex items-center justify-center hover:border-foreground transition-colors cursor-pointer group">
                              <ImageIcon className="w-3 h-3 text-muted group-hover:text-foreground transition-colors" />
                              <input type="file" accept="image/*" onChange={(e) => handleVariantImageChange(variant.id, e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            </div>
                          )}
                        </div>

                        <button type="button" onClick={() => removeVariant(variant.id)} disabled={variants.length === 1} className="col-span-1 flex justify-center p-2 text-muted hover:text-red-600 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-foreground hover:opacity-70 mt-4 px-2"><Plus className="w-3 h-3" /> Add Another Variation</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Default Pricing & Flags */}
            <div className="space-y-6">
              {!formData.hasVariants && (
                <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-4 animate-in fade-in">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Base Pricing & Stock</h3>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Base Price (₦) *</label>
                    <input type="number" placeholder="0.00" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} required={!formData.hasVariants} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Main SKU *</label>
                    <input type="text" placeholder="GC-MAIN-00" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required={!formData.hasVariants} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Stock Quantity</label>
                    <input type="number" placeholder="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                </div>
              )}

              <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Global Discount</h3>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Sale Price Override (₦)</label>
                  <input type="number" placeholder="LEAVE BLANK IF NO SALE" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value }) } className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-gray-200 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Display Flags</h3>
                <div className="flex flex-col gap-1">
                  <Toggle label="Active (Visible)" checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: !formData.isActive }) } />
                  <Toggle label="Featured Item" checked={formData.isFeatured} onChange={() => setFormData({ ...formData, isFeatured: !formData.isFeatured }) } />
                  <Toggle label="Hot Deal" checked={formData.isHotDeal} onChange={() => setFormData({ ...formData, isHotDeal: !formData.isHotDeal }) } />
                  <Toggle label="New Arrival" checked={formData.isNewArrival} onChange={() => setFormData({ ...formData, isNewArrival: !formData.isNewArrival }) } />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3.5 bg-transparent border border-gray-200 text-foreground text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors duration-300 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}