import { useEffect, useRef } from 'react';

/**
 * Confirmación de borrado. Nombra el libro y nunca elimina al primer clic (SPEC CA-19).
 * Sin autenticación, esta es la única barrera contra la pérdida de datos (SPEC §4).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta-900/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-tarjeta"
      >
        <h2 id="confirm-title" className="font-titulo text-lg text-tinta-900">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-tinta-500">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="boton-secundario" onClick={onCancel}>
            Cancelar
          </button>
          <button ref={confirmRef} type="button" className="boton-primario" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
