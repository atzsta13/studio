# 🤖 Local AI Scout Guide (Gemma 4 on Android)

## 🌌 Overview
The Android app features a "Local AI Scout"—a native discovery engine that allows users to find artists using natural language prompts (e.g., *"I want something dark and industrial for a 2 AM rave"*). It works 100% offline.

---

### 🧱 Technical Components

#### 1. Google AI Edge SDK (`MediaPipe GenAI`)
We use the **MediaPipe LLM Inference API** to execute the model. 
- **Model**: `Gemma 4 E2B` (Quantized 4-bit).
- **Format**: `.bin` flatbuffer file.
- **Hardware**: Accelerated by the Snapdragon 8 Gen 4 NPU (Galaxy S25).

#### 2. The Model Downloader
To keep the initial APK size small, the model is not bundled.
- **Location**: `LocalScoutRepository.kt` handles the `downloadModel` logic.
- **Source**: Fetched from `${config.productionUrl}/ai/gemma4-2b-android.bin`.
- **Feedback**: A real-time `StateFlow<Float>` provides download progress to the `DiscoverScreen`.

#### 3. RAG-Lite (Context Injection)
Since the model is local, we cannot feed it the entire world of knowledge. Instead, we inject our local data as context:
```kotlin
val artistsContext = artists.joinToString("\n") { 
    "- ${it.artist} (${it.genres.joinToString()}): ${it.description}"
}
val fullPrompt = "You are the Scout... Here is the LINEUP: $artistsContext... USER: $prompt"
```

---

### 🛠️ Developer Maintenance

#### Updating the Model
If you need to switch to a different model (e.g., `Gemma 4 E4B` or a newer `Gemini Nano` variant):
1.  Upload the new `.bin` file to the production server.
2.  Update the `modelFileName` in `LocalScoutRepository.kt`.
3.  Ensure the new model matches the MediaPipe inference schema.

#### Performance Tuning
In `initializeLlm()`, you can adjust these parameters:
- **`setMaxTokens`**: Currently 512 (adjust based on UI response length needs).
- **`setTopK`**: Currently 40 (adjust for "Creativity" vs. "Precision").
- **`setTemperature`**: Currently 0.7 (higher = more experimental recommendations).

---

### ⚠️ Safety & Fallbacks
- **NPU Check**: The UI should check for NPU support before offering the download.
- **SOS Prohibition**: By architectural mandate, **AI must NEVER be used for emergency or security advice.** It is strictly a "Discovery & Vibe" tool.
