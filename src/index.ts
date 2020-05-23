import fs from 'fs'
import sharp from 'sharp'
import { PDFImage } from 'pdf-image'
import { createWorker } from 'tesseract.js'

interface PDFOptions {
    filePath: string
}

class PDF {

    filePath: string

    constructor({ filePath }: PDFOptions) {
        this.filePath = filePath
    }

    loadToBuffer(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const path = this.filePath
                const buffer = fs.readFileSync(path)
                resolve(buffer)
            } catch (error) {
                reject(error)
            }
        })
    }

}

class OCR {

    /**
     * @param imageBuffer The buffer to perform ocr iamge enhancements on
     * @returns A promise resulting in a buffer of the converted image
     */
    prepareImage(imageBuffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const buffer = sharp(imageBuffer).greyscale().toBuffer()
                resolve(buffer)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * @param pdfPath The path to the pdf you want to convert
     * @returns Returns a promise resolving in an array of strings. Each string represents
     * a generated image.
     */
    convertPdfToImages(pdfPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const pdfImage = new PDFImage(pdfPath, {
                convertOptions: {
                    '-density': '500',
                    '-resize': '30%',
                    '-blur': '1x2',
                    '-monochrome': ''
                }
            });
            pdfImage.convertFile()
                .then(resolve)
                .catch(reject);
        })
    }

    /**
     * @param imagePath The image path to perform OCR recognition on
     * @returns Returns a promise resolving in the OCR information
     */
    recognize(imagePath: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const worker = createWorker()
                await worker.load()
                await worker.loadLanguage('eng')
                await worker.initialize('eng')
                const res = await worker.recognize(imagePath)
                await worker.terminate();
                resolve(res)
            } catch (error) {
                reject(error)
            }
        })

    }

}

export { PDF, OCR }