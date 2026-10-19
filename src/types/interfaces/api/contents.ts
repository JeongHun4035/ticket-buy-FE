export interface ApiContent {
  id: number,
  category: string,
  title: string,
  content: string,
  date: string,
}

export interface ContentInput {
  category: 'NOTICE' | 'GUIDE' | 'UPDATE',
  titles: Record<string, string>,
  bodies: Record<string, string>,
}
