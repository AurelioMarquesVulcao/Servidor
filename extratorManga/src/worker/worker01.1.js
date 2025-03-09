const cluster = require('cluster');
const os = require('os');
const { createClient } = require('redis');
const downloadImages = require('../util/extrairImagem'); // Caminho relativo para o módulo de download

if (cluster.isMaster) {
    const numWorkers = os.cpus().length; // Número de CPUs disponíveis

    console.log(`Iniciando ${numWorkers} workers...`);
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} morreu. Iniciando um novo worker...`);
        cluster.fork();
    });
} else {
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

    // Função para processar a tarefa
    async function processImageTask() {
        // Pegando o próximo item da fila
        try {
            const task = await client.rPop('fila-de-extracao'); // rPop retorna o valor de forma assíncrona

            if (task) {
                const taskData = JSON.parse(task); // Transformando a tarefa de volta para objeto
                const { url, titulo, ordenador, nome } = taskData;

                try {
                    console.log(`Processando tarefa: ${titulo} - ${ordenador}`);
                    await downloadImages(url, titulo, ordenador, nome); // Usando o módulo de download
                    console.log(`Imagem ${nome} baixada com sucesso.`);
                } catch (error) {
                    console.error(`Falha ao processar a tarefa ${titulo} - ${ordenador}:`, error);
                    // Recolocando a tarefa falhada de volta na fila
                    await client.lPush('fila-de-extracao', JSON.stringify(taskData)); // Usando lPush para adicionar na fila
                    console.log(`Tarefa ${titulo} - ${ordenador} recolocada na fila devido a falha.`);
                }
            } else {
                console.log('Nenhuma tarefa na fila.');
            }
        } catch (err) {
            console.error('Erro ao pegar a tarefa:', err);
        }
    }

    // Chamada para processar a tarefa periodicamente
    setInterval(processImageTask, 5000); // Verifica a fila a cada 5 segundos
}