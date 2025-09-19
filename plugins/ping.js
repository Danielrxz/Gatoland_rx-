module.exports = {
  commands: [
    {
      name: 'ping',
      aliases: ['p'],
      run: async ({ msg, conn, from }) => {
        await conn.sendMessage(from, { text: 'Pong! 🏓' });
      }
    }
  ]
};
