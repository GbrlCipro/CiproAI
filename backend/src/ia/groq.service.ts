import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async gerarResposta(historico: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    const resposta = await this.groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: historico,
    });

    return resposta.choices[0]?.message?.content ?? '';
  }
}