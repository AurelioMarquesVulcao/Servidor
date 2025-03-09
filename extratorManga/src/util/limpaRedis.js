const { createClient } = require('redis');

// Conectando ao Redis
const client = createClient({
    url: 'redis://localhost:6379', // URL para o Redis
});

// Conectando ao Redis de forma assíncrona
async function connectRedis() {
    try {
        await client.connect();
        console.log('Conectado ao Redis');
    } catch (err) {
        console.error('Erro ao conectar no Redis:', err);
    }
}

connectRedis();

// Função para limpar o Redis
async function clearRedis() {
    try {
        await client.flushAll(); // Limpa todas as bases de dados
        console.log('Redis limpo com sucesso.');
    } catch (err) {
        console.error('Erro ao limpar o Redis:', err);
    } finally {
        // Desconecta do Redis
        client.quit();
    }
}

// Executa a função para limpar o Redis
clearRedis();