const fs = require('fs');
const path = require('path');
const criarPDFComImagens = require('../util/geraPdf'); // Caminho relativo para o módulo

// Função para criar o PDF para cada pasta encontrada
async function gerarPDFParaPastas() {
    const downloadsFolder = path.join('src', 'downloads');

    // Verifica se o diretório "downloads" existe
    if (!fs.existsSync(downloadsFolder)) {
        console.log('Diretório de downloads não encontrado.');
        return;
    }

    // Lê todas as pastas dentro de 'src/downloads'
    const pastas = fs.readdirSync(downloadsFolder).filter(pasta => fs.statSync(path.join(downloadsFolder, pasta)).isDirectory());

    for (const titulo of pastas) {
        const tituloPath = path.join(downloadsFolder, titulo);

        // Lê as subpastas de cada pasta (ordenadores)
        const subpastas = fs.readdirSync(tituloPath).filter(subpasta => fs.statSync(path.join(tituloPath, subpasta)).isDirectory());

        for (const ordenador of subpastas) {
            console.log(`Gerando PDF para ${titulo} - ${ordenador}`);

            try {
                // Caminho onde o PDF será salvo em 'src/extracao'
                const pdfFilePath = path.join('src', 'extracao', `${titulo}_${ordenador}.pdf`);

                // Chama o módulo para criar o PDF com as imagens, passando o caminho do PDF
                await criarPDFComImagens(titulo, ordenador, pdfFilePath);
            } catch (error) {
                console.error(`Erro ao gerar PDF para ${titulo} - ${ordenador}:`, error.message);
            }
        }
    }
}

// Intervalo de 5 minutos (300.000 milissegundos)
setInterval(gerarPDFParaPastas, 5 * 60 * 1000);

// Executa a função também na inicialização
gerarPDFParaPastas();
