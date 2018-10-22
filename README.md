# Generate pdf from docx by template in BROWSER !!!!

Example use yarn httpserver

## Usage
```javascript
  const docx = new DocxPdf({
    first_name: 'John',
    last_name: 'Doe',
    phone: '0652455478',
    description: 'New Website'
  });
  const doc = document.getElementById('app');
  docx.fromURL("https://docxtemplater.com/tag-example.docx", (promise) => {
    promise.then((data) => {
      data.getDataUrl((dataURL) => {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', dataURL);
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('style', 'position: absolute; top:0; height: 100%; left:0; border: none;');
        doc.appendChild(iframe);
      });
    });
  });
```
##TODO
- update ol/ul
- add subheader

## Available tasks

```sh

# Runs development server (Webpack dev server)
$ yarn dev

# Build command
$ yarn build

# Lint with ESLint
$ yarn lint

# Run Flow
$ yarn flow

# Run unit tests (ava + instanbul)
$ yarn test

# Runs http-server on port 8082
$ yarn httpserver

```