"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2, 
  FolderOpen,
  Loader2,
  Star // Added Star icon for visual cue
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext"; 
import { 
  getCategories, 
  toggleCategoryStatus,
  toggleCategoryFeatured, // Make sure to import this
  deleteCategory 
} from "@/app/actions/admin/category";

import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function Main() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // --- URL-BASED VIEW STATE ---
  const isAddViewOpen = searchParams.get("modal") === "add-category";
  const editCategoryId = searchParams.get("id");
  const isEditViewOpen = searchParams.get("modal") === "edit-category" && !!editCategoryId;

  // --- DATA & PAGINATION STATES ---
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5; 
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // --- DELETE MODAL STATE ---
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- DATA FETCHING ---
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await getCategories(page, limit, searchQuery);
      if (result.success && result.categories) {
        setCategories(result.categories);
        setTotalItems(result.total || 0);
      } else {
        toast(result.error || "Failed to load categories", "error");
      }
    } catch (error) {
      toast("An error occurred while fetching data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadCategories();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery, isAddViewOpen, isEditViewOpen]);

  // --- NAVIGATION HANDLERS ---
  const openAddView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "add-category");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openEditView = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "edit-category");
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeModals = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- TABLE ACTIONS ---
  
  // 1. Toggle Active
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
    );
    const result = await toggleCategoryStatus(id, currentStatus);
    if (result.success) {
      toast(`Category is now ${!currentStatus ? 'Active' : 'Inactive'}.`, "success");
    } else {
      toast(result.error || "Failed to update status", "error");
      loadCategories();
    }
  };

  // 2. Toggle Featured (New)
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, isFeatured: !currentStatus } : c)
    );

    // Server Action
    const result = await toggleCategoryFeatured(id, currentStatus);

    if (result.success) {
      toast(`Category is now ${!currentStatus ? 'Featured' : 'Unfeatured'}.`, "success");
    } else {
      toast(result.error || "Failed to update featured status", "error");
      loadCategories(); 
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteConfig({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteCategory(deleteConfig.id);
      if (result.success) {
        toast("Category deleted successfully", "success");
        loadCategories();
      } else {
        toast(result.error || "Failed to delete", "error");
      }
    } finally {
      setIsDeleting(false);
      setDeleteConfig({ isOpen: false, id: null });
    }
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // --- RENDER LOGIC ---
  if (isAddViewOpen) {
    return <AddCategoryModal onSuccess={loadCategories} />;
  }

  if (isEditViewOpen) {
    const categoryToEdit = categories.find(c => c.id === editCategoryId);
    
    if (!categoryToEdit && isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Loading Category Data...</span>
        </div>
      );
    }

    if (!categoryToEdit && !isLoading) {
        return (
            <div className="p-8 text-center">
                <p className="text-xs uppercase tracking-widest text-red-500">Category not found</p>
                <button onClick={closeModals} className="mt-4 text-[10px] underline uppercase tracking-widest">Return to List</button>
            </div>
        );
    }

    return (
      <EditCategoryModal 
        category={categoryToEdit} 
        onClose={closeModals} 
        onSuccess={loadCategories} 
      />
    );
  }

  const totalPages = Math.ceil(totalItems / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Deletion"
        description="This action is permanent and will remove this category from the system."
        confirmLabel="Delete Category"
        variant="danger"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-medium tracking-tight uppercase">Categories</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Manage product collections</p>
        </div>
        <button onClick={openAddView} className="flex items-center justify-center gap-3 px-6 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="w-full md:max-w-md relative flex items-center">
          <Search className="w-4 h-4 text-muted absolute left-4" />
          <input
            type="text"
            placeholder="SEARCH CATEGORIES"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[9px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted">
            <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Categories Found</span>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-foreground" checked={selectedCategories.length === categories.length} onChange={(e) => e.target.checked ? setSelectedCategories(categories.map(c => c.id)) : setSelectedCategories([])} />
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">Category</th>
                    {/* NEW COLUMN */}
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-center">Featured</th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-center">Active</th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id} className={`hover:bg-[#FAFAFA] transition-colors group ${!category.isActive ? "opacity-60" : ""}`}>
                      <td className="p-4 text-center">
                        <input type="checkbox" className="w-4 h-4 accent-foreground" checked={selectedCategories.includes(category.id)} onChange={() => handleSelectCategory(category.id)} />
                      </td>
                      <td className="py-4 px-4 max-w-[300px]">
                        <div className="flex items-center gap-4">
                          <img src={category.image || "/placeholder-category.png"} className="w-12 h-12 object-cover border border-gray-200" alt="" />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-widest">{category.name}</span>
                            <span className="text-[9px] text-muted mt-1 line-clamp-1">{category.description}</span>
                          </div>
                        </div>
                      </td>
                      {/* FEATURED TOGGLE CELL */}
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => handleToggleFeatured(category.id, category.isFeatured)} className={`w-9 h-4 relative border transition-colors inline-block ${category.isFeatured ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
                           <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${category.isFeatured ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => handleToggleActive(category.id, category.isActive)} className={`w-9 h-4 relative border transition-colors inline-block ${category.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
                          <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${category.isActive ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditView(category.id)} className="p-2 text-muted hover:text-foreground border border-transparent hover:border-gray-200 transition-colors">
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => triggerDelete(category.id)} className="p-2 text-muted hover:text-red-600 border border-transparent hover:border-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="lg:hidden flex flex-col divide-y divide-gray-100">
              {categories.map((category) => (
                <div key={category.id} className={`p-4 space-y-4 ${!category.isActive ? "bg-gray-50/50 opacity-70" : ""}`}>
                  
                  {/* Mobile Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-foreground" 
                        checked={selectedCategories.includes(category.id)} 
                        onChange={() => handleSelectCategory(category.id)} 
                      />
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 border ${category.isActive ? "border-foreground bg-foreground text-white" : "border-gray-200 text-muted"}`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                      {category.isFeatured && (
                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-2 py-1 border border-foreground text-foreground">
                           <Star className="w-3 h-3 fill-foreground" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex gap-4">
                    <img 
                      src={category.image || "/placeholder-category.png"} 
                      className="w-16 h-16 object-cover border border-gray-200 shrink-0" 
                      alt="" 
                    />
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest truncate">{category.name}</h3>
                      <p className="text-[9px] text-muted mt-1 line-clamp-2 leading-relaxed">{category.description}</p>
                    </div>
                  </div>

                  {/* Mobile Toggles Row */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 border-dashed">
                      <div className="flex items-center justify-between bg-gray-50 p-2 border border-gray-100">
                         <span className="text-[9px] font-bold uppercase text-muted">Active Status</span>
                         <button onClick={() => handleToggleActive(category.id, category.isActive)} className={`w-9 h-4 relative border transition-colors ${category.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
                           <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${category.isActive ? "translate-x-5" : "translate-x-0"}`} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-2 border border-gray-100">
                         <span className="text-[9px] font-bold uppercase text-muted">Featured</span>
                         <button onClick={() => handleToggleFeatured(category.id, category.isFeatured)} className={`w-9 h-4 relative border transition-colors ${category.isFeatured ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}>
                           <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${category.isFeatured ? "translate-x-5" : "translate-x-0"}`} />
                         </button>
                      </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => openEditView(category.id)} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-[9px] font-bold uppercase tracking-widest hover:border-foreground transition-colors"
                    >
                      <Edit2 className="w-3 h-3" strokeWidth={2} /> Edit
                    </button>
                    <button 
                      onClick={() => triggerDelete(category.id)} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-100 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={2} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Showing {startItem}-{endItem} of {totalItems} Categories</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground">Prev</button>
                <span className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">Page {page} of {totalPages || 1}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}