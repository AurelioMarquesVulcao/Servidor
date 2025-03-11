const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const Redis = require("ioredis");

// Configuração do Redis
const redis = new Redis();

// Variáveis para título e intervalo de capítulos
const titulo = "seu-talento-e-meu"; // Título do mangá ou da página
const inicio = 0; // Número inicial do capítulo
const fim = 97; // Número final do capítulo

// Seletor da div que contém as imagens
const imageContainerSelector = ".page-break.no-gaps";

// Função para capturar o HTML do site com repetição em caso de erro
const fetchHTML = async (url) => {
  const maxRetries = 3; // Número máximo de tentativas
  const delay = 60000; // Tempo de espera em milissegundos (1 minuto)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar a página (tentativa ${attempt}):`, error);
      if (
        error.response &&
        error.response.status === 520 &&
        attempt < maxRetries
      ) {
        console.log(
          `Esperando ${delay / 1000} segundos antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return null;
      }
    }
  }
};

// Função para processar o HTML e extrair as URLs das imagens
const extractImages = async (url, capitulo) => {
  const html = await fetchHTML(url);
  if (!html) return;

  const $ = cheerio.load(html);
  console.log(`Título da página (${capitulo}):`, $("title").text());

  let imageUrls = [];

  $(imageContainerSelector)
    .find("img")
    .each((index, element) => {
      let imgUrl = $(element).attr("src");
      if (imgUrl) {
        imgUrl = imgUrl.replace(/^[\s\t\n]+/, "").match(/https?.*/)?.[0] || ""; // Remove espaços extras e captura apenas a URL a partir de http
        if (imgUrl) {
          imageUrls.push(imgUrl);
        }
      }
    });

  // Salva as URLs das imagens em um arquivo JSON
  // fs.writeFileSync(`images-${capitulo}.json`, JSON.stringify(imageUrls, null, 2));
  // console.log(`URLs das imagens do capítulo ${capitulo} salvas em images-${capitulo}.json`);

  // Adiciona as URLs à fila do Redis
  for (let index = 0; index < imageUrls.length; index++) {
    const imgUrl = imageUrls[index];
    const extension = imgUrl.split(".").pop(); // Obtém a extensão da imagem
    const task = {
      url: imgUrl, // URL da imagem
      titulo: titulo, // Título do mangá
      ordenador: `capitulo-${capitulo}`, // Capítulo ou subpasta
      nome: `imagem-${index + 1}.${extension}`, // Nome do arquivo baseado no número da interação do laço for
    };

    // Usando rPush para adicionar a tarefa
    await redis.rpush("fila-de-extracao", JSON.stringify(task));
    console.log(
      `Imagem ${task.nome} do capítulo ${capitulo} adicionada à fila de extração`
    );
  }
};

// Função para iterar sobre os capítulos e extrair as imagens
const extractMultipleChapters = async (inicio, fim) => {
  const delay = fim > 150 ? 30000 : fim > 100 ? 10000 : fim > 50 ? 5000 : 0;
  for (let capitulo = inicio; capitulo <= fim; capitulo++) {
    const capituloStr = capitulo.toString().padStart(2, "0"); // Formata o número do capítulo com zeros à esquerda
    // const capituloStr = capitulo.toString().padStart(3, "0"); // Formata o número do capítulo com zeros à esquerda
    const url = `https://remangas.net/manga/${titulo}/capitulo-${capituloStr}/`;
    console.log(url);

    await extractImages(url, capituloStr);
    if (delay > 0) {
      console.log(
        `Esperando ${
          delay / 1000
        } segundos antes de processar o próximo capítulo...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Desconecta do Redis
  redis.quit();
};

// Executa o processo para múltiplos capítulos
extractMultipleChapters(inicio, fim);
