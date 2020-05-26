# a11ycat-ocr

**OCR PDF documents in Node.js 🐱**



## Dependencies
* [ImageMagick 7](https://imagemagick.org/) 

>IMPORTANT: `a11ycat-ocr` expects the ImageMagick tools to be available in your `PATH`



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
const { AllycatOCR } = require('./dist/index')
const { resolve } = require('path')

const ocr = new AllycatOCR.OCR()

async function main() {

    try {

        // Set the path to the pdf you want to OCR
        const pdfPath = resolve(process.cwd() + '/test/data/pdfs/set1/Modeling High-Frequency Limit Order Book Dynamics with Support Vector Machines.pdf')

        // Set a destination directory for the pdf images
        const destinationDir = resolve(process.cwd() + '/tmp')

        console.log('Generating images from PDF')
        // Convert a pdf to a series of images
        const generatedImages = await ocr.convertPdfToImages(pdfPath, destinationDir) 
       
        console.log('Doing OCR on first page')
        // Run OCR on one of the generated images
        const { data } = await ocr.recognize(generatedImages[0])

        const foundText = data.text

        // Log out the OCR'd text.
        console.log(foundText)

        // The OCR'd text will also be saved next to the source image

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
