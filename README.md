# a11ycat-ocr

**OCR PDF documents in Node.js 🐱**

## Dependencies
* [GraphicsMagick](http://www.graphicsmagick.org/) 

>IMPORTANT: `a11ycat-ocr` expects the graphicsmagick binary `gm` to exist in your `PATH`

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
import { OCR } from './dist/index'

const ocr = new OCR()

async function main() {
    try {

        // Set a destination directory for the pdf images
        const destinationDir = './'

        // Convert a pdf to a series of images
        const generatedImages = await ocr.convertPdfToImages('path/to/file.pdf', destinationDir) 
       
        // Run OCR on one of the generated images
        const { data } = await ocr.recognize(destinationDir + generatedImages[0])

        const foundText = data.text

        // Log out the OCR'd text.
        console.log(foundText)

        // The OCR'd text will also be saved next to the source image        

    } catch (error) {
        throw error
    }
}

```
