const { mkdirpSync, readdirSync, rmdirSync } = require('fs-extra')
const { join } = require('path')
const chai = require('chai')

const { A11yCat } = require('../../dist/index')

const OCR = A11yCat.OCR

describe('OCR Class', () => {

    const ocr = new OCR()

    let pdfPath = ''

    const tmpDirBase = join(process.cwd(), 'test', 'tmp')
    const pdfDataDir = join(process.cwd(), 'test', 'data', 'pdfs')

    beforeEach(() => {
        // Get a random pdf set from a directory
        const pdfSets = readdirSync(pdfDataDir).filter(name => name !== ".DS_Store")
        const randomSet = pdfSets[Math.floor(Math.random() * pdfSets.length)]

        // Get a random pdf
        const setBase = join(pdfDataDir, randomSet)
        const files = readdirSync(setBase)
        const fileIndex = Math.floor(Math.random() * files.length)
        pdfPath = join(setBase, files[fileIndex])
    })

    it('Should write an image for each page in a PDF to disk', async () => {
        const tmpDir = join(tmpDirBase, new Date().getTime().toString())
        mkdirpSync(tmpDir)
        const imagePaths = await ocr.convertPdfToImages(pdfPath, tmpDir)

        rmdirSync(tmpDir, { recursive: true })
        chai.expect(imagePaths).to.be.an('array')
    })

    it('Should ocr an image using tesseract.js', async () => {
        const tmpDir = join(tmpDirBase, new Date().getTime().toString())
        mkdirpSync(tmpDir)
        const imagePaths = await ocr.convertPdfToImages(pdfPath, tmpDir)

        const { data } = await ocr.recognize(imagePaths[Math.floor(Math.random() * imagePaths.length)])
        
        rmdirSync(tmpDir, { recursive: true })

        chai.expect(data).to.have.keys([
            'text',
            'hocr',
            'tsv',
            'box',
            'unlv',
            'osd',
            'confidence',
            'blocks',
            'psm',
            'oem',
            'version',
            'paragraphs',
            'lines',
            'words',
            'symbols'
        ])

    })

    it('Should ocr an image using system tesseract', async () => {
        const tmpDir = join(tmpDirBase, new Date().getTime().toString())
        mkdirpSync(tmpDir)
        const imagePaths = await ocr.convertPdfToImages(pdfPath, tmpDir)
        const textFile = await ocr.tess(imagePaths[Math.floor(Math.random() * imagePaths.length)])
        rmdirSync(tmpDir, { recursive: true })

        chai.expect(textFile).to.be.a('string')
    })

})
