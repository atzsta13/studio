# The Festival App Landscape

**A survey of who builds festival companion apps, who they're built for, and where the gaps are.**

*Last verified: 2026-07-25. Prices, festival counts, and app listings change — check the sources before relying on any specific number.*

---

## Table of contents

1. [Why this document exists](#1-why-this-document-exists)
2. [How to read it](#2-how-to-read-it--fact-inference-and-unknown)
3. [The official apps: who actually builds them](#3-the-official-apps-who-actually-builds-them)
4. [The white-label B2B market and its price floor](#4-the-white-label-b2b-market-and-its-price-floor)
5. [The independent consumer apps](#5-the-independent-consumer-apps)
6. [Clashfinder and the community-data lineage](#6-clashfinder-and-the-community-data-lineage)
7. [The open-source picture](#7-the-open-source-picture)
8. [The gap](#8-the-gap)
9. [What Open Festival Hub is — and is not](#9-what-open-festival-hub-is--and-is-not)
10. [Naming: what the research ruled out](#10-naming-what-the-research-ruled-out)
11. [Licensing rationale](#11-licensing-rationale)
12. [Legal and ethical ground rules](#12-legal-and-ethical-ground-rules)
13. [Open questions](#13-open-questions)
14. [Sources](#14-sources)

---

## 1. Why this document exists

This project started as a companion app for one festival, then grew to six. At that point a reasonable question arrives: *why does this need to exist at all?* Every large festival already ships an official app. Several independent developers already ship multi-festival apps. Both groups are further along than we are.

Rather than assume an answer, we went and looked. This document is what we found.

The short version: the festival app market is real, competent, and well-served **at the top**. Large festivals get good apps. A handful of talented indie developers serve enthusiasts across many festivals. But the market is organised around money moving — ticketing, cashless payments, sponsorship — and where no money moves, nothing gets built. Small festivals get nothing. And nothing in the consumer space is open source, which means every privacy promise in the category is something you're asked to take on trust.

Those two observations are the entire reason for this project.

Nothing below is an attack on anyone. The companies and developers described here build good software and are honest about what they're doing. They have different goals, different constraints, and different people to answer to. That's the point — the gap exists because of *structure*, not because of anyone's failings.

---

## 2. How to read it — fact, inference, and unknown

Market research goes stale and gets repeated as fact, so this document marks its own confidence:

- **Verified** — read directly off a public page (an app store listing, a company's own website, a press release) on the date stamped above. Sources are linked in §14.
- **Inferred** — a reasonable conclusion drawn from verified facts, flagged as such. You may draw a different one.
- **Unknown** — we tried and failed to establish it. Said plainly rather than estimated.

One example of the last category, up front: **we could not obtain reliable install counts for any competitor app.** Google Play's listing pages render their numbers client-side, and scraping them returns values contaminated by the "similar apps" carousel. Rather than publish a guess dressed as data, we're telling you it's unknown. Anyone with a phone can check in thirty seconds; we'd welcome a correction.

---

## 3. The official apps: who actually builds them

Start with the six festivals this project currently covers. Look at the Android package identifiers rather than the branding:

| Festival | Country | Android package | Built by |
|---|---|---|---|
| Sziget | Hungary | `com.greencopper.android.sziget` | Greencopper |
| FM4 Frequency | Austria | `com.greencopper.fm4` | Greencopper |
| Nova Rock | Austria | `com.greencopper.novarock` | Greencopper |
| Rock am Ring | Germany | `com.mlk.rockamring` | eventimpresents GmbH (CTS Eventim) |
| Area 53 | Austria | — | *no app* |
| Ernte Punk | Austria | — | *no app* |

**Verified.** Three of the six ship the same underlying product from the same vendor, with different colours and different data. Sziget's app and Nova Rock's app are siblings.

### Who Greencopper is

Greencopper is a Montreal-founded company building mobile and web technology for live events. Its published client list includes Coachella, Roskilde, Reading and Leeds, Bottlerock, Pitchfork, Stagecoach and Osheaga — a genuinely impressive roster. In February 2018 it was acquired by Patron Technology, which was backed by Providence Equity Partners; the group has since consolidated under the name **Leap Event Technology**.

So the app a Sziget attendee downloads is a white-label instance operated by a vendor inside a private-equity-backed events technology group. This is completely normal and not a criticism — it's how nearly all festival software works. But it's worth knowing, because it explains the product.

### What these apps are actually for

Look at the feature lists on the store pages. Alongside the lineup and map you consistently find:

- **Personalised ticket / entry credential**
- **Cashless wristband top-up**
- **Sponsor and partner placement**
- Push messaging controlled by the organiser

**Inferred, but strongly:** the timetable is not the product. The payment and access rail is the product, and the timetable is what gets you to open the app often enough for the rail to matter. That isn't cynical — an organiser needs cashless top-up to work at 03:00 in a field with 60,000 people on it, and getting that right is genuinely hard, high-stakes engineering. It deserves the investment. It just means the *companion* features are downstream of a different priority.

A supporting detail: the Nova Rock listing has been re-titled "Nova Rock Festival 2023", then 2024, 2025, 2026 — on the same package ID. The app is maintained as an annual campaign asset tied to one edition, not as a companion you keep on your phone between festivals. Several official apps in this category follow the same pattern, and some are rebuilt or emptied out entirely between editions.

**Inferred:** this is why official apps are frequently criticised for feeling thin between announcements, and why they rarely work well offline. Offline resilience matters to an attendee standing in a dead-signal field; it matters much less to a product whose core function requires a network connection anyway.

### The two festivals with nothing

Area 53 and Ernte Punk have **no app at all**. Not a bad app — none. Their attendees get a printed poster, a PDF, or a website. The next section explains why.

---

## 4. The white-label B2B market and its price floor

Below the tier that can afford Greencopper or Eventim sits a market of white-label vendors selling a festival-branded app as a product.

**FestiGuide**, built by Swiss-Development GmbH in Baden, Switzerland, publishes its pricing openly — which is unusually transparent for this sector and worth crediting:

| Tier | Price (per festival, per weekend/day, excl. VAT) |
|---|---|
| Basic | CHF 8,450 |
| Pro | CHF 14,450 |
| Custom | on request |

**Verified** from their public pricing page. The product is a genuine one: customisable programme, interactive GPS map, news feed, favourites, sponsor directory, admin backend with push notifications.

The number is the finding. **Roughly CHF 8,450 is the entry price for a small festival to have an app at all** — for a single edition. Note also that FestiGuide's own positioning line is "the better festival guide," which is a reminder that "better" is a crowded claim in this space.

Others in this tier include Festivawl's white-label offering (§5) and the larger platforms — Eventbase (Sundance, SXSW), Everfest, Front Gate Tickets.

**Inferred:** for a festival with a few thousand attendees and volunteer organisers, five figures per edition for an app is not a hard decision — it's not a decision at all. This is a structural exclusion, not an oversight. There is no version of the commercial market that serves Ernte Punk, because there is no margin in it.

---

## 5. The independent consumer apps

Distinct from the organiser-facing market, a small number of independent developers build multi-festival apps for attendees. These are the closest things to peers this project has, and both are good.

### festivalpilot

**Verified from the developer's own site and store listings.** Built by a solo developer trading as *70six*, based in Germany, who has been going to festivals since the early 1990s and previously ran a festival information site. Android package `de.seventysix.festivalpilot`; also on iOS.

- **93 festivals for the 2026 season**, across Germany, Austria, Switzerland, Belgium, Croatia and beyond — including Wacken, Rock am Ring, Tomorrowland and Sziget
- Three-phase model: planning (bookmark bands, clash detection, day plans), live mode (weather alerts, stage locations), recap (personal stats)
- Apple Watch and Wear OS support
- Packing lists, arrival planning, car/tent location markers, setlists
- **Offline capable. No account, no login, no passwords.**
- Self-hosted on German infrastructure (Hetzner, Nuremberg), GDPR-first, no ads
- Free, with a Pro tier the developer prices as "about one festival beer"

This is, by some distance, the most complete product in the independent tier, and the developer's privacy stance is sincere and well-documented. Anyone evaluating whether to use this project instead of festivalpilot should look at festivalpilot first — for most people today it is the better answer, and it covers roughly fifteen times as many festivals.

**Not open source.** No public repository; no mention of one anywhere on the site.

### Festivawl

**Verified from the company's own "our story" page and store listings.** A bootstrapped two-person team founded in 2022 — a product designer as CEO and a developer as CTO, building the mobile app in Flutter and the web app in React.

Their origin story is worth repeating because it's a sharp piece of market analysis: after a frustrating experience at a top-ten global festival, they tested **60 festival apps worldwide** and concluded that nearly all of them prioritised sponsors over fans. By their account, only Glastonbury's app met their standard. Their stated design question is "how does this make life easier for fans?"

The product: multi-festival, calendar view, timetable, "90% of the app available offline," on both iOS and Android. They also sell a white-label app to festivals — so they operate in both the consumer and B2B tiers.

**Not open source.**

### Others noted

Festival Dust, FEST, FestiPlannr, Setmine and several more occupy this space. We did not survey them in depth. Their existence reinforces the point: the enthusiast multi-festival niche is real and has multiple independent entrants.

### The common thread

Both leading independents make a strong privacy claim: your data stays on your device, we don't track you. Both claims appear entirely sincere, and there is no reason to doubt either team.

But both are **closed source**. Which means the claim is exactly that — a claim. A user who wants to *verify* it has no route to. That isn't a moral failing; closed source is a completely normal choice, and for a paid product it's often a necessary one. It does, however, leave one thing genuinely unoccupied.

---

## 6. Clashfinder and the community-data lineage

The most important thing this research turned up isn't a competitor. It's a predecessor.

**[Clashfinder](https://clashfinder.com/)** has been doing community-sourced festival timetables since roughly 2010. It's a free web tool for building and viewing festival running orders, and it covers a remarkable range: Glastonbury, Reading & Leeds, Coachella, Rock Werchter, Download, Bloodstock, Electric Picnic, Green Man, End of the Road, Latitude, WOMAD, OFF Festival, Bonnaroo and dozens more.

The mechanics are the interesting part:

- **The data is entered by users**, not licensed from organisers
- To qualify for "core" status, a clashfinder **must be editable by any user** — openness is enforced by the site's own rules
- Free, no ads, funded by donations
- Credited to a small group of hobbyists, with hosting donated

It is also, per its own site, under financial pressure from rising hosting costs.

**The lesson:** community-maintained festival schedule data is not a hypothesis. It has worked for about fifteen years, at scale, across dozens of major festivals, run by volunteers. If you've ever wondered whether people will actually contribute accurate timetable data for free — they demonstrably will, and have been doing so for longer than most festival apps have existed.

**Clashfinder is an ally, not a competitor.** It is web-only, with no native app and no offline mode. This project is offline-first with a static site that costs essentially nothing to host. The overlap is the data; the gap is everything either of us doesn't do. Interoperating — or at minimum linking to each other — serves both. That's a follow-up worth pursuing once this project is public.

A naming aside, since it comes up in §10: *Clashfinder* is coined from the subculture's own vocabulary. A "clash" is two acts you want to see playing at the same time. That's how you get a name that's short, distinctive, and instantly legible to the people who need it.

---

## 7. The open-source picture

We searched for open-source festival apps. What exists is real but sits in different categories:

| Project | What it is | Category |
|---|---|---|
| **festapp** (`vkh-cr/festapp`) | Event app for festivals and conferences — Android, iOS, web/PWA; offline; timetable on time × place axes | Organiser-side platform |
| **Hi.Events** | Event management and ticket selling, self-hostable | Ticketing |
| **Giggity** | Android reader for Pentabarf / frab / xcal / wafer schedule XML | Generic schedule reader |
| **Festivals-App** | "Cooperative, ethical and open source" festival app | iOS/macOS, low activity |
| **fusion-timetable** | Locked WebView for one festival's timetable | Single-purpose wrapper |

Two of these deserve specific respect. **festapp** is the most complete open-source event app we found, and if you're an organiser wanting to run your own, it's a serious option. **Giggity** is beloved in the hacker-conference world for exactly the right reasons — it consumes open schedule formats, it's deliberately unbranded, and it just works.

But note what none of them are: **a curated, multi-festival, fan-facing companion**. festapp and Hi.Events serve the organiser. Giggity serves any event that already publishes a machine-readable schedule in an open format — which almost no music festival does. The commercial festivals in this document publish PDFs, posters and HTML.

**Verified: there is no open-source equivalent to festivalpilot or Festivawl.** Nothing in the consumer multi-festival space is open.

---

## 8. The gap

Putting the pieces together:

| Tier | Who's served | Who serves them | Why the gap persists |
|---|---|---|---|
| Major festivals | Well | Greencopper/Leap, Eventim, Eventbase | — |
| Mid-size festivals | Adequately | White-label vendors from ~CHF 8,450/edition | — |
| **Small festivals** | **Not at all** | **Nobody** | No margin exists at that size |
| Multi-festival enthusiasts | Well | festivalpilot, Festivawl (closed source) | — |
| **Users who want to verify privacy claims** | **Not at all** | **Nobody** | Closed source is the norm |
| Community data contributors | Partly | Clashfinder (web-only, no app, funding-constrained) | — |

Two unoccupied positions, and they're the same position from two angles:

**1. Festivals too small to be a customer.** Area 53 and Ernte Punk aren't underserved because anyone made a bad decision. They're underserved because the cheapest commercial option costs more than their entire tech budget. A project with no revenue requirement has no floor — the marginal cost of adding a festival is a folder of JSON and a pull request. This is the one advantage that cannot be competed away, because competing for it means giving up your revenue model.

**2. Privacy that can be checked rather than believed.** Every serious app in this category promises no tracking. Those promises are, as far as we can tell, all being kept. But "trust us" is the only option on offer. An open repository turns the promise into something a suspicious person can go and read for themselves — and turns the festival data into something anyone can audit, correct, or take with them.

**Inferred:** neither incumbent can occupy these positions without abandoning their business model. Greencopper's revenue is the payment rail. FestiGuide's is per-festival licensing. Festivawl sells white-label apps to the same festivals. festivalpilot is a solo developer with a Pro tier who reasonably needs to keep his work his own. None of that is wrong. It just means the gap stays open.

---

## 9. What Open Festival Hub is — and is not

### Is

- **A companion app**, web and Android, for finding your way around a festival: lineup, timetable, clash detection, map, guide, favourites.
- **Multi-festival**, from one codebase. A festival is a folder of configuration and JSON, not a fork.
- **Offline-first.** Everything core works with zero signal — because that is the actual condition of an actual festival field.
- **Fully open source.** Code and data both. The privacy claim is inspectable.
- **Community-driven.** Adding a festival is a pull request. Fixing a wrong set time is a pull request.
- **Non-commercial.** No ads. No sponsored placement. No monetisation, now or later.
- **Anonymous.** No accounts, no login, no email, no phone number. All user data — favourites, notes, progress — stays in local storage on the device.

### Is not

This boundary is deliberate, and it is permanent:

> **Open Festival Hub will never handle ticketing, payments, cashless wristband top-up, entry scanning, or any function where failure strands an attendee at a gate. Those belong to the official app. This is a companion, not a replacement.**

The reasoning is threefold:

1. **Competence.** Payment and access control at festival scale is serious infrastructure with serious consequences. A volunteer project should not be in that business.
2. **Honesty.** The official app is genuinely better at the things it's built for. Attendees should use it for those things. Pretending otherwise would be a disservice.
3. **Liability.** A companion that shows a wrong set time is annoying. A payment system that fails is a catastrophe.

Also permanently excluded, for reasons of privacy and scope: no camera or QR scanning, no social feeds or photo walls, no user accounts, no analytics or data collection of any kind, and no server — the whole thing is a static site plus a bundled Android app.

### Honest limitations

To be published alongside everything above:

- We currently cover **six festivals.** festivalpilot covers 93. If you want breadth today, use festivalpilot.
- We have **no iOS app.** Web works on iOS; native does not exist.
- Our data is **hand-verified but unofficial.** We are not the organiser and we can be wrong. The official app is authoritative; when it disagrees with us, believe it.
- This is a **spare-time project.** It carries no uptime promise and no support commitment.

---

## 10. Naming: what the research ruled out

Recorded because the reasoning generalises to anyone naming an app.

The candidate name was "**Festival — but better**." It's funny, it's memorable, and every relevant domain was available. It was still the wrong choice, for four separate reasons:

**1. App store metadata policy.** Google Play prohibits promotional and superlative claims in app titles — "best", "top", "#1", "free" — enforced across metadata since 2021. Apple has tightened comparably on promotional language in app names. "But better" is literally a comparative performance claim. Not a guaranteed rejection, but exactly the shape that triggers manual review, and a name-driven rejection is expensive to unwind after you've printed the stickers.

**2. It can't be protected.** "Festival" is generic for a festival app; "but better" is laudatory. Combined, the mark has essentially no distinctive character and would likely be refused on absolute grounds at both EUIPO and the USPTO. Practical consequence: anyone could ship the identical name tomorrow.

**3. The phrase belongs to someone else culturally.** "But Better" is strongly associated with a well-known cooking series and cookbook. No legal conflict — different class entirely — but it means the phrase would never rank in search, and it reads as borrowed rather than coined.

**4. It's the wrong claim.** "Better than what?" invites a feature comparison against official apps that we would lose, on features we have deliberately chosen never to build. Our differentiator isn't being better; it's being *open*, and being available to festivals nobody else will serve.

It survives as a **tagline** — *"Festival apps, but better"* — where store policy and trademark law don't apply and the joke still lands.

**On short names generally:** we checked availability for a long list of short, real-word candidates on `.app` — mainstage, encore, lanyard, wristband, campfire, grounds, festa, headliner, sundown, tentpole and more. Every single one was registered. Short real words are not a naming choice in 2026; they're a purchase. Names that are short *and* available have to be coined — which, as Clashfinder demonstrates, is also how you get one that's actually distinctive.

---

## 11. Licensing rationale

Planned, and recorded here so the reasoning is public:

**Code: AGPL-3.0.** Copyleft is a deliberate fit for the stated values. A permissive licence would let anyone fork this, add trackers and advertising, and ship it closed — which would make the project's central promise meaningless. AGPL also closes the network case, so a closed re-host of the web app isn't possible either.

*Known trade-off:* GPL-family licences are incompatible with Apple's App Store terms, which forecloses a native iOS release under the same licence. This is a real cost, accepted knowingly. If iOS becomes a priority, MPL-2.0 is the alternative — file-level copyleft, App Store compatible, still prevents quietly closing modified files.

**Festival data: ODbL 1.0.** Timetable data is largely factual and thin on copyright, but the EU *sui generis* database right applies and this is an EU-based project. ODbL is the standard instrument and keeps derived databases open — which matters if this data is ever going to be genuinely shared.

---

## 12. Legal and ethical ground rules

Published because a project that asks to be trusted should show its working.

**Trademarks.** Festival names — Sziget, Nova Rock, FM4 Frequency, Rock am Ring and others — are trademarks belonging to their owners. We use them to identify *which festival a schedule describes*, which is nominative use. We do not use festival logos, wordmarks, or official artwork anywhere.

> Open Festival Hub is an independent, unofficial project. It is not affiliated with, endorsed by, or connected to any festival, organiser, or app vendor named in this document. All festival names and trademarks belong to their respective owners.

**Artist images.** Never downloaded, never re-hosted. Every image is hotlinked to its original source and displayed with a visible attribution watermark naming that source. If you own an image and want it gone, open an issue and it goes.

**Data sourcing.** Schedule data is compiled from festivals' own public announcements — official sites, published posters, official timetables. Sources and verification dates are recorded per festival. Automated collection respects `robots.txt` and stays gentle. We are guests on other people's servers.

**Corrections.** We will get things wrong. Wrong set times, missing acts, misread poster typography — all of it has already happened at least once. The correction path is a public issue or a pull request, and corrections are welcome from anyone, including from festivals and vendors named here. If anything in this document is inaccurate, tell us and it will be fixed with the change noted.

**On the companies described here.** Everything above is drawn from public sources and stated as neutrally as we could manage. Greencopper, Leap Event Technology, CTS Eventim, Swiss-Development, festivalpilot and Festivawl build good software for the people who pay them. Where this document identifies a gap, the gap is a consequence of business structure, not of anybody doing a bad job. The two independent developers in particular deserve credit rather than competition — they got there first, they're doing it well, and they're doing it honestly.

---

## 13. Open questions

Things we could not settle, and would welcome help with:

- **Install counts for competitor apps.** Google Play renders these client-side; our scrape returned contaminated values. Genuinely unknown. Anyone can check on a phone.
- **Whether Clashfinder wants to interoperate.** Not yet asked. Should be, once this repo is public.
- **Whether any small festival actually wants this.** Area 53 and Ernte Punk have no app; we have not asked their organisers whether they'd want one, or want ours. Building for people without talking to them is how projects go wrong.
- **What the official apps' data licensing position is.** Timetable facts are thin on copyright, but the EU database right is a live question and we have not had it assessed.
- **Whether "no monetisation, ever" survives contact with hosting costs.** Today the answer is easy: static hosting is free and there is no server. Clashfinder's experience suggests the answer gets harder with scale. Worth revisiting honestly rather than discovering it at the wrong moment.

---

## 14. Sources

All accessed 2026-07-25.

**Official festival apps**
- Sziget Festival — Google Play (`com.greencopper.android.sziget`)
- FM4 Frequency Festival — Google Play (`com.greencopper.fm4`)
- Nova Rock Festival 2026 — Google Play (`com.greencopper.novarock`)
- Rock am Ring — Google Play (`com.mlk.rockamring`)

**Vendors**
- Greencopper / Leap Event Technology — greencopper.com
- Patron Technology acquires Greencopper (Feb 2018) — TheTicketingBusiness News; FinSMEs; Hypebot
- FestiGuide — festiguide.app (pricing and impressum), Swiss-Development GmbH
- Eventbase — eventbase.com

**Independent apps**
- festivalpilot — festivalpilot.app (site, blog, impressum); Google Play `de.seventysix.festivalpilot`; App Store
- Festivawl — festivawl.com (including "our story" and "for festivals"); Google Play `com.festivawl.festivawl_mobile`

**Community**
- Clashfinder — clashfinder.com and clashfinder.com/list/

**Open source**
- `vkh-cr/festapp` · `HiEventsDev/Hi.Events` · Giggity · `Festivals-App` · `MasterMasius/fusion-timetable`

**Store policy and trademark**
- Google Play Console Help — Metadata policy
- Apptweak, AppRadar, MobileAction — analyses of Play and App Store metadata restrictions (2021–2026)
- EUIPO Guidelines — absolute grounds for refusal, distinctive character
- Gerben IP, JPG Legal — trademark Class 9 for software and app names

**Domain availability** — checked via RDAP, 2026-07-25.

---

*Corrections, additions and disagreement are all welcome. Open an issue.*
