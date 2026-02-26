"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { useToast } from "@/context/ToastContext";
import { createCategory } from "@/app/actions/admin/category";

interface AddCategoryModalProps {
  onSuccess: () => void;
}

export default function AddCategoryModal({ onSuccess }: AddCategoryModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isFeatured: false,
    imageFile: null as File | null,
  });

  // Load Draft from SessionStorage
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("categoryFormDraft");
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setFormData((prev) => ({ ...prev, ...parsed }));
    }
  }, []);

  // Save Draft on change
  useEffect(() => {
    const { imageFile, ...textData } = formData;
    sessionStorage.setItem("categoryFormDraft", JSON.stringify(textData));
  }, [formData.name, formData.slug, formData.description, formData.isFeatured]);

  const closeAddView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAndClose = () => {
    sessionStorage.removeItem("categoryFormDraft");
    setFormData({ name: "", slug: "", description: "", isFeatured: false, imageFile: null });
    setImagePreview(null);
    closeAddView();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name, slug: slugify(name) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      return toast("Category Name and Slug are required.", "error");
    }

    if (formData.imageFile && formData.imageFile.size > 1000000) {
      return toast("Image size exceeds 1MB. Please compress your image.", "error");
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("slug", formData.slug);
      submitData.append("description", formData.description);
      submitData.append("isFeatured", String(formData.isFeatured));
      if (formData.imageFile) submitData.append("image", formData.imageFile);

      const result = await createCategory(submitData);

      if (result?.success) {
        toast("Category created successfully.", "success");
        handleClearAndClose();
        onSuccess();
      } else {
        toast(result?.error || "Failed to create category", "error");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error?.message || "";
      if (errorMessage.includes("Body exceeded") || errorMessage.includes("1 MB limit")) {
        toast("Upload failed: File size exceeds server 1MB limit.", "error");
      } else {
        toast("An unexpected error occurred.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- REUSED TOGGLE COMPONENT ---
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
            Add New Category
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Create a new product collection
          </p>
        </div>
        <button
          onClick={closeAddView}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent text-foreground border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors duration-300 group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
          Back to Categories
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: TEXT FIELDS */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Category Name</label>
                  <input
                    type="text"
                    placeholder="E.G. GROOMING"
                    value={formData.name}
                    onChange={handleNameChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors placeholder:text-gray-300 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Slug</label>
                  <input
                    type="text"
                    placeholder="E.G. GROOMING-ESSENTIALS"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors placeholder:text-gray-300 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* FEATURED SETTING */}
              <div className="bg-[#FAFAFA] border border-gray-200 px-4 py-2">
                 <Toggle 
                    label="Featured Category" 
                    checked={formData.isFeatured} 
                    onChange={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })} 
                 />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Description</label>
                <textarea
                  rows={6}
                  placeholder="SHORT DESCRIPTION..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors resize-none placeholder:text-gray-300 disabled:opacity-50"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: IMAGE UPLOAD */}
            <div className="lg:col-span-2">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Cover Image</label>
              <div className="relative w-full aspect-[4/3] border border-gray-300 bg-[#FAFAFA] hover:border-foreground transition-colors flex items-center justify-center overflow-hidden group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => { setFormData((prev) => ({ ...prev, imageFile: null })); setImagePreview(null); }}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[9px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted p-6 text-center cursor-pointer">
                    <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Click to upload</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-4">
            <button type="button" onClick={handleClearAndClose} disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:border-foreground transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground border border-foreground transition-all min-w-[160px] flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}