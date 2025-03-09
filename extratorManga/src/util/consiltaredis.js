const Redis = require('ioredis');

// Configuração do Redis
const redis = new Redis();

// Função para listar os itens na fila
const listarFila = async () => {
    try {
        const fila = await redis.lrange('fila-de-extracao', 0, -1);
        console.log('Itens na fila:', fila);
    } catch (error) {
        console.error('Erro ao listar a fila:', error);
    } finally {
        // Desconecta do Redis
        redis.quit();
    }
};

// Executa a função
listarFila();