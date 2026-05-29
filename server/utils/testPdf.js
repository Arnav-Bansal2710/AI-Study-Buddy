const extractTextFromPDF = require('./pdfParser');

// Put any PDF file path here to test
extractTextFromPDF('./uploads/pdf-test.pdf')
  .then(text => {
    console.log('Extracted text:');
    console.log(text.substring(0, 100)); // show first 500 chars
  })
  .catch(err => console.error(err));