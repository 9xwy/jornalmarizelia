import { defaultSiteSettings } from "@/data/site-settings";
import { useSiteSettings } from "@/hooks/use-site-content";

const HeroHeader = () => {
  const { data } = useSiteSettings();
  const settings = data ?? defaultSiteSettings;
  const today = new Date();
  const formatted = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header id="inicio" className="relative overflow-hidden bg-card py-12 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,93,173,0.12),_transparent_55%)]" />
      <div className="container text-center relative">
        <p className="text-muted-foreground font-body text-sm uppercase tracking-widest mb-2">
          {formatted}
        </p>
        <div className="newspaper-divider mb-4" />
        <h1 className="font-display text-5xl md:text-7xl font-black text-primary tracking-tight leading-none">
          {settings.siteTitle}
        </h1>
        <div className="newspaper-divider mt-4 mb-3" />
        <p className="font-display italic text-muted-foreground text-base md:text-lg">
          {settings.heroTagline}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
          <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Cobertura escolar</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">Noticias vivas</p>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Eventos, resultados, projetos e bastidores atualizados em um unico lugar.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
            <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">Participacao</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">Voz dos alunos</p>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Textos, fotos, enquete da semana e espaco para producoes autorais.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
