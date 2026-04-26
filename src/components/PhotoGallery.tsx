import { Link } from "react-router-dom";
import { ArrowRight, Camera } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { useGalleryItems } from "@/hooks/use-site-content";

const PhotoGallery = () => {
  const { data: gallery = [], isLoading, error } = useGalleryItems();

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Camera className="w-7 h-7 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Galeria de fotos</h2>
          </div>
          <Link to="/galeria" className="hidden sm:flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            Ver galeria <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="newspaper-divider mb-8" />

        {isLoading && <div className="rounded-2xl border border-border bg-card h-48 animate-pulse" />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
            Nao foi possivel carregar a galeria agora.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gallery.slice(0, 8).map((item) => (
              <div key={item.id} className="aspect-square rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
                <ContentImage src={item.imageUrl} alt={item.title} tone={item.coverTone} icon={Camera} className="h-full" />
              </div>
            ))}
          </div>
        )}

        <Link to="/galeria" className="sm:hidden flex items-center justify-center gap-1 text-primary font-body text-sm font-semibold mt-6">
          Ver galeria completa <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default PhotoGallery;
