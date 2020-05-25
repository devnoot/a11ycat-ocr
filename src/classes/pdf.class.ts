import { getDocument, PDFDocumentProxy, PDFPageProxy, PDFMetadata } from 'pdfjs-dist'

interface PDFOptions {}

interface PDFOptionsFilepath extends PDFOptions {
    filepath: string
    data: never
}

interface PDFOptionsBuffer extends PDFOptions {
    filepath: never
    data: Buffer
}

/**
 * The PDF class provides methods to interface with a PDF
 */
class PDF {

    source: string|Buffer
    isLoaded: boolean
    documentProxy: undefined|PDFDocumentProxy
    metaData: undefined|PDFMetadata

    constructor({ filepath, data }: PDFOptionsFilepath|PDFOptionsBuffer) {
        this.source = filepath||data
        this.documentProxy = undefined
        this.metaData = undefined
        this.isLoaded = false
    }

    /**
     * Loads the PDF
     */
    load(): Promise<PDFDocumentProxy> {
        return new Promise((resolve, reject) => {

            const docLoader = getDocument(this.source)

            docLoader.promise.then(

                async pdf => {
                    this.documentProxy = pdf
                    const metaData = await this.meta()
                    this.metaData = metaData
                    this.isLoaded = true
                    resolve(pdf)
                },

                error => {
                    reject(error)
                }

            )
        })
    }

    /**
     * Returns a page of the loaded PDF
     * 
     * @param pageNumber The page number in the loaded PDF
     */
    page(pageNumber: number): Promise<PDFPageProxy> {
        return new Promise((resolve, reject) => {
            if (!this.isLoaded) {
                reject('PDF is not loaded yet!')
            }

            if (this.documentProxy) {
                this.documentProxy.getPage(pageNumber)
                    .then(page => resolve(page), error => reject(error))
            } else {
                throw new Error('documentProxy is undefined')
            }

        })
    }

    /**
     * Returns the metadata of the loaded PDF
     */
    meta(): Promise<any> {
        return new Promise((resolve, reject) => {

            if (this.documentProxy) {
                this.documentProxy.getMetadata().then(
                    metadata => {
                        resolve(metadata)
                    },
                    error => {
                        reject(error)
                    }
                )
            }

        })
    }

    /**
     * Returns page text from a page of the loaded PDF
     * 
     * @param pageNumber The page number in the loaded PDF
     */
    async getPageText(pageNumber: number): Promise<string> {
        return new Promise((resolve, reject) => {
            (async () => {
                const page = await this.page(pageNumber)
                page.getTextContent()
                    .then(content => {
                        const strings = content.items.map(item => item.str)
                        resolve(strings.join(' '))
                    })
            })()
        })
    }

    /**
     * Returns the number of pages of the loaded PDF
     */
    pages(): number|void {
        if (!this.isLoaded) {
            console.error('PDF is not loaded yet!')
        }
        if (this.documentProxy) {
            return this.documentProxy.numPages
        } else {
            throw new Error('documentProxy is undefined')
        }
        
    }

    /**
     * Destroys the document proxy
     */
    destroy(): void {
        if (this.documentProxy) {
            this.documentProxy.destroy()
        }
    }
}

export { PDF } 