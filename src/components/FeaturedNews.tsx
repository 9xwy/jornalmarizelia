import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ContentImage from "@/components/ContentImage";
import { useNewsArticles } from "@/hooks/use-site-content";
import { formatPublishedLabel } from "@/lib/content-api";
import { newsCategoryStyles } from "@/lib/site-config";

const FeaturedNews = () => {
  const { data: articles = [], isLoading, error } = useNewsArticles();
  const ordered = [...articles].sort((a, b) => Number(b.featured) - Number(a.featured));
  const [featured, ...secondary] = ordered;

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Noticias em destaque</h2>
          <Link to="/noticias" className="hidden sm:flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="newspaper-divider mb-8" />

        {isLoading && (
          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-3 rounded-xl border border-border bg-card h-[380px] animate-pulse" />
            <div className="lg:col-span-2 grid gap-4">
              <div className="rounded-xl border border-border bg-card h-[118px] animate-pulse" />
              <div className="rounded-xl border border-border bg-card h-[118px] animate-pulse" />
              <div className="rounded-xl border border-border bg-card h-[118px] animate-pulse" />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
            Nao foi possivel carregar as noticias agora.
          </div>
        )}

        {!isLoading && !error && featured && (
          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            <Link to={`/noticias/${featured.slug}`} className="lg:col-span-3 group">
              <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="h-56 md:h-72">
                  <ContentImage src={featured.coverImageUrl} alt={featured.title} tone={featured.coverTone} className="h-full" />
                </div>
                <div className="p-6">
                  <Badge className={`${newsCategoryStyles[featured.category] || "bg-secondary text-secondary-foreground"} mb-3 font-body text-xs font-semibold`}>
                    {featured.category}
                  </Badge>
                  <h3 className="font-display text-2xl font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">{featured.summary}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-body text-xs text-muted-foreground italic">Por {featured.author}</p>
                    <p className="font-body text-xs text-muted-foreground">{formatPublishedLabel(featured.publishedAt)}</p>
                  </div>
                </div>
              </article>
            </Link>

            <div className="lg:col-span-2 flex flex-col gap-4">
              {secondary.slice(0, 3).map((article) => (
                <Link to={`/noticias/${article.slug}`} key={article.id} className="group">
                  <article className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
                    <Badge className={`${newsCategoryStyles[article.category] || "bg-secondary text-secondary-foreground"} mb-2 font-body text-xs font-semibold`}>
                      {article.category}
                    </Badge>
                    <h3 className="font-display text-base font-bold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-xs leading-relaxed line-clamp-2">{article.summary}</p>
                    <p className="font-body text-xs text-muted-foreground italic mt-2">Por {article.author}</p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && !featured && (
          <div className="rounded-2xl border border-border bg-card p-6 font-body text-sm text-muted-foreground">
            Nenhuma noticia publicada ainda.
          </div>
        )}

        <Link to="/noticias" className="sm:hidden flex items-center justify-center gap-1 text-primary font-body text-sm font-semibold mt-4">
          Ver todas as noticias <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedNews;
