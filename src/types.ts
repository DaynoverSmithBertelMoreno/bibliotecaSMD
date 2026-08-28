export type Screen = 'home' | 'myBooks' | 'detail' | 'create'
export type BookStatus = 'draft' | 'published'
export type MyBooksTab = 'all' | 'published' | 'draft'

export type Book = {
  id: string
  title: string
  subtitle: string | null
  authorName: string | null
  coverUrl: string
  status: BookStatus
  pageCount: number | null
  publicationDate: string | null
  edition: number | null
  language: { code: string; name: string } | null
  isFavorite: boolean
  description: string | null
  isbn: string | null
  location: string | null
  publisher: { id: string; name: string } | null
  categories: Array<{ id: string; slug: string; name: string }>
  owner: { id: string; displayName: string; avatarUrl: string | null }
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  isFeatured?: boolean
}

export type Category = { id: string; slug: string; name: string }
