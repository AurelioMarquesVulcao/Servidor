# Images to PDF

Convert images in folder to one PDF file.

# Install

```shell
npm i images-pdf
```

or install to global

```shel
npm i g images-pdf
```

# Usage

## CLI

```
Usage: images-pdf [options]

Options:
  -V, --version        output the version number
  -f, --folder <path>  the folder that contains the images.
  -o, --output <path>  the PDF file to generate.
  -h, --help           output usage information
```

ex: `images-pdf -f ./image/folder -o ./output/file.pdf`

## RequireJS

```javascript
const ImagesToPDF = require('images-pdf');
new ImagesToPDF.ImagesToPDF().convertFolderToPDF('image/folder', 'output/file.pdf');
```

## TypeScript

There are inbuilt type definition file. So you don't have to install any other package.

```typescript
import { ImagesToPDF } from 'images-pdf';
new ImagesToPDF().convertFolderToPDF('image/folder', 'output/file.pdf');
```