import { describe, expect, it } from 'vitest';
import { emptyDraft } from './book';
import { canPublish, canSaveDraft, missingToPublish } from './publish-contract';

/** Sin renderizar ni un componente de React: ese es el beneficio de la capa (CA-43). */
describe('publish-contract', () => {
  const complete = () => ({
    ...emptyDraft(),
    title: 'Argonauta',
    isbn: '9788412345674',
    publicationYear: 2025,
    publisher: 'Letrame',
    language: 'Español',
    shelfLocation: 'Sala A - Estante 03',
    author: 'eVEm',
  });

  it('un borrador solo exige título (SPEC §6.2)', () => {
    expect(canSaveDraft({ ...emptyDraft(), title: 'Sin terminar' })).toBe(true);
    expect(canSaveDraft(emptyDraft())).toBe(false);
  });

  it('reúne todos los campos faltantes, no solo el primero (CA-10)', () => {
    const missing = missingToPublish(emptyDraft(), 2026).map((m) => m.field);
    expect(missing).toEqual(
      expect.arrayContaining([
        'isbn',
        'title',
        'publicationYear',
        'publisher',
        'language',
        'shelfLocation',
        'author',
      ]),
    );
  });

  it('exige ubicación pese a que el mockup no la marca con asterisco (CA-8)', () => {
    const draft = { ...complete(), shelfLocation: null };
    expect(missingToPublish(draft, 2026).map((m) => m.field)).toContain('shelfLocation');
  });

  it('no exige los campos que el mockup marca pero el diccionario declara opcionales', () => {
    const fields = missingToPublish(emptyDraft(), 2026).map((m) => m.field);
    expect(fields).not.toContain('subtitle');
    expect(fields).not.toContain('edition');
    expect(fields).not.toContain('pageCount');
    expect(fields).not.toContain('description');
  });

  it('rechaza un año posterior al actual', () => {
    const missing = missingToPublish({ ...complete(), publicationYear: 2027 }, 2026);
    expect(missing).toContainEqual(
      expect.objectContaining({ field: 'publicationYear', reason: 'futureYear' }),
    );
  });

  it('acepta un borrador completo', () => {
    expect(canPublish(complete(), 2026)).toBe(true);
  });
});
