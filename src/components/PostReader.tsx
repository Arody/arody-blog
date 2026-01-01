"use client";

import { useState } from "react";
import { Type, Smartphone, Check } from "lucide-react";
import clsx from "clsx";

interface PostReaderProps {
  content: string;
}

type FontStyle = "elegant" | "modern" | "mobile";

export default function PostReader({ content }: PostReaderProps) {
  const [fontStyle, setFontStyle] = useState<FontStyle>("elegant");

  const styles = {
    elegant: "font-serif prose-lg first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]",
    modern: "font-sans prose-base tracking-tight leading-relaxed",
    mobile: "font-sans prose-xl leading-loose tracking-wide",
  };

  return (
    <div className="relative">
      {/* Typography Controls - Floating Bottom Center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full p-2 flex gap-4 shadow-xl transition-all hover:scale-105">
          <button
            onClick={() => setFontStyle("elegant")}
            className={clsx(
              "p-2 rounded-full transition-all text-xs flex items-center gap-2",
              fontStyle === "elegant" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-500"
            )}
            title="Elegante (Original)"
          >
            <span className="font-serif italic font-bold text-lg">Aa</span>
          </button>

          <button
            onClick={() => setFontStyle("modern")}
            className={clsx(
              "p-2 rounded-full transition-all text-xs flex items-center gap-2",
              fontStyle === "modern" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-500"
            )}
            title="Moderna"
          >
            <span className="font-sans font-bold text-lg">Aa</span>
          </button>

          <button
            onClick={() => setFontStyle("mobile")}
            className={clsx(
              "p-2 rounded-full transition-all text-xs flex items-center gap-2",
              fontStyle === "mobile" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-500"
            )}
            title="Ideal para Móviles"
          >
             <Smartphone size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={clsx(
          "prose mx-auto transition-all duration-500 ease-in-out",
          styles[fontStyle]
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
