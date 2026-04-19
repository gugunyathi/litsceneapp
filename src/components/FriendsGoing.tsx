import { getFriendsGoing } from "@/data/friends";

interface Props {
  placeSlug: string;
  size?: "sm" | "md";
  className?: string;
}

export function FriendsGoing({ placeSlug, size = "sm", className = "" }: Props) {
  const friends = getFriendsGoing(placeSlug);
  if (friends.length === 0) return null;

  const visible = friends.slice(0, 4);
  const extra = friends.length - visible.length;

  const dim =
    size === "md"
      ? "h-7 w-7 text-sm -ml-2 first:ml-0 ring-2"
      : "h-5 w-5 text-[10px] -ml-1.5 first:ml-0 ring-2";

  const labelText = size === "md" ? `${friends.length} friends going` : `${friends.length} going`;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex">
        {visible.map((f) => (
          <span
            key={f.id}
            title={f.handle}
            aria-label={f.handle}
            className={`${dim} ${f.color} grid place-items-center rounded-full ring-background backdrop-blur`}
          >
            {f.avatar}
          </span>
        ))}
        {extra > 0 && (
          <span
            className={`${dim} grid place-items-center rounded-full ring-background bg-foreground/20 font-display font-black`}
          >
            +{extra}
          </span>
        )}
      </div>
      <span
        className={`font-display font-bold uppercase tracking-widest text-foreground/80 ${
          size === "md" ? "text-[11px]" : "text-[9px]"
        }`}
      >
        {labelText}
      </span>
    </div>
  );
}
