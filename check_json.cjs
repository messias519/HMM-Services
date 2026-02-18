
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Messias\\Desktop\\HMM\\Programação\\HMM-Services\\src\\data\\procedimentos.json';
try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    if (json.length > 0) {
        console.log('Keys in first item:', Object.keys(json[0]));
        console.log('Sample item:', json[0]);
    } else {
        console.log('JSON is empty array');
    }
} catch (e) {
    console.error('Error reading JSON:', e);
}
