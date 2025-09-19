// ./plugins/chatgpt.js
// Si defines OPENAI_API_KEY en las variables de entorno, este plugin intentará usar la API de OpenAI.
// Si no, responderá con una respuesta local simple (eco/ayuda).
module.exports = {
  commands: [
    {
      name: 'chatgpt',
      run: async ({ msg, conn, from, args }) => {
        const q = args.join(' ');
        if (!q) return conn.sendMessage(from, { text: 'Usa: .chatgpt <pregunta>' });
        const key = process.env.OPENAI_API_KEY;
        if (!key) {
          // Respuesta local simple (sin necesidad de signup).
          const reply = "Respuesta local (sin OpenAI): " + q.split('').reverse().join('').slice(0,200);
          return conn.sendMessage(from, { text: reply });
        } else {
          // Si hay API key, intenta usar fetch a OpenAI (requiere node >=18 o global fetch)
          try {
            const res = await (await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: q }],
                max_tokens: 500
              })
            })).json();
            const text = res?.choices?.[0]?.message?.content || JSON.stringify(res);
            return conn.sendMessage(from, { text: 'OpenAI: ' + text });
          } catch (e) {
            return conn.sendMessage(from, { text: 'Error llamando OpenAI: ' + e.message });
          }
        }
      }
    }
  ]
};
