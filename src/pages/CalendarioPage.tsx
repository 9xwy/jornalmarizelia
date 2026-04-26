import { CalendarDays } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useCalendarEvents } from "@/hooks/use-site-content";
import { formatDateInputValue, formatMonthLabel } from "@/lib/content-api";

const CalendarioPage = () => {
  const { data: events = [], isLoading, error } = useCalendarEvents();
  const monthGroups = Array.from(new Set(events.map((event) => formatMonthLabel(event.eventDate))));

  return (
    <PublicLayout>
      <section className="py-10 md:py-16">
        <div className="container">
          <PageHeader
            title="Calendario escolar"
            description="Datas importantes, encontros, eventos da comunidade e agenda academica."
            icon={<CalendarDays className="w-8 h-8 text-primary" />}
          />

          {isLoading && <div className="rounded-2xl border border-border bg-card h-56 animate-pulse" />}

          {!isLoading && error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
              Nao foi possivel carregar o calendario agora.
            </div>
          )}

          {!isLoading &&
            !error &&
            monthGroups.map((month) => (
              <div key={month} className="mb-10">
                <h2 className="font-display text-2xl font-bold text-primary capitalize mb-4">{month}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events
                    .filter((event) => formatMonthLabel(event.eventDate) === month)
                    .map((event) => (
                      <div key={event.id} className="flex gap-4 items-start bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                        <div className="bg-primary/10 rounded-lg w-14 h-14 flex items-center justify-center shrink-0">
                          <span className="font-display text-2xl font-black text-primary leading-none">
                            {formatDateInputValue(event.eventDate).slice(-2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">{event.title}</p>
                          <p className="font-body text-muted-foreground text-xs mt-0.5">{event.description}</p>
                          <p className="font-body text-xs text-muted-foreground mt-2">{event.location}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default CalendarioPage;
