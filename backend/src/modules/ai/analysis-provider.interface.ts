export interface CategoryHint {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface CategorySuggestion {
  categoryName: string | null;
  confidence: number;
}

export interface InsightInput {
  month: string;
  income: number;
  expense: number;
  topCategories: { name: string; total: number }[];
  overBudget: { name: string; spent: number; limit: number }[];
}

export interface GeneratedInsight {
  summary: string;
  alerts: string[];
  tip: string;
}

export interface IAnalysisProvider {
  readonly name: string;
  suggestCategory(description: string, type: string, categories: CategoryHint[]): Promise<CategorySuggestion>;
  generateInsights(input: InsightInput): Promise<GeneratedInsight>;
}
