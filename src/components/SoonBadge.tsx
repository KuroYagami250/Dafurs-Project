export function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-1.5 inline-block rounded-full bg-shell px-2 py-0.5 align-middle text-xs font-semibold normal-case text-ink no-underline [text-shadow:none]">
      {label}
    </span>
  );
}
