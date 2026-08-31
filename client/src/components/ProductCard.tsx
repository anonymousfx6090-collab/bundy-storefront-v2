import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export type StoreProduct = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  temuUrl: string;
};

function displayPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function ProductCard({ product, index = 0 }: { product: StoreProduct; index?: number }) {
  const accents = ["bg-[#e33d2d]", "bg-[#155ec9]", "bg-[#f0bd22]"];
  return (
    <article className="product-card group relative reveal" style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}>
      <span className={`absolute -left-2 -top-2 z-10 h-5 w-5 border-2 border-black ${accents[index % accents.length]}`} />
      <Link href={`/product/${product.slug}`} className="block overflow-hidden border-2 border-black bg-white">
        <div className="aspect-[4/5] overflow-hidden bg-[#e5dfd3]">
          <img className="product-image h-full w-full object-cover" src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
        </div>
        <div className="border-t-2 border-black p-4">
          <div className="flex items-center justify-between gap-3"><p className="bundy-label text-[10px]">{product.category}</p><span className="bundy-label bg-[#f0bd22] px-1.5 py-0.5 text-[8px]">Bundy pick</span></div>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight">{product.title}</h3>
          <p className="mt-2 font-mono text-lg font-bold text-[#e33d2d]">{displayPrice(product.price, product.currency)}</p>
        </div>
      </Link>
      <a href={product.temuUrl} target="_blank" rel="noreferrer" className="mt-2 flex w-full items-center justify-between border-2 border-black bg-[#155ec9] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black active:scale-[.98]">
        View on Temu <ArrowUpRight className="h-4 w-4" />
      </a>
    </article>
  );
}
