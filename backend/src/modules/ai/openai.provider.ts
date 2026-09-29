import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  CategoryHint,
  CategorySuggestion,
  GeneratedInsight,
  IAnalysisProvider,
  InsightInput,
} from './analysis-provider.interface';

// Modelos gratuitos do OpenRouter nem sempre suportam JSON mode —
// então pedimos "APENAS JSON" no prompt e recortamos a resposta.
function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

const isOpenRouter = (baseURL?: string) => (baseURL ?? '').includes('openrouter');

// Reasoning models (ex: nemotron) podem devolver o JSON no campo `reasoning`.
function contentOf(res: any): string | undefined {
  const msg = res.choices?.[0]?.message;
  return msg?.content || msg?.reasoning || undefined;
}

@Injectable()
export class OpenAiProvider implements IAnalysisProvider {
  readonly name = isOpenRouter(process.env.OPENAI_BASE_URL) ? 'openrouter' : 'openai';
  private client: OpenAI | null;
  private model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || undefined;
    // ponytail: headers recomendados pelo OpenRouter (referer/título), ignorados pela OpenAI
    this.client = apiKey
      ? new OpenAI({
          apiKey,
          baseURL,
          defaultHeaders: isOpenRouter(baseURL)
            ? { 'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000', 'X-Title': 'Personal Finance' }
            : undefined,
        })
      : null;
  }

  get available() {
    return this.client !== null;
  }

  async suggestCategory(description: string, type: string, categories: CategoryHint[]): Promise<CategorySuggestion> {
    if (!this.client) throw new Error('LLM indisponível');
    const names = categories.filter((c) => c.type === type).map((c) => c.name);
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Você classifica transações financeiras. Responda APENAS com JSON, sem markdown: {"category": string|null, "confidence": number}.' },
        { role: 'user', content: `Transação "${description}" (${type === 'income' ? 'receita' : 'despesa'}). Categorias: ${names.join(', ') || 'nenhuma'}.` },
      ],
    });
    const parsed = extractJson(contentOf(res) ?? '{}');
    return { categoryName: parsed.category ?? null, confidence: Number(parsed.confidence ?? 0) };
  }

  async generateInsights(input: InsightInput): Promise<GeneratedInsight> {
    if (!this.client) throw new Error('LLM indisponível');
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Você é um consultor financeiro direto e prático. Responda em PT-BR, APENAS com JSON, sem markdown: {"summary": string, "alerts": string[], "tip": string}.' },
        { role: 'user', content: `Mês ${input.month}: receitas ${input.income}, despesas ${input.expense}. Top categorias: ${JSON.stringify(input.topCategories)}. Estouraram orçamento: ${JSON.stringify(input.overBudget)}. Gere resumo, alertas e 1 dica acionável.` },
      ],
    });
    const parsed = extractJson(contentOf(res) ?? '{}');
    return {
      summary: String(parsed.summary ?? ''),
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts.map(String) : [],
      tip: String(parsed.tip ?? ''),
    };
  }
}
