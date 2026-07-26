package org.openfestivalhub.ui.schedule

import android.content.SharedPreferences

/**
 * Zoom + pan math for the timetable grid, kept free of Compose so it can be
 * unit-tested. Mirrors the web implementation in `src/hooks/use-timetable-zoom.ts`
 * — the constants and density thresholds are deliberately the same numbers so
 * both platforms show the same amount of detail at the same zoom.
 *
 * All sizes are dp; scroll positions are px, as Compose scroll state reports them.
 */
object TimetableZoom {

    const val BASE_DP_PER_MINUTE = 2.2f
    const val BASE_COLUMN_DP = 158f
    const val GUTTER_DP = 48f
    const val HEADER_DP = 40f

    // The floor is deliberately low: at ~10% a full 18-stage Sziget day fits one
    // phone screen as blocks, which is the point of zooming out.
    const val MIN_ZOOM = 0.1f
    const val MAX_ZOOM = 2.6f
    const val ZOOM_STEP = 1.3f

    enum class Tier { TINY, SMALL, FULL }

    fun clamp(zoom: Float): Float = when {
        zoom.isNaN() || zoom.isInfinite() -> 1f
        else -> zoom.coerceIn(MIN_ZOOM, MAX_ZOOM)
    }

    /**
     * Scroll position that keeps the content under [focal] in place across a
     * zoom change. [focal] and [scroll] share one axis and one unit (px); for
     * the X axis pass the focal point relative to the horizontal scroller's
     * left edge, i.e. minus the gutter, because the gutter does not scale.
     *
     * Same formula as the web grid's `anchoredScroll`.
     */
    fun anchoredScroll(prevZoom: Float, nextZoom: Float, focal: Float, scroll: Float): Float {
        if (prevZoom <= 0f) return scroll
        val ratio = nextZoom / prevZoom
        return ((scroll + focal) * ratio - focal).coerceAtLeast(0f)
    }

    /** Largest zoom at which every stage column is visible without panning. */
    fun fitWidth(containerWidthDp: Float, stageCount: Int): Float {
        if (stageCount <= 0 || containerWidthDp <= GUTTER_DP) return 1f
        return clamp((containerWidthDp - GUTTER_DP) / (stageCount * BASE_COLUMN_DP))
    }

    /**
     * Largest zoom at which the whole day fits — all stages, all hours. An axis
     * that cannot be measured yet is excluded; if neither can be, the zoom is
     * left alone rather than snapped to a bound.
     */
    fun fit(
        containerWidthDp: Float,
        containerHeightDp: Float,
        stageCount: Int,
        totalMinutes: Int,
        headerDp: Float = HEADER_DP
    ): Float {
        val widthFit = if (stageCount > 0 && containerWidthDp > GUTTER_DP) {
            (containerWidthDp - GUTTER_DP) / (stageCount * BASE_COLUMN_DP)
        } else Float.POSITIVE_INFINITY
        val heightFit = if (totalMinutes > 0 && containerHeightDp > headerDp) {
            (containerHeightDp - headerDp) / (totalMinutes * BASE_DP_PER_MINUTE)
        } else Float.POSITIVE_INFINITY
        val fit = minOf(widthFit, heightFit)
        return if (fit.isInfinite()) 1f else clamp(fit)
    }

    /**
     * Column width at [zoom], stretched to fill the container when the scaled
     * columns would leave dead space — a 3-stage festival should never render
     * as a thin strip down one side of the screen.
     */
    fun columnWidthDp(zoom: Float, stageCount: Int, containerWidthDp: Float): Float {
        val scaled = BASE_COLUMN_DP * zoom
        if (stageCount <= 0 || containerWidthDp <= GUTTER_DP) return scaled
        return maxOf(scaled, (containerWidthDp - GUTTER_DP) / stageCount)
    }

    /**
     * Layout density for a slot, from its rendered height rather than its set
     * duration — under zoom the same 60-minute set can be 400dp or 14dp tall.
     */
    fun densityTier(heightDp: Float): Tier = when {
        heightDp < 46f -> Tier.TINY
        heightDp < 78f -> Tier.SMALL
        else -> Tier.FULL
    }

    /** Below this there is no room for one readable character: draw a block. */
    fun isBlock(widthDp: Float, heightDp: Float): Boolean = widthDp < 46f || heightDp < 13f

    /** Hourly labels collide when zoomed out; thin them but keep every line. */
    fun labelStepHours(dpPerMinute: Float): Int {
        val hourHeight = 60f * dpPerMinute
        return when {
            hourHeight < 26f -> 3
            hourHeight < 44f -> 2
            else -> 1
        }
    }

    // ─── Persistence (per festival, so an 18-stage density doesn't follow you) ──

    private fun key(festivalId: String) = "timetable_zoom_$festivalId"

    fun load(prefs: SharedPreferences, festivalId: String): Float? {
        val stored = prefs.getFloat(key(festivalId), 0f)
        return if (stored > 0f) clamp(stored) else null
    }

    fun save(prefs: SharedPreferences, festivalId: String, zoom: Float) {
        prefs.edit().putFloat(key(festivalId), clamp(zoom)).apply()
    }
}
