package com.example.szigerinsider2026.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [UserProgress::class, FavoriteArtist::class],
    version = 1,
    exportSchema = false
)
@androidx.room.TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
