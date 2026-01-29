"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const images = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"];

export default function Slideshow() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-20 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto">
        {/* Premium Badge - Centered */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-sm font-black uppercase tracking-widest text-amber-500">
              Premium Pages
            </span>
          </div>
        </div>

        {/* Full-width Marquee Container - Clean & Borderless */}
        <div className="relative group">
          {/* Subtle top/bottom borders for structure */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Marquee Content */}
          <div className="relative flex overflow-hidden py-12">
            <div
              className="flex animate-marquee hover:[animation-play-state:paused] w-max gap-10 px-8"
              style={{ animationDuration: "120s" }} // Even slower animation speed for larger screens
            >
              {[...images, ...images].map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  // Desktop ratio (16:9) - Width 800px, aspect-video automatically handles height
                  className="relative w-[280px] sm:w-[600px] lg:w-[800px] aspect-video flex-shrink-0 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 group/item bg-slate-900 border border-white/20 hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  <Image
                    src={src}
                    alt={`Premium Page Preview ${index + 1}`}
                    fill
                    className="object-cover" // Ensures the image fills the 16:9 frame perfectly
                    sizes="800px"
                    quality={90}
                  />

                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Dark gradient at bottom for depth */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Soft fade edges for infinite feel */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
