"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function FeedbackPopup() {
    const [isVisible, setIsVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[9998] flex flex-col gap-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-2.5 sm:p-3 relative overflow-hidden group hover:ring-amber-200 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                
                <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex-1">
                        <span className="inline-flex items-center rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 mb-1">
                            Feedback
                        </span>
                        <div className="text-xs text-gray-900 leading-relaxed">
                            <span className="hidden sm:inline">Have suggestions? </span>
                            <br className="hidden sm:block"/>
                            <Link 
                                href="https://t.me/ibrohimfr" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-semibold text-amber-600 hover:text-amber-700 underline decoration-amber-300 underline-offset-2"
                            >
                                {isMobile ? "Send Feedback" : "Please send your feedbacks"}
                            </Link>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Dismiss feedback popup"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
