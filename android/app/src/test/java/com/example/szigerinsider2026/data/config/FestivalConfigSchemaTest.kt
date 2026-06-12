package com.example.szigerinsider2026.data.config

import kotlinx.serialization.json.Json
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class FestivalConfigSchemaTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun `all bundled config files parse against the FestivalConfigData schema`() {
        val assetsDir = File("src/main/assets")
        assertTrue("assets dir missing: ${assetsDir.absolutePath}", assetsDir.isDirectory)
        FestivalConfig.AVAILABLE_IDS.forEach { id ->
            val file = File(assetsDir, "$id/config.json")
            assertTrue("config.json missing for $id", file.isFile)
            val config = json.decodeFromString<FestivalConfigData>(file.readText())
            assertTrue("id mismatch for $id", config.id == id)
        }
    }
}
