export default function Footer() {
    return (
      <footer className="py-12 mt-20 border-t border-[var(--border)] text-center">
        <div className="container">
          <p className="font-serif text-2xl mb-4 italic">"Capturando momentos de elegancia."</p>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)]">
            &copy; {new Date().getFullYear()} Arody Fotografía. Todos los derechos reservados.
            </p>
        </div>
      </footer>
    );
  }
