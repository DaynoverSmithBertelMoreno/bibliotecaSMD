/** Esqueletos con la geometría final: evitan el desplazamiento de layout (SPEC §8.2). */
export function CoverSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] w-full rounded-lg bg-crema-200" />
          <div className="mt-2 h-3 w-3/4 rounded bg-crema-200" />
        </div>
      ))}
    </>
  );
}

export function RowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-4 border-b border-crema-200 py-5">
          <div className="h-32 w-[86px] shrink-0 rounded bg-crema-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-1/3 rounded bg-crema-200" />
            <div className="h-3 w-1/5 rounded bg-crema-200" />
            <div className="h-3 w-2/5 rounded bg-crema-200" />
          </div>
        </div>
      ))}
    </>
  );
}
