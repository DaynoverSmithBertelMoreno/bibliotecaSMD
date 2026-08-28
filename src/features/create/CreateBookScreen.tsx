type CreateBookScreenProps = {
  draftTitle: string
  draftSubtitle: string
  draftAuthorName: string
  draftDescription: string
  draftIsbn: string
  draftCover: string
  draftPublishingYear: string
  draftEdition: string
  draftPageCount: string
  draftLanguage: string
  draftPublisher: string
  draftLocation: string
  onTitleChange: (value: string) => void
  onSubtitleChange: (value: string) => void
  onAuthorChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onIsbnChange: (value: string) => void
  onCoverChange: (file: File | null) => void
  onPublishingYearChange: (value: string) => void
  onEditionChange: (value: string) => void
  onPageCountChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onPublisherChange: (value: string) => void
  onLocationChange: (value: string) => void
  onCancel: () => void
  onSaveDraft: () => void
  onPublish: () => void
}

export function CreateBookScreen({
  draftTitle,
  draftSubtitle,
  draftAuthorName,
  draftDescription,
  draftIsbn,
  draftCover,
  draftPublishingYear,
  draftEdition,
  draftPageCount,
  draftLanguage,
  draftPublisher,
  draftLocation,
  onTitleChange,
  onSubtitleChange,
  onAuthorChange,
  onDescriptionChange,
  onIsbnChange,
  onCoverChange,
  onPublishingYearChange,
  onEditionChange,
  onPageCountChange,
  onLanguageChange,
  onPublisherChange,
  onLocationChange,
  onCancel,
  onSaveDraft,
  onPublish,
}: CreateBookScreenProps) {
  return (
    <>
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full border border-stone-200 bg-white px-3 py-2 text-lg text-slate-600 transition hover:bg-stone-50" onClick={onCancel}>←</button>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">NUEVO LIBRO</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">Tu historia comienza aquí.</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-50" onClick={onCancel}>Cancelar</button>
          <button type="button" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800" onClick={onSaveDraft}>Guardar</button>
          <button type="button" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400" onClick={onPublish}>Publicar</button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <aside className="space-y-5 rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="overflow-hidden rounded-[22px] bg-stone-100">
            <img src={draftCover} alt="Portada del libro" className="h-[360px] w-full object-cover" />
          </div>

          <label className="block cursor-pointer rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm font-medium text-slate-600 transition hover:bg-stone-100">
            Subir portada
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(event) => onCoverChange(event.target.files?.[0] ?? null)} />
          </label>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              ISBN
              <input value={draftIsbn} onChange={(event) => onIsbnChange(event.target.value)} placeholder="Ej. 9788498385760" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Titulo
              <input value={draftTitle} onChange={(event) => onTitleChange(event.target.value)} placeholder="La luna de la memoria" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Subtitulo
              <input value={draftSubtitle} onChange={(event) => onSubtitleChange(event.target.value)} placeholder="Una historia de regreso" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Autor
              <input value={draftAuthorName} onChange={(event) => onAuthorChange(event.target.value)} placeholder="Nombre del autor" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>
          </div>
        </aside>

        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Descripción
              <textarea value={draftDescription} onChange={(event) => onDescriptionChange(event.target.value)} rows={5} placeholder="Escribe la sinopsis del libro..." className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Año Publicación
              <input value={draftPublishingYear} onChange={(event) => onPublishingYearChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Edición
              <input value={draftEdition} onChange={(event) => onEditionChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Editorial
              <input value={draftPublisher} onChange={(event) => onPublisherChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Idioma
              <select value={draftLanguage} onChange={(event) => onLanguageChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Numero de paginas
              <input value={draftPageCount} onChange={(event) => onPageCountChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Ubicacion
              <input value={draftLocation} onChange={(event) => onLocationChange(event.target.value)} placeholder="Libre" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Categoría
              <select defaultValue="literatura" className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-800 focus:border-brand-300 focus:outline-none">
                <option value="literatura">Literatura</option>
                <option value="ficcion">Ficción</option>
                <option value="poesia">Poesía</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </>
  )
}
