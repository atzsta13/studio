package com.example.szigerinsider2026.util

import android.content.SharedPreferences

/**
 * In-memory SharedPreferences stub for pure-JVM unit tests.
 * Implements only the subset of the API used by ViewModels under test.
 */
class FakeSharedPreferences : SharedPreferences {

    private val store = mutableMapOf<String, Any?>()
    private val listeners = mutableListOf<SharedPreferences.OnSharedPreferenceChangeListener>()

    override fun getString(key: String, defValue: String?): String? =
        store[key] as? String ?: defValue

    override fun getInt(key: String, defValue: Int): Int =
        store[key] as? Int ?: defValue

    override fun getLong(key: String, defValue: Long): Long =
        store[key] as? Long ?: defValue

    override fun getFloat(key: String, defValue: Float): Float =
        store[key] as? Float ?: defValue

    override fun getBoolean(key: String, defValue: Boolean): Boolean =
        store[key] as? Boolean ?: defValue

    override fun getStringSet(key: String, defValues: MutableSet<String>?): MutableSet<String>? =
        @Suppress("UNCHECKED_CAST") (store[key] as? MutableSet<String>) ?: defValues

    override fun getAll(): MutableMap<String, *> = store.toMutableMap()

    override fun contains(key: String): Boolean = store.containsKey(key)

    override fun edit(): SharedPreferences.Editor = FakeEditor()

    override fun registerOnSharedPreferenceChangeListener(
        listener: SharedPreferences.OnSharedPreferenceChangeListener
    ) {
        listeners.add(listener)
    }

    override fun unregisterOnSharedPreferenceChangeListener(
        listener: SharedPreferences.OnSharedPreferenceChangeListener
    ) {
        listeners.remove(listener)
    }

    private inner class FakeEditor : SharedPreferences.Editor {
        private val pending = mutableMapOf<String, Any?>()
        private val removals = mutableSetOf<String>()
        private var clearAll = false

        override fun putString(key: String, value: String?): SharedPreferences.Editor {
            pending[key] = value; return this
        }

        override fun putInt(key: String, value: Int): SharedPreferences.Editor {
            pending[key] = value; return this
        }

        override fun putLong(key: String, value: Long): SharedPreferences.Editor {
            pending[key] = value; return this
        }

        override fun putFloat(key: String, value: Float): SharedPreferences.Editor {
            pending[key] = value; return this
        }

        override fun putBoolean(key: String, value: Boolean): SharedPreferences.Editor {
            pending[key] = value; return this
        }

        override fun putStringSet(
            key: String,
            values: MutableSet<String>?
        ): SharedPreferences.Editor {
            pending[key] = values; return this
        }

        override fun remove(key: String): SharedPreferences.Editor {
            removals.add(key); return this
        }

        override fun clear(): SharedPreferences.Editor {
            clearAll = true; return this
        }

        override fun commit(): Boolean {
            flush(); return true
        }

        override fun apply() {
            flush()
        }

        private fun flush() {
            if (clearAll) store.clear()
            removals.forEach { store.remove(it) }
            store.putAll(pending)
        }
    }
}
