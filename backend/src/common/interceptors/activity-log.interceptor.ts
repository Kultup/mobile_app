import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogService } from '../services/activity-log.service';
import { Request } from 'express';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, user, body, params, query } = request;

    // Отримуємо IP адресу та User-Agent
    const ip_address = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const user_agent = request.headers['user-agent'] || '';

    // Визначаємо тип дії на основі HTTP методу
    const actionMap: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
      GET: 'view',
    };
    const action = actionMap[method] || 'view';

    // Визначаємо тип сутності на основі URL
    const entityTypeMap: Record<string, string> = {
      '/admin/questions': 'question',
      '/admin/knowledge-base': 'knowledge_base_article',
      '/admin/users': 'user',
      '/admin/admin-users': 'admin_user',
      '/admin/achievements': 'achievement',
      '/admin/shop/products': 'shop_product',
      '/admin/surveys': 'survey',
      '/admin/settings': 'settings',
      '/admin/shop/categories': 'shop_product_category',
      '/admin/shop/product-types': 'product_type',
      '/admin/question-categories': 'question_category',
      '/admin/knowledge-base/categories': 'knowledge_base_category',
    };

    let entity_type = 'unknown';
    for (const [path, type] of Object.entries(entityTypeMap)) {
      if (url.includes(path)) {
        entity_type = type;
        break;
      }
    }

    // Отримуємо ID сутності з params або body
    const entity_id = params?.id || body?.id || query?.id || undefined;

    // Формуємо опис
    let description = `${action} ${entity_type}`;
    if (entity_id) {
      description += ` (ID: ${entity_id})`;
    }
    if (body?.name) {
      description += ` - ${body.name}`;
    } else if (body?.title) {
      description += ` - ${body.title}`;
    }

    // Логуємо тільки якщо є користувач (адміністратор)
    // user може бути { userId, username, role, type } або { sub, username, role, type }
    const adminUserId = (user as any)?.userId || (user as any)?.sub;
    if (adminUserId && (user as any)?.type === 'admin') {
      // Асинхронне логування, щоб не блокувати відповідь
      this.activityLogService.createLogAsync({
        admin_user_id: adminUserId,
        action,
        entity_type,
        entity_id,
        description,
        details: {
          method,
          url,
          body: method !== 'GET' ? body : undefined,
        },
        ip_address: Array.isArray(ip_address) ? ip_address[0] : ip_address,
        user_agent,
      });
    }

    return next.handle();
  }
}

