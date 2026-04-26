export const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Noticias", href: "/noticias" },
  { label: "Calendario", href: "/calendario" },
  { label: "Galeria", href: "/galeria" },
  { label: "Trabalhos", href: "/trabalhos" },
  { label: "Avisos", href: "/avisos" },
];

export const newsCategoryStyles: Record<string, string> = {
  Evento: "bg-accent text-accent-foreground",
  Esportes: "bg-primary text-primary-foreground",
  Cultura: "bg-amber-600 text-white",
  Tecnologia: "bg-violet-600 text-white",
  Comunidade: "bg-emerald-600 text-white",
  Destaque: "bg-rose-600 text-white",
};

export const workTypeStyles: Record<string, string> = {
  Redacao: "bg-primary/10 text-primary",
  Poesia: "bg-rose-100 text-rose-700",
  Arte: "bg-violet-100 text-violet-700",
  Ciencias: "bg-emerald-100 text-emerald-700",
  Projeto: "bg-amber-100 text-amber-700",
};

export const noticeTypeStyles: Record<string, string> = {
  Urgente: "text-destructive border-destructive/20 bg-destructive/5",
  Destaque: "text-accent border-accent/20 bg-accent/5",
  Informativo: "text-primary border-primary/20 bg-primary/5",
  Aviso: "text-primary border-primary/20 bg-primary/5",
};

export const galleryCategories = [
  "Eventos",
  "Esportes",
  "Cultura",
  "Dia a dia",
  "Tecnologia",
  "Comunidade",
];

export const newsCategories = ["Evento", "Esportes", "Cultura", "Tecnologia", "Comunidade", "Destaque"];

export const noticeTypes = ["Urgente", "Destaque", "Informativo", "Aviso"];

export const noticeIcons = ["alert", "star", "info", "megaphone"];

export const workTypes = ["Redacao", "Poesia", "Arte", "Ciencias", "Projeto"];

export const toneOptions = [
  "from-primary/60 to-primary/25",
  "from-sky-500/60 to-sky-300/25",
  "from-emerald-500/60 to-emerald-300/25",
  "from-amber-500/60 to-amber-300/25",
  "from-rose-500/60 to-rose-300/25",
  "from-violet-500/60 to-violet-300/25",
  "from-orange-500/60 to-orange-300/25",
  "from-cyan-500/60 to-cyan-300/25",
];
