import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ContentImage from "@/components/ContentImage";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useNewsArticles } from "@/hooks/use-site-content";
import { formatPublishedLabel } from "@/lib/content-api";
import { newsCategories, newsCategoryStyles } from "@/lib/site-config";

const NoticiasPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const { data: articles = [], isLoading, error } = useNewsArticles();

  const filtered = articles.filter((article) => {
    const matchesCategory = category === "Todas" || article.category === category;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      article.title.toLowerCase().includes(term) ||
      article.summary.toLowerCase().includes(term) ||
      article.author.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <PageHeader
            title="Todas as noticias"
            description="Cobertura completa da rotina, dos projetos e dos acontecimentos da Escola Marizelia."
            icon={<Newspaper className="w-8 h-8 text-primary" />}
          />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end mb-8">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo, resumo ou autor"
            />

            <div className="flex flex-wrap gap-2">
              {["Todas", ...newsCategories].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
                    category === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <div className="rounded-2xl border border-border bg-card h-56 animate-pulse" />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
              Nao foi possivel carregar as noticias agora.
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <Link to={`/noticias/${article.slug}`} key={article.id} className="group">
                  <article className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="h-44">
                      <ContentImage src={article.coverImageUrl} alt={article.title} tone={article.coverTone} className="h-full" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <Badge className={`${newsCategoryStyles[article.category] || "bg-secondary text-secondary-foreground"} mb-3 font-body text-xs font-semibold w-fit`}>
                        {article.category}
                      </Badge>
                      <h2 className="font-display text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{article.summary}</p>
                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <p className="font-body text-xs text-muted-foreground italic">Por {article.author}</p>
                        <p className="font-body text-xs text-muted-foreground">{formatPublishedLabel(article.publishedAt)}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 font-body text-sm text-muted-foreground mt-6">
              Nenhuma noticia encontrada com os filtros atuais.
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default NoticiasPage;
