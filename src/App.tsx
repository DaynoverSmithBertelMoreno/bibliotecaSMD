import { useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { booksSeed, categories } from './data/books'
import { CreateBookScreen } from './features/create/CreateBookScreen'
import { DetailScreen } from './features/detail/DetailScreen'
import { HomeScreen } from './features/home/HomeScreen'
import { MyBooksScreen } from './features/books/MyBooksScreen'
import type { Book, MyBooksTab, Screen } from './types'

const myBookTabs: { label: string; value: MyBooksTab }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Publicados', value: 'published' },
  { label: 'Borradores', value: 'draft' },
]

const defaultDraft = {
  title: '',
  subtitle: '',
  authorName: '',
  description: '',
  isbn: '',
  cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
  publishingYear: '2025',
  edition: '1',
  pageCount: '256',
  language: 'es',
  publisher: 'Letrame',
  location: 'Libre',
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedBookId, setSelectedBookId] = useState('luna')
  const [myBooksTab, setMyBooksTab] = useState<MyBooksTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [draftTitle, setDraftTitle] = useState(defaultDraft.title)
  const [draftSubtitle, setDraftSubtitle] = useState(defaultDraft.subtitle)
  const [draftAuthorName, setDraftAuthorName] = useState(defaultDraft.authorName)
  const [draftDescription, setDraftDescription] = useState(defaultDraft.description)
  const [draftIsbn, setDraftIsbn] = useState(defaultDraft.isbn)
  const [draftCover, setDraftCover] = useState(defaultDraft.cover)
  const [draftPublishingYear, setDraftPublishingYear] = useState(defaultDraft.publishingYear)
  const [draftEdition, setDraftEdition] = useState(defaultDraft.edition)
  const [draftPageCount, setDraftPageCount] = useState(defaultDraft.pageCount)
  const [draftLanguage, setDraftLanguage] = useState(defaultDraft.language)
  const [draftPublisher, setDraftPublisher] = useState(defaultDraft.publisher)
  const [draftLocation, setDraftLocation] = useState(defaultDraft.location)

  const selectedBook = booksSeed.find((book) => book.id === selectedBookId) ?? booksSeed[0]
  const featuredBooks = booksSeed.filter((book) => book.isFeatured && book.status === 'published')

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return booksSeed.filter((book) => {
      if (book.status !== 'published') return false

      const matchesCategory =
        !activeCategory ||
        activeCategory === 'cat-all' ||
        book.categories.some((category) => category.id === activeCategory)

      const haystack = `${book.title} ${book.subtitle ?? ''} ${book.description ?? ''}`.toLowerCase()
      const matchesQuery = !query || haystack.includes(query)

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, searchQuery])

  const visibleMyBooks = useMemo(() => {
    return booksSeed.filter((book) => {
      if (myBooksTab === 'published') return book.status === 'published'
      if (myBooksTab === 'draft') return book.status === 'draft'
      return true
    })
  }, [myBooksTab])

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const handleOpenDetail = (bookId: string) => {
    setSelectedBookId(bookId)
    setScreen('detail')
  }

  const resetDraft = () => {
    setDraftTitle(defaultDraft.title)
    setDraftSubtitle(defaultDraft.subtitle)
    setDraftAuthorName(defaultDraft.authorName)
    setDraftDescription(defaultDraft.description)
    setDraftIsbn(defaultDraft.isbn)
    setDraftCover(defaultDraft.cover)
    setDraftPublishingYear(defaultDraft.publishingYear)
    setDraftEdition(defaultDraft.edition)
    setDraftPageCount(defaultDraft.pageCount)
    setDraftLanguage(defaultDraft.language)
    setDraftPublisher(defaultDraft.publisher)
    setDraftLocation(defaultDraft.location)
  }

  const handleCreateDraft = () => {
    const title = draftTitle.trim()
    if (!title) {
      showNotice('El título es obligatorio para guardar un borrador.')
      return
    }

    const nextBook: Book = {
      id: `draft-${Date.now()}`,
      title,
      subtitle: draftSubtitle.trim() || null,
      authorName: draftAuthorName.trim() || null,
      coverUrl: draftCover,
      status: 'draft',
      pageCount: Number(draftPageCount) || null,
      publicationDate: draftPublishingYear ? `${draftPublishingYear}-01-01` : null,
      edition: Number(draftEdition) || null,
      language: { code: draftLanguage, name: draftLanguage === 'es' ? 'Español' : 'English' },
      isFavorite: false,
      description: draftDescription.trim() || null,
      isbn: draftIsbn.trim() || null,
      location: draftLocation.trim() || 'Libre',
      publisher: draftPublisher ? { id: `pub-${Date.now()}`, name: draftPublisher } : null,
      categories: [{ id: 'cat-literatura', slug: 'literatura', name: 'Literatura' }],
      owner: { id: 'user-1', displayName: 'Ana Gómez', avatarUrl: null },
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    booksSeed.unshift(nextBook)
    setSelectedBookId(nextBook.id)
    setScreen('myBooks')
    setMyBooksTab('draft')
    resetDraft()
    setNotice('Borrador guardado correctamente.')
  }

  const handlePublish = () => {
    if (!draftTitle.trim()) {
      showNotice('Falta el título para publicar.')
      return
    }

    const missing: string[] = []
    if (!draftAuthorName.trim()) missing.push('Autor')
    if (!draftIsbn.trim()) missing.push('ISBN')
    if (!draftDescription.trim()) missing.push('Descripción')
    if (!draftPublisher.trim()) missing.push('Editorial')
    if (!draftPageCount.trim()) missing.push('Número de páginas')

    if (missing.length > 0) {
      showNotice(`Faltan requisitos: ${missing.join(', ')}`)
      return
    }

    const publishedBook: Book = {
      id: `book-${Date.now()}`,
      title: draftTitle.trim(),
      subtitle: draftSubtitle.trim() || null,
      authorName: draftAuthorName.trim() || null,
      coverUrl: draftCover,
      status: 'published',
      pageCount: Number(draftPageCount),
      publicationDate: `${draftPublishingYear}-01-01`,
      edition: Number(draftEdition) || 1,
      language: { code: draftLanguage, name: draftLanguage === 'es' ? 'Español' : 'English' },
      isFavorite: false,
      description: draftDescription.trim(),
      isbn: draftIsbn.trim(),
      location: draftLocation.trim() || 'Libre',
      publisher: { id: `pub-${Date.now()}`, name: draftPublisher },
      categories: [{ id: 'cat-literatura', slug: 'literatura', name: 'Literatura' }],
      owner: { id: 'user-1', displayName: 'Ana Gómez', avatarUrl: null },
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFeatured: true,
    }

    booksSeed.unshift(publishedBook)
    setSelectedBookId(publishedBook.id)
    setScreen('detail')
    resetDraft()
    setNotice('Libro publicado correctamente.')
  }

  const handleCancel = () => {
    const hasContent = Boolean(
      draftTitle.trim() || draftDescription.trim() || draftSubtitle.trim() || draftIsbn.trim(),
    )

    if (hasContent && !window.confirm('¿Deseas descartar los cambios no guardados?')) {
      return
    }

    setScreen('myBooks')
    resetDraft()
  }

  const handleCoverChange = (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setDraftCover(String(reader.result ?? draftCover))
    reader.readAsDataURL(file)
  }

  const renderScreen = () => {
    if (screen === 'home') {
      return (
        <HomeScreen
          categories={categories}
          featuredBooks={featuredBooks}
          filteredCatalog={filteredCatalog}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onSearchChange={setSearchQuery}
          onCategoryToggle={(categoryId) =>
            setActiveCategory((current) => (current === categoryId ? null : categoryId))
          }
          onOpenDetail={handleOpenDetail}
          onOpenMyBooks={() => setScreen('myBooks')}
          onClearFilters={() => {
            setSearchQuery('')
            setActiveCategory(null)
          }}
        />
      )
    }

    if (screen === 'myBooks') {
      return (
        <MyBooksScreen
          tabs={myBookTabs}
          books={visibleMyBooks}
          currentTab={myBooksTab}
          onTabChange={setMyBooksTab}
          onOpenDetail={handleOpenDetail}
          onCreateBook={() => setScreen('create')}
          onShowNotice={showNotice}
        />
      )
    }

    if (screen === 'detail') {
      return <DetailScreen book={selectedBook} onBack={() => setScreen('myBooks')} />
    }

    return (
      <CreateBookScreen
        draftTitle={draftTitle}
        draftSubtitle={draftSubtitle}
        draftAuthorName={draftAuthorName}
        draftDescription={draftDescription}
        draftIsbn={draftIsbn}
        draftCover={draftCover}
        draftPublishingYear={draftPublishingYear}
        draftEdition={draftEdition}
        draftPageCount={draftPageCount}
        draftLanguage={draftLanguage}
        draftPublisher={draftPublisher}
        draftLocation={draftLocation}
        onTitleChange={setDraftTitle}
        onSubtitleChange={setDraftSubtitle}
        onAuthorChange={setDraftAuthorName}
        onDescriptionChange={setDraftDescription}
        onIsbnChange={setDraftIsbn}
        onCoverChange={handleCoverChange}
        onPublishingYearChange={setDraftPublishingYear}
        onEditionChange={setDraftEdition}
        onPageCountChange={setDraftPageCount}
        onLanguageChange={setDraftLanguage}
        onPublisherChange={setDraftPublisher}
        onLocationChange={setDraftLocation}
        onCancel={handleCancel}
        onSaveDraft={handleCreateDraft}
        onPublish={handlePublish}
      />
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800">
      <div className="flex min-h-screen">
        <div className="hidden w-[240px] shrink-0 lg:block">
          <Sidebar currentScreen={screen} onChange={setScreen} />
        </div>

        <main className="min-w-0 flex-1">
          <Topbar currentScreen={screen} onNotify={() => showNotice('Sin notificaciones nuevas')} />
          <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">{renderScreen()}</div>
        </main>
      </div>

      {notice && (
        <div className="fixed bottom-6 right-6 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
          ✓ {notice}
        </div>
      )}
    </div>
  )
}

export default App
