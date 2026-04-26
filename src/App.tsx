import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index.tsx"));
const NoticiasPage = lazy(() => import("./pages/NoticiasPage.tsx"));
const NoticiaDetailPage = lazy(() => import("./pages/NoticiaDetailPage.tsx"));
const GaleriaPage = lazy(() => import("./pages/GaleriaPage.tsx"));
const CalendarioPage = lazy(() => import("./pages/CalendarioPage.tsx"));
const TrabalhosPage = lazy(() => import("./pages/TrabalhosPage.tsx"));
const TrabalhoDetailPage = lazy(() => import("./pages/TrabalhoDetailPage.tsx"));
const AvisosPage = lazy(() => import("./pages/AvisosPage.tsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-body">
              Carregando...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/noticias/:slug" element={<NoticiaDetailPage />} />
            <Route path="/galeria" element={<GaleriaPage />} />
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/trabalhos" element={<TrabalhosPage />} />
            <Route path="/trabalhos/:slug" element={<TrabalhoDetailPage />} />
            <Route path="/avisos" element={<AvisosPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
