import { put } from "@vercel/blob";

export async function POST(req: Request) {
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 2_000_000) {
    return Response.json({ error: "File gambar tidak valid" }, { status: 400 });
  }
  const blob = await put(`findings/${Date.now()}-${file.name}`, file, { access: "public" });
  return Response.json({ url: blob.url });
}
