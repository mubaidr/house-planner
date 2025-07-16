declare module 'pdfmake/build/pdfmake' {
  import { TDocumentDefinitions } from 'pdfmake/interfaces';

  interface PdfMake {
    createPdf(documentDefinitions: TDocumentDefinitions): any;
  }

  const pdfMake: PdfMake;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: any;
  export default pdfFonts;
}
