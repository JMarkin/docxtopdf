if (PRODUCTION) {
  require('offline-plugin/runtime').install();
}

window.DocxPdf = require('./components/app').default;
