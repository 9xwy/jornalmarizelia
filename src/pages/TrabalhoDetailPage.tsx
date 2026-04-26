import { Link, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useStudentWork, useStudentWorks } from "@/hooks/use-site-content";
import { formatPublishedLabel } from "@/lib/content-api";
import { workTypeStyles } from "@/lib/site-config";

const TrabalhoDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: work, isLoading, error } = useStudentWork(slug);
  const { data: works = [] } = useStudentWorks();

  if (!isLoading && (!work || error)) {
    return (
      <PublicLayout>
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-primary mb-4">Trabalho nao encontrado</h1>
            <Link to="/trabalhos" className="text-primary font-body hover:underline">Voltar aos trabalhos</Link>
          </div>
        </main>
      </PublicLayout>
    );
  }

  const related = works.filter((item) => item.slug !== slug && item.workType === work?.workType).slice(0, 2);

  return (
    <PublicLayout>
      <main className="flex-1 py-10 md:py-16">
        <div className="container">
          {isLoading && <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card h-80 animate-pulse" />}

          {work && (
            <div className="max-w-3xl mx-auto">
              <Link to="/trabalhos" className="inline-flex items-center gap-1 text-primary font-body text-sm font-medium hover:underline mb-8">
                <ArrowLeft className="w-4 h-4" /> Voltar aos trabalhos
              </Link>

              <div className="rounded-3xl overflow-hidden border border-border bg-card mb-8">
                <div className="h-56">
                  <ContentImage src={work.coverImageUrl} alt={work.title} tone={work.coverTone} className="h-full" />
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-body font-semibold mb-4 ${workTypeStyles[work.workType] || "bg-secondary text-secondary-foreground"}`}>
                    {work.workType}
                  </span>

                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                    {work.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                    <span className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {work.author}
                    </span>
                    <span className="font-body text-sm text-muted-foreground">{formatPublishedLabel(work.publishedAt)}</span>
                  </div>

                  <div className={`font-body text-foreground/90 text-base md:text-lg leading-relaxed space-y-4 ${work.workType === "Poesia" ? "italic" : ""}`}>
                    {work.content.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {related.length > 0 && (
                <div className="mt-16">
                  <h2 className="font-display text-2xl font-bold text-primary mb-2">Mais em {work.workType}</h2>
                  <div className="newspaper-divider mb-6" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    {related.map((item) => (
                      <Link to={`/trabalhos/${item.slug}`} key={item.id} className="group">
                        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
                          <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="font-body text-xs text-muted-foreground italic mt-1">{item.author}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
};

export default TrabalhoDetailPage;
