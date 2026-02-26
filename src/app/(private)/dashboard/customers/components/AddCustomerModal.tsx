"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { createCustomer } from "@/app/actions/admin/customer";

export default function AddCustomerModal({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    location: "",
    phone: "",
    role: "CUSTOMER",
  });

  const closeView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });

      const result = await createCustomer(data);
      if (result.success) {
        toast("Customer account created.", "success");
        onSuccess();
        closeView();
      } else {
        toast(result.error || "Failed to create user", "error");
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
          <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight uppercase text-foreground">Add New User</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Create a customer or admin account</p>
        </div>
        <button onClick={closeView} className="flex items-center gap-3 px-6 py-3.5 border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Full Name *</label>
                <input type="text" placeholder="JOHN DOE" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] font-bold uppercase tracking-widest" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Email Address *</label>
                <input type="email" placeholder="JOHN@EXAMPLE.COM" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] lowercase text-muted" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Location *</label>
                <input type="text" placeholder="CITY, COUNTRY" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] font-bold uppercase tracking-widest" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Phone Number</label>
                <input type="tel" placeholder="+123 456 7890" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] font-bold uppercase tracking-widest" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Temporary Password *</label>
                <input type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] tracking-widest" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">Account Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-[#FAFAFA] border-transparent border focus:bg-white focus:border-foreground focus:outline-none transition-all text-[11px] font-bold uppercase tracking-widest appearance-none cursor-pointer">
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {formData.role === "ADMIN" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 mt-4">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-red-800 leading-relaxed uppercase tracking-wider">
                  You are granting Admin privileges. This user will have full access to the dashboard.
                </p>
              </div>
            )}
            
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
            <button type="button" onClick={closeView} disabled={isSubmitting} className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-10 py-3.5 bg-foreground text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-3">
              {isSubmitting ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing</> : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}