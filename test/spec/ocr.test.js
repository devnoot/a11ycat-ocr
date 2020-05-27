const { mkdirpSync, readdirSync, rmdirSync } = require('fs-extra')
const { join } = require('path')
const chai = require('chai')
const expect = chai.expect

const { OCR } = require('../../dist/classes/ocr.class')

describe('OCR Class', () => {

    const ocr = new OCR()

    let pdfPath = ''

    const tmpDirBase = join(process.cwd(), 'test', 'tmp')
    const pdfDataDir = join(process.cwd(), 'test', 'data', 'pdfs')

    beforeEach(() => {
        // Get a random pdf set from a directory
        const pdfSets = readdirSync(pdfDataDir)
        const randomSet = pdfSets[Math.floor(Math.random() * pdfSets.length)]

        // Get a random pdf
        const setBase = join(pdfDataDir, randomSet)
        const files = readdirSync(setBase)
        const fileIndex = Math.floor(Math.random() * files.length)
        pdfPath = join(setBase, files[fileIndex])
    })

    it('Should convert a pdf from disk to a series of images', async () => {
        const tmpDir = join(tmpDirBase, new Date().getTime().toString())
        mkdirpSync(tmpDir)
        const imagePaths = await ocr.convertPdfToImages(pdfPath, tmpDir)
        rmdirSync(tmpDir, { recursive: true })
        expect(imagePaths).to.be.an('array')
    })

    it('Should ocr an image', async () => {
        const tmpDir = join(tmpDirBase, new Date().getTime().toString())
        mkdirpSync(tmpDir)
        const imagePaths = await ocr.convertPdfToImages(pdfPath, tmpDir)
        const { data } = await ocr.recognize(imagePaths[Math.floor(Math.random() * imagePaths.length)])
        rmdirSync(tmpDir, { recursive: true })
        expect(data.text).to.be.a('string')
    })

})