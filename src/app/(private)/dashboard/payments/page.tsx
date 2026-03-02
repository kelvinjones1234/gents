import React from 'react';
import Main from './components/Main';
import { getPaginatedPayments } from '@/app/actions/admin/payment';

// Next.js passes searchParams to page components automatically
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // Parse the page number from the URL, default to 1
  const currentPage = Number(searchParams.page) || 1;
  const limit = 10; // Show 10 transactions per page

  // Fetch paginated data
  const data = await getPaginatedPayments(currentPage, limit);

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
          initialPayments={data.success ? data.payments : []} 
          currentPage={data.success ? data.currentPage : 1}
          totalPages={data.success ? data.totalPages : 1}
        />
      </main>
    </div>
  );
}