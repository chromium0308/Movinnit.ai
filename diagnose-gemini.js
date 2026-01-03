const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (err) { }

if (!apiKey) {
    fs.writeFileSync('models_clean.txt', 'NO_KEY');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.models) {
                const models = response.models
                    .filter(m => m.name.includes('gemini'))
                    .map(m => m.name)
                    .join('\n');
                fs.writeFileSync('models_clean.txt', models);
            } else {
                fs.writeFileSync('models_clean.txt', 'NO_MODELS: ' + JSON.stringify(response));
            }
        } catch (e) {
            fs.writeFileSync('models_clean.txt', 'PARSE_ERROR');
        }
    });
}).on('error', (e) => {
    fs.writeFileSync('models_clean.txt', 'REQ_ERROR: ' + e.message);
});
