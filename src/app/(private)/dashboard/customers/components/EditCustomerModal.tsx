"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { updateCustomer } from "@/app/actions/customer";

export default function EditCustomerModal({
  customer,
  onClose,
  onSuccess,
}: {
  customer: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely extract nested profile data
  const initialPhone = customer.profile?.phone || "";

  const [formData, setFormData] = useState({
    fullName: customer.fullName || "",
    email: customer.email || "",
    location: customer.location || "",
    phone: initialPhone,
    role: customer.role || "CUSTOMER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });

      const result = await updateCustomer(customer.id, data);
      if (result.success) {
        toast("Profile updated successfully.", "success");
        onSuccess();
        onClose();
      } else {
        toast(result.error || "Failed to update profile", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-medium tracking-tight uppercase text-foreground">
            Edit Profile
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Update {customer.fullName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-3 px-6 py-3.5 border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border-gray-200 border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] lowercase text-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3.5 bg-foreground text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Updating
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}