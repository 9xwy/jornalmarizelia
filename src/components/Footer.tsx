import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-10">
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Newspaper className="w-5 h-5" />
            <span className="font-display text-xl font-bold">Jornal Marizelia</span>
          </Link>
          <p className="font-body text-sm text-primary-foreground/70 max-w-sm">
            Portal estudantil da Escola Municipal Marizelia com cobertura escolar, agenda, producoes dos alunos e avisos.
          </p>
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
          <div className="font-body text-sm text-primary-foreground/60 space-y-1">
            <p>Escola Municipal Marizelia</p>
            <p>Rua da Educacao, 123 - Centro</p>
            <p>contato@jornalmarizelia.edu.br</p>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold mb-3 uppercase tracking-wide text-primary-foreground/90">Equipe editorial</h3>
          <div className="font-body text-sm text-primary-foreground/60 space-y-1">
            <p>Prof. Maria Helena - Orientadora</p>
            <p>Ana Clara - Editora-chefe</p>
            <p>Lucas Mendes - Editor de esportes</p>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-4 text-center">
        <p className="font-body text-xs text-primary-foreground/50">
          (c) {new Date().getFullYear()} Jornal Marizelia. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
