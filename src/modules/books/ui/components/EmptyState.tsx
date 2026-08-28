import { ReactNode } from 'react';

/** Un listado vacío nunca se renderiza como rejilla vacía (SPEC CA-24). */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-crema-300 bg-white/60 px-6 py-14 text-center">
      <h3 className="font-titulo text-lg text-tinta-900">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-tinta-500">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
