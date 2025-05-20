import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { News } from "@shared/types";

interface NewsItemProps {
  news: News;
  showImage?: boolean;
}

export function NewsItem({ news, showImage = true }: NewsItemProps) {
  const formattedDate = format(parseISO(news.createdAt), "dd MMM yyyy", { locale: ptBR });
  
  return (
    <article className="border-b border-gray-100 pb-4">
      {showImage && news.imageUrl && (
        <img 
          src={news.imageUrl} 
          alt={news.title} 
          className="w-full h-36 object-cover rounded-md mb-3" 
        />
      )}
      <h3 className="font-semibold text-secondary hover:text-primary">
        {news.title}
      </h3>
      <p className="text-sm text-neutral-medium mt-1 line-clamp-2">
        {news.content}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-neutral-medium">{formattedDate}</span>
        <Badge variant={news.isPublic ? "public" : "internal"}>
          {news.isPublic ? "Notícia Pública" : "Notícia Interna"}
        </Badge>
      </div>
    </article>
  );
}
