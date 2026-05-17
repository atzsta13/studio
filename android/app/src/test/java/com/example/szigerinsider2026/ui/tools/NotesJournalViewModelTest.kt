package com.example.szigerinsider2026.ui.tools

import com.example.szigerinsider2026.InMemorySharedPreferences
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.Assert.*
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class NotesJournalViewModelTest {

    @Test
    fun `initial notes are empty`() {
        val prefs = InMemorySharedPreferences()
        val vm = NotesJournalViewModel(prefs)
        assertTrue(vm.notes.value.isEmpty())
    }

    @Test
    fun `addNote adds a note to the list`() {
        val prefs = InMemorySharedPreferences()
        val vm = NotesJournalViewModel(prefs)
        vm.addNote("Buy water", "SHOPPING")
        assertEquals(1, vm.notes.value.size)
        assertEquals("Buy water", vm.notes.value.first().text)
        assertEquals("SHOPPING", vm.notes.value.first().category)
    }

    @Test
    fun `deleteNote removes the correct note`() {
        val prefs = InMemorySharedPreferences()
        val vm = NotesJournalViewModel(prefs)
        vm.addNote("Note 1", "CAT1")
        val id = vm.notes.value.first().id
        vm.deleteNote(id)
        assertTrue(vm.notes.value.isEmpty())
    }
}
