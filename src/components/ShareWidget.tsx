"use client";

import { useState } from 'react';
import { Share2, Link as LinkIcon, Facebook, Phone } from 'lucide-react';

interface ShareWidgetProps {
    slug: string;
    title: string;
    location?: 'card' | 'post';
}

export default function ShareWidget({ slug, title, location = 'card' }: ShareWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // We need to construct the URL. Since this is client-side, we can use window.
    // However, for SSR safety, use a getter or effect, but for click handlers it's fine.
    
    const getUrl = () => {
         const origin = typeof window !== 'undefined' ? window.location.origin : '';
         return `${origin}/blog/${slug}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleWhatsApp = () => {
        const url = encodeURIComponent(getUrl());
        const text = encodeURIComponent(title);
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    };

    const handleFacebook = () => {
        const url = encodeURIComponent(getUrl());
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };
    
    // Toggle for mobile/desktop interaction
    const toggleOpen = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a Link component
        setIsOpen(!isOpen);
    };

    if (location === 'post') {
        return (
            <div className="flex items-center gap-4 border-t border-b border-gray-100 py-6 my-8">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Compartir</span>
                <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 rounded-full hover:bg-gray-100 transition relative group" title="Copiar Link">
                        <LinkIcon size={18} />
                        {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded">Copiado</span>}
                    </button>
                     <button onClick={handleFacebook} className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition" title="Facebook">
                        <Facebook size={18} />
                    </button>
                </div>
            </div>
        )
    }

    // Card Version (Minimal, Popover-like)
    return (
        <div className="relative group/share z-20">
             <button 
                onClick={toggleOpen}
                className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-black'}`}
            >
                <Share2 size={16} />
             </button>

             {/* Dropdown Menu */}
             <div className={`absolute bottom-full right-0 mb-2 bg-white shadow-xl border border-gray-100 rounded-lg p-2 flex flex-col gap-1 transition-all duration-300 origin-bottom-right w-32 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <button onClick={(e) => { e.preventDefault(); handleCopy(); }} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 rounded text-left w-full">
                    <LinkIcon size={12} /> {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
                <button onClick={(e) => { e.preventDefault(); handleWhatsApp(); }} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 rounded text-left w-full hover:text-green-600">
                    <Phone size={12} className="rotate-90"/> WhatsApp
                </button>
                <button onClick={(e) => { e.preventDefault(); handleFacebook(); }} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 rounded text-left w-full hover:text-blue-600">
                    <Facebook size={12} /> Facebook
                </button>
             </div>
        </div>
    );
}

