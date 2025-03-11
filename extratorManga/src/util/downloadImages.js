const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function esperar(tempo) {
  return new Promise((resolve) => setTimeout(resolve, tempo));
}

async function baixarImagemPuppeteer(page, url, pastaDestino, nome) {
  try {
    console.log(`Baixando imagem: ${url}`);
    await page.goto(url, { waitUntil: "load" });
    await esperar(1000);
    const buffer = await page.screenshot({ encoding: "binary" });
    fs.writeFileSync(path.join(pastaDestino, nome), buffer);
    console.log(`Imagem salva: ${path.join(pastaDestino, nome)}`);
  } catch (error) {
    console.error(`Erro ao baixar ${url}:`, error);
  }
}

async function extrairImagensPuppeteer(
  capituloUrl,
  titulo,
  ordenador,
  nomeImagem
) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1200,800"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  try {
    console.log(`Acessando página: ${capituloUrl}`);
    await page.goto(capituloUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await esperar(1000);

    // Tentar diferentes seletores
    const seletores = [".page-break.no-gaps img", "img", "body img"];
    let imageUrls = [];

    for (const seletor of seletores) {
      try {
        await page.waitForSelector(seletor, { timeout: 10000 });
        imageUrls = await page.evaluate((seletor) => {
          return Array.from(document.querySelectorAll(seletor))
            .map((img) => img.src.trim())
            .filter((src) => src.startsWith("http"));
        }, seletor);
        if (imageUrls.length > 0) break;
      } catch (err) {
        console.warn(`Seletor ${seletor} não encontrado.`);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("Nenhuma imagem encontrada!");
    }

    console.log(`Encontradas ${imageUrls.length} imagens no capítulo.`);
    await esperar(1000);

    // Criando estrutura de diretórios
    const pastaDestino = path.join(__dirname, "downloads", titulo, ordenador);
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    // Baixar e salvar as imagens usando Puppeteer
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const extensao = path.extname(url).split("?")[0] || ".jpg";
      const nomeArquivo = nomeImagem || `imagem-${i + 1}${extensao}`; // Usa o nome do Redis se existir
      await baixarImagemPuppeteer(page, url, pastaDestino, nomeArquivo);
      await esperar(1000);
    }
  } catch (error) {
    console.error(`Erro ao extrair imagens de ${capituloUrl}:`, error);
    throw error;
  } finally {
    await esperar(2000);
    await browser.close();
  }
}

module.exports = { extrairImagensPuppeteer };
