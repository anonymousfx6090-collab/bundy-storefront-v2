import { ProductCard, StoreProduct } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUpRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const catalog = trpc.catalog.list.useQuery();
  const categories = trpc.catalog.categories.useQuery();

  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ((catalog.data ?? []) as StoreProduct[]).filter(product => {
      const belongsToCategory = category === "All" || product.category === category;
      const matchesSearch = !normalized || [product.title, product.category, product.description].some(value => value.toLowerCase().includes(normalized));
      return belongsToCategory && matchesSearch;
    });
  }, [catalog.data, category, query]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf0] text-black">
      <StoreHeader />
      <main>
        <section className="bauhaus-grid relative isolate overflow-hidden border-b-2 border-black">
          <div className="absolute -right-16 -top-28 h-64 w-64 rounded-full border-[28px] border-[#155ec9] sm:h-80 sm:w-80" />
          <div className="absolute bottom-0 left-[7%] h-24 w-24 rotate-45 border-2 border-black bg-[#f0bd22] sm:h-32 sm:w-32" />
          <div className="shape-triangle absolute bottom-10 right-[17%] hidden rotate-[22deg] md:block" />
          <div className="relative mx-auto grid min-h-[610px] max-w-7xl items-end gap-10 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-[1.45fr_.55fr] lg:px-8 lg:pb-16">
            <div className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#e33d2d]" />
                <p className="bundy-label text-xs">Curated clothing / 001</p>
              </div>
              <h1 className="bundy-display max-w-4xl text-[clamp(3.8rem,11vw,9.5rem)] uppercase">Find the<br /><span className="text-[#e33d2d]">shape</span> of your<br />style.</h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed sm:text-xl">An edited collection of statement pieces, everyday essentials, and everything in between. Choose a find, then open the details when you’re ready.</p><p className="mt-5 max-w-xl border-l-4 border-[#e33d2d] bg-[#fffaf0]/80 px-4 py-3 text-base font-medium leading-relaxed text-black sm:text-lg"><strong>Affiliate Disclosure:</strong> This page contains affiliate links. We may earn a commission on qualifying purchases at no extra cost to you.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#collection" className="inline-flex items-center gap-3 border-2 border-black bg-black px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#e33d2d] active:scale-[.98]">Explore the edit <ArrowDown className="h-4 w-4" /></a>
                <a href="#about" className="inline-flex items-center gap-3 border-2 border-black bg-[#f0bd22] px-5 py-3.5 text-sm font-bold transition-colors hover:bg-white active:scale-[.98]">How Bundy works <ArrowUpRight className="h-4 w-4" /></a>
              </div>
            </div>
            <aside className="relative mb-5 justify-self-end border-2 border-black bg-[#e33d2d] p-6 text-white shadow-[9px_9px_0_#000] sm:max-w-xs">
              <Sparkles className="absolute -right-4 -top-4 h-10 w-10 rounded-full border-2 border-black bg-[#f0bd22] p-2 text-black" />
              <p className="bundy-label text-xs">The Bundy rule</p>
              <p className="mt-4 text-2xl font-bold leading-tight">Less searching.<br />More wearing.</p>
              <div className="mt-6 border-t border-white/60 pt-3 font-mono text-xs">Fresh edits, clearly linked.</div>
            </aside>
          </div>
        </section>

        <section id="collection" className="scroll-mt-16 border-b-2 border-black bg-[#fffaf0] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="bundy-label text-xs text-[#e33d2d]">The collection</p>
                <h2 className="bundy-display mt-3 text-5xl uppercase sm:text-7xl">Wearable<br />geometry.</h2>
              </div>
              <p className="max-w-sm border-l-2 border-black pl-4 text-sm leading-relaxed">Select a category or search the catalog. Every piece has its own details and purchase option.</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t-2 border-black bg-[#f0bd22] px-4 py-2 text-xs font-bold"><span className="bundy-label text-[10px]">Curated clothing drop</span><span>Choose a piece for its full details and shopping option.</span></div>
            <div className="grid gap-3 border-b-2 border-black py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <label className="flex min-h-12 items-center gap-3 border-2 border-black bg-white px-4 focus-within:ring-2 focus-within:ring-[#155ec9]">
                <Search className="h-5 w-5 shrink-0" />
                <input value={query} onChange={event => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500" placeholder="Search the collection" aria-label="Search the collection" />
              </label>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:justify-end lg:pb-0">
                <span className="flex h-12 items-center gap-2 px-1 text-xs font-bold"><SlidersHorizontal className="h-4 w-4" /> Filter</span>
                {["All", ...(categories.data ?? [])].map((item, index) => (
                  <button key={item} onClick={() => setCategory(item)} className={`h-12 shrink-0 border-2 border-black px-4 text-sm font-bold transition-colors ${category === item ? ["bg-black text-white", "bg-[#e33d2d] text-white", "bg-[#155ec9] text-white", "bg-[#f0bd22]"][index % 4] : "bg-white hover:bg-[#f0bd22]"}`}>{item}</button>
                ))}
              </div>
            </div>

            {catalog.isLoading && <div className="grid min-h-72 place-items-center border-b-2 border-black"><p className="bundy-label animate-pulse text-sm">Arranging the collection...</p></div>}
            {catalog.isError && <div className="mt-8 border-2 border-black bg-[#e33d2d] p-8 text-white"><p className="bundy-label text-xs">Catalog unavailable</p><h3 className="mt-2 text-2xl font-bold">We couldn’t load the collection.</h3><button onClick={() => catalog.refetch()} className="mt-5 border-2 border-white px-4 py-2 text-sm font-bold hover:bg-white hover:text-black">Try again</button></div>}
            {!catalog.isLoading && !catalog.isError && products.length === 0 && (
              <div className="relative mt-8 grid min-h-80 place-items-center overflow-hidden border-2 border-black bg-white p-8 text-center">
                <span className="absolute -left-7 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border-2 border-black bg-[#155ec9]" />
                <span className="absolute right-8 top-7 h-10 w-10 rotate-45 border-2 border-black bg-[#e33d2d]" />
                <span className="absolute bottom-8 right-1/4 h-14 w-14 border-2 border-black bg-[#f0bd22]" />
                <div className="relative"><span className="mx-auto block h-14 w-14 rounded-full border-2 border-black bg-[#f0bd22]" /><p className="bundy-label mt-5 text-[10px]">Future wardrobe / In formation</p><h3 className="mt-2 text-2xl font-bold">{query || category !== "All" ? "No pieces match that filter." : "The first edit is being assembled."}</h3><p className="mt-2 max-w-md text-sm text-neutral-600">{query || category !== "All" ? "Try a different search or category." : "The owner can add products and their supplied imagery from the catalog dashboard."}</p></div>
              </div>
            )}
            {!catalog.isLoading && !catalog.isError && products.length > 0 && <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>}
          </div>
        </section>

        <section id="about" className="scroll-mt-16 bg-black py-16 text-[#fffaf0] sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div><p className="bundy-label text-xs text-[#f0bd22]">A clear path to purchase</p><h2 className="bundy-display mt-4 text-5xl uppercase sm:text-6xl">Pick.<br /><span className="text-[#e33d2d]">Click.</span><br />Discover.</h2></div>
            <div className="grid gap-0 border-2 border-[#fffaf0] sm:grid-cols-3">
              {[['01', 'Browse', 'Find clothing pieces in a focused, shoppable edit.'], ['02', 'Choose', 'Open a product page for its price, image, and details.'], ['03', 'Continue', 'Select View on Temu when you are ready to continue.']].map(([number, title, text], index) => <div key={title} className={`p-6 ${index < 2 ? 'border-b-2 border-[#fffaf0] sm:border-b-0 sm:border-r-2' : ''}`}><p className="font-mono text-[#f0bd22]">{number}</p><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-300">{text}</p></div>)}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t-2 border-black bg-[#f0bd22] px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs sm:flex-row"><p className="font-bold">© {new Date().getFullYear()} Bundy. A curated clothing edit.</p><p>Prices and availability may change.</p></div></footer>
    </div>
  );
}
