import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const explore = () => {
    setOpen(false);
    if (window.location.pathname !== "/") setLocation("/");
    window.setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2" aria-label="Bundy home">
          <span className="grid h-7 w-7 grid-cols-2 overflow-hidden border-2 border-black transition-transform duration-200 group-hover:rotate-12">
            <span className="bg-[#e33d2d]" /><span className="bg-[#155ec9]" /><span className="bg-[#f0bd22]" /><span className="bg-black" />
          </span>
          <span className="bundy-display text-2xl uppercase">Bundy</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label="Primary navigation">
          <button onClick={explore} className="hover:text-[#155ec9]">Collection</button>
          <a href="#about" className="hover:text-[#e33d2d]">How it works</a>
          <Link href="/admin" className="flex items-center gap-1 border-b-2 border-black pb-0.5 hover:border-[#155ec9] hover:text-[#155ec9]">Owner <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </nav>

        <button className="grid h-10 w-10 place-items-center border-2 border-black md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t-2 border-black bg-[#fffaf0] p-4 md:hidden" aria-label="Mobile navigation">
          <button onClick={explore} className="block w-full border-b border-black py-3 text-left text-lg font-bold">Collection</button>
          <a onClick={() => setOpen(false)} href="#about" className="block border-b border-black py-3 text-lg font-bold">How it works</a>
          <Link onClick={() => setOpen(false)} href="/admin" className="block py-3 text-lg font-bold">Owner catalog</Link>
        </nav>
      )}
    </header>
  );
}
