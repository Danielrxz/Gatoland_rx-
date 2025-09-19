// ./plugins/whatmusic.js
module.exports = {
  commands: [
    {
      name: 'whatmusic',
      aliases: ['whatsong'],
      run: async ({ msg, conn, from }) => {
        await conn.sendMessage(from, { text: 'Envía un fragmento de audio y te diré si lo reconozco (nota: reconocimiento real requiere servicios externos).' });
      }
    }
  ]
};
