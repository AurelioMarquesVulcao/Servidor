import * as fs from 'fs';
import sizeOf from 'image-size';
import PDFKit from 'pdfkit';

export class ImagesToPDF {
  convertFolderToPDF(folder: string, outputPath: string): void {
    let doc = new PDFKit();
    fs.readdir(folder, (_, files) => {
      console.log("********************************");
      console.log(files);
      console.log("********************************");
      files.forEach((file, index) => {
        const filePath = `${folder}/${file}`;
        try {
          const size = sizeOf(filePath);
          if (index === 0) {
            doc = new PDFKit({
              size: [size.width, size.height]
            });
          } else {
            doc.addPage({ size: [size.width, size.height] });
          }

          doc.image(filePath, 0, 0, { width: size.width, height: size.height });
        } catch {
          return;
        }
      });
      doc.pipe(fs.createWriteStream(outputPath));
      doc.end();
    });
  }
}
