import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useCalendarEvents } from "@/hooks/use-site-content";
import { formatDateInputValue, formatMonthLabel } from "@/lib/content-api";

const SchoolCalendar = () => {
  const { data: events = [], isLoading, error } = useCalendarEvents();
  const currentEvents = events.slice(0, 6);
  const monthName = currentEvents[0]?.eventDate ? formatMonthLabel(currentEvents[0].eventDate) : "agenda";

  return (
    <section className="py-10 md:py-16 bg-card">
      <div className="container">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary capitalize">
              Calendario - {monthName}
            </h2>
          </div>
          <Link to="/calendario" className="hidden sm:flex items-center gap-1 text-primary font-body text-sm font-semibold hover:underline">
            Ver completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="newspaper-divider mb-8" />

        {isLoading && <div className="rounded-2xl border border-border bg-background h-36 animate-pulse" />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
            Nao foi possivel carregar a agenda agora.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentEvents.map((event) => (
              <div key={event.id} className="flex gap-4 items-start bg-secondary/50 rounded-lg p-4">
                <span className="font-display text-3xl font-black text-primary leading-none min-w-[2.5rem] text-center">
                  {formatDateInputValue(event.eventDate).slice(-2)}
                </span>
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">{event.title}</p>
                  <p className="font-body text-muted-foreground text-xs">{event.description}</p>
                  <p className="font-body text-xs text-muted-foreground mt-2">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/calendario" className="sm:hidden flex items-center justify-center gap-1 text-primary font-body text-sm font-semibold mt-6">
          Ver calendario completo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default SchoolCalendar;
