"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";

// Import actions & modals
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import {
  getProducts,
  toggleProductStatus,
  deleteProduct,
} from "@/app/actions/admin/product";

const ITEMS_PER_PAGE = 10; // Adjust this number as needed

export default function Main() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const isAddViewOpen = searchParams.get("modal") === "add-product";
  const editProductId = searchParams.get("edit");

  // --- STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- DELETE CONFIRMATION STATE ---
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.products);
      } else {
        toast("Failed to load products.", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAddViewOpen && !editProductId) fetchProducts();
  }, [isAddViewOpen, editProductId]);

  // Reset to page 1 if the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      setSelectedProducts(paginatedProducts.map((p) => p.id));
    else setSelectedProducts([]);
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id))
      setSelectedProducts(selectedProducts.filter((pId) => pId !== id));
    else setSelectedProducts([...selectedProducts, id]);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, isActive: !currentStatus } : p,
      ),
    );
    const result = await toggleProductStatus(id, currentStatus);
    if (result.success) {
      toast(
        `Product is now ${!currentStatus ? "Active" : "Hidden"}.`,
        "success",
      );
    } else {
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, isActive: currentStatus } : p,
        ),
      );
      toast("Failed to update status in database.", "error");
    }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const result = await deleteProduct(productToDelete);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== productToDelete));
      toast("Product deleted successfully.", "success");
    } else {
      toast(result.error || "Failed to delete product.", "error");
      fetchProducts();
    }
    setIsDeleting(false);
    setProductToDelete(null);
  };

  // --- NAVIGATION ---
  const closeView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("edit");
    router.push(`${pathname}?${params.toString()}`);
    fetchProducts();
  };

  // --- DERIVED DATA (SEARCH & PAGINATION) ---
  const getProductStock = (product: any) => {
    if (product.hasVariants && product.variants?.length > 0) {
      return product.variants.reduce(
        (total: number, v: any) => total + v.stock,
        0,
      );
    }
    return product.stock || 0;
  };

  const filteredProducts = products.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  });

  // Calculate Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // --- RENDER VIEWS ---
  if (isAddViewOpen) return <AddProductModal onClose={closeView} />;
  if (editProductId)
    return <EditProductModal productId={editProductId} onClose={closeView} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-10 h-10 bg-red-50 flex items-center justify-center rounded-full mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-display text-base font-medium tracking-tight uppercase text-foreground mb-2">
                Delete Product
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-muted leading-relaxed">
                Are you sure you want to permanently delete this product? This
                action cannot be undone.
              </p>
            </div>
            <div className="bg-[#FAFAFA] border-t border-gray-100 p-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest text-foreground hover:border-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-red-600 bg-red-600 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-transparent hover:text-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-medium tracking-tight uppercase text-foreground">
            Products
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Manage your inventory and catalog
          </p>
        </div>
        <button
          onClick={() => {
            const p = new URLSearchParams(searchParams.toString());
            p.set("modal", "add-product");
            router.push(`${pathname}?${p.toString()}`);
          }}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Product
        </button>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="w-full md:max-w-md relative flex items-center">
          <Search
            className="w-4 h-4 text-muted absolute left-4"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[9px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 3. TABLE / LIST */}
      <div className="bg-white border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Loader2 className="w-8 h-8 text-muted animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Loading Products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              No products found.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-foreground cursor-pointer"
                        checked={
                          selectedProducts.length ===
                            paginatedProducts.length &&
                          paginatedProducts.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Product
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      SKU
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Price
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Stock
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-center">
                      Active
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((product) => {
                    const totalStock = getProductStock(product);
                    const displayCategory =
                      product.categories?.[0]?.name || "Uncategorized";
                    const displayImage =
                      product.images?.[0] ||
                      "https://placehold.co/150x150?text=No+Image";

                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-[#FAFAFA] transition-colors group ${!product.isActive ? "opacity-60" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-foreground cursor-pointer"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                              <img
                                src={displayImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-foreground line-clamp-1">
                                {product.name}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest text-muted mt-1 flex items-center gap-1">
                                <Tag className="w-3 h-3" strokeWidth={1.5} />{" "}
                                {displayCategory}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                          {product.hasVariants
                            ? "Multiple SKUs"
                            : product.sku || "-"}
                        </td>
                        <td className="py-4 px-4 text-[11px] font-bold tabular-nums text-foreground">
                          ₦
                          {(
                            product.discountPrice || product.basePrice
                          ).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-[8px] font-bold uppercase tracking-widest border ${totalStock > 0 ? "bg-gray-50 text-foreground border-gray-200" : "bg-red-50 text-red-700 border-red-200"}`}
                          >
                            {totalStock > 0 ? `${totalStock}` : "0"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() =>
                              handleToggleActive(product.id, product.isActive)
                            }
                            className={`w-9 h-4 relative border transition-colors duration-300 mx-auto block focus:outline-none ${product.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}
                          >
                            <div
                              className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border ${product.isActive ? "border-foreground translate-x-5" : "border-gray-300 translate-x-0"} transition-transform duration-300`}
                            />
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const p = new URLSearchParams(
                                  searchParams.toString(),
                                );
                                p.set("edit", product.id);
                                router.push(`${pathname}?${p.toString()}`);
                              }}
                              className="p-2 text-muted hover:text-foreground hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                            >
                              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => setProductToDelete(product.id)}
                              className="p-2 text-muted hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */} 
            <div className="lg:hidden flex flex-col divide-y divide-gray-100">
              {paginatedProducts.map((product) => {
                const totalStock = getProductStock(product);
                const displayImage =
                  product.images?.[0] ||
                  "https://placehold.co/150x150?text=No+Image";

                return (
                  <div
                    key={product.id}
                    className={`p-4 flex flex-col gap-4 relative transition-opacity ${!product.isActive ? "opacity-70" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-foreground cursor-pointer"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                        <span
                          className={`inline-flex items-center px-2 py-1 text-[8px] font-bold uppercase tracking-widest border ${totalStock > 0 ? "bg-gray-50 text-foreground border-gray-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                          {totalStock > 0
                            ? `${totalStock} Units`
                            : "Out of Stock"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted mt-0.5">
                          {product.isActive ? "Active" : "Hidden"}
                        </span>
                        <button
                          onClick={() =>
                            handleToggleActive(product.id, product.isActive)
                          }
                          className={`w-9 h-4 relative border transition-colors duration-300 focus:outline-none ${product.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}
                        >
                          <div
                            className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border ${product.isActive ? "border-foreground translate-x-5" : "border-gray-300 translate-x-0"} transition-transform duration-300`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground line-clamp-2 leading-relaxed">
                          {product.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-muted">
                          {product.hasVariants ? "Multiple SKUs" : product.sku}
                        </span>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[11px] font-bold tabular-nums text-foreground">
                            ₦
                            {(
                              product.discountPrice || product.basePrice
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 mt-1">
                      <button
                        onClick={() => {
                          const p = new URLSearchParams(
                            searchParams.toString(),
                          );
                          p.set("edit", product.id);
                          router.push(`${pathname}?${p.toString()}`);
                        }}
                        className="flex-1 flex justify-center items-center gap-2 py-2 text-[9px] font-bold uppercase tracking-widest text-foreground border border-gray-200 hover:border-foreground transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="flex-1 flex justify-center items-center gap-2 py-2 text-[9px] font-bold uppercase tracking-widest text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />{" "}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. PAGINATION FOOTER */}
            {filteredProducts.length > 0 && (
              <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                  Showing {startIndex + 1}-
                  {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of{" "}
                  {totalItems} Products
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground"
                  >
                    Prev
                  </button>
                  <span className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
