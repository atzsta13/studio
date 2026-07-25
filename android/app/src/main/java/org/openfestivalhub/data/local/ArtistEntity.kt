package org.openfestivalhub.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.model.Socials

@Entity(tableName = "artists")
data class ArtistEntity(
    @PrimaryKey val id: String,
    val artist: String,
    val stage: String?,
    val day: String?,
    val startTime: String?,
    val endTime: String?,
    val countryCode: String?,
    val genres: List<String>,
    val festivalUrl: String?,
    val socials: Socials?,
    val description: String?,
    val imageUrl: String?,
    val vibes: List<String>,
    val isHeadliner: Boolean,
    val returningHero: Boolean,
    val lastYearStage: String?,
    val timeSlot: String?,
    val year: String
)

fun ArtistEntity.toModel() = Artist(
    id = id,
    artist = artist,
    stage = stage,
    day = day,
    startTime = startTime,
    endTime = endTime,
    countryCode = countryCode,
    genres = genres,
    festivalUrl = festivalUrl,
    socials = socials,
    description = description,
    imageUrl = imageUrl,
    vibes = vibes,
    isHeadliner = isHeadliner,
    returningHero = returningHero,
    lastYearStage = lastYearStage,
    timeSlot = timeSlot
)

fun Artist.toEntity(year: String) = ArtistEntity(
    id = id,
    artist = artist,
    stage = stage,
    day = day,
    startTime = startTime,
    endTime = endTime,
    countryCode = countryCode,
    genres = genres,
    festivalUrl = festivalUrl,
    socials = socials,
    description = description,
    imageUrl = imageUrl,
    vibes = vibes,
    isHeadliner = isHeadliner,
    returningHero = returningHero,
    lastYearStage = lastYearStage,
    timeSlot = timeSlot,
    year = year
)
