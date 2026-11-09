export type AICommand =
  | 'complete'
  | 'suggest-rhyme'
  | 'rewrite'
  | 'suggest-title'
  | 'suggest-slug'

export interface AIRequest {
  command: AICommand
  context: string   // full writing content
  selection?: string // selected text (optional)
}

export interface AIResponse {
  result: string
}
