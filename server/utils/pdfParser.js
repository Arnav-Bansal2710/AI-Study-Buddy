const pdfParse = require('pdf-parse');
const fs = require('fs');

const extractTextFromPdf = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const data = await pdfParse(fileBuffer);

    return data.text;
  } catch (err) {
    console.error("PDF parsing error", err);
    throw new Error('Failed to extract text from pdf');
  }
};

module.exports = extractTextFromPdf;
