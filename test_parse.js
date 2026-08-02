const fs = require('fs');
// Mocking the browser environment
const mdText = fs.readFileSync('topics/02-oops.md', 'utf8');
console.log("Characters in file:", mdText.length);
