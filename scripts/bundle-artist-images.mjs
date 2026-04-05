const fs = require('fs');
const path = require('path');
const https = require('https');

const lineupPath = path.join(__dirname, '../android/app/src/main/assets/lineup.json');
const outputDir = path.join(__dirname, '../android/app/src/main/assets/artists/');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function bundle() {
    console.log('Reading lineup from:', lineupPath);
    const data = JSON.parse(fs.readFileSync(lineupPath, 'utf8'));
    console.log(`Found ${data.length} artists. Target directory: ${outputDir}`);
    
    let count = 0;
    for (let artist of data) {
        if (!artist.imageUrl || artist.imageUrl.startsWith('file:///')) {
            count++;
            continue;
        }

        const remoteUrl = artist.imageUrl;
        let ext = remoteUrl.split('.').pop().split('?')[0] || 'jpg';
        if (ext.length > 4) ext = 'jpg'; 
        const filename = `${artist.id}.${ext}`;
        const dest = path.join(outputDir, filename);

        // ALWAYS update the JSON to point to the local path
        artist.imageUrl = `file:///android_asset/artists/${filename}`;

        if (!fs.existsSync(dest)) {
            try {
                process.stdout.write(`Downloading ${artist.artist}... `);
                await download(remoteUrl, dest);
                console.log('DONE');
            } catch (err) {
                console.log('FAILED');
                console.error(`  [!] ${err.message}`);
                // Revert if failed (or keep as broken local path?)
                artist.imageUrl = remoteUrl; 
            }
        }
        count++;
    }
    
    console.log('Writing updated lineup.json...');
    fs.writeFileSync(lineupPath, JSON.stringify(data, null, 2));
    console.log(`Completed. JSON updated and images stored in assets/artists/`);
}

bundle().catch(err => {
    console.error('Bundle failed:', err);
    process.exit(1);
});
