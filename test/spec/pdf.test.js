const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')
const chai = require('chai')
const expect = chai.expect
const { PDF } = require('../../dist/classes/pdf.class')

describe('PDF', () => {

    let pdfPath = ''
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

    it('should load a pdf by data buffer, then load the metadata, then load page text', async () => {
        const pdfBuffer = readFileSync(pdfPath)
        const pdf = new PDF({ data: pdfBuffer })
        const pdfData = await pdf.load()
        const metaData = await pdf.meta()
        const pageText = await pdf.getPageText(1)
        expect(pageText).to.be.a('string')
    })

})