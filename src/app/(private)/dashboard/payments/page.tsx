import React from 'react';
import Main from './components/Main';
import { getPaginatedPayments } from '@/app/actions/admin/payment';

// 1. Type searchParams as a Promise
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>; 
}) {
  // 2. Await the searchParams before using them
  const resolvedSearchParams = await searchParams;
  
  // 3. Now you can safely read the page number
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 10;

  // Fetch paginated data
  const data = await getPaginatedPayments(currentPage, limit);

  // Setup default fallback values
  let payments: any[] = [];
  let safeCurrentPage = 1;
  let safeTotalPages = 1;

  // Type Narrowing
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