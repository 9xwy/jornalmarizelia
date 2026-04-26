import { supabase } from "@/lib/supabase";

export const MEDIA_BUCKET = "jornal-media";
export const MEDIA_HELP_TEXT = "JPG, PNG, WEBP ou GIF ate 5 MB.";

const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type MediaFolder = "news" | "gallery" | "works";

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();
  const extensionFromType = file.type.split("/").pop()?.toLowerCase();
  const extension = extensionFromName || extensionFromType || "jpg";

  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

function createMediaPath(file: File, folder: MediaFolder) {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${folder}/${id}.${getFileExtension(file)}`;
}

export async function uploadMediaFile(file: File, folder: MediaFolder) {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Configure as variaveis de ambiente antes de enviar imagens.");
  }

  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    throw new Error("Envie uma imagem JPG, PNG, WEBP ou GIF.");
  }

  if (file.size > MAX_MEDIA_FILE_SIZE) {
    throw new Error("A imagem deve ter no maximo 5 MB.");
  }

  const path = createMediaPath(file, folder);
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Nao foi possivel gerar a URL publica da imagem.");
  }

  return data.publicUrl;
}
