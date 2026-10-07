import { FacebookLogoIcon } from "@phosphor-icons/react/ssr";
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
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sea transition-colors hover:bg-sand"
          >
            <FacebookLogoIcon aria-hidden weight="fill" className="size-7" />
          </a>
        )}
      </div>
    </footer>
  );
}
