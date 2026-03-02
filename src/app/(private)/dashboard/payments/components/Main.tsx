"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CreditCard, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Payment {
  id: string;
  reference: string;
  amount: string;
  provider: string;
  status: string;
  date: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}

interface MainProps {
  initialPayments: Payment[];
  currentPage: number;
  totalPages: number;
}

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "text-green-700 bg-green-50 border-green-200";
    case "PENDING":
      return "text-amber-600 border-amber-200 bg-amber-50";
    case "FAILED":
      return "text-red-600 border-red-200 bg-red-50";
    case "REFUNDED":
      return "text-gray-600 border-gray-200 bg-gray-100";
    default:
      return "text-muted border-gray-200";
  }
};

export default function Main({ initialPayments, currentPage, totalPages }: MainProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Function to change page via URL parameters
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Table Controls (Optional Search/Filter row could go here) */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="SEARCH REF OR EMAIL..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-[#FAFAFA]">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">Transaction Ref</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">Order ID</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">Customer</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">Date</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Amount</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialPayments.length > 0 ? (
              initialPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-xs font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted" />
                      {payment.reference}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted hover:text-foreground cursor-pointer transition-colors">
                    {payment.orderNumber}
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-foreground">{payment.customerName}</div>
                    <div className="text-[10px] text-muted tracking-wider">{payment.customerEmail}</div>
                  </td>
                  <td className="p-4 text-[10px] text-muted uppercase tracking-wider">
                    {payment.date}
                  </td>
                  <td className="p-4 text-xs font-bold text-foreground text-right">
                    {payment.amount}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 border text-[9px] font-bold uppercase tracking-widest ${getPaymentStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-xs text-muted uppercase tracking-widest">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-gray-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}