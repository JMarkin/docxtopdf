import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import JSZipUtils from 'jszip-utils';
import mammoth from 'mammoth';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ParseHtml } from '../../lib/html-pdf';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class DocxPdf {
  /**
   *
   * @param {Object} templateData
   */
  constructor(templateData) {
    this.templateData = templateData;
  }

  /**
   * @param {String} value htmlString for parse
   * @returns pdfmake class
   * @example
   * html2Pdf("<p>Hello World<p>").getDataUrl((dataURL) => {
   *      const iframe = document.createElement('iframe');
   *      iframe.setAttribute('src', dataURL);
   *      iframe.setAttribute('width', '100%');
   *      iframe.setAttribute('style', 'position: absolute; top:0; height: 100%; left:0; border: none;');
   *      doc.appendChild(iframe);
   * });
   */
  html2Pdf(value) {
    const content = [];
    ParseHtml(content, value);
    console.log(content);
    const docDefinition = {
      pageSize    : 'A4',
      content,
      pageMargins : [20, 40, 20, 60]
    };
    const pdf = pdfMake.createPdf(docDefinition);
    return pdf;
  }

  /**
   *
   * @param {ArrayBuffer} contents content of docx document
   * @returns pdfmake class
   */
  docx2HTML(contents) {
    function transformParagraph(element) {
      if (element.alignment === 'center' && !element.styleId) {
        return { ...element, styleName: 'Title' };
      } if (element.numbering && element.numbering.isOrdered) {
        if (element.numbering.level === '0') { return { ...element, styleName: 'ol' }; }
        return { ...element, styleName: 'li' };
      }
      return { ...element, styleName: 'par' };
    }
    function transformElement(element) {
      if (element.children) {
        const children = element.children.map(v => transformElement(v));
        element = { ...element, children };
      }

      if (element.type === 'paragraph') {
        element = transformParagraph(element);
      }
      return element;
    }
    const options = {
      transformDocument : transformElement,
      styleMap          : [
        "p[style-name='Title'] => h3.centered:fresh",
        "p[style-name='par'] => p.par:fresh",
        "p[style-name='ol'] => h3.ol.par.centered:fresh",
        "p[style-name='li'] => p.li.par:fresh",
        'i => i'
      ]
    };
    return mammoth.convertToHtml({
      arrayBuffer: contents
    }, options).then((result) => {
      const { messages, value } = result;
      console.log(messages);
      return this.html2Pdf(value);
    });
  }

  /**
   *
   * @param {String} url URl allowed by GET
   */
  fromURL(url, callback) {
    JSZipUtils.getBinaryContent(url, (error, content) => {
      if (error) { throw error; }
      const pdf = this.fromArrayBuffer(content);
      callback(pdf);
    });
  }

  /**
   *
   * @param {ArrayBuffer/String} content  content of docx file
   */
  fromArrayBuffer(content) {
    console.log(content);
    const zip = new JSZip(content);
    const doc = new Docxtemplater().loadZip(zip);
    doc.setData(this.templateData);
    try {
      doc.render();
    } catch (error2) {
      const e = {
        message    : error2.message,
        name       : error2.name,
        stack      : error2.stack,
        properties : error2.properties
      };
      console.log(JSON.stringify({ error: e }));
      throw error2;
    }
    const out = doc.getZip().generate({
      type     : 'arraybuffer',
      mimeType : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    return this.docx2HTML(out);
  }
}


export default DocxPdf;
