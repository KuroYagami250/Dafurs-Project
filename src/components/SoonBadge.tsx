export function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-1 inline-block rounded-full bg-shell px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-ink no-underline">
      {label}
    </span>
  );
}
