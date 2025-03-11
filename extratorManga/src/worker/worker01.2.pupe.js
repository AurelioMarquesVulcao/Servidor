const cluster = require("cluster");
const os = require("os");
const { createClient } = require("redis");
const { extrairImagensPuppeteer } = require("../util/downloadImages");

if (cluster.isMaster) {
  // const numWorkers = 1; // Ajuste conforme necessário;
  const numWorkers = os.cpus().length; // Número de CPUs disponíveis

  console.log(`Iniciando ${numWorkers} workers...`);
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} morreu. Reiniciando...`);
    cluster.fork();
  });
} else {
  const client = createClient({ url: "redis://localhost:6379" });

  async function connectRedis() {
    try {
      await client.connect();
      console.log(`Worker ${process.pid} conectado ao Redis`);
    } catch (err) {
      console.error("Erro ao conectar no Redis:", err);
    }
  }

  connectRedis();

  async function processImageTask() {
    try {
      const task = await client.lPop("fila-de-extracao");

      if (task) {
        const taskData = JSON.parse(task);
        const { url, titulo, ordenador, nome } = taskData; // Agora pegando o nome corretamente

        try {
          console.log(
            `Worker ${process.pid} processando: ${titulo} - ${ordenador}`
          );

          // Extrai e baixa as imagens com o nome correto
          await extrairImagensPuppeteer(url, titulo, ordenador, nome);

          console.log(`Capítulo ${ordenador} baixado com sucesso!`);
        } catch (error) {
          console.error(
            `Erro no processamento de ${titulo} - ${ordenador}:`,
            error
          );
          await client.lPush("fila-de-extracao", JSON.stringify(taskData));
          console.log(`Reinserindo ${titulo} - ${ordenador} na fila.`);
        }
      }
    } catch (err) {
      console.error("Erro ao pegar a tarefa:", err);
    }
  }

  // Executa a função continuamente sem sobrecarregar
  (async function processLoop() {
    while (true) {
      await processImageTask();
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda 5s antes de pegar outra tarefa
    }
  })();
}
