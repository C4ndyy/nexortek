function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function verifyTurnstile(token, ip, secret) {
  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip && ip !== "unknown") formData.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
}

async function createNotionLead(env, lead) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: {
        database_id: env.NOTION_DATABASE_ID,
      },
      properties: {
        "Nome": {
          title: [
            {
              text: {
                content: lead.name,
              },
            },
          ],
        },
        "Negócio": {
          rich_text: lead.business
            ? [{ text: { content: lead.business } }]
            : [],
        },
        "Email": {
          email: lead.email,
        },
        "Telefone": {
          phone_number: lead.phone || null,
        },
        "Serviço": {
          select: {
            name: lead.service,
          },
        },
        "Mensagem": {
          rich_text: [
            {
              text: {
                content: lead.message.slice(0, 1900),
              },
            },
          ],
        },
        "Origem": {
          rich_text: [
            {
              text: {
                content: "Website Nexortek",
              },
            },
          ],
        },
        "Data": {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Falha ao guardar no Notion.");
  }

  return data;
}

async function sendNotificationEmail(env, lead) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Nexortek <onboarding@resend.dev>",
      to: [env.LEAD_NOTIFICATION_EMAIL],
      subject: `Novo pedido de contacto: ${lead.name}`,
      reply_to: lead.email,
      html: `
        <h2>Novo pedido de contacto</h2>
        <p><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Negócio:</strong> ${escapeHtml(lead.business || "-")}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
        <p><strong>Telefone:</strong> ${escapeHtml(lead.phone || "-")}</p>
        <p><strong>Serviço:</strong> ${escapeHtml(lead.service)}</p>
        <p><strong>Mensagem:</strong><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Falha ao enviar email.");
  }

  return data;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";

    const body = await request.json();

    const {
      name = "",
      business = "",
      email = "",
      phone = "",
      service = "",
      message = "",
      company_website = "",
      turnstileToken = "",
    } = body;

    if (company_website && company_website.trim() !== "") {
      return json({ error: "Spam detetado." }, 400);
    }

    if (name.trim().length < 2) {
      return json({ error: "Nome inválido." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Email inválido." }, 400);
    }

    if (!service.trim()) {
      return json({ error: "Serviço obrigatório." }, 400);
    }

    if (message.trim().length < 20) {
      return json({ error: "Mensagem demasiado curta." }, 400);
    }

    if (!turnstileToken) {
      return json({ error: "Verificação anti-bot em falta." }, 400);
    }

    const turnstileResult = await verifyTurnstile(
      turnstileToken,
      ip,
      env.TURNSTILE_SECRET_KEY
    );

    if (!turnstileResult.success) {
      return json(
        {
          error: "Falha na verificação anti-bot.",
          details: turnstileResult["error-codes"] || [],
        },
        400
      );
    }

    const lead = {
      name: name.trim(),
      business: business.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service.trim(),
      message: message.trim(),
    };

    const [notionResult, emailResult] = await Promise.all([
      createNotionLead(env, lead),
      sendNotificationEmail(env, lead),
    ]);

    return json({
      ok: true,
      notionPageId: notionResult.id,
      emailId: emailResult.id,
    });
  } catch (error) {
    return json(
      {
        error: error.message || "Erro interno no servidor.",
      },
      500
    );
  }
}