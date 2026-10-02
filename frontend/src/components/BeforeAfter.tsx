import { MediaItem } from "../types";

function Pane({ label, m }: { label: string; m?: MediaItem | null }) {
  return (
    <figure className="flex-1">
      <figcaption className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</figcaption>
      {m ? (
        m.media_type === "video" ? (
          <video src={m.url} controls className="aspect-[4/3] w-full rounded-xl bg-black object-cover" />
        ) : (
          <img src={m.url} alt={label} className="aspect-[4/3] w-full rounded-xl object-cover shadow" />
        )
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-slate-200 text-sm text-slate-500">Not available</div>
      )}
    </figure>
  );
}

export default function BeforeAfter({ before, after }: { before?: MediaItem | null; after?: MediaItem | null }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Pane label="Before" m={before} />
      <Pane label="After" m={after} />
    </div>
  );
}
