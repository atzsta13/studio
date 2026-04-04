package com.example.szigerinsider2026.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.szigerinsider2026.data.config.FestivalConfig

@Database(
    entities = [ArtistEntity::class],
    version = 5,
    exportSchema = false
)
@androidx.room.TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun artistDao(): ArtistDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: android.content.Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val dbName = "${FestivalConfig.current.id.replace("-", "_")}_database"
                val instance = androidx.room.Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    dbName
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
