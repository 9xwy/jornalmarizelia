import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Newspaper, X } from "lucide-react";
import { defaultSiteSettings } from "@/data/site-settings";
import { useSiteSettings } from "@/hooks/use-site-content";
import { navLinks } from "@/lib/site-config";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data } = useSiteSettings();
  const settings = data ?? defaultSiteSettings;

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-lg">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground font-display text-lg font-bold tracking-wide">
          <Newspaper className="w-5 h-5" />
          {settings.siteTitle}
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground" aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <ul className="md:hidden bg-primary border-t border-primary-foreground/10 pb-4">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={() => setOpen(false)}
                className={`block px-6 py-2.5 text-sm font-body transition-colors ${
                  location.pathname === item.href
                    ? "text-primary-foreground bg-primary-foreground/10"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
