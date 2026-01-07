
import json
import time
import os
from playwright.sync_api import sync_playwright

# Path to your lineup.json
LINEUP_FILE = '../data/lineup.json'

def fetch_artist_data():
    # Resolve absolute path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, LINEUP_FILE)

    with open(file_path, 'r', encoding='utf-8') as f:
        artists = json.load(f)

    with sync_playwright() as p:
        # Launch browser (headless=True is faster, False is good for debugging)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for artist in artists:
            url = artist.get('szigetUrl')
            
            # Skip if no URL or if we want to skip already populated ones (optional)
            if not url:
                print(f"Skipping {artist['artist']} (No URL)")
                continue
                
            print(f"Fetching data for: {artist['artist']}...")
            
            try:
                page.goto(url, timeout=60000)
                # Wait for the main content container to appear
                page.wait_for_selector('.ArtistSingleBody__content', timeout=15000)
                
                # --- Extract Genres ---
                genres = []
                # Select all tag elements
                tag_elements = page.query_selector_all('.ArtistSingleBody__content__tags__tag')
                for tag in tag_elements:
                    text = tag.inner_text().strip().upper()
                    if text:
                        genres.append(text)
                
                if genres:
                    # Update genres if we found any (merge or replace - here replacing to be accurate)
                    artist['genres'] = genres
                    print(f"  Found genres: {genres}")

                # --- Extract Description ---
                description_el = page.query_selector('.ArtistSingleBody__content__description')
                if description_el:
                    # Get text, maybe clean up "More..." text if present
                    description = description_el.inner_text().replace('More...', '').strip()
                    artist['description'] = description
                    print(f"  Found description ({len(description)} chars)")

                # --- Extract Image ---
                # Try to get the Open Graph image, which is usually the best representation
                image_el = page.query_selector('meta[property="og:image"]')
                if image_el:
                    image_url = image_el.get_attribute('content')
                    if image_url:
                        artist['imageUrl'] = image_url
                        print(f"  Found image URL: {image_url}")

                # --- Extract Socials ---
                socials = {
                    "website": None,
                    "facebook": None,
                    "instagram": None,
                    "twitter": None,
                    "tiktok": None,
                    "youtube": None,
                    "spotify": None,
                    "appleMusic": None
                }
                
                social_links = page.query_selector_all('.ArtistSingleBody__content__socials a')
                for link in social_links:
                    href = link.get_attribute('href')
                    if not href:
                        continue
                        
                    if 'facebook.com' in href:
                        socials['facebook'] = href
                    elif 'instagram.com' in href:
                        socials['instagram'] = href
                    elif 'twitter.com' in href or 'x.com' in href:
                        socials['twitter'] = href
                    elif 'tiktok.com' in href:
                        socials['tiktok'] = href
                    elif 'youtube.com' in href:
                        socials['youtube'] = href
                    elif 'spotify.com' in href:
                        socials['spotify'] = href
                    elif 'music.apple.com' in href:
                        socials['appleMusic'] = href
                    elif 'soundcloud.com' in href:
                        socials['soundcloud'] = href # Adding support for extra links
                    else:
                        # Assume it's the official website if it's none of the above
                        socials['website'] = href
                
                # Only update keys that were found to avoid overwriting with None if we missed something
                # Or replace entirely? Let's be safe and replace entirely to match the source of truth.
                if not artist.get('socials'):
                    artist['socials'] = socials
                else:
                    # Merge found socials
                    for k, v in socials.items():
                        if v:
                            artist['socials'][k] = v
                
                print(f"  Found {sum(1 for v in socials.values() if v)} social links")

            except Exception as e:
                print(f"  Error fetching {artist['artist']}: {e}")
            
            # Nice little pause to be polite to the server
            time.sleep(1)

        browser.close()

    # Save updated data back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(artists, f, indent=2, ensure_ascii=False)
    
    print(f"\nSuccessfully updated {file_path}")

if __name__ == "__main__":
    fetch_artist_data()
