// Bundles the prototype into one self-contained file: node tools/bundle.js
// Output: YourPal-Admin-Panel.html (open it directly in a browser, no server needed).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
let html = read('index.html');
const safe = js => js.replace(/<\/script/gi, '<\/script');
html = html
  .replace('<link rel="stylesheet" href="design-system.css">', () => '<style>\n' + read('design-system.css') + '\n</style>')
  .replace('<link rel="stylesheet" href="app.css">', () => '<style>\n' + read('app.css') + '\n</style>')
  .replace('<script src="icons.js"></script>', () => '<script>\n' + safe(read('icons.js')) + '\n</script>')
  .replace('<script src="app.js"></script>', () => '<script>\n' + safe(read('app.js')) + '\n</script>');
if (/href="(design-system|app)\.css"|src="(icons|app)\.js"/.test(html)) throw new Error('a file was not inlined');
fs.writeFileSync(path.join(root, 'YourPal-Admin-Panel.html'), html);
console.log('wrote YourPal-Admin-Panel.html', Math.round(html.length / 1024) + ' KB');
