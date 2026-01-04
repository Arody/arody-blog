import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Unlink } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initial content setup
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            // Only update if significantly different to avoid cursor jumping
            // A simple check might not be enough for perfect cursor preservation, 
            // but for a block editor it's usually acceptable to sync on blur or debounced.
            // Here we only set it on mount or if empty to avoid fighting the user.
            if (content === '' && editorRef.current.innerHTML === '<br>') return;
             if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = content;
            }
        }
    }, [content]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML); // Sync changes
        }
    };

    const addLink = () => {
        const url = prompt("Introduce la URL:");
        if (url) execCmd('createLink', url);
    };

    return (
        <div className={`relative group ${className}`}>
            
            {/* Toolbar - Visible on focus or hover */}
            <div className={`absolute -top-10 left-0 bg-black text-white rounded shadow-lg flex items-center gap-1 p-1 transition-opacity duration-200 z-50 ${isFocused ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:visible'}`}>
                <ToolbarBtn icon={<Bold size={14} />} onClick={() => execCmd('bold')} label="Negrita" />
                <ToolbarBtn icon={<Italic size={14} />} onClick={() => execCmd('italic')} label="Cursiva" />
                <ToolbarBtn icon={<Underline size={14} />} onClick={() => execCmd('underline')} label="Subrayado" />
                <div className="w-px h-4 bg-gray-600 mx-1" />
                <ToolbarBtn icon={<LinkIcon size={14} />} onClick={addLink} label="Enlace" />
                <ToolbarBtn icon={<Unlink size={14} />} onClick={() => execCmd('unlink')} label="Quitar enlace" />
            </div>

            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 cursor-text"
                data-placeholder={placeholder}
                style={{ whiteSpace: 'pre-wrap' }} 
            />
        </div>
    );
}

function ToolbarBtn({ icon, onClick, label }: { icon: any, onClick: (e: React.MouseEvent) => void, label: string }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus from editor
                onClick(e);
            }}
            className="p-1.5 hover:bg-gray-700 rounded transition"
            title={label}
        >
            {icon}
        </button>
    );
}
