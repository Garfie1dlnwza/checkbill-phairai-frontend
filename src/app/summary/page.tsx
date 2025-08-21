"use client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SummaryContent from "@/components/Summary/SummaryContent";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">กำลังโหลด</h3>
        <p className="text-neutral-400">กรุณารอสักครู่...</p>
      </div>
    </div>
  );
}

// Main Summary Page Component
export default function SummaryPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SummaryContent />
    </Suspense>
  );
}
