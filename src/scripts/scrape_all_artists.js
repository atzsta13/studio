const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const LINEUP_FILE = path.join(__dirname, '../data/lineup.json');
const LINEUP_URL = 'https://szigetfestival.com/en/programs-lineup-2026#/';

// Helper to convert URL slug to proper artist name
function slugToName(slug) {
    // Remove leading numbers and dash (e.g., "2069922-bring-me-the-horizon" -> "bring me the horizon")
    const cleanSlug = slug.replace(/^\d+-/, '');
    // Replace dashes with spaces and title case
    return cleanSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\+/g, '+ ') // Handle "Florence + The Machine" style
        .replace(/\s+/g, ' ')
        .trim();
}

async function scrapeAllArtists() {
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let existingArtists = [];

    try {
        console.log('📄 Navigating to lineup page...');
        await page.goto(LINEUP_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for artist links to appear
        await page.waitForSelector('a[href*="#/artist/"]', { timeout: 15000 });

        // Scroll slowly to load ALL artists (handles lazy loading)
        console.log('📜 Scrolling to load all artists...');
        const allArtistUrls = new Set();

        for (let i = 0; i < 30; i++) { // Max 30 scroll iterations
            // Collect current artist URLs
            const urls = await page.evaluate(() => {
                const links = document.querySelectorAll('a[href*="#/artist/"]');
                return Array.from(links).map(a => a.href);
            });

            urls.forEach(url => allArtistUrls.add(url));

            // Scroll down
            await page.evaluate(() => window.scrollBy(0, 800));
            await new Promise(r => setTimeout(r, 800));

            // Check if we've reached the bottom
            const atBottom = await page.evaluate(() =>
                (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100
            );

            if (atBottom && i > 5) {
                // Do a few more scrolls to be sure
                await new Promise(r => setTimeout(r, 1000));
                const finalUrls = await page.evaluate(() => {
                    const links = document.querySelectorAll('a[href*="#/artist/"]');
                    return Array.from(links).map(a => a.href);
                });
                finalUrls.forEach(url => allArtistUrls.add(url));
                break;
            }
        }

        console.log(`✅ Found ${allArtistUrls.size} unique artist URLs on the lineup page.`);

        // Parse artist names from URLs
        const artistsFromPage = [];
        for (const url of allArtistUrls) {
            // Extract slug from URL like: https://szigetfestival.com/en/programs-lineup-2026#/artist/2069922-bring-me-the-horizon
            const match = url.match(/#\/artist\/([^?]+)/);
            if (match) {
                const slug = match[1];
                const name = slugToName(slug);
                artistsFromPage.push({ name, url, slug });
            }
        }

        console.log(`🎤 Parsed ${artistsFromPage.length} artist names from URLs.`);

        // Load existing lineup
        try {
            const data = fs.readFileSync(LINEUP_FILE, 'utf8');
            existingArtists = JSON.parse(data);
            console.log(`📁 Loaded ${existingArtists.length} existing artists from lineup.json`);
        } catch (e) {
            console.log('📁 No existing lineup.json found, starting fresh.');
        }

        // Create map of existing artists by URL for quick lookup
        const existingByUrl = new Map();
        existingArtists.forEach(a => {
            if (a.szigetUrl) existingByUrl.set(a.szigetUrl, a);
        });

        // Find new artists
        const newArtists = artistsFromPage.filter(a => !existingByUrl.has(a.url));
        console.log(`\n🆕 Found ${newArtists.length} NEW artists to add!`);

        if (newArtists.length > 0) {
            console.log('\n--- New Artists ---');
            newArtists.forEach(a => console.log(`  ✨ ${a.name}`));
            console.log('-------------------\n');
        }

        // Add new artists with placeholder data
        let nextId = Math.max(...existingArtists.map(a => parseInt(a.id) || 0), 0) + 1;
        for (const newArtist of newArtists) {
            existingArtists.push({
                id: String(nextId++),
                artist: newArtist.name,
                stage: null,
                day: null,
                startTime: null,
                endTime: null,
                countryCode: null,
                genres: [],
                szigetUrl: newArtist.url,
                socials: {
                    website: null,
                    facebook: null,
                    instagram: null,
                    x: null,
                    tiktok: null,
                    youtube: null,
                    spotify: null,
                    appleMusic: null
                },
                description: null,
                imageUrl: null,
                vibes: []
            });
        }

        // Now fetch details for ALL artists
        console.log('\n--- Fetching details for all artists ---\n');

        for (let i = 0; i < existingArtists.length; i++) {
            const artist = existingArtists[i];

            if (!artist.szigetUrl) {
                console.log(`[${artist.id}] ${artist.artist} - No URL, skipping.`);
                continue;
            }

            console.log(`[${artist.id}] Processing ${artist.artist}...`);

            try {
                await page.goto(artist.szigetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                try {
                    await page.waitForSelector('.ArtistSingleBody__content', { timeout: 10000 });
                } catch (e) {
                    console.log('  ⚠️ Timeout waiting for content, page may not exist.');
                    continue;
                }

                // --- Genres ---
                const genres = await page.evaluate(() => {
                    const tags = Array.from(document.querySelectorAll('.ArtistSingleBody__content__tags__tag'));
                    return tags.map(t => t.innerText.trim().toUpperCase()).filter(t => t.length > 0);
                });
                if (genres.length > 0) {
                    artist.genres = genres;
                    console.log(`  🏷️ Genres: ${genres.join(', ')}`);
                }

                // --- Country Code ---
                const countryCode = await page.evaluate(() => {
                    const el = document.querySelector('.ArtistSingleHeader__country');
                    return el ? el.innerText.trim().toUpperCase() : null;
                });
                if (countryCode) {
                    artist.countryCode = countryCode;
                    console.log(`  🌍 Country: ${countryCode}`);
                }

                // --- Description (expand if needed) ---
                try {
                    const moreBtn = await page.$('.ArtistSingleBody__content__description__more');
                    if (moreBtn) {
                        const hasMore = await page.evaluate(() => {
                            const btn = document.querySelector('.ArtistSingleBody__content__description__more');
                            return btn && btn.innerText.includes('More');
                        });
                        if (hasMore) {
                            await moreBtn.click();
                            await page.waitForFunction(() => {
                                const btn = document.querySelector('.ArtistSingleBody__content__description__more');
                                return btn && btn.innerText.includes('Less');
                            }, { timeout: 3000 }).catch(() => { });
                        }
                    }
                } catch (e) { }

                const description = await page.evaluate(() => {
                    const el = document.querySelector('.ArtistSingleBody__content__description');
                    return el ? el.innerText.trim() : null;
                });
                if (description) {
                    // Clean up description - remove "More..." or "Less" if still there
                    artist.description = description.replace(/\s*(More\.\.\.|Less)\s*$/, '').trim();
                    console.log(`  📝 Description (${artist.description.length} chars)`);
                }

                // --- Image ---
                const imageUrl = await page.evaluate(() => {
                    const fullImg = document.querySelector('.ArtistSingleHeader__fullimg');
                    if (fullImg && fullImg.src) return fullImg.src;

                    const allImgs = Array.from(document.querySelectorAll('img'));
                    for (const img of allImgs) {
                        const src = img.src;
                        if (src.includes('media.appmiral.com')) return src;
                    }
                    return null;
                });
                if (imageUrl) {
                    artist.imageUrl = imageUrl;
                    console.log(`  🖼️ Image found`);
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

                if (!artist.socials) {
                    artist.socials = {};
                }
                let socialCount = 0;
                for (const [key, value] of Object.entries(socialsMap)) {
                    if (value) {
                        artist.socials[key] = value;
                        socialCount++;
                    }
                }
                console.log(`  🔗 Found ${socialCount} social links`);

            } catch (err) {
                console.error(`  ❌ Error: ${err.message}`);
            }

            // Polite pause
            await new Promise(r => setTimeout(r, 600));
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    } finally {
        await browser.close();
    }

    console.log('\n💾 Saving updated lineup.json...');
    fs.writeFileSync(LINEUP_FILE, JSON.stringify(existingArtists, null, 2), 'utf8');
    console.log(`✅ Done! Total artists: ${existingArtists.length}`);
}

scrapeAllArtists();
