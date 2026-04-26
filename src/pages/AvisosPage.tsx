import { AlertTriangle, Info, Megaphone, Star } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useNotices } from "@/hooks/use-site-content";
import { formatDateTimeLabel } from "@/lib/content-api";

const iconMap: Record<string, typeof Megaphone> = {
  alert: AlertTriangle,
  star: Star,
  info: Info,
  megaphone: Megaphone,
};

const colorMap: Record<string, string> = {
  Urgente: "text-destructive border-destructive/20 bg-destructive/5",
  Destaque: "text-accent border-accent/20 bg-accent/5",
  Informativo: "text-primary border-primary/20 bg-primary/5",
  Aviso: "text-primary border-primary/20 bg-primary/5",
};

const AvisosPage = () => {
  const { data: notices = [], isLoading, error } = useNotices();

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <PageHeader
            title="Mural de avisos"
            description="Comunicados rapidos, lembretes e informacoes importantes para toda a escola."
            icon={<Megaphone className="w-8 h-8 text-primary" />}
          />

          {isLoading && <div className="rounded-2xl border border-border bg-card h-56 animate-pulse max-w-3xl" />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive max-w-3xl">
              Nao foi possivel carregar os avisos agora.
            </div>
          )}

          {!isLoading && !error && (
            <div className="max-w-3xl space-y-4">
              {notices.map((notice) => {
                const Icon = iconMap[notice.icon] || Info;
                const styles = colorMap[notice.noticeType] || "text-primary border-primary/20 bg-primary/5";
                const [textColor] = styles.split(" ");
                return (
                  <div key={notice.id} className={`flex gap-4 items-start rounded-xl border p-6 transition-shadow hover:shadow-sm ${styles}`}>
                    <Icon className={`w-6 h-6 mt-0.5 shrink-0 ${textColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 gap-3">
                        <span className={`font-body text-xs font-bold uppercase tracking-wide ${textColor}`}>{notice.noticeType}</span>
                        <span className="font-body text-xs text-muted-foreground">{formatDateTimeLabel(notice.publishedAt)}</span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">{notice.title}</h2>
                      <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{notice.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default AvisosPage;
