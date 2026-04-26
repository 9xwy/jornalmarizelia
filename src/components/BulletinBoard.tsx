import { ArrowRight, AlertTriangle, Info, Megaphone, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotices } from "@/hooks/use-site-content";
import { formatDateTimeLabel } from "@/lib/content-api";

const iconMap: Record<string, typeof Megaphone> = {
  alert: AlertTriangle,
  star: Star,
  info: Info,
  megaphone: Megaphone,
};

const colorMap: Record<string, string> = {
  Urgente: "text-destructive",
  Destaque: "text-accent",
  Informativo: "text-primary",
  Aviso: "text-primary",
};

const BulletinBoard = () => {
  const { data: notices = [], isLoading, error } = useNotices();

  return (
    <section className="py-10 md:py-16 bg-card">
      <div className="container">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Mural de avisos</h2>
          </div>
          <Link to="/avisos" className="hidden sm:flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="newspaper-divider mb-8" />

        {isLoading && <div className="rounded-2xl border border-border bg-background h-44 animate-pulse max-w-3xl" />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive max-w-3xl">
            Nao foi possivel carregar os avisos agora.
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4 max-w-3xl">
            {notices.slice(0, 4).map((notice) => {
              const Icon = iconMap[notice.icon] || Info;
              const color = colorMap[notice.noticeType] || "text-primary";
              return (
                <div key={notice.id} className="flex gap-4 items-start bg-background rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5 gap-3">
                      <span className={`font-body text-xs font-bold uppercase tracking-wide ${color}`}>{notice.noticeType}</span>
                      <span className="font-body text-xs text-muted-foreground">{formatDateTimeLabel(notice.publishedAt)}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground mt-0.5">{notice.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{notice.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/avisos" className="sm:hidden flex items-center justify-center gap-1 text-primary font-body text-sm font-semibold mt-6">
          Ver todos os avisos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default BulletinBoard;
