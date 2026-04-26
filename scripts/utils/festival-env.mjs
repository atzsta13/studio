import path from 'path';

/**
 * Gets the current festival ID from environment or fallback.
 */
export function getFestivalId() {
  return process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026';
}

/**
 * Converts a festival ID (e.g. "ernte-punk-2026") into an Android product flavor slug ("erntepunk").
 */
export function getAndroidSlug(festivalId) {
  return festivalId.replace(/-\d{4}$/, '').replace(/-/g, '');
}

/**
 * Returns standard paths for the given festival ID.
 */
export function getFestivalPaths(festivalId = getFestivalId()) {
  const cwd = process.cwd();
  const slug = getAndroidSlug(festivalId);
  return {
    festivalId,
    slug,
    srcDataDir: path.join(cwd, 'festivals', festivalId, 'data'),
    srcConfig: path.join(cwd, 'festivals', festivalId, 'config.json'),
    androidAssetsDir: path.join(cwd, 'android', 'app', 'src', slug, 'assets'),
    lineupFile: path.join(cwd, 'festivals', festivalId, 'data', 'lineup.json'),
    poiFile: path.join(cwd, 'festivals', festivalId, 'data', 'poi.json'),
    foodFile: path.join(cwd, 'festivals', festivalId, 'data', 'food.json'),
    guideFile: path.join(cwd, 'festivals', festivalId, 'data', 'guide.json'),
    survivalFile: path.join(cwd, 'festivals', festivalId, 'data', 'survival.json')
  };
}
