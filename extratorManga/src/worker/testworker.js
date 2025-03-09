const { createClient } = require('redis');

// Conectando ao Redis
const client = createClient({
    url: 'redis://localhost:6379',
});

async function addTaskToQueue() {
    try {
        await client.connect();
        console.log('Conectado ao Redis');

        // Adicionando uma tarefa de teste na fila de extração
        const task = {
            url: 'https://remangas.net/wp-content/uploads/WP-manga/data/manga_67942222254d4/f166b3cec3baad4d23be23279dfdc82e/00000000_007000_resultado.jpg',
            titulo: 'teste02',
            ordenador: 'cap02',
            nome: '001.jpg',
        };

        // Usando rPush para adicionar a tarefa
        await client.rPush('fila-de-extracao', JSON.stringify(task));
        console.log('Tarefa adicionada à fila de extração');
    } catch (err) {
        console.error('Erro ao adicionar tarefa na fila:', err);
    } finally {
        await client.quit(); // Fecha a conexão com o Redis
    }
}

addTaskToQueue();
