import { PDFExtract } from "pdf.js-extract";

export const extractPdfText = async (buffer) => {
  const options = { disableWorker: true };
  const pdfExtract = new PDFExtract();
  const chunks = [];
  const maxChunkSize = 2000;

  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, options, (err, data) => {
      if (err) {
        console.error(err, "Error PDF Extractor");
        return reject(err);
      }

      const pages = data.pages;
      pages.forEach((page) => {
        let ch = "";
        page.content.forEach((chunk) => {
          console.log("\n=>", chunk.str);
          if ((ch + chunk.str).length > maxChunkSize) {
            chunks.push(ch);
            ch = chunk.str;
          } else {
            ch += chunk.str;
          }
        });

        // Push the last chunk if there's remaining content
        if (ch.length > 0) {
          chunks.push(ch);
        }
      });

      resolve(chunks);
    });
  });
};