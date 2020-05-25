import { createWorker } from 'tesseract.js'
import { spawn } from 'child_process'
import { basename, join } from 'path'
import { readdirSync, writeFileSync } from 'fs-extra'
import { bold, green, yellow, redBright } from 'chalk'

/**
 * The OCR class provides methods to convert and OCR a PDF
 */

class OCR {

    /**
     * Converts a PDF to a series of images
     * 
     * @param pdfPath The path to the pdf you want to convert
     * @param destinationDir The path to save the images. Defaults to ./
     * @returns Returns a promise resolving in an array of filepaths. 
     */
    public convertPdfToImages(pdfPath: string, destinationDir?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {

            async function convert() {
                try {
                    const src = pdfPath
                    const dest = destinationDir || './'
                    const outFile = basename(pdfPath) + '-%02d' + '.tiff'

                    const gmArgs = [
                        'convert',
                        '-density', '100',
                        src,
                        '+adjoin',
                        join(dest, outFile)
                    ]

                    const proc = spawn('gm', gmArgs)
    
                    proc.stdout.on('data', data => {
                        console.log(data.toString())
                    })

                    proc.stderr.on('data', data => {
                        console.error(data.toString())
                    })

                    proc.on('exit', (code) => {
                        if (code && code > 0) {

                            if (process.env.NODE_ENV !== 'test') {
                                console.log(redBright({ proc: JSON.stringify(proc), code }))
                            }

                            throw new Error(`Could not process file \n${pdfPath}\nReceived exit code ${code}`)
                        }
                        const createdFiles = readdirSync(dest).map(f => join(dest, f))
                        resolve(createdFiles)
                    })

                    proc.on('error', error => {

                        if (process.env.NODE_ENV !== 'test') {
                            console.error(redBright({ proc }))
                        }

                        throw error
                    })

                } catch (error) {
                    reject(error)
                }
            }
            convert()
            
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

                interface Task {
                    name: string
                    worker: string
                }

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
                            console.info(`${bold(msg.workerId || '**')} | ${msg.status} | ${msg.progress === 1 ? green(formattedMsg) : yellow(formattedMsg)}%`)
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
