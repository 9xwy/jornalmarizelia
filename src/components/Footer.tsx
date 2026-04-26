import { Link } from "react-router-dom";
import { ExternalLink, Mail, MapPin, Newspaper, Phone } from "lucide-react";
import { defaultSiteSettings } from "@/data/site-settings";
import { useSiteSettings } from "@/hooks/use-site-content";

const socialLinks = [
  { key: "instagramUrl", label: "Instagram" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "youtubeUrl", label: "YouTube" },
] as const;

const Footer = () => {
  const { data } = useSiteSettings();
  const settings = data ?? defaultSiteSettings;

  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5" />
              <span className="font-display text-xl font-bold">{settings.siteTitle}</span>
            </Link>
            <p className="font-body text-sm text-primary-foreground/70 max-w-sm">
              {settings.siteDescription}
            </p>
            {socialLinks.some((item) => settings[item.key]) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((item) =>
                  settings[item.key] ? (
                    <a
                      key={item.key}
                      href={settings[item.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/20 px-2.5 py-1.5 font-body text-xs text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                    >
                      {item.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-bold mb-3 uppercase tracking-wide text-primary-foreground/90">Navegacao</h3>
            <div className="font-body text-sm text-primary-foreground/60 space-y-1.5">
              <Link to="/noticias" className="block hover:text-primary-foreground transition-colors">Noticias</Link>
              <Link to="/calendario" className="block hover:text-primary-foreground transition-colors">Calendario</Link>
              <Link to="/galeria" className="block hover:text-primary-foreground transition-colors">Galeria</Link>
              <Link to="/trabalhos" className="block hover:text-primary-foreground transition-colors">Trabalhos</Link>
              <Link to="/avisos" className="block hover:text-primary-foreground transition-colors">Avisos</Link>
              <Link to="/admin" className="block hover:text-primary-foreground transition-colors">Admin</Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold mb-3 uppercase tracking-wide text-primary-foreground/90">Contato</h3>
            <div className="font-body text-sm text-primary-foreground/60 space-y-2">
              <p>{settings.schoolName}</p>
              {settings.schoolAddress && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.schoolAddress}</span>
                </p>
              )}
              {settings.contactEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary-foreground transition-colors">
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings.contactPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{settings.contactPhone}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold mb-3 uppercase tracking-wide text-primary-foreground/90">Equipe editorial</h3>
            <div className="font-body text-sm text-primary-foreground/60 space-y-1">
              {settings.editorialTeam.map((member) => (
                <p key={member}>{member}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-4 text-center">
          <p className="font-body text-xs text-primary-foreground/50">
            (c) {new Date().getFullYear()} {settings.siteTitle}. {settings.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
