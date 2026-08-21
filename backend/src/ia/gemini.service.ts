import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async gerarResposta(historico: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const historicoSemUltima = historico.slice(0, -1); // tudo menos a última
      const ultimaMensagem = historico[historico.length - 1].content;

      const chat = model.startChat({
        history: historicoSemUltima
          .filter(m => m.role !== 'system') // Gemini não aceita role "system" no history
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
      });

      const result = await chat.sendMessage(ultimaMensagem);
      return result.response.text();
    } catch (error: any) {
      console.error('ERRO DETALHADO DO GEMINI:', error?.message || error);
      throw error;
    }
  }
}