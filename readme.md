# a11ycat-ocr

**OCR PDF documents in Node.js 🐱**

## Dependencies
* [ImageMagick 7](https://imagemagick.org/) 

Optional:

This is only needed if you are testing out the `tess` method on the `OCR` class.  This is much faster than the `recognize` method on the `OCR` class since it uses tesseract.js, but yeilds less information.

* [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)

>IMPORTANT: `a11ycat-ocr` expects the ImageMagick tools to be availabe in `$PATH`. If you are testing the `tess` method on the `OCR` class, then `tesseract` must also be in `$PATH`

## Quick Start 

1. Build the project from the repository

```bash
git clone https://github.com/devnoot/a11ycat-ocr.git a11ycat-ocr
cd a11ycat-ocr
npm install
npm build
```

2. Include the OCR class in your project

```javascript
const { A11yCat } = require('../../dist/index')
const { resolve } = require('path')

const ocr = new A11yCat.OCR()

async function main() {

    try {

        // Set the path to the pdf you want to OCR
        const pdfPath = '/path/to/my.pdf'

        // Set a destination directory for the pdf images
        const destinationDir = resolve(process.cwd() + '/tmp')

        // Convert a pdf to a series of images
        const generatedImages = await ocr.convertPdfToImages(pdfPath, destinationDir) 

        // Run OCR on one of the generated images
        const textFile = await ocr.tess(generatedImages[0])

    } catch (error) {
        throw error
    }

}

main()

```



## Tests

Tests are located in `test/spec`. Tests should use data from `test/data/images` and `test/data/pdfs`

Because there are some large PDFs in the test dataset, this can take a very long time depending on the host computer.

```
npm test
```
