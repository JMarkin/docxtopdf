import '../styles/index.scss';
import DocxPdf from '../../../src';

console.log(DocxPdf);
const test = () => {
  try {
    const docx = new DocxPdf({
      first_name  : 'John',
      last_name   : 'Doe',
      phone       : '0652455478',
      description : 'New Website'
    });
    docx.fromURL('https://docxtemplater.com/tag-example.docx', (promise) => {
      promise.then((pdf) => {
        pdf.download();
      });
    });
  } catch (e) {
    console.log(e);
  }
};
test();
