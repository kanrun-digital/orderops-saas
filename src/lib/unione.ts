/**
 * UniOne Email Service
 * Transactional email via UniOne API (eu1.unione.io)
 * 
 * Auth: X-API-KEY header
 * All endpoints: POST with JSON body
 */

const UNIONE_BASE = "https://api.unione.io/en/transactional/api/v1";

function getConfig() {
  return {
    apiKey: process.env["UNIONE_API_KEY"] || "",
    senderEmail: process.env["NOTIFICATION_SENDER_EMAIL"] || "noreply@orderops.io",
    senderName: process.env["NOTIFICATION_SENDER_NAME"] || "OrderOps",
  };
}

function headers() {
  const config = getConfig();
  return {
    "Content-Type": "application/json",
    "X-API-KEY": config.apiKey,
  };
}

// ============ Email Send ============

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  plaintext?: string;
  replyTo?: string;
  tags?: string[];
  substitutions?: Record<string, any>;
  metadata?: Record<string, string>;
  attachments?: Array<{ type: string; name: string; content: string }>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ jobId: string }> {
  const config = getConfig();

  const body = {
    idempotency_key: crypto.randomUUID(),
    message: {
      recipients: [
        {
          email: options.to,
          substitutions: {
            to_name: options.toName || options.to,
            ...options.substitutions,
          },
          metadata: options.metadata || {},
        },
      ],
      subject: options.subject,
      body: {
        html: options.html,
        plaintext: options.plaintext || "",
      },
      from_email: config.senderEmail,
      from_name: config.senderName,
      reply_to: options.replyTo || config.senderEmail,
      tags: options.tags || [],
      track_links: 1,
      track_read: 1,
      template_engine: "simple",
      attachments: options.attachments || [],
    },
  };

  const res = await fetch(`${UNIONE_BASE}/email/send.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`UniOne send failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { jobId: data.job_id || data.status };
}

// ============ Batch Send ============

export async function sendBatchEmail(
  recipients: Array<{ email: string; name?: string; substitutions?: Record<string, any> }>,
  subject: string,
  html: string,
  tags?: string[]
): Promise<{ jobId: string }> {
  const config = getConfig();

  const body = {
    idempotency_key: crypto.randomUUID(),
    message: {
      recipients: recipients.map((r: any) => ({
        email: r.email,
        substitutions: { to_name: r.name || r.email, ...r.substitutions },
      })),
      subject,
      body: { html },
      from_email: config.senderEmail,
      from_name: config.senderName,
      tags: tags || [],
      track_links: 1,
      track_read: 1,
      template_engine: "simple",
    },
  };

  const res = await fetch(`${UNIONE_BASE}/email/send.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`UniOne batch send failed: ${await res.text()}`);
  const data = await res.json();
  return { jobId: data.job_id || data.status };
}

// ============ Templates ============

export async function createTemplate(
  name: string,
  subject: string,
  html: string
): Promise<{ id: string }> {
  const config = getConfig();

  const res = await fetch(`${UNIONE_BASE}/template/set.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      template: {
        name,
        subject,
        body: { html },
        from_email: config.senderEmail,
        from_name: config.senderName,
        template_engine: "simple",
      },
    }),
  });

  if (!res.ok) throw new Error(`UniOne template create failed: ${await res.text()}`);
  const data = await res.json();
  return { id: data.template?.id || "" };
}

export async function listTemplates(): Promise<any[]> {
  const res = await fetch(`${UNIONE_BASE}/template/list.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ limit: 100, offset: 0 }),
  });
  if (!res.ok) throw new Error(`UniOne template list failed: ${await res.text()}`);
  const data = await res.json();
  return data.templates || [];
}

// ============ Email Validation ============

export async function validateEmail(email: string): Promise<{ valid: boolean; status: string }> {
  const res = await fetch(`${UNIONE_BASE}/email-validation/single.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`UniOne validation failed: ${await res.text()}`);
  const data = await res.json();
  return { valid: data.status === "valid", status: data.status };
}

// ============ Webhooks ============

export async function setupWebhook(url: string): Promise<void> {
  const res = await fetch(`${UNIONE_BASE}/webhook/set.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      url,
      status: "active",
      event_format: "json_post",
      single_event: 0,
      max_parallel: 10,
      events: {
        email_status: ["delivered", "opened", "clicked", "unsubscribed", "hard_bounced", "soft_bounced", "spam"],
      },
    }),
  });
  if (!res.ok) throw new Error(`UniOne webhook setup failed: ${await res.text()}`);
}

// ============ Suppression ============

export async function addSuppression(email: string, cause: string = "unsubscribed"): Promise<void> {
  await fetch(`${UNIONE_BASE}/suppression/set.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, cause }),
  });
}

export async function removeSuppression(email: string): Promise<void> {
  await fetch(`${UNIONE_BASE}/suppression/delete.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email }),
  });
}

// ============ System Info ============

export async function getSystemInfo(): Promise<any> {
  const res = await fetch(`${UNIONE_BASE}/system/info.json`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`UniOne system info failed: ${await res.text()}`);
  return res.json();
}

// ============ Pre-built Email Templates ============

export function orderConfirmationHtml(orderNumber: string, items: string, total: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Замовлення #${orderNumber} підтверджено</h2>
      <p>Дякуємо за замовлення!</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px;">
        ${items}
      </div>
      <p style="font-size: 18px; font-weight: bold;">Разом: ${total}</p>
    </div>
  `;
}

export function welcomeHtml(name: string, loginUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Ласкаво просимо, ${name}!</h2>
      <p>Ваш акаунт в OrderOps створено. Увійдіть щоб почати:</p>
      <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">Увійти</a>
    </div>
  `;
}

export function reviewRequestHtml(customerName: string, restaurantName: string, reviewUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Як вам сподобалось?</h2>
      <p>Привіт, ${customerName}! Сподіваємось, ви задоволені замовленням з ${restaurantName}.</p>
      <p>Будь ласка, залиште відгук:</p>
      <a href="${reviewUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px;">Залишити відгук</a>
    </div>
  `;
}
