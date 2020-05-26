let fs = require('fs');
let data = fs.readFileSync('./distpicker.json');
fs.writeFileSync('./dist.js','export default ' + data);

