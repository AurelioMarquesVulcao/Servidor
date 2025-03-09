const { default: axios } = require("axios");
const cheerio = require('cheerio');
const Fs = require('fs');
const { readFile } = require('fs');
const { setMaxIdleHTTPParsers } = require("http");
const Path = require('path');
const sleep = require('await-sleep')

const hummus = require("hummus")
const streamToPromise = require("stream-to-promise")
// const sleep = require('await-sleep')

const ImagesToPDF = require('images-pdf');
const imagesToPdf = require("images-to-pdf")

// const html =readFile('./html/01.html', (err, data) => {
//   if (err) throw err;
//   console.log(data);
// });

const html = Fs.readFileSync('./html/01.html').toString()

// MangaYabu
// var manga = "magical-daoist-priest"
// var manga = "the-beginning"
var manga = "one-piece"
var urlManga = "https://mangayabu.top/ler/one-piece-capitulo-701-my12892/"
// var urlManga = "https://mangayabu.top/ler/yi-shijie-mofa-daoshi-otherworldly-magical-daoist-priest-capitulo-35-my1137823/"
// var urlManga = "https://mangayabu.top/ler/yi-shijie-mofa-daoshi-otherworldly-magical-daoist-priest-capitulo-01-my1134054/"
// var urlManga = "https://mangayabu.top/ler/the-beginning-after-the-end-capitulo-41-my119358/"
// var parseImages = 'img[gear="misaki"]'
var parseImages = 'img[gear="satoshi"]'
var parseProximoCapitulo = 'a[title="Próximo Capítulo"]'
// outro leitor.net
// var manga = "a-returners-magic-should-be-special"
// var urlManga = "https://leitor.net/manga/a-returners-magic-should-be-special/7718#"
// var parseProximoCapitulo = 'li > a[class="link-dark"]'
// var parseImages = 'img'
// outro site
// var manga = "a-returners-magic-should-be-special"
// var urlManga = "'https://mangayabu.top/ler/a-returners-magic-should-be-special-capitulo-01-my175268/"
// var parseImages = 'img[gear="satoshi"]'
// var parseProximoCapitulo = 'a[title="Próximo Capítulo"]' 
// -------------------
var capitulo = 701
var capitulos = 1073
var images = [
  

]


console.log("Iniciando");
const extract = async (url) => {
  const site = await axios.get(url)
  const dataSite = site.data
  return dataSite
}
const parsePages = async (firstPage) => {
  let url = []
  // para mangauba
  const body = await extract(firstPage)
  const $ = cheerio.load(body)

  // para Leitor.net
  // const $ = cheerio.load(html)
  $(parseProximoCapitulo).each(async function (element) {
    let datas = $(this).attr('href');
    url.push(datas)
  });
  // console.log(url);




  await download(await parse(firstPage))
  await pdf()

  console.log('Terminado capitulo ' + capitulo);
  capitulo++
  // await sleep(60000)

  if (capitulo < capitulos + 1) {
    images = []
    await parsePages(url[url.length - 1])


  } else {
    // await sleep(20000)
    // await pdf()
  }


}

const parse = async (page) => {
  let url = []
  // console.log(page);
  const body = await extract(page)
  // console.log(body);
  const $ = cheerio.load(body)
  $(parseImages).each(async function (element) {
    let datas = $(this).attr("src");
    url.push(datas)
    console.log(datas);
  });
  // $('referrerpolicy')
  // .filter(function ( i,el) {
  //   let datas = $(this).attr('src') ;
  //   if(datas){

  //     url.push(datas)
  //   }
  // })
  // console.log(url);
  // $('img').filter('.no-referrer').attr('referrerpolicy');
  // console.log($('img').filter('no-referrer').attr('referrerpolicy'));

  // REMOVE URL DESNECESSARIAS
  // url.shift()
  // url.pop()
  url.shift()

  // console.log(url);
  return url
}
const download = async (link) => {
  try {
    images = []
    let dir = 'downloads/' + manga + '/' + capitulo
    if (!Fs.existsSync(dir)) {
      Fs.mkdirSync(dir);
    }
    console.log(dir);
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const local = "/home/vulcao/meta/Servidor/extratorManga/downloads/" + manga + '/' + capitulo
    console.log(local);
    let name
    // const link = await parse()
    for (i = 0; i < link.length; i++) {
      await sleep(2000)
      // console.log(link[i]);
      if (i < 10) {
        name = capitulo + manga + '0' + i + '.jpg'
      } else {
        name = capitulo + manga + i + '.jpg'
      }
      images.push("downloads/" + manga + '/' + capitulo + "/" + name)
      const url = link[i];
      const path = Path.resolve(__dirname, local, name);
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        // httpsAgent: proxy,
      });
      // await console.log(!!Fs.createWriteStream(path));
      // console.log(path);
      response.data.pipe(Fs.createWriteStream(path));
      new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve();
          console.log('Url foi baixada com sucesso.' + i);
          // logger.info('Url foi baixada com sucesso.');
        });
        response.data.on('error', (err) => {
          reject(err);
          console.log('Url falhou...');
          // logger.info('Url falhou...');
          const error = new Error('Não foi possivél baixar o documento');
          error.code = 'Extração falhou no download de documentos';
          throw error;
        });
      });

    }

  } catch (e) {
    console.log(e);
    console.log('erro no Download');
  }
  // pdfWriter.getImageDimensions(path)
  await sleep(25000)
}

const pdf = async () => {
  console.log(images);
  console.log("Gerando 1 pdf");
  // await new ImagesToPDF.ImagesToPDF().convertFolderToPDF('downloads/' + manga, manga + '001.pdf');
  await new ImagesToPDF.ImagesToPDF().convertFolderToPDF('downloads/' + manga + '/' + capitulo, 'pdf/cap-' + capitulo + manga + '.pdf');
  // await sleep(40000)
  // console.log("Gerando 2 pdf");


  // const arquivo = 'cap' + capitulo + manga + '.pdf'
  // await imagesToPdf(images, arquivo)


  // async function imagesToPdf(paths, resultPath) {
  //   if (!Array.isArray(paths) || paths.length === 0) {
  //     throw new Error("Must have at least one path in array")
  //   }
  //   const pdfWriter = hummus.createWriter(resultPath)
  //   console.log("-----------------------------");
  //   console.log(paths);
  //   console.log("-----------------------------");
  //   console.log(resultPath);
  //   console.log("-----------------------------");
  //   // paths.forEach(async path => {
  //   //   const { width, height } = pdfWriter.getImageDimensions(path)
  //   //   const page = pdfWriter.createPage(0, 0, width, height)
  //   //   pdfWriter.startPageContentContext(page).drawImage(0, 0, path)
  //   //   pdfWriter.writePage(page)
  //   // })
  //   for (i = 0; i < paths.length-2; i++) {
  //     try {
  //       let path = paths[i]
  //       console.log(path);
  //       console.log(i);

  //       const { width, height } = pdfWriter.getImageDimensions(path)

  //       console.log(pdfWriter.getImageDimensions(path));
  //       const page = pdfWriter.createPage(0, 0, width, height)
  //       console.log(page);
  //       pdfWriter.startPageContentContext(page).drawImage(0, 0, path)
  //       pdfWriter.writePage(page)
  //       await sleep(1000)
  //     } catch (e) { console.log(e); }
  //   }

  //   // await sleep(1000)
  //   pdfWriter.end()
  //   await streamToPromise(pdfWriter)
  //   return resultPath
  // }






}
// parsePages('https://mangayabu.top/ler/bug-player-capitulo-01-my158005/')

// parsePages('https://mangayabu.top/ler/a-returners-magic-should-be-special-capitulo-01-my175268/')
// https://mangayabu.top/ler/a-returners-magic-should-be-special-capitulo-01-my175268/
// parsePages('https://mangayabu.top/ler/i-am-the-sorcerer-king-capitulo-01-my122853/')
// https://mangayabu.top/ler/i-am-the-sorcerer-king-capitulo-01-my122853/
parsePages(urlManga)

// "https://mangayabu.top/ler/player-who-returned-10000-years-later-capitulo-01-my1054161/"