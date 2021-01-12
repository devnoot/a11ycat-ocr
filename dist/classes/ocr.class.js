"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCR = void 0;
const tesseract_js_1 = require("tesseract.js");
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const chalk_1 = require("chalk");
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
    convertPdfToImages(pdfPath, destinationDir) {
        return new Promise((resolve, reject) => {
            try {
                const src = pdfPath;
                const dest = destinationDir;
                const outFile = path_1.basename(pdfPath) + '-%02d' + '.png';
                const defaultImageMagickArgs = [
                    '-density', '150',
                    src,
                    '+adjoin',
                    path_1.join(dest, outFile)
                ];
                const proc = child_process_1.spawn('convert', defaultImageMagickArgs);
                proc.stdout.on('data', data => {
                    if (process.env.NODE_ENV !== 'test') {
                        console.log(chalk_1.dim(data.toString()));
                    }
                });
                proc.on('exit', (code) => {
                    if (code && code > 0) {
                        reject(`\nCould not process file \n${pdfPath}\nReceived exit code ${code}`);
                    }
                    const createdFiles = fs_extra_1.readdirSync(dest).map(f => path_1.join(dest, f));
                    resolve(createdFiles);
                });
                proc.on('error', error => {
                    throw error;
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Performs OCR on an image by calling Tesseract from the host system
     *
     * IMPORTANT: This function assumes that tesseract is installed and available in $PATH
     * This function is also NOT COMPLETE
     *
     * @param imagePath The image path to perform OCR recognition on
     */
    tess(imagePath) {
        return new Promise((resolve, reject) => {
            try {
                const tesseractOpts = [
                    imagePath,
                    path_1.basename(imagePath),
                    '-l', 'eng'
                ];
                const proc = child_process_1.spawn('tesseract', tesseractOpts);
                proc.stdout.on('data', data => {
                    if (process.env.NODE_ENV !== 'test') {
                        console.log(chalk_1.dim(data.toString()));
                    }
                });
                proc.on('exit', (code) => {
                    if (code && code > 0) {
                        reject(`Receieved error code ${code}`);
                    }
                    resolve(`Exited with code ${code}`);
                });
                proc.on('error', error => {
                    throw error;
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Performs OCR on an image
     *
     * @param imagePath The image path to perform OCR recognition on
     * @returns Returns a promise resolving in the OCR information
     */
    recognize(imagePath) {
        return new Promise(async (resolve, reject) => {
            try {
                const worker = tesseract_js_1.createWorker({
                    // Handle all of the logging
                    logger: (msg) => {
                        if (process.env.NODE_ENV !== 'test') {
                            const formattedMsg = Math.round(msg.progress * 100);
                            console.info(chalk_1.dim(`${chalk_1.bold(msg.workerId || '**')} | ${msg.status} | ${msg.progress === 1 ? chalk_1.green(formattedMsg) : chalk_1.yellow(formattedMsg)}%`));
                        }
                    }
                });
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const res = await worker.recognize(imagePath);
                const text = res.data.text;
                if (process.env.NODE_ENV !== 'test') {
                    fs_extra_1.writeFileSync(imagePath + '.txt', text);
                }
                await worker.terminate();
                resolve(res);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.OCR = OCR;
