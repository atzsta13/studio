package org.openfestivalhub.data.model

import org.junit.Assert.*
import org.junit.Test

class ArtistTest {

    // -------------------------------------------------------------------------
    // spotifyId — computed property that extracts a Spotify artist ID from a URL
    // -------------------------------------------------------------------------

    @Test
    fun `spotifyId extracts id from a full open spotify url`() {
        val artist = Artist(
            id = "1", artist = "Test",
            socials = Socials(spotify = "https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi")
        )
        assertEquals("4tZwfgrHOc3mvqYlEYSvVi", artist.spotifyId)
    }

    @Test
    fun `spotifyId strips query parameters from spotify url`() {
        val artist = Artist(
            id = "1", artist = "Test",
            socials = Socials(spotify = "https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi?si=abc123&utm_source=copy-link")
        )
        assertEquals("4tZwfgrHOc3mvqYlEYSvVi", artist.spotifyId)
    }

    @Test
    fun `spotifyId is null when socials is null`() {
        val artist = Artist(id = "1", artist = "Test", socials = null)
        assertNull(artist.spotifyId)
    }

    @Test
    fun `spotifyId is null when spotify field is null`() {
        val artist = Artist(id = "1", artist = "Test", socials = Socials(spotify = null))
        assertNull(artist.spotifyId)
    }

    @Test
    fun `spotifyId is null for a non-artist spotify url (playlist)`() {
        val artist = Artist(
            id = "1", artist = "Test",
            socials = Socials(spotify = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
        )
        // URL doesn't contain '/artist/' — splitOrNull returns null
        assertNull(artist.spotifyId)
    }

    @Test
    fun `spotifyId is null for a non-artist spotify url (album)`() {
        val artist = Artist(
            id = "1", artist = "Test",
            socials = Socials(spotify = "https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE")
        )
        assertNull(artist.spotifyId)
    }

    @Test
    fun `spotifyId is null for an empty string spotify field`() {
        val artist = Artist(id = "1", artist = "Test", socials = Socials(spotify = ""))
        assertNull(artist.spotifyId)
    }

    // -------------------------------------------------------------------------
    // Default field values
    // -------------------------------------------------------------------------

    @Test
    fun `default fields are null or empty when not provided`() {
        val artist = Artist(id = "abc", artist = "My Band")
        assertNull(artist.stage)
        assertNull(artist.day)
        assertNull(artist.startTime)
        assertNull(artist.endTime)
        assertNull(artist.countryCode)
        assertNull(artist.festivalUrl)
        assertNull(artist.description)
        assertNull(artist.imageUrl)
        assertNull(artist.socials)
        assertNull(artist.lastYearStage)
        assertNull(artist.timeSlot)
        assertTrue(artist.genres.isEmpty())
        assertTrue(artist.vibes.isEmpty())
        assertFalse(artist.isHeadliner)
        assertFalse(artist.returningHero)
    }

    // -------------------------------------------------------------------------
    // Data class equality and copy
    // -------------------------------------------------------------------------

    @Test
    fun `two artists with identical fields are equal`() {
        val a = Artist(id = "1", artist = "Band A", genres = listOf("ROCK"), vibes = listOf("High Energy"))
        val b = Artist(id = "1", artist = "Band A", genres = listOf("ROCK"), vibes = listOf("High Energy"))
        assertEquals(a, b)
    }

    @Test
    fun `artists with different ids are not equal`() {
        val a = Artist(id = "1", artist = "Band A")
        val b = Artist(id = "2", artist = "Band A")
        assertNotEquals(a, b)
    }

    @Test
    fun `copy preserves unmodified fields`() {
        val original = Artist(
            id = "1",
            artist = "Original",
            genres = listOf("ROCK"),
            vibes = listOf("High Energy"),
            isHeadliner = true
        )
        val copy = original.copy(artist = "Copy")
        assertEquals("Copy", copy.artist)
        assertEquals(original.id, copy.id)
        assertEquals(original.genres, copy.genres)
        assertEquals(original.isHeadliner, copy.isHeadliner)
    }

    // -------------------------------------------------------------------------
    // Socials data class
    // -------------------------------------------------------------------------

    @Test
    fun `Socials defaults all fields to null`() {
        val socials = Socials()
        assertNull(socials.website)
        assertNull(socials.facebook)
        assertNull(socials.instagram)
        assertNull(socials.twitter)
        assertNull(socials.x)
        assertNull(socials.tiktok)
        assertNull(socials.youtube)
        assertNull(socials.spotify)
        assertNull(socials.appleMusic)
        assertNull(socials.soundcloud)
    }

    @Test
    fun `Socials can hold values for all fields`() {
        val socials = Socials(
            website = "https://example.com",
            instagram = "https://instagram.com/band",
            spotify = "https://open.spotify.com/artist/xyz",
            youtube = "https://youtube.com/channel/abc"
        )
        assertEquals("https://example.com", socials.website)
        assertEquals("https://instagram.com/band", socials.instagram)
        assertEquals("https://open.spotify.com/artist/xyz", socials.spotify)
        assertEquals("https://youtube.com/channel/abc", socials.youtube)
    }

    // -------------------------------------------------------------------------
    // schedule fields (always null per platform contract)
    // -------------------------------------------------------------------------

    @Test
    fun `stage startTime endTime default to null (schedule TBA)`() {
        val artist = Artist(id = "1", artist = "Test")
        assertNull(artist.stage)
        assertNull(artist.startTime)
        assertNull(artist.endTime)
    }
}
