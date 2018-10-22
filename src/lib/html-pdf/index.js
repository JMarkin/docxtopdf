/* eslint-disable  */

function CreateParagraph() {
    const p = { text: [] };
    return p;
}
function ParseContainer(cnt, e, p, styles) {
    const elements = [];
    const children = e.childNodes;
    console.log('1', children);
    if (children.length != 0) {
        for (var i = 0; i < children.length; i++) p = ParseElement(elements, children[i], p, styles);
    }
    if (elements.length != 0) {
        for (var i = 0; i < elements.length; i++) cnt.push(elements[i]);
    }
    return p;
}

function ComputeStyle(o, styles) {
    for (let i = 0; i < styles.length; i++) {
        const st = styles[i].trim().toLowerCase().split(':');
        if (st.length == 2) {
            switch (st[0]) {
                case 'font-size': {
                    o.fontSize = parseInt(st[1]);
                    break;
                }
                case 'text-align': {
                    switch (st[1]) {
                        case 'right': o.alignment = 'right'; break;
                        case 'center': o.alignment = 'center'; break;
                    }
                    break;
                }
                case 'font-weight': {
                    switch (st[1]) {
                        case 'bold': o.bold = true; break;
                    }
                    break;
                }
                case 'text-decoration': {
                    switch (st[1]) {
                        case 'underline': o.decoration = 'underline'; break;
                    }
                    break;
                }
                case 'font-style': {
                    switch (st[1]) {
                        case 'italic': o.italics = true; break;
                    }
                    break;
                }
            }
        }
    }
}


let ol = 0;
let isOl = false;
let li = 0;
let isLI = false;

/**
 * 
 * @param {Array} cnt 
 * @param {DomElement} e simple dom element
 * @param {Object} p paragraph by pdfmaker style
 * @param {Array} styles styles fro pdfmaker
 */
//TODO need complete list render
function ParseElement(cnt, e, p, styles) {
    if (!styles) styles = [];
    if (e.getAttribute) {
        const nodeStyle = e.getAttribute('style');
        if (nodeStyle) {
            const ns = nodeStyle.split(';');
            for (var k = 0; k < ns.length; k++) styles.push(ns[k]);
        }
    }

    switch (e.nodeName.toLowerCase()) {
        case '#text': {
            console.log(e);
            var t = { text: e.textContent.replace(/\n/g, '') };
            if (isOl) {
                t.text = `${ol}. ${t.text}`;
                isOl = false;
            }
            if (isLI) {
                p.text.push({ text: `${ol}.${li}. `, bold: true });
                isLI = false;
            }
            if (styles) ComputeStyle(t, styles);
            p.text.push(t);
            break;
        }
        case 'b': case 'strong': {
            // styles.push("font-weight:bold");
            ParseContainer(cnt, e, p, styles.concat(['font-weight:bold']));
            break;
        }
        case 'u': {
            // styles.push("text-decoration:underline");
            ParseContainer(cnt, e, p, styles.concat(['text-decoration:underline']));
            break;
        }
        case 'h3': {
            p = CreateParagraph();
            cnt.push(p);
            const style = ['font-size:15'];
            console.log(e.getAttribute('class'));
            if (e.getAttribute('class').indexOf('centered') >= 0) {
                style.push('text-align:center');
            }
            if (e.getAttribute('class').indexOf('par') >= 0) {
                p.text.push('\n');
            }
            if (e.getAttribute('class').indexOf('ol') >= 0) {
                ol += 1;
                isOl = true;
                li = 0;
                isLI = false;
            }
            ParseContainer(cnt, e, p, styles.concat(style));
            break;
        }
        case 'i': {
            // styles.push("font-style:italic");
            ParseContainer(cnt, e, p, styles.concat(['font-style:italic']));
            // styles.pop();
            break;
            // cnt.push({ text: e.innerText, bold: false });
        }
        case 'span': {
            ParseContainer(cnt, e, p, styles);
            break;
        }
        case 'br': {
            p = CreateParagraph();
            cnt.push(p);
            break;
        }
        case 'table':
            {
                var t = {
                    table: {
                        widths: [],
                        body: []
                    }
                };
                const border = e.getAttribute('border');
                let isBorder = false;
                if (border) if (parseInt(border) == 1) isBorder = true;
                if (!isBorder) t.layout = 'noBorders';
                ParseContainer(t.table.body, e, p, styles);

                const widths = e.getAttribute('widths');
                if (!widths) {
                    if (t.table.body.length != 0) {
                        if (t.table.body[0].length != 0) for (var k = 0; k < t.table.body[0].length; k++) t.table.widths.push('*');
                    }
                } else {
                    const w = widths.split(',');
                    for (var k = 0; k < w.length; k++) t.table.widths.push(w[k]);
                }
                cnt.push(t);
                break;
            }
        case 'tbody': {
            ParseContainer(cnt, e, p, styles);
            // p = CreateParagraph();
            break;
        }
        case 'tr': {
            const row = [];
            ParseContainer(row, e, p, styles);
            cnt.push(row);
            break;
        }
        case 'td': {
            p = CreateParagraph();
            var st = { stack: [] };
            st.stack.push(p);

            const rspan = e.getAttribute('rowspan');
            if (rspan) st.rowSpan = parseInt(rspan);
            const cspan = e.getAttribute('colspan');
            if (cspan) st.colSpan = parseInt(cspan);

            ParseContainer(st.stack, e, p, styles);
            cnt.push(st);
            break;
        }
        case 'div': case 'p': {
            p = CreateParagraph();
            var st = { stack: [] };
            st.stack.push(p);
            ComputeStyle(st, styles);
            if (e.getAttribute('class').indexOf('par') >= 0) {
                p.text.push('\n');
            }
            if (e.getAttribute('class').indexOf('li') >= 0) {
                li += 1;
                isLI = true;
            }
            ParseContainer(st.stack, e, p);

            cnt.push(st);
            break;
        }
        default: {
            console.log(`Parsing for node ${e.nodeName} not found`);
            break;
        }
    }
    return p;
}

/**
 * DFS for html
 * @param {Array} cnt 
 * @param {String} htmlText 
 */
export function ParseHtml(cnt, htmlText) {
    ol = 0;
    isOl = false;
    li = 0;
    isLI = false;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlText.replace(/\t/g, '').replace(/\n/g, '');
    const html = wrapper.childNodes;
    const p = CreateParagraph();
    for (let i = 0; i < html.length; i++) ParseElement(cnt, html[i], p, []);
}


function blobToFile(theBlob, fileName) {
    // A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}
