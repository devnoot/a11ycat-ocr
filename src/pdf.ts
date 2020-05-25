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

    page(pageNumber: number): Promise<PDFPageProxy> {
        return new Promise((resolve, reject) => {
            if (!this.isLoaded) {
                reject('PDF is not loaded yet!')
            }
            this.documentProxy.getPage(pageNumber)
                .then(page => resolve(page), error => reject(error))
        })
    }

    meta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.documentProxy.getMetadata().then(
                metadata => {
                    resolve(metadata)
                },
                error => {
                    reject(error)
                }
            )
        })
    }

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

    pages(): number|void {
        if (!this.isLoaded) {
            console.error('PDF is not loaded yet!')
        }
        return this.documentProxy.numPages
    }

    destroy(): void {
        this.documentProxy.destroy()
    }
}

export { PDF } 