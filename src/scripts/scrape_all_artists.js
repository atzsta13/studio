// src/scripts/scrape_all_artists.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Multi-festival Scraper Configuration.
 * These selectors are targeted at the Appmiral-based web interfaces 
 * used by Sziget and most Nova Music festivals.
 */
const SCRAPER_CONFIGS = {
    'sziget-2026': {
        baseUrl: 'https://szigetfestival.com/en/programs-lineup-2026#/',
        artistLinkSelector: 'a[href*="#/artist/"]',
        contentSelector: '.ArtistSingleBody__content',
        tagSelector: '.ArtistSingleBody__content__tags__tag',
        countrySelector: '.ArtistSingleHeader__country',
        descriptionSelector: '.ArtistSingleBody__content__description',
        imageSelector: '.ArtistSingleHeader__fullimg',
        socialsSelector: '.ArtistSingleBody__content__socials a',
        slugRegex: /#\/artist\/([^?]+)/
    },
    'novarock-2026': {
        baseUrl: 'https://www.novarock.at/en/lineup/',
        artistLinkSelector: 'a[href*="/artist/"]',
        contentSelector: '.artistSingle__descContent, .hero__image', // Fallback to hero if no bio
        tagSelector: '.showMeta__entry:has(.showMeta--stage) .showMeta__value', // We hijack tags for stage info if needed
        countrySelector: '.ArtistSingleHeader__country', // Appmiral pattern
        descriptionSelector: '.artistSingle__descContent',
        imageSelector: '.hero__image img',
        socialsSelector: '.embedContainer--spotify iframe, .body__content a',
        slugRegex: /\/artist\/([^/]+)/
    },
    'area53-2026': {
        baseUrl: 'https://area53festival.at/en/lineup/',
        artistLinkSelector: 'a.artist-link', 
        contentSelector: '.entry-content',
        tagSelector: '.genre-tag',
        countrySelector: '.country',
        descriptionSelector: '.artist-bio',
        imageSelector: '.featured-image img',
        socialsSelector: '.social-links a',
        slugRegex: /\/lineup\/([^/]+)/
    },
    'frequency-2026': {
        baseUrl: 'https://www.frequency.at/en/lineup/',
        artistLinkSelector: 'a[href*="/artist/"]',
        contentSelector: '.act__content',
        tagSelector: '.torn--badge',
        countrySelector: '.country',
        descriptionSelector: 'main.torn--box.copy',
        imageSelector: '.act__content header img',
        socialsSelector: '.body__content dl dd.copy a',
        slugRegex: /\/artist\/([^/]+)/
    }
};

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026';
const config = SCRAPER_CONFIGS[festivalId];

if (!config) {
    console.error(`Unknown FESTIVAL_ID: ${festivalId}`);
    process.exit(1);
}

const LINEUP_FILE = path.join(__dirname, `../../festivals/${festivalId}/data/lineup.json`);

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
    console.log(`🚀 Launching browser for ${festivalId}...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let existingArtists = [];

    try {
        console.log(`📄 Navigating to ${festivalId} lineup page...`);
        await page.goto(config.baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for artist links to appear
        console.log(`⏳ Waiting for selector: ${config.artistLinkSelector}`);
        await page.waitForSelector(config.artistLinkSelector, { timeout: 15000 });

        // Scroll slowly to load ALL artists (handles lazy loading)
        console.log('📜 Scrolling to load all artists...');
        const allArtistUrls = new Set();

        for (let i = 0; i < 30; i++) {
            const urls = await page.evaluate((sel) => {
                const links = document.querySelectorAll(sel);
                return Array.from(links).map(a => a.href);
            }, config.artistLinkSelector);

            urls.forEach(url => allArtistUrls.add(url));

            await page.evaluate(() => window.scrollBy(0, 1000));
            await new Promise(r => setTimeout(r, 800));

            const atBottom = await page.evaluate(() =>
                (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100
            );
            if (atBottom && i > 5) break;
        }

        console.log(`✅ Found ${allArtistUrls.size} unique artist URLs.`);

        // Parse artist names from URLs
        const artistsFromPage = [];
        for (const url of allArtistUrls) {
            const match = url.match(config.slugRegex);
            if (match) {
                const slug = match[1];
                const name = slugToName(slug);
                artistsFromPage.push({ name, url, slug });
            }
        }

        // Load existing lineup
        try {
            const data = fs.readFileSync(LINEUP_FILE, 'utf8');
            existingArtists = JSON.parse(data);
            console.log(`📁 Loaded ${existingArtists.length} existing artists from lineup.json`);
        } catch (e) {
            console.log('📁 No existing lineup.json found, starting fresh.');
        }

        const existingByUrl = new Map();
        existingArtists.forEach(a => {
            if (a.festivalUrl) existingByUrl.set(a.festivalUrl, a);
        });

        // Add new artists
        const newArtists = artistsFromPage.filter(a => !existingByUrl.has(a.url));
        console.log(`🆕 Found ${newArtists.length} NEW artists to add!`);

        let nextIdNum = Math.max(...existingArtists.map(a => parseInt(a.id) || 0), 0) + 1;
        for (const newArtist of newArtists) {
            existingArtists.push({
                id: String(nextIdNum++),
                artist: newArtist.name,
                stage: null,
                day: null,
                startTime: null,
                endTime: null,
                countryCode: null,
                genres: [],
                festivalUrl: newArtist.url,
                socials: { spotify: null },
                description: null,
                imageUrl: null,
                vibes: []
            });
        }

        fs.writeFileSync(LINEUP_FILE, JSON.stringify(existingArtists, null, 2)); console.log("💾 Baseline saved."); // Fetch details
        console.log('\n--- Fetching details for artists ---\n');
        
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;

        for (let i = 0; i < existingArtists.length; i++) {
            const artist = existingArtists[i];
            if (!artist.festivalUrl) continue;

            // Only fetch if data is missing or empty
            if (artist.description && artist.imageUrl && artist.genres.length > 0) continue;

            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                console.log(`\n🛑 Circuit breaker triggered after ${MAX_CONSECUTIVE_FAILURES} consecutive failures. stopping detail scrape.`);
                break;
            }

            console.log(`[${artist.id}] Processing ${artist.artist}...`);

            try {
                await page.goto(artist.festivalUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForSelector(config.contentSelector, { timeout: 10000 });

                artist.genres = await page.evaluate((sel) => {
                    return Array.from(document.querySelectorAll(sel)).map(t => t.innerText.trim().toUpperCase()).filter(t => t.length > 0);
                }, config.tagSelector);

                artist.countryCode = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    return el ? el.innerText.trim().toUpperCase() : null;
                }, config.countrySelector);

                artist.description = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    return el ? el.innerText.trim() : null;
                }, config.descriptionSelector);

                artist.imageUrl = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    return el ? (el.src || el.getAttribute('src')) : null;
                }, config.imageSelector);

                // Socials
                const socialsMap = await page.evaluate((sel) => {
                    const links = {};
                    const anchors = Array.from(document.querySelectorAll(sel));
                    anchors.forEach(a => {
                        const href = a.href || "";
                        if (href.includes('facebook.com')) links.facebook = href;
                        else if (href.includes('instagram.com')) links.instagram = href;
                        else if (href.includes('spotify.com')) links.spotify = href;
                        else if (href.includes('youtube.com')) links.youtube = href;
                    });
                    return links;
                }, config.socialsSelector);

                artist.socials = { ...artist.socials, ...socialsMap };
                
                consecutiveFailures = 0; // Reset on success

            } catch (err) {
                consecutiveFailures++;
                console.error(`  ❌ Error: ${err.message} (Failure ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`);
            }
            // Slower, randomized delay to be more human-like
            const delay = 1000 + Math.random() * 2000;
            await new Promise(r => setTimeout(r, delay));
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    } finally {
        await browser.close();
    }

    console.log(`\n💾 Saving to ${LINEUP_FILE}...`);
    fs.writeFileSync(LINEUP_FILE, JSON.stringify(existingArtists, null, 2), 'utf8');
    console.log(`✅ Done! Total: ${existingArtists.length}`);
}

scrapeAllArtists();
