import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  backHref = "/",
  backLabel = "Voltar ao inicio",
}: PageHeaderProps) {
  return (
    <>
      <Link
        to={backHref}
        className="inline-flex items-center gap-1 text-primary font-body text-sm font-medium hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">{title}</h1>
      </div>
      <p className="font-body text-muted-foreground mb-2">{description}</p>
      <div className="newspaper-divider mb-8" />
    </>
  );
}
