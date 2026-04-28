declare module "pdfmake/build/pdfmake" {
  type PdfDocument = {
    download: (defaultFileName?: string) => void;
  };

  type TDocumentDefinitions = {
    pageSize?: string;
    pageMargins?: number[];
    content: unknown[];
    defaultStyle?: {
      font?: string;
      fontSize?: number;
    };
  };

  const pdfMake: {
    vfs?: Record<string, string>;
    createPdf: (documentDefinitions: TDocumentDefinitions) => PdfDocument;
  };

  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: {
    pdfMake?: {
      vfs?: Record<string, string>;
    };
    vfs?: Record<string, string>;
  };

  export default pdfFonts;
}
