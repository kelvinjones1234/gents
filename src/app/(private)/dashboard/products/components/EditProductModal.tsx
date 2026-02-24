"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, ChevronDown, Plus, Trash2, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { slugify } from "@/lib/slugify";
import { getProduct, updateProduct } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";

interface EditProductModalProps {
  productId: string;
  onClose: () => void;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function EditProductModal({ productId, onClose }: EditProductModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    discountPrice: "",
    stock: "",
    sku: "",
    categoryId: "",
    hasVariants: false,
    isFeatured: false,
    isHotDeal: false,
    isNewArrival: false,
    isActive: true,
  });

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Variants
  const [variants, setVariants] = useState<any[]>([]);

  // INITIAL DATA FETCH
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategories(),
          getProduct(productId)
        ]);

        if (catRes.success && catRes.categories) setCategoryOptions(catRes.categories);

        if (prodRes.success && prodRes.product) {
          const p = prodRes.product;
          setFormData({
            name: p.name,
            slug: p.slug,
            description: p.description || "",
            basePrice: p.basePrice.toString(),
            discountPrice: p.discountPrice ? p.discountPrice.toString() : "",
            stock: p.stock.toString(),
            sku: p.sku || "",
            categoryId: p.categories[0]?.id || "",
            hasVariants: p.hasVariants,
            isFeatured: p.isFeatured,
            isHotDeal: p.isHotDeal,
            isNewArrival: p.isNewArrival,
            isActive: p.isActive,
          });

          setExistingImages(p.images || []);

          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants.map((v: any) => ({
              id: v.id || Date.now() + Math.random(), // Needs unique ID for mapped keys
              color: v.color || "",
              size: v.size || "",
              sku: v.sku,
              price: v.price.toString(),
              stock: v.stock.toString(),
              existingImage: v.image || null,
              imageFile: null,
              imagePreview: null,
            })));
          } else {
            addVariant(); // Add empty variant if none exist but toggle gets flipped
          }
        } else {
          toast("Failed to load product details.", "error");
          onClose();
        }
      } catch (error) {
        toast("Error loading data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [productId, toast, onClose]);

  // IMAGE HANDLERS
  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setNewImages((prev) => [...prev, ...filesArray]);
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // VARIANT HANDLERS
  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), color: "", size: "", sku: "", price: "", stock: "", imageFile: null, imagePreview: null, existingImage: null }]);
  };

  const removeVariant = (id: number | string) => {
    if (variants.length > 1) setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: number | string, field: string, value: any) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const handleVariantImageChange = (id: number | string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateVariant(id, "imageFile", file);
      updateVariant(id, "imagePreview", URL.createObjectURL(file));
      updateVariant(id, "existingImage", null); // Clear existing if new is uploaded
    }
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return toast("Name and Category required.", "error");

    // 1. PRE-VALIDATION: Check file sizes before uploading to prevent 413 limit errors
    let totalPayloadSize = 0;
    newImages.forEach(file => { totalPayloadSize += file.size });
    variants.forEach(v => { if (v.imageFile) totalPayloadSize += v.imageFile.size });

    if (totalPayloadSize > 1000000) {
      return toast("Image size must not exceeds 1MB");
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

    // Images
    submitData.append("existingImages", JSON.stringify(existingImages));
    newImages.forEach(file => submitData.append("newImages", file));

    if (formData.hasVariants) {
      const validVariants = variants.filter((v) => v.price && v.sku);
      if (validVariants.length === 0) return toast("Add at least one valid variation.", "error");

      const variantTextData = validVariants.map((v) => ({
        id: v.id, color: v.color, size: v.size, sku: v.sku, price: v.price, stock: v.stock, existingImage: v.existingImage
      }));
      submitData.append("variantsData", JSON.stringify(variantTextData));

      validVariants.forEach((v) => {
        if (v.imageFile) submitData.append(`variantImage_${v.id}`, v.imageFile);
      });

      const lowestPrice = Math.min(...validVariants.map((v) => parseFloat(v.price)));
      submitData.append("basePrice", String(lowestPrice));
    } else {
      if (!formData.basePrice || !formData.sku) return toast("Base Price and Main SKU required.", "error");
      submitData.append("basePrice", formData.basePrice);
      submitData.append("sku", formData.sku);
      submitData.append("stock", formData.stock || "0");
    }

    setIsSubmitting(true);
    try {
      const result = await updateProduct(productId, submitData);
      if (result.success) {
        toast("Product updated successfully!", "success");
        onClose();
      } else {
        toast(result.error || "Failed to update product.", "error");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      
      // 2. ERROR CATCHING: Fallback if the server still throws a 413 size error
      const errorMessage = error?.message || "";
      if (errorMessage.includes("Body exceeded") || errorMessage.includes("1 MB limit") || errorMessage.includes("size limit")) {
        toast("Upload failed: File sizes exceed the server 1MB limit. Please compress your images.", "error");
      } else {
        toast("An unexpected error occurred while updating the product.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{label}</span>
      <button type="button" onClick={onChange} className={`w-9 h-4 relative border transition-colors focus:outline-none ${checked ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
        <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border ${checked ? "border-foreground translate-x-5" : "border-gray-300 translate-x-0"} transition-transform`} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in">
        <Loader2 className="w-8 h-8 text-muted animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Loading Product Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-medium tracking-tight uppercase text-foreground">Edit Product</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Update product details and inventory</p>
        </div>
        <button onClick={onClose} className="flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT COLUMN: MAIN FIELDS & IMAGES */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Product Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:border-foreground outline-none" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Slug (URL)</label>
                <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:border-foreground outline-none" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Category *</label>
                <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:border-foreground outline-none cursor-pointer">
                  <option value="" disabled>SELECT CATEGORY</option>
                  {categoryOptions.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Description</label>
              <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:border-foreground outline-none resize-none" />
            </div>

            {/* IMAGES */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Product Images</label>
              <div className="w-full p-4 bg-[#FAFAFA] border border-dashed border-gray-300 hover:border-foreground transition-colors flex flex-col items-center justify-center relative min-h-[120px]">
                <UploadCloud className="w-6 h-6 text-muted mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Click or drag images here</span>
                <input type="file" multiple accept="image/*" onChange={handleNewImagesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                  {/* Render Existing Images */}
                  {existingImages.map((src, idx) => (
                    <div key={`exist-${idx}`} className="relative aspect-square border border-gray-200 group overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="Existing" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 bg-black/50 text-white text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">Remove</button>
                    </div>
                  ))}
                  {/* Render New Previews */}
                  {newImagePreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square border border-blue-200 group overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="New" />
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute inset-0 bg-black/50 text-white text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VARIANTS */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">Product Variations</h3>
                <Toggle label="" checked={formData.hasVariants} onChange={() => setFormData({ ...formData, hasVariants: !formData.hasVariants })} />
              </div>

              {formData.hasVariants && (
                <div className="space-y-3 overflow-x-auto pb-4">
                  <div className="grid grid-cols-12 gap-2 text-[8px] font-bold uppercase tracking-widest text-muted px-2 min-w-[750px]">
                    <div className="col-span-2">Color</div><div className="col-span-1">Size</div><div className="col-span-2">SKU</div>
                    <div className="col-span-2">Price (₦)</div><div className="col-span-1">Stock</div><div className="col-span-3 text-center">Image</div><div className="col-span-1 text-center">Act</div>
                  </div>
                  {variants.map((variant) => (
                    <div key={variant.id} className="grid grid-cols-12 gap-2 items-center min-w-[750px] bg-gray-50/50 p-2 border border-gray-100">
                      <input type="text" value={variant.color} onChange={(e) => updateVariant(variant.id, "color", e.target.value)} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase outline-none" />
                      <input type="text" value={variant.size} onChange={(e) => updateVariant(variant.id, "size", e.target.value)} className="col-span-1 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase outline-none" />
                      <input type="text" value={variant.sku} onChange={(e) => updateVariant(variant.id, "sku", e.target.value)} required={formData.hasVariants} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold uppercase outline-none" />
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, "price", e.target.value)} required={formData.hasVariants} className="col-span-2 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold tabular-nums uppercase outline-none" />
                      <input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, "stock", e.target.value)} className="col-span-1 px-3 py-2 bg-white border border-gray-200 text-[9px] font-bold tabular-nums uppercase outline-none" />
                      
                      <div className="col-span-3 flex justify-center">
                        {(variant.imagePreview || variant.existingImage) ? (
                          <div className="relative w-8 h-8 border border-gray-200 group">
                            <img src={variant.imagePreview || variant.existingImage} className="w-full h-full object-cover" alt="var" />
                            <button type="button" onClick={() => { updateVariant(variant.id, "imageFile", null); updateVariant(variant.id, "imagePreview", null); updateVariant(variant.id, "existingImage", null); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative w-full py-2 bg-white border border-dashed border-gray-300 flex items-center justify-center hover:border-foreground cursor-pointer">
                            <ImageIcon className="w-3 h-3 text-muted" />
                            <input type="file" accept="image/*" onChange={(e) => handleVariantImageChange(variant.id, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeVariant(variant.id)} disabled={variants.length === 1} className="col-span-1 flex justify-center p-2 text-muted hover:text-red-600 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[9px] font-bold uppercase text-foreground hover:opacity-70 mt-4"><Plus className="w-3 h-3" /> Add Variation</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PRICING & FLAGS */}
          <div className="space-y-6">
            {!formData.hasVariants && (
              <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Base Pricing & Stock</h3>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-muted mb-2">Base Price (₦) *</label>
                  <input type="number" required value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-muted mb-2">Main SKU *</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-muted mb-2">Stock</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums outline-none" />
                </div>
              </div>
            )}

            <div className="bg-[#FAFAFA] border border-gray-200 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Global Discount</h3>
              <input type="number" placeholder="Leave blank if no sale" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tabular-nums outline-none" />
            </div>

            <div className="bg-[#FAFAFA] border border-gray-200 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">Display Flags</h3>
              <Toggle label="Active" checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: !formData.isActive })} />
              <Toggle label="Featured Item" checked={formData.isFeatured} onChange={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })} />
              <Toggle label="Hot Deal" checked={formData.isHotDeal} onChange={() => setFormData({ ...formData, isHotDeal: !formData.isHotDeal })} />
              <Toggle label="New Arrival" checked={formData.isNewArrival} onChange={() => setFormData({ ...formData, isNewArrival: !formData.isNewArrival })} />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3.5 border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}