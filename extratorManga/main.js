const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const Redis = require('ioredis');

// Configuração do Redis
const redis = new Redis();

// Variáveis para título e capítulo (ordenador)
const titulo = 'o-lixo-da-familia-condal';  // Título do mangá ou da página
const ordenador = 'capitulo-006';           // Ordenador ou capítulo

// URL do capítulo do mangá
const url = `https://remangas.net/manga/${titulo}/${ordenador}/`;

// Seletor da div que contém as imagens
const imageContainerSelector = '.page-break.no-gaps';

// Função para capturar o HTML do site
const fetchHTML = async (url) => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error('Erro ao buscar a página:', error);
        return null;
    }
};

// Função para processar o HTML e extrair as URLs das imagens
const extractImages = async () => {
    const html = await fetchHTML(url);
    if (!html) return;

    const $ = cheerio.load(html);
    console.log('Título da página:', $('title').text());

    let imageUrls = [];

    $(imageContainerSelector).find('img').each((index, element) => {
        let imgUrl = $(element).attr('src');
        if (imgUrl) {
            imgUrl = imgUrl.replace(/^[\s\t\n]+/, '').match(/https?.*/)?.[0] || ''; // Remove espaços extras e captura apenas a URL a partir de http
            if (imgUrl) {
                imageUrls.push(imgUrl);
            }
        }
    });

    // Salva as URLs das imagens em um arquivo JSON
    fs.writeFileSync('images.json', JSON.stringify(imageUrls, null, 2));
    console.log('URLs das imagens salvas em images.json');

    // Adiciona as URLs à fila do Redis
    for (let index = 0; index < imageUrls.length; index++) {
        const imgUrl = imageUrls[index];
        const extension = imgUrl.split('.').pop(); // Obtém a extensão da imagem
        const task = {
            url: imgUrl, // URL da imagem
            titulo: titulo, // Título do mangá
            ordenador: ordenador, // Capítulo ou subpasta
            nome: `imagem-${index + 1}.${extension}`, // Nome do arquivo baseado no número da interação do laço for
        };

        // Usando rPush para adicionar a tarefa
        await redis.rpush('fila-de-extracao', JSON.stringify(task));
        console.log(`Imagem ${task.nome} adicionada à fila de extração`);
    }

    // Desconecta do Redis
    redis.quit();
};

// Executa o processo
extractImages();