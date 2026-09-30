import { put } from '@vercel/blob';
import { json } from './_session.mjs';

const MAX_QTY = 8;

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405);
  }

  try {
    const body = await request.json();

    const orderCode = clean(body?.orderCode, 40).toUpperCase();
    const event = clean(body?.event, 120);
    const eventSlug = clean(body?.eventSlug, 120).toLowerCase();
    const customer = clean(body?.customer, 160);
    const discord = clean(body?.discord, 160);
    const contact = clean(body?.contact, 80);
    const quantity = Number(body?.quantity);
    const unitPrice = Number(body?.unitPrice);
    const currency = clean(body?.currency, 8) || '$';
    const participants = Array.isArray(body?.participants)
      ? body.participants.map(name => clean(name, 120)).filter(Boolean).slice(0, MAX_QTY)
      : [];

    if (!/^101-[A-Z0-9]{3}-[A-Z0-9]{6}$/.test(orderCode)) {
      return json({ error: 'Código de pedido inválido.' }, 400);
    }

    if (!event || !customer || !discord) {
      return json({ error: 'Dados do pedido incompletos.' }, 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return json({ error: 'Quantidade inválida.' }, 400);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return json({ error: 'Preço inválido.' }, 400);
    }

    if (participants.length !== quantity) {
      return json({ error: 'A lista de participantes não corresponde à quantidade.' }, 400);
    }

    const total = Number((quantity * unitPrice).toFixed(2));
    const createdAt = new Date().toISOString();

    const order = {
      orderCode,
      event,
      eventSlug,
      customer,
      discord,
      contact,
      quantity,
      unitPrice,
      total,
      currency,
      participants,
      status: 'AGUARDA VALIDAÇÃO',
      createdAt,
      updatedAt: createdAt
    };

    const blob = await put(
      `orders/${orderCode}.json`,
      JSON.stringify(order, null, 2),
      {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json'
      }
    );

    return json({ ok: true, orderCode, pathname: blob.pathname }, 201);
  } catch (error) {
    console.error('[101] orders/create:', error);

    if (error?.code === 'blob_store_not_found') {
      return json({ error: 'Storage da Vercel não está configurado.' }, 500);
    }

    if (error?.name === 'BlobAlreadyExistsError') {
      return json({ error: 'Este pedido já está registado.' }, 409);
    }

    return json({ error: 'Não foi possível guardar o pedido.' }, 500);
  }
}
