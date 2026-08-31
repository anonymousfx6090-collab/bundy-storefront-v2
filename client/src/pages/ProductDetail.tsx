import { StoreHeader } from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { Link, useRoute } from "wouter";

function formatPrice(price: number, currency: string) {
  try { return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(price); }
  catch { return `${currency} ${price.toLocaleString()}`; }
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug ?? "";
  const product = trpc.catalog.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });

  useEffect(() => {
    if (product.data) document.title = `${product.data.title} — Bundy`;
    return () => { document.title = "Bundy — Curated Clothing"; };
  }, [product.data]);

  if (product.isLoading) return <div className="grid min-h-screen place-items-center bg-[#fffaf0]"><p className="bundy-label animate-pulse text-sm">Opening the find...</p></div>;
  if (product.isError || !product.data) return <div className="min-h-screen bg-[#fffaf0]"><StoreHeader /><main className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center px-4"><div className="max-w-md border-2 border-black bg-white p-8 text-center"><span className="mx-auto block h-10 w-10 bg-[#e33d2d]" /><h1 className="bundy-display mt-5 text-4xl uppercase">This find<br />is gone.</h1><p className="mt-4 text-sm text-neutral-600">It may no longer be published, or the link may have changed.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-[#f0bd22] px-4 py-3 text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Back to collection</Link></div></main></div>;

  const item = product.data;
  return <div className="min-h-screen bg-[#fffaf0] text-black"><StoreHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold hover:text-[#155ec9]"><ArrowLeft className="h-4 w-4" /> Back to collection</Link><div className="mt-7 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-16"><div className="relative"><span className="absolute -left-3 -top-3 z-10 h-8 w-8 rounded-full border-2 border-black bg-[#e33d2d]" /><div className="overflow-hidden border-2 border-black bg-[#e5dfd3]"><img src={item.imageUrl} alt={item.imageAlt} className="aspect-[4/5] h-full w-full object-cover" /></div><div className="mt-3 flex items-center justify-between border-2 border-black bg-[#f0bd22] px-4 py-3 text-xs font-bold"><span className="bundy-label">Curated for the Bundy edit</span><span>01 / 01</span></div></div><div className="flex flex-col justify-center"><p className="bundy-label text-xs text-[#e33d2d]">{item.category}</p><h1 className="bundy-display mt-4 text-5xl uppercase sm:text-7xl">{item.title}</h1><p className="mt-6 font-mono text-2xl font-medium">{formatPrice(item.price, item.currency)}</p><div className="mt-6 border-y-2 border-black py-6"><p className="max-w-xl text-base leading-relaxed">{item.description}</p></div><a href={item.temuUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex w-full items-center justify-between border-2 border-black bg-[#155ec9] px-5 py-4 text-base font-bold text-white transition-colors hover:bg-black active:scale-[.98]">View on Temu <ArrowUpRight className="h-5 w-5" /></a><p className="mt-4 flex gap-2 text-xs leading-relaxed text-neutral-600"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /> You’ll continue in a new tab. Prices and availability may vary by location and promotion.</p></div></div></main></div>;
}
