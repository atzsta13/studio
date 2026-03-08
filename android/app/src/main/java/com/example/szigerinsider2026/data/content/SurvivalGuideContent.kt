package com.example.szigerinsider2026.data.content

data class GuideSection(
    val id: String,
    val icon: String,
    val title: String,
    val items: List<String>
)

val SURVIVAL_SECTIONS = listOf(
    GuideSection("transport", "🚌", "GETTING THERE", listOf(
        "Shuttle buses run from Budapest Keleti station hourly from Aug 6",
        "Boat transfers available from central Budapest piers",
        "Taxi/Uber: ~20 min from city center, pre-book for return",
        "Bike parking available at all festival gates — free"
    )),
    GuideSection("money", "💶", "MONEY & ATMs", listOf(
        "ATMs located near the Main Stage and Colosseum areas",
        "Most vendors accept card but have HUF cash as backup",
        "1 EUR ≈ 400 HUF (check current rate in Tools tab)",
        "Festival wristbands do NOT have cashless payment in 2026",
        "Withdraw cash before entering — ATM queues grow Friday–Saturday"
    )),
    GuideSection("safety", "🏥", "STAYING SAFE", listOf(
        "Medical tent: near the Main Gate and World Music Stage",
        "Lost & Found: Main Gate info point, open 10:00–22:00 daily",
        "Buddy system: set a meeting point with your group on arrival",
        "Security guards speak English — approach any yellow vest",
        "Emergency number in Hungary: 112"
    )),
    GuideSection("camping", "⛺", "CAMPING RULES", listOf(
        "Quiet hours: 06:00–10:00 in all camping zones",
        "No generators, gas stoves, or open fires in camping areas",
        "Charging stations available in the ISLAND CAMP zone (fee applies)",
        "Mark your tent with something unique — zones look identical at 3am",
        "Ground sheets required — the grass gets muddy fast"
    )),
    GuideSection("hungarian", "🇭🇺", "HUNGARIAN PHRASES", listOf(
        "Kérek egy sört • keh-rek egg-y shurt • I'd like a beer",
        "Mennyibe kerül? • men-yee-beh keh-rool • How much does it cost?",
        "Hol a toalett? • hole a toh-ah-let • Where is the toilet?",
        "Köszönöm • kuh-suh-nuhm • Thank you",
        "Segítség! • sheh-geet-shayg • Help!",
        "Jó zenét! • yo zeh-nayt • Good music! (festival toast)",
        "Víz, legyen szíves • veez leh-dyen see-vesh • Water, please",
        "Elvesztem • el-ves-tem • I am lost",
        "Ez fantasztikus! • ez fan-tas-tee-koosh • This is fantastic!"
    )),
    GuideSection("rules", "📋", "FESTIVAL RULES", listOf(
        "No re-entry after 02:00 — plan your nights accordingly",
        "Wristband required at all times — do not remove",
        "Banned: glass bottles, professional cameras with detachable lens, drones",
        "Allowed: reusable cups, small backpacks, sunscreen (no aerosol)",
        "Pets not permitted anywhere on the island"
    )),
    GuideSection("connectivity", "📶", "CONNECTIVITY", listOf(
        "Free WiFi hotspots near the info points and food areas",
        "Network gets congested Saturday night — download offline maps now",
        "Recommended offline app: Maps.me with Budapest island area cached",
        "Power banks are essential — charging stations have 2hr queues peak days"
    )),
    GuideSection("eco", "♻️", "ECO TIPS", listOf(
        "Bring a reusable cup — vendors give small discount",
        "Water refill stations: cyan tap symbol on island map",
        "Designated recycling bins: blue (plastic), green (glass), grey (general)",
        "Leave No Trace: your campsite should be cleaner than you found it"
    ))
)
