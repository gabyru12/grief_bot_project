export interface ContentProblem {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

export function buildContent(options?: { write?: boolean; quiet?: boolean }): Promise<{
  problems: ContentProblem[];
  errors: ContentProblem[];
}>;

export function markdownToHtml(src: string): string;
