import { list, get } from '@vercel/blob';
import { json, readSession } from './_session.mjs';

async function readJson(pathname) {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

async function getOrders() {
  const items = [];
  let cursor;

  do {
    const page = await list({
      prefix: 'orders/',
      limit: 1000
      cursor,
      access: 'private'
    });

    for (const blob of page.blobs || []) {
      if (!blob.pathname.endsWith('.json')) continue;
      try {
        const order = await readJson(blob.pathname);
        if (order) items.push(order);
      } catch (error) {
        console.error('[101] Erro a ler pedido:', blob.pathname, error);
      }
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return items.sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  );
}

export default async function handler(request) {
  const session = readSession(request);

  if (!session) {
    return json({ error: 'Não autenticado.' }, 401);
  }

  if (request.method !== 'GET') {
    return json({ error: 'Método não permitido.' }, 405);
  }

  try {
    const orders = await getOrders();
    const paidStatuses = new Set(['PAGO', 'PAGO / CONFIRMADO', 'CONFIRMADO']);

    const eventsMap = new Map();
    for (const order of orders) {
      const key = order.eventSlug || order.event || 'sem-evento';
      if (!eventsMap.has(key)) {
        eventsMap.set(key, {
          name: order.event || 'Evento',
          orders: 0,
          bracelets: 0,
          paid: 0
        });
      }
      const event = eventsMap.get(key);
      event.orders += 1;
      event.bracelets += Number(order.quantity) || 0;
      if (paidStatuses.has(String(order.status || '').toUpperCase())) event.paid += 1;
    }

    return json({
      stats: {
        orders: orders.length,
        bracelets: orders.reduce((sum, order) => sum + (Number(order.quantity) || 0), 0),
        paid: orders.filter(order => paidStatuses.has(String(order.status || '').toUpperCase())).length,
        events: eventsMap.size
      },
      orders: orders.slice(0, 100),
      events: Array.from(eventsMap.values())
    });
  } catch (error) {
    console.error('[101] admin/overview:', error);
    return json({ error: 'Storage da Vercel não está configurado ou não está acessível.' }, 500);
  }
}
