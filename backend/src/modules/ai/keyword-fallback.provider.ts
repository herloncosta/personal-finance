import { Injectable } from '@nestjs/common';
import {
  CategoryHint,
  CategorySuggestion,
  GeneratedInsight,
  IAnalysisProvider,
  InsightInput,
} from './analysis-provider.interface';

const KEYWORDS: Record<string, string[]> = {
  'alimentação': ['ifood', 'mercado', 'restaurante', 'padaria', 'lanche', 'pizza', 'supermercado', 'café', 'burger'],
  'transporte': ['uber', '99', 'gasolina', 'combustível', 'ônibus', 'metro', 'estacionamento', 'pedágio', 'corrida'],
  'moradia': ['aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'internet', 'gás'],
  'saúde': ['farmácia', 'médico', 'dentista', 'exame', 'remédio', 'plano de saúde', 'academia'],
  'lazer': ['cinema', 'show', 'jogo', 'streaming', 'netflix', 'spotify', 'viagem', 'bar'],
  'salário': ['salário', 'pagamento', 'holerite', 'freelance', 'pix recebido'],
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

@Injectable()
export class KeywordFallbackProvider implements IAnalysisProvider {
  readonly name = 'keyword';

  async suggestCategory(description: string, type: string, categories: CategoryHint[]): Promise<CategorySuggestion> {
    const text = norm(description);
    const pool = categories.filter((c) => c.type === type);
    for (const cat of pool) {
      const keys = KEYWORDS[norm(cat.name)] ?? [norm(cat.name).slice(0, 4)];
      if (keys.some((k) => k.length >= 3 && text.includes(k))) {
        return { categoryName: cat.name, confidence: 0.6 };
      }
    }
    return { categoryName: null, confidence: 0 };
  }

  async generateInsights(input: InsightInput): Promise<GeneratedInsight> {
    const top = input.topCategories[0];
    const alerts = input.overBudget.map((b) => `${b.name} estourou: ${b.spent} de ${b.limit}`);
    return {
      summary:
        `Em ${input.month}: receitas ${input.income}, despesas ${input.expense}.` +
        (top ? ` Maior gasto: ${top.name} (${top.total}).` : ' Sem despesas registradas.'),
      alerts,
      tip: top ? `Revise os gastos com ${top.name} para o próximo mês.` : 'Registre suas transações para receber dicas.',
    };
  }
}
