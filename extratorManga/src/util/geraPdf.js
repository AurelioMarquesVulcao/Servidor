const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function criarPDFComImagens(titulo, ordenador, nome) {
    const folderPath = path.join('src', 'downloads', titulo, ordenador);

    // Verifica se o diretório existe
    if (!fs.existsSync(folderPath)) {
        throw new Error(`O diretório ${folderPath} não existe.`);
    }

    // Cria um documento PDF
    const doc = new PDFDocument();

    // Define o caminho do arquivo PDF a ser salvo
    const pdfFilePath = path.join('src', 'downloads', `${titulo}_${ordenador}.pdf`);

    // Cria um fluxo de escrita para o arquivo PDF
    doc.pipe(fs.createWriteStream(pdfFilePath));

    // Adiciona o título do PDF
    doc.fontSize(18).text(titulo, { align: 'center' });
    doc.fontSize(12).text(`Ordenador: ${ordenador}`, { align: 'center' });
    doc.addPage(); // Adiciona uma nova página antes de adicionar as imagens

    // Lê o diretório e pega todos os arquivos de imagem
    const arquivos = fs.readdirSync(folderPath);

    let yPosition = 20; // Posição inicial para a primeira imagem

    for (const arquivo of arquivos) {
        const arquivoPath = path.join(folderPath, arquivo);

        // Verifica se o arquivo é uma imagem (pode ajustar conforme necessário para outros tipos)
        if (/\.(jpg|jpeg|png|gif)$/i.test(arquivo)) {
            if (yPosition > doc.page.height - 100) {
                doc.addPage(); // Adiciona nova página se o espaço acabar
                yPosition = 20; // Reseta a posição para o topo da nova página
            }

            // Adiciona a imagem ao PDF
            doc.image(arquivoPath, { fit: [250, 250], align: 'center', valign: 'center' });

            // Atualiza a posição Y para a próxima imagem
            yPosition += 260; // A altura da imagem + um pequeno espaçamento
            doc.y = yPosition;
        }
    }

    // Finaliza o documento
    doc.end();

    console.log(`PDF com imagens criado com sucesso: ${pdfFilePath}`);
}

module.exports = criarPDFComImagens;
