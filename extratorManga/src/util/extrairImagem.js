const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadImages(url, titulo, ordenador, nome) {
    const folderPath = path.join('src', 'downloads', titulo, ordenador);

    try {
        // Usando fs.promises.mkdir para criar diretórios recursivamente de forma assíncrona
        await fs.promises.mkdir(folderPath, { recursive: true });

        const filePath = path.join(folderPath, nome);

        // Verifica se o arquivo já existe, se sim, apaga ele
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Deleta o arquivo existente
            console.log(`Imagem existente apagada: ${filePath}`);
        }

        // Faz a requisição para baixar a imagem
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        const extension = contentType.split('/')[1]; // Obtém a extensão da imagem (jpeg, png, etc.)

        // Se o nome da imagem não tiver extensão, adiciona a extensão obtida
        if (!nome.includes('.')) {
            nome = `${nome}.${extension}`;
        }

        // Salva a imagem com o nome correto
        fs.writeFileSync(path.join(folderPath, nome), response.data);
        console.log(`Imagem salva em: ${path.join(folderPath, nome)}`);
    } catch (error) {
        // Log do erro
        console.error('Erro ao baixar a imagem:', error.message);

        // Lançamento de exceção após o log do erro para garantir que o erro seja propagado
        throw new Error(`Falha ao processar a tarefa para ${titulo} - ${ordenador}: ${error.message}`);
    }
}

module.exports = downloadImages;
