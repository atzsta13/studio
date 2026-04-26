# Chrome DevTools MCP Integration

This document outlines the research and potential integration of the `chrome-devtools-mcp` (Model Context Protocol) server within the Festival Insider Platform.

## Overview
`chrome-devtools-mcp` is an open-source bridge developed by the Chrome DevTools team that allows AI agents to control, inspect, and debug live Google Chrome instances. It leverages Puppeteer and the Chrome DevTools Protocol (CDP) to expose browser capabilities as standardized MCP tools.

## Key Capabilities
- **Browser Automation:** Reliable page navigation, element interaction (clicks, typing), and UI stability waiting.
- **Deep Inspection:** DOM snapshots, network request monitoring, and console log capture (with source-map support).
- **Performance Auditing:** Recording performance traces and extracting Web Vitals/CrUX data.
- **Environment Emulation:** Device viewports, network throttling, and geolocation mocking.
- **Runtime Execution:** Executing arbitrary JavaScript within the page context.
- **Memory Analysis:** Capturing heap snapshots to identify memory leaks in complex SPA environments.

## Potential Applications for Festival Insider

### 1. Cross-Festival UI Verification
Given the **White-Label** nature of this project, we can use these tools to automatically verify that theme configurations (colors, fonts, brutalist aesthetics) render correctly across all 5+ festival deployments.

### 2. Performance Benchmarking
Since the platform is designed for **On-Site Survival**, performance is critical. We can automate performance audits to ensure:
- Low Cumulative Layout Shift (CLS) for the Timetable.
- Fast Largest Contentful Paint (LCP) for the Artist pages.
- Minimal main-thread blocking during "offline-first" hydration.

### 3. Automated Data Verification
The AI can navigate the official festival sites (e.g., `szigetfestival.com`) to compare the live "Stage" and "Day" tags against our local `lineup.json` in real-time, identifying data drifts before they affect users.

### 4. Debugging Complex Interactions
For hardware-linked features or complex React 19 / Next.js 16 hydration issues, the MCP server provides a high-fidelity environment to capture screenshots and stack traces that are otherwise invisible to static analysis.

## Technical Requirements
- **Runtime:** Node.js v20.19+
- **Protocol:** MCP (Model Context Protocol) via stdio or SSE.
- **Dependencies:** Puppeteer, Chrome DevTools Protocol.

## Integration Path
To use this with Gemini CLI:
1. Install the MCP server: `npm install -g @chromedevtools/mcp-server`
2. Configure the CLI to recognize the MCP server (refer to Gemini CLI / MCP documentation).
3. Invoke browser tools during the **Validation** phase of the development lifecycle.

---
*Created: April 2026*
