import React from 'react';
import Main from './components/Main';
import { getPaginatedPayments } from '@/app/actions/admin/payment';

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const limit = 10;

  // Fetch paginated data
  const data = await getPaginatedPayments(currentPage, limit);

  // 1. Setup default fallback values
  let payments: any[] = [];
  let safeCurrentPage = 1;
  let safeTotalPages = 1;

  // 2. Type Narrowing: If successful, TypeScript now strictly knows these properties exist
  if (data.success && data.payments) {
    payments = data.payments;
    safeCurrentPage = data.currentPage;
    safeTotalPages = data.totalPages;
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
      {/* HEADER */}
      <header className="pb-8 border-b border-gray-200">
        <div>
          <h1 className="font-display text-xl font-medium tracking-tight uppercase">
            Payment Ledger
          </h1>
          <p className="text-[10px] text-muted tracking-wide uppercase mt-3">
            Manage and audit all transaction records
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-[#FAFAFA] py-8">
        <Main 
          initialPayments={payments} 
          currentPage={safeCurrentPage}
          totalPages={safeTotalPages}
        />
      </main>
    </div>
  );
}