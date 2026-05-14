import { ExternalNewsArticle } from "@/types/news";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";

interface NewsCardProps {
  article: ExternalNewsArticle;
  isFeatured?: boolean;
}

export default function NewsCard({ article, isFeatured = false }: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const tags = article.tags
    ? article.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const displayImage = article.thumbnailUrl || "/images/default/news.svg";

  if (isFeatured) {
    return (
      <a 
        href={article.articleUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group relative mb-12 block overflow-hidden rounded-[32px] bg-white shadow-lg transition-all duration-500 hover:shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row">
          <div className="relative h-64 w-full overflow-hidden lg:h-[420px] lg:w-3/5">
            {/* Skeleton Background */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-200" />
            )}
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={article.title}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            
            <div className="absolute top-6 left-6">
              <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                TIN TỨC NỔI BẬT
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 lg:w-2/5 lg:p-12">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">
                  #{tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl lg:text-4xl">
              {article.title}
            </h2>
            
            <p className="mt-6 line-clamp-3 text-lg leading-relaxed text-slate-600">
              {article.summary}
            </p>

            <div className="mt-8 flex items-center gap-3 font-bold text-blue-600 transition-colors group-hover:text-blue-700">
              <span>Đọc bài gốc tại nguồn</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 transition-transform group-hover:translate-x-2">
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a 
      href={article.articleUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative h-52 overflow-hidden">
          {/* Skeleton Background */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={article.title}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          
          <div className="absolute top-4 right-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-blue-600 shadow-sm backdrop-blur-sm">
             {article.category?.toUpperCase() || "TIN TỨC"}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
            {article.title}
          </h3>

          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
            {article.summary}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex gap-2">
               {tags.slice(0, 1).map(tag => (
                 <span key={tag} className="text-[10px] font-bold uppercase text-slate-400">#{tag}</span>
               ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
              XEM NGUỒN <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
