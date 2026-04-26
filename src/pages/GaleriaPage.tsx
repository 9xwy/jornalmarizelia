import { useState } from "react";
import { Camera } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useGalleryItems } from "@/hooks/use-site-content";

const GaleriaPage = () => {
  const { data: gallery = [], isLoading, error } = useGalleryItems();
  const [active, setActive] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(gallery.map((item) => item.category)))];
  const filtered = active === "Todas" ? gallery : gallery.filter((item) => item.category === active);

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <PageHeader
            title="Galeria de fotos"
            description="Um arquivo visual com eventos, projetos, celebracoes e a rotina da escola."
            icon={<Camera className="w-8 h-8 text-primary" />}
          />

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActive(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${
                  active === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {isLoading && <div className="rounded-2xl border border-border bg-card h-56 animate-pulse" />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
              Nao foi possivel carregar a galeria agora.
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                  <div className="aspect-square">
                    <ContentImage src={item.imageUrl} alt={item.title} tone={item.coverTone} icon={Camera} className="h-full" />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-bold text-foreground">{item.title}</p>
                    <p className="font-body text-sm text-muted-foreground mt-1">{item.caption}</p>
                    <p className="font-body text-xs text-muted-foreground mt-3">{item.category}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default GaleriaPage;
