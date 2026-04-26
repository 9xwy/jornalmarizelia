import { useState } from "react";
import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useStudentWorks } from "@/hooks/use-site-content";
import { workTypeStyles } from "@/lib/site-config";

const filters = ["Todos", "Redacao", "Poesia", "Arte", "Ciencias", "Projeto"] as const;

const TrabalhosPage = () => {
  const [active, setActive] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const { data: works = [], isLoading, error } = useStudentWorks();
  const filtered = works.filter((work) => {
    const matchesType = active === "Todos" || work.workType === active;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      work.title.toLowerCase().includes(term) ||
      work.excerpt.toLowerCase().includes(term) ||
      work.author.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <PageHeader
            title="Trabalhos dos alunos"
            description="Uma vitrine para textos, projetos, artes e experimentos produzidos ao longo do ano."
            icon={<PenLine className="w-8 h-8 text-primary" />}
          />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] mb-8">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo, autor ou trecho"
            />

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActive(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${
                    active === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <div className="rounded-2xl border border-border bg-card h-56 animate-pulse" />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
              Nao foi possivel carregar os trabalhos agora.
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((work) => (
                <Link to={`/trabalhos/${work.slug}`} key={work.id} className="group">
                  <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex flex-col">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-body font-semibold mb-3 w-fit ${workTypeStyles[work.workType] || "bg-secondary text-secondary-foreground"}`}>
                      {work.workType}
                    </span>
                    <h2 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{work.title}</h2>
                    <p className="font-body text-muted-foreground text-sm mb-4 leading-relaxed flex-1">{work.excerpt}</p>
                    <p className="font-body text-xs text-muted-foreground italic mt-auto">{work.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 font-body text-sm text-muted-foreground mt-6">
              Nenhum trabalho encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default TrabalhosPage;
