// Validates festival data beyond the config schema: the time rules that
// docs/DATA_SOURCES.md and CONTRIBUTING.md promise CI will enforce.
//
// Config schema validation is delegated to validateAllConfigs().
// Run: npm run validate
import fs from 'fs'
import path from 'path'
import { validateAllConfigs } from './utils/validate-configs.mjs'

const FESTIVALS_DIR = path.join(process.cwd(), 'festivals')
// fractional seconds are optional and valid; a bare "HH:mm" is not
const ISO_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:[+-]\d{2}:\d{2}|Z)$/

const errors = []
const warnings = []

function fail(festival, msg) {
  errors.push(`[${festival}] ${msg}`)
}

validateAllConfigs()

const festivals = fs
  .readdirSync(FESTIVALS_DIR)
  .filter((f) => fs.statSync(path.join(FESTIVALS_DIR, f)).isDirectory())

for (const id of festivals) {
  const lineupPath = path.join(FESTIVALS_DIR, id, 'data', 'lineup.json')
  const configPath = path.join(FESTIVALS_DIR, id, 'config.json')
  if (!fs.existsSync(lineupPath)) {
    fail(id, 'missing data/lineup.json')
    continue
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'))
  const hasTimetable = config.features?.timetable === true

  if (!Array.isArray(lineup)) {
    fail(id, 'lineup.json must be an array')
    continue
  }

  const timed = lineup.filter((a) => a.startTime || a.endTime)

  // 1. timetable flag must match the data
  if (hasTimetable && timed.length === 0) {
    fail(id, 'features.timetable is true but no act has a startTime')
  }
  if (!hasTimetable && timed.length > 0) {
    fail(
      id,
      `features.timetable is false but ${timed.length} act(s) have times — flip the flag`
    )
  }

  const seenIds = new Set()
  const byStage = new Map()
  const unscheduled = []
  const exact = new Set()

  for (const a of lineup) {
    const who = a.artist ?? '(unnamed)'

    if (!a.artist) fail(id, 'an entry has no artist name')
    if (a.id != null) {
      if (seenIds.has(a.id)) fail(id, `duplicate id "${a.id}" (${who})`)
      seenIds.add(a.id)
    }

    // 2. ISO 8601 with offset, never bare HH:mm
    for (const key of ['startTime', 'endTime']) {
      const v = a[key]
      if (v == null) continue
      if (typeof v !== 'string' || !ISO_OFFSET.test(v)) {
        fail(id, `${who}: ${key} "${v}" is not ISO 8601 with offset`)
      }
    }

    // A partial timetable is legitimate — Sziget publishes its programme in
    // waves, so acts without times are "announced, not yet scheduled".
    if (!a.startTime || !a.endTime) {
      if (hasTimetable) unscheduled.push(who)
      continue
    }
    if (!ISO_OFFSET.test(a.startTime) || !ISO_OFFSET.test(a.endTime)) continue

    // 3. end must be after start (post-midnight sets roll to the next date)
    const start = new Date(a.startTime)
    const end = new Date(a.endTime)
    if (end <= start) {
      fail(
        id,
        `${who}: endTime (${a.endTime}) is not after startTime (${a.startTime})` +
          ' — a set running past midnight must roll to the next date'
      )
    }
    const hours = (end - start) / 36e5
    if (hours > 6) {
      warnings.push(`[${id}] ${who}: set is ${hours.toFixed(1)}h long — check the dates`)
    }

    const sig = `${a.artist}|${a.stage}|${a.startTime}|${a.endTime}`
    if (exact.has(sig)) fail(id, `${who}: exact duplicate row (${a.stage}, ${a.startTime})`)
    exact.add(sig)

    if (!a.stage) {
      warnings.push(`[${id}] ${who}: has times but no stage`)
      continue
    }
    if (!byStage.has(a.stage)) byStage.set(a.stage, [])
    byStage.get(a.stage).push(a)
  }

  if (unscheduled.length) {
    warnings.push(
      `[${id}] ${unscheduled.length} act(s) announced but not yet scheduled` +
        ` (e.g. ${unscheduled.slice(0, 3).join(', ')})`
    )
  }

  // 4. no two acts on the same stage at the same time
  for (const [stage, acts] of byStage) {
    acts.sort((x, y) => new Date(x.startTime) - new Date(y.startTime))
    for (let i = 1; i < acts.length; i++) {
      const prev = acts[i - 1]
      const cur = acts[i]
      if (new Date(cur.startTime) < new Date(prev.endTime)) {
        warnings.push(
          `[${id}] ${stage}: "${prev.artist}" (ends ${prev.endTime}) overlaps ` +
            `"${cur.artist}" (starts ${cur.startTime})`
        )
      }
    }
  }
}

for (const w of warnings) console.warn(`⚠️  ${w}`)

if (errors.length) {
  console.error(`\n❌ ${errors.length} data error(s):\n`)
  for (const e of errors) console.error(`   ${e}`)
  console.error('\nSee CONTRIBUTING.md for the data rules.\n')
  process.exit(1)
}

console.log(`✅ Data valid — ${festivals.length} festivals checked.`)
