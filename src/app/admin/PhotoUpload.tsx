"use client";

import { useRef, useState } from "react";

const MAX_SIDE = 2400; // longest edge after shrinking
const JPEG_QUALITY = 0.85;

/** Shrinks a photo in the browser (long edge ≤ 2400px, JPEG) so uploads are small and fast. */
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file; // keep animation
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) throw new Error(`"${file.name}" can't be read. Please use a JPG, PNG or WebP photo.`);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // PNG transparency -> white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error(`Could not process "${file.name}".`);
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function uploadOne(file: File, folder: "gallery" | "couple"): Promise<string> {
  const small = await shrink(file);
  const form = new FormData();
  form.append("file", small);
  form.append("folder", folder);
  const res = await fetch("/admin/upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? `Upload failed (${res.status}).`);
  return data.url;
}

function UploadButton({
  multiple,
  folder,
  onUploaded,
  children,
}: {
  multiple?: boolean;
  folder: "gallery" | "couple";
  onUploaded: (urls: string[]) => void;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setBusy(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
        urls.push(await uploadOne(files[i], folder));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
      if (urls.length) onUploaded(urls);
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />
      <button type="button" disabled={!!busy} onClick={() => input.current?.click()} className="gold-btn px-4 py-2 disabled:opacity-60">
        {busy ?? `+ ${children}`}
      </button>
      {error && <p className="mt-2 font-serif text-lg text-rosegold">{error}</p>}
    </div>
  );
}

/** One photo (e.g. the bride's or groom's portrait). */
export function PhotoField({
  label,
  value,
  onChange,
  folder = "couple",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder?: "gallery" | "couple";
}) {
  return (
    <div>
      <span className="caps text-sm text-gold-deep">{label}</span>
      <div className="mt-1 flex items-start gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-28 w-24 border border-gold/50 object-cover" />
        ) : (
          <div className="flex h-28 w-24 items-center justify-center border border-dashed border-gold/50 font-serif text-base text-muted">
            No photo
          </div>
        )}
        <div className="space-y-2">
          <UploadButton folder={folder} onUploaded={(urls) => onChange(urls[0])}>
            {value ? "Replace photo" : "Upload photo"}
          </UploadButton>
          {value && (
            <button type="button" onClick={() => onChange("")} className="block font-serif text-lg text-rosegold underline">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** The gallery: a grid of thumbnails with upload and remove. */
export function PhotoGrid({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((src, i) => (
            <li key={src + i} className="relative border border-gold/50 bg-ivory p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    aria-label="Move earlier"
                    onClick={() => onChange(move(items, i, i - 1))}
                    className="border border-gold/50 px-2 font-serif text-lg disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={i === items.length - 1}
                    aria-label="Move later"
                    onClick={() => onChange(move(items, i, i + 1))}
                    className="border border-gold/50 px-2 font-serif text-lg disabled:opacity-30"
                  >
                    →
                  </button>
                </span>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="border border-rosegold/40 px-2 font-serif text-lg text-rosegold hover:bg-rosegold hover:text-ivory"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-serif text-lg text-muted">No photos yet.</p>
      )}
      <div className="mt-4">
        <UploadButton multiple folder="gallery" onUploaded={(urls) => onChange([...items, ...urls])}>
          Upload photos
        </UploadButton>
      </div>
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}
