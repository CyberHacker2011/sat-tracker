"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function AuthRedirectToast() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("notification") === "already_signed_in") {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 0);
      
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-red-500/50 backdrop-blur-sm">
        <div className="bg-white/20 p-1.5 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-wide">
            Already Signed In
          </span>
          <span className="text-xs text-red-50 font-medium">
            To switch accounts, first sign out.
          </span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:bg-white/20 p-1 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
