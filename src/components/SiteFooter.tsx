import type { Dictionary } from "@/lib/dictionaries";

type Props = { footer: Dictionary["footer"]; facebookUrl: string };

export function SiteFooter({ footer, facebookUrl }: Props) {
  return (
    <footer className="bg-sea text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 md:px-8">
        <p className="font-semibold">{footer.copyright}</p>
        {facebookUrl !== "" && (
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={footer.facebook}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sea hover:bg-sand"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
            </svg>
          </a>
        )}
      </div>
    </footer>
  );
}
