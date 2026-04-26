import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import { useStudentWorks } from "@/hooks/use-site-content";
import { workTypeStyles } from "@/lib/site-config";

const filters = ["Todos", "Redacao", "Poesia", "Arte", "Ciencias", "Projeto"] as const;

const StudentWork = () => {
  const [active, setActive] = useState<string>("Todos");
  const { data: works = [], isLoading, error } = useStudentWorks();
  const filtered = active === "Todos" ? works : works.filter((work) => work.workType === active);

  return (
    <section className="py-10 md:py-16 bg-card">
      <div className="container">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <PenLine className="w-7 h-7 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Trabalhos dos alunos</h2>
          </div>
          <Link to="/trabalhos" className="hidden sm:flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="newspaper-divider mb-6" />

        <div className="flex flex-wrap gap-2 mb-8">
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

        {isLoading && <div className="rounded-2xl border border-border bg-background h-44 animate-pulse" />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
            Nao foi possivel carregar os trabalhos agora.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 6).map((work) => (
              <Link to={`/trabalhos/${work.slug}`} key={work.id} className="group">
                <div className="bg-background rounded-xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-body font-semibold mb-3 ${workTypeStyles[work.workType] || "bg-secondary text-secondary-foreground"}`}>
                    {work.workType}
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{work.title}</h3>
                  <p className="font-body text-muted-foreground text-sm mb-3 leading-relaxed line-clamp-3">{work.excerpt}</p>
                  <p className="font-body text-xs text-muted-foreground italic">{work.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link to="/trabalhos" className="sm:hidden flex items-center justify-center gap-1 text-primary font-body text-sm font-semibold mt-6">
          Ver todos os trabalhos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default StudentWork;
