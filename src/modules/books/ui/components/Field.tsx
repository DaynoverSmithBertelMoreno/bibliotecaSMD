import { ReactNode, useId } from 'react';

/**
 * Campo con `<label>` real. El placeholder NUNCA sustituye a la etiqueta (SPEC §8.6):
 * en el mockup `Ubicacion` muestra `Libre` como placeholder, y eso es su valor por
 * defecto, no su nombre.
 */
export function Field({
  label,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {label}
        {required && (
          <span className="ml-0.5 text-marca-600" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (obligatorio para publicar)</span>}
      </label>
      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-tinta-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-semibold text-marca-700">
          {error}
        </p>
      )}
    </div>
  );
}
