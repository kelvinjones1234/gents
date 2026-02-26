"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User as UserIcon,
  Loader2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  getCustomers,
  toggleUserStatus,
  deleteUser,
} from "@/app/actions/admin/customer";

import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function Main() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // --- URL-BASED VIEW STATE ---
  const isAddViewOpen = searchParams.get("modal") === "add-customer";
  const editCustomerId = searchParams.get("id");
  const isEditViewOpen =
    searchParams.get("modal") === "edit-customer" && !!editCustomerId;

  // --- DATA & PAGINATION STATES ---
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const result = await getCustomers(page, limit, searchQuery);
      if (result.success) {
        // FIX: Add || [] so TypeScript knows it will never pass undefined
        setCustomers(result.customers || []);
        setTotalItems(result.total || 0);
      } else {
        toast(result.error || "Failed to load customers", "error");
      }
    } catch (error) {
      toast("Error fetching customer data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery, isAddViewOpen, isEditViewOpen]);

  // --- NAVIGATION ---
  const openAddView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "add-customer");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openEditView = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "edit-customer");
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeModals = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c)),
    );

    const result = await toggleUserStatus(id, currentStatus);

    if (!result.success) {
      toast(result.error || "Failed to update status", "error");
      loadCustomers(); // Reverts the optimistic update on failure
    } else {
      toast("Status updated successfully", "success");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(deleteConfig.id);
      if (result.success) {
        toast("Customer removed successfully", "success");
        loadCustomers();
      } else {
        toast(result.error || "Failed to delete", "error");
      }
    } finally {
      setIsDeleting(false);
      setDeleteConfig({ isOpen: false, id: null });
    }
  };

  // --- RENDER LOGIC ---
  if (isAddViewOpen) return <AddCustomerModal onSuccess={loadCustomers} />;

  if (isEditViewOpen) {
    const customerToEdit = customers.find((c) => c.id === editCustomerId);
    if (!customerToEdit && isLoading)
      return (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin" />
        </div>
      );
    return (
      <EditCustomerModal
        customer={customerToEdit}
        onClose={closeModals}
        onSuccess={loadCustomers}
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
        title="Delete Customer Account"
        description="Are you sure? This will permanently delete the user profile and all associated data."
        confirmLabel="Delete User"
        variant="danger"
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-medium tracking-tight uppercase">
            Customers
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={openAddView}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 p-4 shadow-sm">
        <div className="max-w-md relative flex items-center">
          <Search className="w-4 h-4 text-muted absolute left-4" />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR EMAIL"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[9px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Loader2 className="animate-spin mb-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Loading Records...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted">
            <UserIcon className="w-12 h-12 mb-4 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              No Customers Found
            </span>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-muted">
                      User Details
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Role
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-muted text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#FAFAFA] transition-colors ${!user.isActive ? "opacity-60" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                            {user.profile?.avatar ? (
                              <img
                                src={user.profile.avatar}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-4 h-4 text-muted" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                              {user.fullName}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[9px] text-muted flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </span>
                              <span className="text-[9px] text-muted flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {user.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 border ${user.role === "ADMIN" ? "border-foreground bg-foreground text-white" : "border-gray-200 text-muted"}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() =>
                            handleToggleActive(user.id, user.isActive)
                          }
                          className={`w-9 h-4 relative border transition-colors ${user.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}
                        >
                          <div
                            className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${user.isActive ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditView(user.id)}
                            className="p-2 text-muted hover:text-foreground border border-transparent hover:border-gray-200 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfig({ isOpen: true, id: user.id })
                            }
                            className="p-2 text-muted hover:text-red-600 border border-transparent hover:border-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="lg:hidden flex flex-col divide-y divide-gray-100">
              {customers.map((user) => (
                <div key={user.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center">
                        {user.profile?.avatar ? (
                          <img
                            src={user.profile.avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-muted" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest">
                          {user.fullName}
                        </h3>
                        <p className="text-[9px] text-muted mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`w-9 h-4 relative border transition-colors ${user.isActive ? "bg-foreground border-foreground" : "bg-gray-100 border-gray-300"}`}
                    >
                      <div
                        className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] bg-white border transition-transform ${user.isActive ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 border border-gray-100 space-y-1">
                      <span className="text-[7px] font-bold text-muted uppercase tracking-widest block">
                        Location
                      </span>
                      <span className="text-[9px] font-bold uppercase flex items-center gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5" /> {user.location}
                      </span>
                    </div>
                    <div className="p-2 bg-gray-50 border border-gray-100 space-y-1">
                      <span className="text-[7px] font-bold text-muted uppercase tracking-widest block">
                        Phone
                      </span>
                      <span className="text-[9px] font-bold uppercase flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />{" "}
                        {user.profile?.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditView(user.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfig({ isOpen: true, id: user.id })
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-100 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                Showing {startItem}-{endItem} of {totalItems} Customers
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
