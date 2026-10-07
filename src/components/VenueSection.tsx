import type { Dictionary } from "@/lib/dictionaries";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

type Props = { venue: Dictionary["venue"]; mapsQuery: string };

export function VenueSection({ venue, mapsQuery }: Props) {
  return (
    <section aria-labelledby="venue-title" className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:px-8">
      <div>
        <h2 id="venue-title" className="text-3xl font-extrabold uppercase text-sea md:text-4xl">
          {venue.heading}
        </h2>
        <p className="mt-4 font-medium">{venue.intro}</p>
        <ul className="mt-4 list-disc space-y-1 pl-6">
          {venue.details.map((detail) => (
            <li key={detail.label}>
              <span className="font-semibold">{detail.label}:</span> {detail.value}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <iframe
          title={venue.mapTitle}
          src={mapsEmbedUrl(mapsQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full rounded-2xl border-0 shadow-md"
        />
        <a
          href={mapsLinkUrl(mapsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-semibold text-sea underline underline-offset-4"
        >
          {venue.openInMaps} ↗
        </a>
      </div>
    </section>
  );
}
