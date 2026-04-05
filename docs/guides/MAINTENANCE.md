# Maintenance & Data Updates

## 🎤 Updating the Lineup
1. **Scrape**: Run `npm run lineup:scrape` to fetch new artists from the official site.
2. **Clean**: Run `npm run lineup:clean` to dedupe, add countries, and mark headliners.
3. **Vibes**: Run `npm run lineup:vibes` to generate AI-assisted vibe tags.
4. **Manual**: Edit `src/data/lineup.json` for specific set times once announced.

## 🍔 Updating Food Vendors
Edit `src/data/food.json`. 
- Ensure `budgetPrice` is populated to trigger the **Budget Hero** badge.
- `mapCoords` (x,y) are percentages (0-100) relative to the map container.

## 📍 Updating Map Points (POIs)
Edit `src/data/poi.json`.
- Types: `water`, `toilet`, `first-aid`, `camping`.
- These are automatically filtered in **Hydration Mode**.

## 🧠 Updating AI Prompts
Modify `src/ai/flows/recommend-artists-flow.ts`.
- The `recommendPrompt` Handlebars template controls how the Scout speaks.
- Stay in character as the "Sziget Insider Scout".
