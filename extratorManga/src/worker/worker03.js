const fs = require('fs');
const path = require('path');

// Função para converter imagem para base64
function converterImagemParaBase64(caminhoImagem) {
    const imagem = fs.readFileSync(caminhoImagem);
    const extensao = path.extname(caminhoImagem).substring(1); // Obtém a extensão sem o ponto
    return `data:image/${extensao};base64,${imagem.toString('base64')}`;
}

// Função para gerar HTML com imagens
async function gerarHTMLParaPastas() {
    const downloadsFolder = path.join('src', 'downloads');
    const extracaoFolder = path.join('src', 'extracao');

    if (!fs.existsSync(downloadsFolder)) {
        console.log('Diretório de downloads não encontrado.');
        return;
    }

    if (!fs.existsSync(extracaoFolder)) {
        fs.mkdirSync(extracaoFolder, { recursive: true });
    }

    const pastas = fs.readdirSync(downloadsFolder).filter(pasta =>
        fs.statSync(path.join(downloadsFolder, pasta)).isDirectory()
    );

    for (const titulo of pastas) {
        const tituloPath = path.join(downloadsFolder, titulo);
        const subpastas = fs.readdirSync(tituloPath).filter(subpasta =>
            fs.statSync(path.join(tituloPath, subpasta)).isDirectory()
        );

        // Criar diretório para o título dentro da pasta de extração
        const tituloExtracaoFolder = path.join(extracaoFolder, titulo);
        if (!fs.existsSync(tituloExtracaoFolder)) {
            fs.mkdirSync(tituloExtracaoFolder, { recursive: true });
        }

        for (const ordenador of subpastas) {
            console.log(`Gerando HTML para ${titulo} - ${ordenador}`);

            try {
                const imagensPath = path.join(tituloPath, ordenador);
                const imagens = fs.readdirSync(imagensPath)
                    .filter(arquivo => arquivo.match(/\.(jpg|jpeg|png|gif)$/i))
                    .sort(); // Ordena alfabeticamente

                const imagensBase64 = imagens.map(imagem => {
                    const caminhoImagem = path.join(imagensPath, imagem);
                    return converterImagemParaBase64(caminhoImagem);
                });

                const htmlContent = `<!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${ordenador}</title>
                    <style>
                        body {
                            background-color: #121212;
                            color: #fff;
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        img {
                            width: 100%;
                            max-width: 1000px;
                            margin-bottom: 20px;
                            border-radius: 10px;
                            box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
                        }
                    </style>
                </head>
                <body>
                    <h1>${ordenador}</h1>
                    <div class="container">
                        ${imagensBase64.map(src => `<img src="${src}" alt="Imagem">`).join('\n')}
                    </div>
                </body>
                </html>`;

                const htmlFilePath = path.join(tituloExtracaoFolder, `${ordenador}.html`);
                fs.writeFileSync(htmlFilePath, htmlContent);
                console.log(`HTML gerado: ${htmlFilePath}`);
            } catch (error) {
                console.error(`Erro ao gerar HTML para ${titulo} - ${ordenador}:`, error.message);
            }
        }
    }
}

// Intervalo de 5 minutos
setInterval(gerarHTMLParaPastas, 5 * 60 * 1000);

gerarHTMLParaPastas();
