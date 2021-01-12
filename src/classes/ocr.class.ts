import { createWorker } from 'tesseract.js'
import { spawn } from 'child_process'
import { basename, join } from 'path'
import { readdirSync, writeFileSync } from 'fs-extra'
import { bold, green, yellow, dim } from 'chalk'

/**
 * The OCR class provides methods to convert and OCR a PDF
 */

class OCR {

    /**
     * Converts a PDF to a series of images
     * 
     * @param pdfPath The path to the pdf you want to convert
     * @param destinationDir The path to save the images
     * 
     * @returns Returns a promise resolving in an array of filepaths. 
     */
    public convertPdfToImages(pdfPath: string, destinationDir: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            try {
                const src = pdfPath
                const dest = destinationDir
                const outFile = basename(pdfPath) + '-%02d' + '.png'

                const defaultImageMagickArgs = [
                    '-density', '150',
                    src,
                    '+adjoin',
                    join(dest, outFile)
                ]

                const proc = spawn('convert', defaultImageMagickArgs)

                proc.stdout.on('data', data => {
                    if (process.env.NODE_ENV !== 'test') {
                        console.log(dim(data.toString()))
                    }
                })

                proc.on('exit', (code) => {
                    if (code && code > 0) {
                        reject(`\nCould not process file \n${pdfPath}\nReceived exit code ${code}`)
                    }
                    const createdFiles = readdirSync(dest).map(f => join(dest, f))
                    resolve(createdFiles)
                })

                proc.on('error', error => {
                    throw error
                })

            } catch (error) {
                reject(error)
            }
            
        })
    }

    /**
     * Performs OCR on an image by calling Tesseract from the host system
     *
     * IMPORTANT: This function assumes that tesseract is installed and available in $PATH
     * This function is also NOT COMPLETE
     *
     * @param imagePath The image path to perform OCR recognition on
     */

    public tess(imagePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {

                const tesseractOpts = [
                    imagePath,
                    basename(imagePath),
                    '-l', 'eng'
                ]

                const proc = spawn('tesseract', tesseractOpts)

                proc.stdout.on('data', data => {
                    if (process.env.NODE_ENV !== 'test') {
                        console.log(dim(data.toString()))
                    }
                })

                proc.on('exit', (code) => {
                    if (code && code > 0) {
                        reject(`Receieved error code ${code}`)
                    }
                    resolve(`Exited with code ${code}`)
                })

                proc.on('error', error => {
                    throw error
                })
    
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Performs OCR on an image
     * 
     * @param imagePath The image path to perform OCR recognition on
     * @returns Returns a promise resolving in the OCR information
     */
    public recognize(imagePath: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {

                interface TesseractMsg {
                    workerId: string
                    status: string
                    progress: number
                }

                const worker = createWorker({
                    // Handle all of the logging
                    logger: (msg: TesseractMsg) => {
                        if (process.env.NODE_ENV !== 'test') {
                            const formattedMsg = Math.round(msg.progress * 100)
                            console.info(dim(`${bold(msg.workerId || '**')} | ${msg.status} | ${msg.progress === 1 ? green(formattedMsg) : yellow(formattedMsg)}%`))
                        }
                    }
                })

                await worker.load()
                await worker.loadLanguage('eng')
                await worker.initialize('eng')
                const res = await worker.recognize(imagePath)

                const text = res.data.text

                if (process.env.NODE_ENV !== 'test') {
                    writeFileSync(imagePath + '.txt', text)
                }

                await worker.terminate()

                resolve(res)
            } catch (error) {
                reject(error)
            }
        })

    }

}

export { OCR }
