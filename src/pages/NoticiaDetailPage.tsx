import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ContentImage from "@/components/ContentImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useNewsArticle, useNewsArticles } from "@/hooks/use-site-content";
import { formatPublishedLabel } from "@/lib/content-api";
import { newsCategoryStyles } from "@/lib/site-config";

const NoticiaDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: article, isLoading, error } = useNewsArticle(slug);
  const { data: allArticles = [] } = useNewsArticles();

  if (!isLoading && (!article || error)) {
    return (
      <PublicLayout>
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-primary mb-4">Noticia nao encontrada</h1>
            <Link to="/noticias" className="text-primary font-body hover:underline">Voltar as noticias</Link>
          </div>
        </main>
      </PublicLayout>
    );
  }

  const otherArticles = allArticles.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <PublicLayout>
      <main className="flex-1">
        <div className="h-48 md:h-72 relative">
          {article ? (
            <ContentImage src={article.coverImageUrl} alt={article.title} tone={article.coverTone} className="h-full" />
          ) : (
            <div className="h-full bg-card animate-pulse" />
          )}
          <div className="container h-full flex items-end pb-6">
            <Link to="/noticias" className="inline-flex items-center gap-1 text-foreground/70 font-body text-sm font-medium hover:text-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          {isLoading && <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card h-80 animate-pulse" />}

          {article && (
            <div className="max-w-3xl mx-auto">
              <Badge className={`${newsCategoryStyles[article.category] || "bg-secondary text-secondary-foreground"} mb-4 font-body text-xs font-semibold`}>
                {article.category}
              </Badge>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                  <User className="w-4 h-4" /> {article.author}
                </span>
                <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" /> {formatPublishedLabel(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                  <Tag className="w-4 h-4" /> {article.category}
                </span>
              </div>

              <div className="font-body text-foreground/90 text-base md:text-lg leading-relaxed space-y-4">
                {article.content.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {article && otherArticles.length > 0 && (
            <div className="max-w-3xl mx-auto mt-16">
              <h2 className="font-display text-2xl font-bold text-primary mb-2">Outras noticias</h2>
              <div className="newspaper-divider mb-6" />
              <div className="grid sm:grid-cols-3 gap-4">
                {otherArticles.map((item) => (
                  <Link to={`/noticias/${item.slug}`} key={item.id} className="group">
                    <article className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all">
                      <Badge className={`${newsCategoryStyles[item.category] || "bg-secondary text-secondary-foreground"} mb-2 font-body text-xs font-semibold`}>
                        {item.category}
                      </Badge>
                      <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
};

export default NoticiaDetailPage;
