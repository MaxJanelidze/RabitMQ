const fs = require('fs');

let result = '';

const info = fs.readFileSync(__dirname + '../../../package.json');
result = info.toString();

module.exports = { result };
