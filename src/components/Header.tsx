import Link from 'next/link';
import clsx from 'clsx';

export default function Header() {
  return (
    <header className="py-8 border-b border-[var(--border)] mb-12">
      <div className="container flex flex-col items-center justify-between md:flex-row">
        <nav className="flex gap-6 text-sm uppercase tracking-widest text-[var(--accent)] mb-4 md:mb-0">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Inicio</Link>
          <Link href="/blog" className="hover:text-[var(--foreground)] transition-colors">Historias</Link>
          <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">Sobre mí</Link>
        </nav>

        <div className="text-center">
            <Link href="/">
                <h1 className="text-4xl m-0 font-serif tracking-tighter">ARODY</h1>
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mt-1">
            Fotografía & Diario
            </p>
        </div>

        <div className="w-full md:w-auto flex justify-center md:justify-end gap-4 mt-4 md:mt-0">
          {/* Socials or Search could go here. */}
        </div>
      </div>
    </header>
  );
}
