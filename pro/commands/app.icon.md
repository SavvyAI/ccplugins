---
description: "Need an app icon? → Gathers context and generates using AI → Creates iOS/macOS Liquid Glass + Android adaptive icons"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion", "WebFetch"]
---

## Context

This command generates professional app icons using AI image generation, configured for iOS, macOS (with Liquid Glass support), and Android platforms. Works with Expo, native iOS/macOS, and Android projects.

**Supported backends (priority order):**
1. ComfyUI (local) - Free, private, requires running instance
2. Gemini Imagen - Requires `GOOGLE_API_KEY`
3. Grok Aurora - Requires `XAI_API_KEY`
4. Prompt-only mode - Fallback when no backend available

## Arguments

The user may provide:
- `[description]` - Text description of the desired icon
- `--inspiration <path>` - Path to an image for style inspiration

## Your Task

### Step 1: Gather App Context

1. **Check for app configuration:**
   ```bash
   # Look for app.json (Expo) or package.json
   cat app.json 2>/dev/null || cat package.json 2>/dev/null | jq '{name, description}'
   ```

2. **Extract app name and purpose** from the configuration

### Step 2: Collect Icon Requirements

If the user did NOT provide a description in their command:

Use `AskUserQuestion` to gather:

```
Question: "What should your app icon look like?"
Options:
- "Derive from app name/purpose" (let AI interpret)
- "Let me describe it" (user provides description)
- "I have an inspiration image" (user will provide path)
```

If user chooses to describe, prompt them for details.

If user has an inspiration image:
- Read and analyze the image for: colors, style, composition, mood
- Use these attributes to inform the generation prompt

### Step 3: Select Style

Use `AskUserQuestion`:

```
Question: "What visual style for the icon?"
Header: "Style"
Options:
- "minimalism" - Clean, Apple-inspired (2-3 colors)
- "glassy" - Premium glass aesthetic
- "gradient" - Vibrant gradients
- "neon" - Cyberpunk/futuristic
- "material" - Google Material Design
- "geometric" - Bold, angular compositions
```

### Step 4: Detect Available Backend

Check backends in order:

```bash
# 1. ComfyUI (check common ports)
COMFY_PORT=$(curl -s http://localhost:8188/system_stats >/dev/null 2>&1 && echo 8188 || \
             (curl -s http://localhost:8881/system_stats >/dev/null 2>&1 && echo 8881) || echo "")

# 2. API keys
[ -n "$GOOGLE_API_KEY" ] && echo "Gemini available"
[ -n "$XAI_API_KEY" ] && echo "Grok available"
```

Report which backend will be used. If none available, inform user:
```
No image generation backend detected.

Options:
- Start ComfyUI locally (recommended)
- Set GOOGLE_API_KEY for Gemini
- Set XAI_API_KEY for Grok

I'll generate an optimized prompt you can use manually.
```

### Step 5: Build Generation Prompt

Construct an optimized prompt:

```
"App icon for [APP_NAME], [DESCRIPTION].
Style: [STYLE]. [INSPIRATION_NOTES if any]
1024x1024, transparent background, centered composition,
no text, clean edges, suitable for iOS and Android app icon.
Professional quality, simple recognizable symbol."
```

Negative prompt:
```
"text, watermark, blurry, low quality, complex details, photorealistic, human faces"
```

### Step 6: Generate Icon

#### If ComfyUI available:

```bash
# Generate via ComfyUI API
curl -X POST "http://localhost:$COMFY_PORT/prompt" \
  -H "Content-Type: application/json" \
  -d @- << 'WORKFLOW'
{
  "prompt": {
    ... (see skill for full workflow JSON)
  }
}
WORKFLOW
```

Wait for generation, then find output:
```bash
ls -t ~/Documents/ComfyUI/output/app_icon*.png | head -1
```

#### If Gemini available:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:generateImages" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "YOUR_PROMPT",
    "config": {"numberOfImages": 1, "aspectRatio": "1:1"}
  }'
```

#### If prompt-only mode:

Output the optimized prompt for the user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIMIZED ICON PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Generated prompt here]

Negative: text, watermark, blurry, low quality

Settings: 1024x1024, transparent background

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this prompt in your preferred image generator,
then run this command again with the path to the
generated image to complete iOS/Android setup.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 7: Configure for Platforms

Once icon is generated (or user provides path):

```bash
# Ensure assets directory exists
mkdir -p assets

# Create iOS 26 .icon folder
mkdir -p assets/app-icon.icon/Assets
cp [ICON_PATH] assets/app-icon.icon/Assets/icon.png

# Create icon.json for Liquid Glass
cat > assets/app-icon.icon/icon.json << 'EOF'
{
  "fill": "automatic",
  "groups": [{
    "layers": [{
      "glass": false,
      "image-name": "icon.png",
      "name": "icon"
    }],
    "shadow": {"kind": "neutral", "opacity": 0.5},
    "translucency": {"enabled": true, "value": 0.5}
  }],
  "supported-platforms": {"circles": ["watchOS"], "squares": "shared"}
}
EOF

# Create Android adaptive icon (66% scaled)
convert [ICON_PATH] -resize 66% -gravity center -background transparent -extent 1024x1024 assets/android-icon.png
```

### Step 8: Update app.json

```bash
# Read current app.json
cat app.json | jq '.expo.ios.icon = "./assets/app-icon.icon" |
                   .expo.android.adaptiveIcon = {
                     "foregroundImage": "./assets/android-icon.png",
                     "backgroundImage": "./assets/android-icon.png",
                     "monochromeImage": "./assets/android-icon.png"
                   }' > app.json.tmp && mv app.json.tmp app.json
```

### Step 9: Generate macOS iconset (if applicable)

If the project is a native macOS app (detected via `.xcodeproj` or user indication):

```bash
# Generate all macOS icon sizes
mkdir -p AppIcon.iconset
sips -z 16 16     [ICON_PATH] --out AppIcon.iconset/icon_16x16.png
sips -z 32 32     [ICON_PATH] --out AppIcon.iconset/icon_16x16@2x.png
sips -z 32 32     [ICON_PATH] --out AppIcon.iconset/icon_32x32.png
sips -z 64 64     [ICON_PATH] --out AppIcon.iconset/icon_32x32@2x.png
sips -z 128 128   [ICON_PATH] --out AppIcon.iconset/icon_128x128.png
sips -z 256 256   [ICON_PATH] --out AppIcon.iconset/icon_128x128@2x.png
sips -z 256 256   [ICON_PATH] --out AppIcon.iconset/icon_256x256.png
sips -z 512 512   [ICON_PATH] --out AppIcon.iconset/icon_256x256@2x.png
sips -z 512 512   [ICON_PATH] --out AppIcon.iconset/icon_512x512.png
sips -z 1024 1024 [ICON_PATH] --out AppIcon.iconset/icon_512x512@2x.png

# Convert to .icns
iconutil -c icns AppIcon.iconset
```

### Step 10: Report Success

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APP ICON CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created:
  ✓ assets/app-icon.icon/       (iOS/macOS Liquid Glass)
  ✓ assets/android-icon.png     (Android adaptive)
  ✓ AppIcon.icns                (macOS legacy, if generated)
  ✓ app.json updated            (if Expo project)

For Expo:
  npx expo prebuild --clean
  npx expo run:ios
  npx expo run:android

For native macOS:
  - Drag app-icon.icon into Xcode Assets
  - Or use AppIcon.icns for legacy support

To refine with Liquid Glass effects:
  open assets/app-icon.icon  (opens in Xcode Icon Composer)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Notes

- Transparent backgrounds are critical for all platforms
- .icon folder format works for both iOS and macOS Liquid Glass
- Android needs 66% scaled version for adaptive icon safe area
- No text in icons - doesn't scale well
- For native macOS: use .icon folder (modern) or .icns file (legacy)
