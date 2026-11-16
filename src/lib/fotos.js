import { supabase } from "./supabaseClient.js";

export const BUCKET_FOTOS = "realtia-fotos";
const LADO_MAX = 1600;

// Las fotos del celular pesan 3–8 MB: se reducen en el navegador a 1600 px por lado y se
// guardan como JPEG antes de subirlas. Así cargan rápido y caben en el límite del bucket.
export async function comprimirFoto(file) {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((ok) => canvas.toBlob(ok, "image/jpeg", 0.82));
  return blob || file;
}

export async function subirFoto(agenteId, captacionId, file) {
  const contenido = await comprimirFoto(file);
  const path = `${agenteId}/${captacionId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(path, contenido, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function borrarFoto(path) {
  const { error } = await supabase.storage.from(BUCKET_FOTOS).remove([path]);
  if (error) throw error;
}
