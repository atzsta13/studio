package org.openfestivalhub.data.model

import kotlinx.serialization.Serializable

@Serializable
data class GuideItem(
    val title: String,
    val content: String
)

@Serializable
data class GuideSection(
    val id: String? = null,
    val title: String,
    val icon: String,
    val items: List<GuideItem>
)

@Serializable
data class GuideData(
    val title: String,
    val description: String,
    val sections: List<GuideSection>
)
