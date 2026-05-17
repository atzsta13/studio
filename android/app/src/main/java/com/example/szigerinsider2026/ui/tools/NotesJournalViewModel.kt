package com.example.szigerinsider2026.ui.tools

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

@Serializable
data class NoteEntry(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val category: String = "OTHER",
    val timestamp: Long = System.currentTimeMillis()
)

private const val PREFS_NAME = "notes_journal"
private const val KEY_ENTRIES = "notes_journal_entries"

class NotesJournalViewModel(private val prefs: SharedPreferences) : ViewModel() {

    constructor(context: Context) : this(context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE))

    private val _notes = MutableStateFlow<List<NoteEntry>>(loadNotes())
    val notes: StateFlow<List<NoteEntry>> = _notes

    fun addNote(text: String, category: String) {
        if (text.isBlank()) return
        val entry = NoteEntry(
            id = UUID.randomUUID().toString(),
            text = text.trim(),
            category = category,
            timestamp = System.currentTimeMillis()
        )
        val updated = listOf(entry) + _notes.value
        _notes.value = updated
        saveNotes(updated)
    }

    fun deleteNote(id: String) {
        val updated = _notes.value.filter { it.id != id }
        _notes.value = updated
        saveNotes(updated)
    }

    private fun loadNotes(): List<NoteEntry> {
        val json = prefs.getString(KEY_ENTRIES, null) ?: return emptyList()
        return try {
            Json.decodeFromString<List<NoteEntry>>(json)
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveNotes(entries: List<NoteEntry>) {
        prefs.edit()
            .putString(KEY_ENTRIES, Json.encodeToString(entries))
            .apply()
    }

    companion object {
        fun factory(context: Context): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                NotesJournalViewModel(context.applicationContext) as T
        }
    }
}
