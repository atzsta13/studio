package org.openfestivalhub.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import org.openfestivalhub.data.config.FestivalConfig

@Database(
    entities = [ArtistEntity::class, FavoriteArtist::class],
    version = 8,
    exportSchema = false
)
@androidx.room.TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun artistDao(): ArtistDao
    abstract fun userDao(): UserDao

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

        fun resetInstance() {
            synchronized(this) {
                INSTANCE?.close()
                INSTANCE = null
            }
        }
    }
}
