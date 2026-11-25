import type { Metadata } from "next";
import Image from "next/image";
import { Medallion } from "@/components/Ornaments";
import { PageHeader } from "@/components/PageHeader";
import { getInvite } from "@/lib/invite";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const { invite, coupleTitle } = await getInvite();
  const photos = invite.gallery;
  return (
    <>
      <PageHeader eyebrow="Moments" title="Gallery" />
      <div className="pattern-strip" />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        {photos.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((src, i) => (
              <div key={src} className="card mb-4 break-inside-avoid p-2">
                <Image
                  src={src}
                  alt={`${coupleTitle} photo ${i + 1}`}
                  width={800}
                  height={1000}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center border border-gold/60 bg-blush ${
                  i % 3 === 1 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Medallion size={44} />
                  {i === 1 && <p className="eyebrow mt-4">Photos coming soon</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
