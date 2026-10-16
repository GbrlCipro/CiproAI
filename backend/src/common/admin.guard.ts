import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

/**
 * Protege rotas administrativas com uma chave enviada no header "x-admin-key".
 * A chave esperada vem de ADMIN_API_KEY no .env.
 * Se a variável não existir, TODAS as requisições são negadas (falha segura).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const chaveEsperada = process.env.ADMIN_API_KEY;
    const req = context.switchToHttp().getRequest();
    const chaveRecebida = req.headers['x-admin-key'];

    if (!chaveEsperada || typeof chaveRecebida !== 'string') {
      throw new UnauthorizedException();
    }

    const esperada = Buffer.from(chaveEsperada);
    const recebida = Buffer.from(chaveRecebida);

    if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
