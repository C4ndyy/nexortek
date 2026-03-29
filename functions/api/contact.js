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

    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", turnstileToken);
    formData.append("remoteip", ip);

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return json({ error: "Falha na verificação anti-bot." }, 400);
    }

    // Aqui depois ligas email, Notion, webhook, etc.
    console.log("Novo contacto:", {
      name,
      business,
      email,
      phone,
      service,
      message,
    });

    return json({ ok: true }, 200);
  } catch (error) {
    return json({ error: "Erro interno no servidor." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}