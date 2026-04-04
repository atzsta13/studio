import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const lineupPath = 'festivals/frequency-2026/data/lineup.json';
const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'));

async function scrapeArtistDetails() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log(`Starting enhanced crawl for ${lineup.length} artists...`);

  for (let i = 0; i < lineup.length; i++) {
    const artist = lineup[i];
    const url = `https://www.frequency.at/artist/${artist.id}/`;
    
    console.log(`[${i+1}/${lineup.length}] Crawling: ${artist.name} (${url})`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const details = await page.evaluate(() => {
        // Extract Image
        const heroSection = document.querySelector('.artist-header, .artist-hero, .hero-inner');
        let imageUrl = null;
        if (heroSection) {
          const style = window.getComputedStyle(heroSection);
          const bg = style.backgroundImage;
          if (bg && bg !== 'none') {
            imageUrl = bg.slice(4, -1).replace(/"/g, "");
          }
        }
        if (!imageUrl) {
          const img = document.querySelector('.artist-image img, .wp-post-image');
          imageUrl = img ? img.src : null;
        }

        // Extract Bio
        // The bio usually sits in a div after an element containing "ABOUT"
        const aboutHeading = Array.from(document.querySelectorAll('h2, h3, h4, span, div'))
          .find(el => el.textContent.trim().toUpperCase() === 'ABOUT');
        
        let description = "";
        if (aboutHeading) {
          let nextEl = aboutHeading.nextElementSibling;
          while (nextEl && !description) {
            if (nextEl.textContent.trim()) {
              description = nextEl.textContent.trim();
            }
            nextEl = nextEl.nextElementSibling;
          }
        }

        // Socials
        const socials = {};
        const links = Array.from(document.querySelectorAll('a[href]'));
        links.forEach(link => {
          const href = link.href;
          if (href.includes('spotify.com')) socials.spotify = href;
          if (href.includes('instagram.com')) socials.instagram = href;
          if (href.includes('facebook.com')) socials.facebook = href;
          if (href.includes('youtube.com')) socials.youtube = href;
        });

        return { imageUrl, description, socials };
      });

      // Update artist object
      if (details.imageUrl) artist.imageUrl = details.imageUrl;
      if (details.description) artist.description = details.description;
      if (Object.keys(details.socials).length > 0) {
        artist.links = { ...artist.links, ...details.socials };
      }

    } catch (e) {
      console.error(`Failed to scrape ${artist.name}:`, e.message);
    }
  }

  await browser.close();

  // Save updated lineup
  fs.writeFileSync(lineupPath, JSON.stringify(lineup, null, 2));
  console.log(`✅ Enhanced lineup saved to ${lineupPath}`);
}

scrapeArtistDetails();
