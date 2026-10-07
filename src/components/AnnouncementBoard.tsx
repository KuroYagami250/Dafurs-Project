import type { Dictionary } from "@/lib/dictionaries";

type Props = { announcement: Dictionary["announcement"] };

export function AnnouncementBoard({ announcement }: Props) {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-6 bg-sand px-4 pb-16 pt-4">
      <div className="relative mx-auto max-w-5xl pt-20">
        {/* Hanging string and pin, drawn in SVG so the board can grow with its text. */}
        <svg
          aria-hidden
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          className="absolute inset-x-[20%] top-0 h-20 w-[60%]"
        >
          <polyline points="0,80 200,6 400,80" fill="none" stroke="#1f2a27" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <circle cx="200" cy="6" r="6" fill="var(--color-pin)" />
        </svg>
        <div className="rounded-3xl bg-board-frame p-3 shadow-lg md:p-4">
          <div className="rounded-2xl bg-board px-6 py-8 text-white md:px-12 md:py-12">
            <p className="text-3xl font-extrabold text-aqua-soft md:text-5xl">{announcement.kicker}</p>
            <h2 id="about-title" className="mt-2 text-xl font-bold uppercase text-aqua-soft md:text-2xl">
              {announcement.title}
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-white/95">
              {announcement.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
