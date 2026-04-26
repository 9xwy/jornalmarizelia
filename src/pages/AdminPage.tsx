import { useState, type ChangeEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Database,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  PenLine,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ZodError } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useSupabaseSetupStatus } from "@/hooks/use-site-content";
import {
  createSlug,
  deleteCalendarEvent,
  deleteGalleryItem,
  deleteNewsArticle,
  deleteNotice,
  deletePoll,
  deleteStudentWork,
  fetchAdminCalendarEvents,
  fetchAdminGalleryItems,
  fetchAdminNewsArticles,
  fetchAdminNotices,
  fetchAdminPolls,
  fetchAdminStudentWorks,
  formatDateInputValue,
  formatDateTimeInputValue,
  formatDateTimeLabel,
  getTotalVotes,
  queryKeys,
  saveCalendarEvent,
  saveGalleryItem,
  saveNewsArticle,
  saveNotice,
  savePoll,
  saveStudentWork,
  seedDatabaseWithDemoContent,
} from "@/lib/content-api";
import { MEDIA_HELP_TEXT, uploadMediaFile, type MediaFolder } from "@/lib/media-storage";
import { noticeIcons, noticeTypes, newsCategories, toneOptions, workTypes } from "@/lib/site-config";
import type {
  CalendarEventInput,
  GalleryItemInput,
  NewsArticleInput,
  NoticeInput,
  PollInput,
  PollOptionInput,
  StudentWorkInput,
} from "@/types/content";

const inputSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    const labels: Record<string, string> = {
      author: "Autor",
      caption: "Legenda",
      category: "Categoria",
      closesAt: "Data de encerramento",
      content: "Conteudo",
      description: "Descricao",
      eventDate: "Data",
      excerpt: "Resumo",
      imageUrl: "Imagem",
      label: "Opcao",
      location: "Local",
      question: "Pergunta",
      slug: "Slug",
      summary: "Resumo",
      title: "Titulo",
      workType: "Tipo",
    };

    return error.issues
      .map((issue) => {
        const field = String(issue.path.at(-1) ?? issue.path[0] ?? "campo");
        const label = labels[field] ?? field;

        if (issue.code === "too_small" && issue.type === "string") {
          return `${label} precisa ter pelo menos ${issue.minimum} caracteres.`;
        }

        if (issue.code === "too_big" && issue.type === "string") {
          return `${label} pode ter no maximo ${issue.maximum} caracteres.`;
        }

        return `${label}: ${issue.message}`;
      })
      .join(" ");
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" && error && "message" in error
          ? String((error as { message?: unknown }).message ?? "")
          : "";

  if (message) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission denied")) {
      return "Permissao negada no Supabase. Confira se o mesmo email do login esta em allowed_admin_emails e se o schema mais recente foi executado.";
    }

    if (normalizedMessage.includes("bucket not found") || normalizedMessage.includes("storage bucket")) {
      return "Bucket de imagens nao encontrado. Rode novamente o arquivo supabase/schema.sql no SQL Editor.";
    }

    if (normalizedMessage.includes("duplicate key") || normalizedMessage.includes("unique constraint")) {
      return "Ja existe um item com esse slug ou identificador. Use outro slug.";
    }

    return message;
  }

  return "Nao foi possivel concluir a operacao.";
}

type MediaUploadFieldProps = {
  label: string;
  value: string;
  disabled: boolean;
  onUrlChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function MediaUploadField({ label, value, disabled, onUrlChange, onFileChange }: MediaUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onUrlChange(event.target.value)} placeholder="URL da imagem" />
      <Input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled} onChange={onFileChange} />
      <p className="font-body text-xs text-muted-foreground">
        {disabled ? "Enviando imagem..." : MEDIA_HELP_TEXT}
      </p>
    </div>
  );
}

function emptyNews(): NewsArticleInput {
  return {
    slug: "",
    title: "",
    category: newsCategories[0],
    summary: "",
    content: "",
    author: "",
    coverImageUrl: "",
    coverTone: toneOptions[0],
    featured: false,
    status: "published",
    publishedAt: formatDateTimeInputValue(new Date().toISOString()),
  };
}

function emptyGallery(): GalleryItemInput {
  return {
    title: "",
    caption: "",
    category: "Eventos",
    imageUrl: "",
    coverTone: toneOptions[0],
    featured: false,
    status: "published",
    publishedAt: formatDateTimeInputValue(new Date().toISOString()),
  };
}

function emptyEvent(): CalendarEventInput {
  return {
    title: "",
    description: "",
    category: "Academico",
    location: "",
    eventDate: formatDateInputValue(new Date().toISOString()),
    highlight: false,
    status: "published",
  };
}

function emptyWork(): StudentWorkInput {
  return {
    slug: "",
    title: "",
    workType: workTypes[0],
    author: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    coverTone: toneOptions[0],
    featured: false,
    status: "published",
    publishedAt: formatDateTimeInputValue(new Date().toISOString()),
  };
}

function emptyNotice(): NoticeInput {
  return {
    noticeType: noticeTypes[0],
    icon: noticeIcons[0],
    title: "",
    description: "",
    pinned: false,
    status: "published",
    publishedAt: formatDateTimeInputValue(new Date().toISOString()),
  };
}

function emptyPollOption(): PollOptionInput {
  return { label: "", votes: 0 };
}

function emptyPoll(): PollInput {
  return {
    question: "",
    description: "",
    isActive: true,
    closesAt: "",
    options: [emptyPollOption(), emptyPollOption()],
  };
}

function AdminSection({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-display text-2xl text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button onClick={onAction}>
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function statusBadge(status: "draft" | "published") {
  return status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
}

const AdminPage = () => {
  const queryClient = useQueryClient();
  const auth = useAdminAuth();
  const { data: setupStatus, isLoading: setupLoading } = useSupabaseSetupStatus();
  const isTemporaryAccess = auth.authMode === "temporary";
  const isLocalTemporaryMode = Boolean(auth.temporaryLoginEnabled && setupStatus && !setupStatus.configured);
  const isAdminReady = Boolean(auth.isAuthenticated && (isTemporaryAccess || setupStatus?.healthy));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [newsOpen, setNewsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);

  const [newsDraft, setNewsDraft] = useState<NewsArticleInput>(emptyNews());
  const [galleryDraft, setGalleryDraft] = useState<GalleryItemInput>(emptyGallery());
  const [eventDraft, setEventDraft] = useState<CalendarEventInput>(emptyEvent());
  const [workDraft, setWorkDraft] = useState<StudentWorkInput>(emptyWork());
  const [noticeDraft, setNoticeDraft] = useState<NoticeInput>(emptyNotice());
  const [pollDraft, setPollDraft] = useState<PollInput>(emptyPoll());
  const [uploadingMediaField, setUploadingMediaField] = useState<MediaFolder | null>(null);
  const isUploadingMedia = Boolean(uploadingMediaField);

  const newsQuery = useQuery({
    queryKey: queryKeys.adminNews,
    queryFn: fetchAdminNewsArticles,
    enabled: isAdminReady,
  });

  const galleryQuery = useQuery({
    queryKey: queryKeys.adminGallery,
    queryFn: fetchAdminGalleryItems,
    enabled: isAdminReady,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.adminEvents,
    queryFn: fetchAdminCalendarEvents,
    enabled: isAdminReady,
  });

  const worksQuery = useQuery({
    queryKey: queryKeys.adminWorks,
    queryFn: fetchAdminStudentWorks,
    enabled: isAdminReady,
  });

  const noticesQuery = useQuery({
    queryKey: queryKeys.adminNotices,
    queryFn: fetchAdminNotices,
    enabled: isAdminReady,
  });

  const pollsQuery = useQuery({
    queryKey: queryKeys.adminPolls,
    queryFn: fetchAdminPolls,
    enabled: isAdminReady,
  });

  const saveNewsMutation = useMutation({ mutationFn: saveNewsArticle });
  const deleteNewsMutation = useMutation({ mutationFn: deleteNewsArticle });
  const saveGalleryMutation = useMutation({ mutationFn: saveGalleryItem });
  const deleteGalleryMutation = useMutation({ mutationFn: deleteGalleryItem });
  const saveEventMutation = useMutation({ mutationFn: saveCalendarEvent });
  const deleteEventMutation = useMutation({ mutationFn: deleteCalendarEvent });
  const saveWorkMutation = useMutation({ mutationFn: saveStudentWork });
  const deleteWorkMutation = useMutation({ mutationFn: deleteStudentWork });
  const saveNoticeMutation = useMutation({ mutationFn: saveNotice });
  const deleteNoticeMutation = useMutation({ mutationFn: deleteNotice });
  const savePollMutation = useMutation({ mutationFn: savePoll });
  const deletePollMutation = useMutation({ mutationFn: deletePoll });
  const seedMutation = useMutation({ mutationFn: seedDatabaseWithDemoContent });

  async function refreshContent(keys: readonly unknown[][]) {
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  }

  async function handlePasswordLogin(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      await auth.signInWithPassword(email, password);
      toast.success("Login realizado com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleMagicLink() {
    setAuthBusy(true);
    try {
      await auth.sendMagicLink(email);
      toast.success("Link magico enviado para o email informado.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      await auth.signOut();
      toast.success("Sessao encerrada.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function openNewsForm(item?: NewsArticleInput) {
    setNewsDraft(item ?? emptyNews());
    setNewsOpen(true);
  }

  function openGalleryForm(item?: GalleryItemInput) {
    setGalleryDraft(item ?? emptyGallery());
    setGalleryOpen(true);
  }

  function openEventForm(item?: CalendarEventInput) {
    setEventDraft(item ?? emptyEvent());
    setEventOpen(true);
  }

  function openWorkForm(item?: StudentWorkInput) {
    setWorkDraft(item ?? emptyWork());
    setWorkOpen(true);
  }

  function openNoticeForm(item?: NoticeInput) {
    setNoticeDraft(item ?? emptyNotice());
    setNoticeOpen(true);
  }

  function openPollForm(item?: PollInput) {
    setPollDraft(item ?? emptyPoll());
    setPollOpen(true);
  }

  async function handleImageFileUpload(
    event: ChangeEvent<HTMLInputElement>,
    folder: MediaFolder,
    onUploaded: (url: string) => void,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingMediaField(folder);
    try {
      const publicUrl = await uploadMediaFile(file, folder);
      onUploaded(publicUrl);
      toast.success("Imagem enviada com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploadingMediaField(null);
    }
  }

  async function submitNews(event: React.FormEvent) {
    event.preventDefault();
    if (isUploadingMedia) {
      toast.error("Aguarde o envio da imagem terminar.");
      return;
    }

    try {
      await saveNewsMutation.mutateAsync({
        ...newsDraft,
        slug: createSlug(newsDraft.slug || newsDraft.title),
      });
      toast.success("Noticia salva com sucesso.");
      setNewsOpen(false);
      setNewsDraft(emptyNews());
      await refreshContent([queryKeys.adminNews, queryKeys.news]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function submitGallery(event: React.FormEvent) {
    event.preventDefault();
    if (isUploadingMedia) {
      toast.error("Aguarde o envio da imagem terminar.");
      return;
    }

    try {
      await saveGalleryMutation.mutateAsync(galleryDraft);
      toast.success("Item da galeria salvo com sucesso.");
      setGalleryOpen(false);
      setGalleryDraft(emptyGallery());
      await refreshContent([queryKeys.adminGallery, queryKeys.gallery]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function submitEvent(event: React.FormEvent) {
    event.preventDefault();
    try {
      await saveEventMutation.mutateAsync(eventDraft);
      toast.success("Evento salvo com sucesso.");
      setEventOpen(false);
      setEventDraft(emptyEvent());
      await refreshContent([queryKeys.adminEvents, queryKeys.events]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function submitWork(event: React.FormEvent) {
    event.preventDefault();
    if (isUploadingMedia) {
      toast.error("Aguarde o envio da imagem terminar.");
      return;
    }

    try {
      await saveWorkMutation.mutateAsync({
        ...workDraft,
        slug: createSlug(workDraft.slug || workDraft.title),
      });
      toast.success("Trabalho salvo com sucesso.");
      setWorkOpen(false);
      setWorkDraft(emptyWork());
      await refreshContent([queryKeys.adminWorks, queryKeys.works]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function submitNotice(event: React.FormEvent) {
    event.preventDefault();
    try {
      await saveNoticeMutation.mutateAsync(noticeDraft);
      toast.success("Aviso salvo com sucesso.");
      setNoticeOpen(false);
      setNoticeDraft(emptyNotice());
      await refreshContent([queryKeys.adminNotices, queryKeys.notices]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function submitPoll(event: React.FormEvent) {
    event.preventDefault();
    const validOptions = pollDraft.options.filter((option) => option.label.trim());
    if (validOptions.length < 2) {
      toast.error("Cadastre pelo menos duas opcoes para a enquete.");
      return;
    }

    try {
      await savePollMutation.mutateAsync({
        ...pollDraft,
        options: validOptions,
      });
      toast.success("Enquete salva com sucesso.");
      setPollOpen(false);
      setPollDraft(emptyPoll());
      await refreshContent([queryKeys.adminPolls, queryKeys.poll]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSeed() {
    try {
      await seedMutation.mutateAsync();
      toast.success("Conteudo inicial enviado para o banco.");
      await refreshContent([
        queryKeys.adminNews,
        queryKeys.adminGallery,
        queryKeys.adminEvents,
        queryKeys.adminWorks,
        queryKeys.adminNotices,
        queryKeys.adminPolls,
        queryKeys.news,
        queryKeys.gallery,
        queryKeys.events,
        queryKeys.works,
        queryKeys.notices,
        queryKeys.poll,
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const adminCards = [
    { label: "Noticias", value: newsQuery.data?.length ?? 0, icon: Newspaper },
    { label: "Galeria", value: galleryQuery.data?.length ?? 0, icon: ImageIcon },
    { label: "Eventos", value: eventsQuery.data?.length ?? 0, icon: CalendarDays },
    { label: "Trabalhos", value: worksQuery.data?.length ?? 0, icon: PenLine },
    { label: "Avisos", value: noticesQuery.data?.length ?? 0, icon: Megaphone },
    { label: "Enquetes", value: pollsQuery.data?.length ?? 0, icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">Painel administrativo</p>
            <h1 className="font-display text-3xl font-bold text-primary">Gestao do Jornal Marizelia</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-sm font-body text-primary hover:underline">
              Voltar para o site
            </Link>
            {auth.isAuthenticated && (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl text-primary flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Controle editorial completo
              </CardTitle>
              <CardDescription>
                Publique noticias, atualize a agenda, mantenha a galeria em dia e administre a enquete da semana em um unico painel.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {adminCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm text-muted-foreground">{item.label}</p>
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-display text-4xl font-bold text-primary mt-3">{item.value}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl text-primary flex items-center gap-2">
                <Database className="w-5 h-5" />
                {isTemporaryAccess || isLocalTemporaryMode ? "Modo local temporario" : "Status do Supabase"}
              </CardTitle>
              <CardDescription>
                {isTemporaryAccess || isLocalTemporaryMode
                  ? "O painel pode usar o login local temporario e salvar o conteudo neste navegador."
                  : "O painel funciona com autenticacao e permissao por email liberado na tabela `allowed_admin_emails`."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {setupLoading && <div className="rounded-xl border border-border bg-background h-24 animate-pulse" />}

              {!setupLoading && setupStatus && !isTemporaryAccess && !isLocalTemporaryMode && (
                <Alert variant={setupStatus.healthy ? "default" : "destructive"}>
                  <Database className="h-4 w-4" />
                  <AlertTitle>{setupStatus.healthy ? "Conexao pronta" : "Ajuste necessario"}</AlertTitle>
                  <AlertDescription>{setupStatus.message}</AlertDescription>
                </Alert>
              )}

              {(isTemporaryAccess || isLocalTemporaryMode) && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>{isTemporaryAccess ? "Login provisorio ativo" : "Supabase desligado no ambiente local"}</AlertTitle>
                  <AlertDescription>
                    {isTemporaryAccess
                      ? "O painel esta operando localmente com o usuario temporario. O que voce publicar agora fica salvo neste navegador ate reativarmos o fluxo completo do Supabase."
                      : `Entre com ${auth.temporaryUsername} / ${auth.temporaryPassword} para editar usando dados temporarios neste navegador.`}
                  </AlertDescription>
                </Alert>
              )}

              {!auth.isAuthenticated && (
                <form className="space-y-4" onSubmit={handlePasswordLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">{auth.temporaryLoginEnabled ? "Usuario ou email do admin" : "Email do admin"}</Label>
                    <Input
                      id="admin-email"
                      type={auth.temporaryLoginEnabled ? "text" : "email"}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={auth.temporaryLoginEnabled ? "admin-local ou voce@escola.com" : "voce@escola.com"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Sua senha"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={authBusy || !email || !password}>
                      Entrar
                    </Button>
                    {!isLocalTemporaryMode && (
                      <Button type="button" variant="outline" disabled={authBusy || !email} onClick={handleMagicLink}>
                        Enviar magic link
                      </Button>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {auth.temporaryLoginEnabled
                      ? `Acesso temporario disponivel agora com ${auth.temporaryUsername} / ${auth.temporaryPassword}.`
                      : "O email precisa estar cadastrado em `allowed_admin_emails` no Supabase."}
                  </p>
                </form>
              )}

              {auth.isAuthenticated && (
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-body text-sm text-muted-foreground">Sessao ativa</p>
                  <p className="font-body font-semibold text-foreground mt-1">{auth.userEmail}</p>
                  {isTemporaryAccess && (
                    <p className="font-body text-xs text-muted-foreground mt-2">
                      Modo local temporario. Para voltar ao Supabase depois, desligue `VITE_ENABLE_TEMP_ADMIN_LOGIN`.
                    </p>
                  )}
                </div>
              )}

              {auth.isAuthenticated && (isTemporaryAccess || setupStatus?.healthy) && (
                <Button variant="outline" onClick={handleSeed} disabled={seedMutation.isPending}>
                  <RefreshCw className={`w-4 h-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
                  {isTemporaryAccess ? "Restaurar conteudo inicial local" : "Carregar conteudo inicial"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {auth.isAuthenticated && !isTemporaryAccess && setupStatus && !setupStatus.healthy && (
          <Alert variant="destructive">
            <Database className="h-4 w-4" />
            <AlertTitle>Configuracao do banco pendente</AlertTitle>
            <AlertDescription>
              Rode o arquivo `supabase/schema.sql` no SQL Editor do Supabase e depois inclua o seu email em `allowed_admin_emails`.
            </AlertDescription>
          </Alert>
        )}

        {auth.isAuthenticated && isAdminReady && (
          <Tabs defaultValue="news" className="space-y-6">
            <TabsList className="h-auto flex flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="events">Calendario</TabsTrigger>
              <TabsTrigger value="works">Trabalhos</TabsTrigger>
              <TabsTrigger value="notices">Avisos</TabsTrigger>
              <TabsTrigger value="polls">Enquete</TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <AdminSection
                title="Noticias"
                description="Gerencie a vitrine principal do site e publique coberturas completas."
                actionLabel="Nova noticia"
                onAction={() => openNewsForm()}
              >
                <div className="grid gap-4">
                  {(newsQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                          <Badge variant="outline">{item.category}</Badge>
                          {item.featured && <Badge className="bg-primary/10 text-primary">destaque</Badge>}
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                        <p className="font-body text-sm text-muted-foreground">{item.summary}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {item.author} • {formatDateTimeLabel(item.publishedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openNewsForm({
                              id: item.id,
                              slug: item.slug,
                              title: item.title,
                              category: item.category,
                              summary: item.summary,
                              content: item.content,
                              author: item.author,
                              coverImageUrl: item.coverImageUrl ?? "",
                              coverTone: item.coverTone,
                              featured: item.featured,
                              status: item.status,
                              publishedAt: formatDateTimeInputValue(item.publishedAt),
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir esta noticia?")) return;
                            try {
                              await deleteNewsMutation.mutateAsync(item.id);
                              toast.success("Noticia removida.");
                              await refreshContent([queryKeys.adminNews, queryKeys.news]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>

            <TabsContent value="gallery">
              <AdminSection
                title="Galeria"
                description="Adicione imagens, capas visuais e organize categorias."
                actionLabel="Novo item"
                onAction={() => openGalleryForm()}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {(galleryQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="font-body text-sm text-muted-foreground">{item.caption}</p>
                      <p className="font-body text-xs text-muted-foreground">{formatDateTimeLabel(item.publishedAt)}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openGalleryForm({
                              id: item.id,
                              title: item.title,
                              caption: item.caption,
                              category: item.category,
                              imageUrl: item.imageUrl ?? "",
                              coverTone: item.coverTone,
                              featured: item.featured,
                              status: item.status,
                              publishedAt: formatDateTimeInputValue(item.publishedAt),
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir este item da galeria?")) return;
                            try {
                              await deleteGalleryMutation.mutateAsync(item.id);
                              toast.success("Item removido.");
                              await refreshContent([queryKeys.adminGallery, queryKeys.gallery]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>

            <TabsContent value="events">
              <AdminSection
                title="Calendario"
                description="Mantenha a agenda escolar sempre atualizada."
                actionLabel="Novo evento"
                onAction={() => openEventForm()}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {(eventsQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                        {item.highlight && <Badge className="bg-primary/10 text-primary">destaque</Badge>}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="font-body text-sm text-muted-foreground">{item.description}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {item.location} • {item.eventDate}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openEventForm({
                              id: item.id,
                              title: item.title,
                              description: item.description,
                              category: item.category,
                              location: item.location,
                              eventDate: item.eventDate,
                              highlight: item.highlight,
                              status: item.status,
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir este evento?")) return;
                            try {
                              await deleteEventMutation.mutateAsync(item.id);
                              toast.success("Evento removido.");
                              await refreshContent([queryKeys.adminEvents, queryKeys.events]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>

            <TabsContent value="works">
              <AdminSection
                title="Trabalhos"
                description="Publique redações, projetos, poesias, artes e experimentos."
                actionLabel="Novo trabalho"
                onAction={() => openWorkForm()}
              >
                <div className="grid gap-4">
                  {(worksQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-4 md:flex-row md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                          <Badge variant="outline">{item.workType}</Badge>
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                        <p className="font-body text-sm text-muted-foreground">{item.excerpt}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {item.author} • {formatDateTimeLabel(item.publishedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openWorkForm({
                              id: item.id,
                              slug: item.slug,
                              title: item.title,
                              workType: item.workType,
                              author: item.author,
                              excerpt: item.excerpt,
                              content: item.content,
                              coverImageUrl: item.coverImageUrl ?? "",
                              coverTone: item.coverTone,
                              featured: item.featured,
                              status: item.status,
                              publishedAt: formatDateTimeInputValue(item.publishedAt),
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir este trabalho?")) return;
                            try {
                              await deleteWorkMutation.mutateAsync(item.id);
                              toast.success("Trabalho removido.");
                              await refreshContent([queryKeys.adminWorks, queryKeys.works]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>

            <TabsContent value="notices">
              <AdminSection
                title="Avisos"
                description="Publique comunicados importantes e mantenha o mural atualizado."
                actionLabel="Novo aviso"
                onAction={() => openNoticeForm()}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {(noticesQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                        <Badge variant="outline">{item.noticeType}</Badge>
                        {item.pinned && <Badge className="bg-primary/10 text-primary">fixado</Badge>}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="font-body text-sm text-muted-foreground">{item.description}</p>
                      <p className="font-body text-xs text-muted-foreground">{formatDateTimeLabel(item.publishedAt)}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openNoticeForm({
                              id: item.id,
                              noticeType: item.noticeType,
                              icon: item.icon,
                              title: item.title,
                              description: item.description,
                              pinned: item.pinned,
                              status: item.status,
                              publishedAt: formatDateTimeInputValue(item.publishedAt),
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir este aviso?")) return;
                            try {
                              await deleteNoticeMutation.mutateAsync(item.id);
                              toast.success("Aviso removido.");
                              await refreshContent([queryKeys.adminNotices, queryKeys.notices]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>

            <TabsContent value="polls">
              <AdminSection
                title="Enquete da semana"
                description="Defina a pergunta ativa, as opcoes e acompanhe o total de votos."
                actionLabel="Nova enquete"
                onAction={() => openPollForm()}
              >
                <div className="grid gap-4">
                  {(pollsQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-4 md:flex-row md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {item.isActive && <Badge className="bg-primary/10 text-primary">ativa</Badge>}
                          {item.closesAt && <Badge variant="outline">fecha em {formatDateTimeLabel(item.closesAt)}</Badge>}
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">{item.question}</h3>
                        <p className="font-body text-sm text-muted-foreground">{item.description}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {item.options.length} opcoes • {getTotalVotes(item)} votos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            openPollForm({
                              id: item.id,
                              question: item.question,
                              description: item.description,
                              isActive: item.isActive,
                              closesAt: item.closesAt ? formatDateTimeInputValue(item.closesAt) : "",
                              options: item.options.map((option) => ({
                                id: option.id,
                                label: option.label,
                                votes: option.votes,
                              })),
                            })
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm("Excluir esta enquete?")) return;
                            try {
                              await deletePollMutation.mutateAsync(item.id);
                              toast.success("Enquete removida.");
                              await refreshContent([queryKeys.adminPolls, queryKeys.poll]);
                            } catch (error) {
                              toast.error(getErrorMessage(error));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Dialog open={newsOpen} onOpenChange={setNewsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{newsDraft.id ? "Editar noticia" : "Nova noticia"}</DialogTitle>
            <DialogDescription>Preencha os campos principais para publicar no site.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitNews}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={newsDraft.title} onChange={(e) => setNewsDraft((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={newsDraft.slug} onChange={(e) => setNewsDraft((prev) => ({ ...prev, slug: e.target.value }))} placeholder="deixe vazio para gerar automatico" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select className={inputSelectClassName} value={newsDraft.category} onChange={(e) => setNewsDraft((prev) => ({ ...prev, category: e.target.value }))}>
                  {newsCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={newsDraft.author} onChange={(e) => setNewsDraft((prev) => ({ ...prev, author: e.target.value }))} />
              </div>
              <MediaUploadField
                label="Imagem"
                value={newsDraft.coverImageUrl}
                disabled={isUploadingMedia}
                onUrlChange={(coverImageUrl) => setNewsDraft((prev) => ({ ...prev, coverImageUrl }))}
                onFileChange={(event) =>
                  void handleImageFileUpload(event, "news", (coverImageUrl) =>
                    setNewsDraft((prev) => ({ ...prev, coverImageUrl })),
                  )
                }
              />
              <div className="space-y-2">
                <Label>Tema da capa</Label>
                <select className={inputSelectClassName} value={newsDraft.coverTone} onChange={(e) => setNewsDraft((prev) => ({ ...prev, coverTone: e.target.value }))}>
                  {toneOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Publicado em</Label>
                <Input type="datetime-local" value={newsDraft.publishedAt} onChange={(e) => setNewsDraft((prev) => ({ ...prev, publishedAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className={inputSelectClassName} value={newsDraft.status} onChange={(e) => setNewsDraft((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}>
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={newsDraft.featured} onChange={(e) => setNewsDraft((prev) => ({ ...prev, featured: e.target.checked }))} />
              <Label>Marcar como destaque</Label>
            </div>

            <div className="space-y-2">
              <Label>Resumo</Label>
              <Textarea value={newsDraft.summary} onChange={(e) => setNewsDraft((prev) => ({ ...prev, summary: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Conteudo</Label>
              <Textarea className="min-h-[220px]" value={newsDraft.content} onChange={(e) => setNewsDraft((prev) => ({ ...prev, content: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveNewsMutation.isPending || isUploadingMedia}>
                {isUploadingMedia ? "Enviando imagem..." : "Salvar noticia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{galleryDraft.id ? "Editar item da galeria" : "Novo item da galeria"}</DialogTitle>
            <DialogDescription>Use imagem por URL, envie um arquivo ou deixe apenas um tema visual de capa.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitGallery}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={galleryDraft.title} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={galleryDraft.category} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <MediaUploadField
                label="Imagem"
                value={galleryDraft.imageUrl}
                disabled={isUploadingMedia}
                onUrlChange={(imageUrl) => setGalleryDraft((prev) => ({ ...prev, imageUrl }))}
                onFileChange={(event) =>
                  void handleImageFileUpload(event, "gallery", (imageUrl) =>
                    setGalleryDraft((prev) => ({ ...prev, imageUrl })),
                  )
                }
              />
              <div className="space-y-2">
                <Label>Tema da capa</Label>
                <select className={inputSelectClassName} value={galleryDraft.coverTone} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, coverTone: e.target.value }))}>
                  {toneOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Publicado em</Label>
                <Input type="datetime-local" value={galleryDraft.publishedAt} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, publishedAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className={inputSelectClassName} value={galleryDraft.status} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}>
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={galleryDraft.featured} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, featured: e.target.checked }))} />
              <Label>Marcar como destaque</Label>
            </div>
            <div className="space-y-2">
              <Label>Legenda</Label>
              <Textarea value={galleryDraft.caption} onChange={(e) => setGalleryDraft((prev) => ({ ...prev, caption: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveGalleryMutation.isPending || isUploadingMedia}>
                {isUploadingMedia ? "Enviando imagem..." : "Salvar item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{eventDraft.id ? "Editar evento" : "Novo evento"}</DialogTitle>
            <DialogDescription>Agende reunioes, mostras, festivais e datas academicas.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitEvent}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={eventDraft.title} onChange={(e) => setEventDraft((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={eventDraft.category} onChange={(e) => setEventDraft((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={eventDraft.eventDate} onChange={(e) => setEventDraft((prev) => ({ ...prev, eventDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={eventDraft.location} onChange={(e) => setEventDraft((prev) => ({ ...prev, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={eventDraft.highlight} onChange={(e) => setEventDraft((prev) => ({ ...prev, highlight: e.target.checked }))} />
              <Label>Marcar como destaque</Label>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className={inputSelectClassName} value={eventDraft.status} onChange={(e) => setEventDraft((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}>
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={eventDraft.description} onChange={(e) => setEventDraft((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveEventMutation.isPending}>Salvar evento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={workOpen} onOpenChange={setWorkOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{workDraft.id ? "Editar trabalho" : "Novo trabalho"}</DialogTitle>
            <DialogDescription>Publique producoes dos alunos com texto completo e capa opcional.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitWork}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={workDraft.title} onChange={(e) => setWorkDraft((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={workDraft.slug} onChange={(e) => setWorkDraft((prev) => ({ ...prev, slug: e.target.value }))} placeholder="deixe vazio para gerar automatico" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select className={inputSelectClassName} value={workDraft.workType} onChange={(e) => setWorkDraft((prev) => ({ ...prev, workType: e.target.value }))}>
                  {workTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={workDraft.author} onChange={(e) => setWorkDraft((prev) => ({ ...prev, author: e.target.value }))} />
              </div>
              <MediaUploadField
                label="Imagem"
                value={workDraft.coverImageUrl}
                disabled={isUploadingMedia}
                onUrlChange={(coverImageUrl) => setWorkDraft((prev) => ({ ...prev, coverImageUrl }))}
                onFileChange={(event) =>
                  void handleImageFileUpload(event, "works", (coverImageUrl) =>
                    setWorkDraft((prev) => ({ ...prev, coverImageUrl })),
                  )
                }
              />
              <div className="space-y-2">
                <Label>Tema da capa</Label>
                <select className={inputSelectClassName} value={workDraft.coverTone} onChange={(e) => setWorkDraft((prev) => ({ ...prev, coverTone: e.target.value }))}>
                  {toneOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Publicado em</Label>
                <Input type="datetime-local" value={workDraft.publishedAt} onChange={(e) => setWorkDraft((prev) => ({ ...prev, publishedAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className={inputSelectClassName} value={workDraft.status} onChange={(e) => setWorkDraft((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}>
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={workDraft.featured} onChange={(e) => setWorkDraft((prev) => ({ ...prev, featured: e.target.checked }))} />
              <Label>Marcar como destaque</Label>
            </div>
            <div className="space-y-2">
              <Label>Resumo</Label>
              <Textarea value={workDraft.excerpt} onChange={(e) => setWorkDraft((prev) => ({ ...prev, excerpt: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Conteudo</Label>
              <Textarea className="min-h-[220px]" value={workDraft.content} onChange={(e) => setWorkDraft((prev) => ({ ...prev, content: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveWorkMutation.isPending || isUploadingMedia}>
                {isUploadingMedia ? "Enviando imagem..." : "Salvar trabalho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{noticeDraft.id ? "Editar aviso" : "Novo aviso"}</DialogTitle>
            <DialogDescription>Defina o tipo de comunicado, o icone e a ordem de exibicao.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitNotice}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select className={inputSelectClassName} value={noticeDraft.noticeType} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, noticeType: e.target.value }))}>
                  {noticeTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Icone</Label>
                <select className={inputSelectClassName} value={noticeDraft.icon} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, icon: e.target.value }))}>
                  {noticeIcons.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Titulo</Label>
                <Input value={noticeDraft.title} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Publicado em</Label>
                <Input type="datetime-local" value={noticeDraft.publishedAt} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, publishedAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className={inputSelectClassName} value={noticeDraft.status} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}>
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={noticeDraft.pinned} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, pinned: e.target.checked }))} />
              <Label>Fixar no topo do mural</Label>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={noticeDraft.description} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveNoticeMutation.isPending}>Salvar aviso</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pollOpen} onOpenChange={setPollOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{pollDraft.id ? "Editar enquete" : "Nova enquete"}</DialogTitle>
            <DialogDescription>Escolha a pergunta ativa e configure as opcoes de voto.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitPoll}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Pergunta</Label>
                <Input value={pollDraft.question} onChange={(e) => setPollDraft((prev) => ({ ...prev, question: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descricao</Label>
                <Textarea value={pollDraft.description} onChange={(e) => setPollDraft((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fecha em</Label>
                <Input type="datetime-local" value={pollDraft.closesAt} onChange={(e) => setPollDraft((prev) => ({ ...prev, closesAt: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input type="checkbox" checked={pollDraft.isActive} onChange={(e) => setPollDraft((prev) => ({ ...prev, isActive: e.target.checked }))} />
                <Label>Manter esta enquete ativa</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Opcoes</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPollDraft((prev) => ({
                      ...prev,
                      options: [...prev.options, emptyPollOption()],
                    }))
                  }
                >
                  <Plus className="w-4 h-4" />
                  Adicionar opcao
                </Button>
              </div>

              {pollDraft.options.map((option, index) => (
                <div key={`${option.id ?? "new"}-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_auto]">
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      setPollDraft((prev) => ({
                        ...prev,
                        options: prev.options.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: e.target.value } : item,
                        ),
                      }))
                    }
                    placeholder={`Opcao ${index + 1}`}
                  />
                  <Input
                    type="number"
                    min="0"
                    value={option.votes}
                    onChange={(e) =>
                      setPollDraft((prev) => ({
                        ...prev,
                        options: prev.options.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, votes: Number(e.target.value) } : item,
                        ),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setPollDraft((prev) => ({
                        ...prev,
                        options: prev.options.length > 2
                          ? prev.options.filter((_, itemIndex) => itemIndex !== index)
                          : prev.options,
                      }))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={savePollMutation.isPending}>Salvar enquete</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
