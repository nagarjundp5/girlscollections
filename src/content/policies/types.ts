export interface PolicyClause {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PolicyDocument {
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string[];
  clauses: PolicyClause[];
}
