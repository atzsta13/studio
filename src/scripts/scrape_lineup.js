
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const LINEUP_FILE = path.join(__dirname, '../data/lineup.json');

async function scrapeLineup() {
    console.log('Reading lineup.json...');
    const data = fs.readFileSync(LINEUP_FILE, 'utf8');
    const artists = JSON.parse(data);

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new", // Use new headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Good for running in containers/server envs
    });
    const page = await browser.newPage();

    // Set a normal user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        // Process artists 11-20 as requested, or remove slice to do all
        // For now, let's iterate through all but skip ones that already have descriptions/socials if we want to be safe, 
        // OR just update everyone to be sure. 
        // Let's filter for just 11-20 loops first to be fast as requested, or loop all.
        // The user said "continue with 11-20", so let's target them specifically or check for missing data.

        for (let i = 0; i < artists.length; i++) {
            const artist = artists[i];

            // Process all artists for image extraction
            // if (parseInt(artist.id) < 1 || parseInt(artist.id) > 10) { continue; }

            console.log(`\n[${artist.id}] Processing ${artist.artist}...`);

            if (!artist.szigetUrl) {
                console.log('  No Sziget URL found, skipping.');
                continue;
            }

            try {
                await page.goto(artist.szigetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                // Wait for the main content to load
                try {
                    await page.waitForSelector('.ArtistSingleBody__content', { timeout: 10000 });
                } catch (e) {
                    console.log('  Timeout waiting for content selector, page might not exist or loaded differently.');
                    continue;
                }

                // --- Genres ---
                const genres = await page.evaluate(() => {
                    const tags = Array.from(document.querySelectorAll('.ArtistSingleBody__content__tags__tag'));
                    return tags.map(t => t.innerText.trim().toUpperCase()).filter(t => t.length > 0);
                });

                if (genres.length > 0) {
                    artist.genres = genres;
                    console.log(`  Genres: ${genres.join(', ')}`);
                }

                // --- Description ---
                try {
                    const moreBtn = await page.$('.ArtistSingleBody__content__description__more');
                    if (moreBtn) {
                        const hasMore = await page.evaluate(() => {
                            const btn = document.querySelector('.ArtistSingleBody__content__description__more');
                            return btn && btn.innerText.includes('More');
                        });

                        if (hasMore) {
                            await moreBtn.click();
                            // Wait for the text to actually change (no more "...") 
                            // or for the button to change to "Less"
                            try {
                                await page.waitForFunction(() => {
                                    const btn = document.querySelector('.ArtistSingleBody__content__description__more');
                                    const desc = document.querySelector('.ArtistSingleBody__content__description');
                                    return (btn && btn.innerText.includes('Less')) || (desc && !desc.innerText.endsWith('...'));
                                }, { timeout: 3000 });
                            } catch (e) {
                                // Fallback to a fixed wait if condition fails
                                await new Promise(r => setTimeout(r, 1000));
                            }
                        }
                    }
                } catch (e) {
                    console.log(`  Warning: Could not expand description for ${artist.artist}`);
                }

                const description = await page.evaluate(() => {
                    const el = document.querySelector('.ArtistSingleBody__content__description');
                    return el ? el.innerText.trim() : null;
                });

                if (description) {
                    artist.description = description;
                    console.log(`  Description found (${description.length} chars)`);
                }

                // --- Image Extraction ---
                const imageUrl = await page.evaluate(() => {
                    // Strategy 1: Specific selector provided by user
                    const fullImg = document.querySelector('.ArtistSingleHeader__fullimg');
                    if (fullImg && fullImg.src) return fullImg.src;

                    // Strategy 2: Fallback to any Appmiral hosted image if selector doesn't match
                    const allImgs = Array.from(document.querySelectorAll('img'));
                    for (const img of allImgs) {
                        const src = img.src;
                        if (src.includes('media.appmiral.com')) return src;
                        if (src.includes('performance_') || src.includes('thumb_')) return src;
                    }
                    return null;
                });

                if (imageUrl) {
                    artist.imageUrl = imageUrl;
                    console.log(`  Image found: ${imageUrl}`);
                }

                // --- Socials ---
                const socialsMap = await page.evaluate(() => {
                    const links = {};
                    const anchors = Array.from(document.querySelectorAll('.ArtistSingleBody__content__socials a'));

                    anchors.forEach(a => {
                        const href = a.href;
                        if (href.includes('facebook.com')) links.facebook = href;
                        else if (href.includes('instagram.com')) links.instagram = href;
                        else if (href.includes('twitter.com') || href.includes('x.com')) links.x = href;
                        else if (href.includes('tiktok.com')) links.tiktok = href;
                        else if (href.includes('youtube.com')) links.youtube = href;
                        else if (href.includes('spotify.com')) links.spotify = href;
                        else if (href.includes('music.apple.com')) links.appleMusic = href;
                        else if (href.includes('soundcloud.com')) links.soundcloud = href;
                        else links.website = href;
                    });
                    return links;
                });

                // Initialize socials if missing
                if (!artist.socials) {
                    artist.socials = {
                        website: null, facebook: null, instagram: null,
                        x: null, tiktok: null, youtube: null,
                        spotify: null, appleMusic: null
                    };
                }

                // Merge found socials
                let socialCount = 0;
                for (const [key, value] of Object.entries(socialsMap)) {
                    if (value) {
                        artist.socials[key] = value;
                        socialCount++;
                    }
                }
                console.log(`  Found ${socialCount} social links`);

            } catch (err) {
                console.error(`  Error scraping ${artist.artist}: ${err.message}`);
            }

            // Polite pause
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (error) {
        console.error('Fatal script error:', error);
    } finally {
        await browser.close();
    }

    console.log('\nSaving updated lineup.json...');
    fs.writeFileSync(LINEUP_FILE, JSON.stringify(artists, null, 2), 'utf8');
    console.log('Done!');
}

scrapeLineup();
