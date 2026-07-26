package org.openfestivalhub.ui.schedule

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.openfestivalhub.InMemorySharedPreferences

class TimetableZoomTest {

    @Test
    fun `clamp keeps in-range values and clamps the rest`() {
        assertEquals(1f, TimetableZoom.clamp(1f), 0f)
        assertEquals(0.5f, TimetableZoom.clamp(0.5f), 0f)
        assertEquals(TimetableZoom.MIN_ZOOM, TimetableZoom.clamp(0.001f), 0f)
        assertEquals(TimetableZoom.MAX_ZOOM, TimetableZoom.clamp(99f), 0f)
    }

    @Test
    fun `clamp falls back to 1 for non-finite input`() {
        assertEquals(1f, TimetableZoom.clamp(Float.NaN), 0f)
        assertEquals(1f, TimetableZoom.clamp(Float.POSITIVE_INFINITY), 0f)
    }

    @Test
    fun `anchoredScroll keeps the content under the focal point in place`() {
        // Focal 300px down the viewport, already scrolled 600px: the content
        // point under the finger is at 900px and must sit at 1800px after a 2x
        // zoom, so the scroll position has to become 1500.
        val next = TimetableZoom.anchoredScroll(prevZoom = 1f, nextZoom = 2f, focal = 300f, scroll = 600f)
        assertEquals(1500f, next, 0.01f)
    }

    @Test
    fun `anchoredScroll is a no-op when the zoom does not change`() {
        assertEquals(420f, TimetableZoom.anchoredScroll(1.5f, 1.5f, 200f, 420f), 0.01f)
    }

    @Test
    fun `anchoredScroll round-trips in and back out`() {
        val zoomedIn = TimetableZoom.anchoredScroll(1f, 2f, 300f, 600f)
        assertEquals(600f, TimetableZoom.anchoredScroll(2f, 1f, 300f, zoomedIn), 0.01f)
    }

    @Test
    fun `anchoredScroll never returns a negative scroll position`() {
        assertEquals(0f, TimetableZoom.anchoredScroll(2f, 0.5f, 10f, 0f), 0f)
    }

    @Test
    fun `anchoredScroll agrees with the web grid on the shared example`() {
        // src/test/use-timetable-zoom.test.ts asserts the same numbers: the
        // growth of the content left of the focal point is what gets scrolled.
        val next = TimetableZoom.anchoredScroll(prevZoom = 1f, nextZoom = 2f, focal = 100f, scroll = 0f)
        assertEquals(100f, next, 0.01f)
    }

    @Test
    fun `fitWidth makes every stage column fit exactly`() {
        val width = TimetableZoom.GUTTER_DP + 5 * TimetableZoom.BASE_COLUMN_DP
        assertEquals(1f, TimetableZoom.fitWidth(width, 5), 0.0001f)
    }

    @Test
    fun `fitWidth returns 1 when there is nothing to fit`() {
        assertEquals(1f, TimetableZoom.fitWidth(800f, 0), 0f)
        assertEquals(1f, TimetableZoom.fitWidth(10f, 3), 0f)
    }

    @Test
    fun `fit picks the constraining axis`() {
        // 18 stages in 1200dp would allow ~0.42; 16 hours in 600dp allows less.
        val zoom = TimetableZoom.fit(
            containerWidthDp = 1200f,
            containerHeightDp = 600f,
            stageCount = 18,
            totalMinutes = 16 * 60
        )
        val heightFit = (600f - TimetableZoom.HEADER_DP) / (16 * 60 * TimetableZoom.BASE_DP_PER_MINUTE)
        assertEquals(TimetableZoom.clamp(heightFit), zoom, 0.0001f)
    }

    @Test
    fun `fit result really does fit the board inside the container`() {
        val zoom = TimetableZoom.fit(
            containerWidthDp = 1000f,
            containerHeightDp = 5000f,
            stageCount = 5,
            totalMinutes = 600
        )
        val used = TimetableZoom.GUTTER_DP + 5 * TimetableZoom.BASE_COLUMN_DP * zoom
        assertTrue("board width $used should fit 1000dp", used <= 1000.01f)
    }

    @Test
    fun `fit leaves the zoom alone when the container has not been measured`() {
        assertEquals(1f, TimetableZoom.fit(0f, 0f, 18, 960), 0f)
    }

    @Test
    fun `an 18-stage 17-hour Sziget day fits a phone screen above the zoom floor`() {
        val widthDp = 392f
        val heightDp = 600f
        val zoom = TimetableZoom.fit(
            containerWidthDp = widthDp,
            containerHeightDp = heightDp,
            stageCount = 18,
            totalMinutes = 17 * 60
        )
        assertTrue("$zoom should be above the floor", zoom > TimetableZoom.MIN_ZOOM)
        val usedWidth = TimetableZoom.GUTTER_DP + 18 * TimetableZoom.BASE_COLUMN_DP * zoom
        val usedHeight = TimetableZoom.HEADER_DP + 17 * 60 * TimetableZoom.BASE_DP_PER_MINUTE * zoom
        assertTrue("width $usedWidth fits $widthDp", usedWidth <= widthDp + 0.01f)
        assertTrue("height $usedHeight fits $heightDp", usedHeight <= heightDp + 0.01f)
    }

    @Test
    fun `fit clamps to the floor when the board dwarfs the container`() {
        assertEquals(TimetableZoom.MIN_ZOOM, TimetableZoom.fit(200f, 300f, 40, 2000), 0f)
    }

    @Test
    fun `columnWidth stretches to fill instead of leaving dead space`() {
        // 3 stages on a 1000dp tablet: scaled columns would use 474dp of 1000.
        val stretched = TimetableZoom.columnWidthDp(zoom = 1f, stageCount = 3, containerWidthDp = 1000f)
        assertEquals((1000f - TimetableZoom.GUTTER_DP) / 3f, stretched, 0.01f)
    }

    @Test
    fun `columnWidth follows the zoom once the columns overflow`() {
        val scaled = TimetableZoom.columnWidthDp(zoom = 2f, stageCount = 18, containerWidthDp = 392f)
        assertEquals(TimetableZoom.BASE_COLUMN_DP * 2f, scaled, 0.01f)
    }

    @Test
    fun `densityTier maps rendered height not duration`() {
        assertEquals(TimetableZoom.Tier.TINY, TimetableZoom.densityTier(12f))
        assertEquals(TimetableZoom.Tier.TINY, TimetableZoom.densityTier(45f))
        assertEquals(TimetableZoom.Tier.SMALL, TimetableZoom.densityTier(46f))
        assertEquals(TimetableZoom.Tier.SMALL, TimetableZoom.densityTier(77f))
        assertEquals(TimetableZoom.Tier.FULL, TimetableZoom.densityTier(78f))
    }

    @Test
    fun `isBlock triggers only when there is no room for text`() {
        assertTrue(TimetableZoom.isBlock(widthDp = 20f, heightDp = 200f))
        assertTrue(TimetableZoom.isBlock(widthDp = 200f, heightDp = 10f))
        assertFalse(TimetableZoom.isBlock(widthDp = 158f, heightDp = 132f))
    }

    @Test
    fun `labelStepHours thins hour labels as they collide`() {
        assertEquals(1, TimetableZoom.labelStepHours(TimetableZoom.BASE_DP_PER_MINUTE))
        assertEquals(2, TimetableZoom.labelStepHours(TimetableZoom.BASE_DP_PER_MINUTE * 0.3f))
        assertEquals(3, TimetableZoom.labelStepHours(TimetableZoom.BASE_DP_PER_MINUTE * 0.15f))
    }

    @Test
    fun `zoom persists per festival and does not leak between them`() {
        val prefs = InMemorySharedPreferences()
        assertNull(TimetableZoom.load(prefs, "sziget-2026"))

        TimetableZoom.save(prefs, "sziget-2026", 0.75f)
        assertEquals(0.75f, TimetableZoom.load(prefs, "sziget-2026")!!, 0.0001f)
        assertNull(TimetableZoom.load(prefs, "novarock-2026"))
    }

    @Test
    fun `a persisted zoom is clamped on the way in and out`() {
        val prefs = InMemorySharedPreferences()
        TimetableZoom.save(prefs, "sziget-2026", 99f)
        assertEquals(TimetableZoom.MAX_ZOOM, TimetableZoom.load(prefs, "sziget-2026")!!, 0f)
    }
}
