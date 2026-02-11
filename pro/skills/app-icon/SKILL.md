---
name: app-icon
description: Generate app icons for iOS, macOS, and Android apps with iOS 26 Liquid Glass support and Android adaptive icons. Use when creating or updating app icons using AI image generation. Works with Expo, native iOS/macOS, and Android projects.
---

<!--
  Source: https://github.com/code-with-beto/skills/tree/main/plugins/cwb-app-icon
  Original Author: Beto (codewithbeto.dev)
  License: MIT

  Modified to support multiple image generation backends (ComfyUI, Gemini, Grok)
  instead of SnapAI/OpenAI dependency.
-->

# App Icon Generation Workflow

## Overview

Generate professional app icons using AI and configure them for iOS, macOS (with iOS 26/macOS Liquid Glass support), and Android platforms. Works with Expo, native iOS/macOS, and Android projects.

## Supported Image Generation Backends

This skill supports multiple backends in priority order:

1. **ComfyUI** (local) - Free, private, best quality. Requires running instance with FLUX/SDXL model.
2. **Gemini Imagen** - Google's image generation. Requires `GOOGLE_API_KEY`.
3. **Grok Aurora** - xAI's image generation. Requires `XAI_API_KEY`.
4. **Prompt-only mode** - Outputs optimized prompt for manual generation when no backend available.

## Step 0: Gather Context and Requirements

Before generating, understand what icon to create:

1. **Read app context:**
   - Check `app.json` or `package.json` for app name and purpose
   - Understand the app's function and target audience

2. **Get description** (ask user if not provided):
   - "What should the app icon look like?"
   - "Describe the icon you envision"

3. **Check for inspiration image** (optional):
   - "Do you have an existing icon or image for style inspiration?"
   - If provided, analyze: colors, style, composition, mood

4. **Determine style preference:**
   - `minimalism` - Clean, Apple-inspired (2-3 colors max)
   - `glassy` - Premium glass aesthetic with semi-transparent elements
   - `gradient` - Vibrant gradients, Instagram-inspired
   - `neon` - Cyberpunk, futuristic with glowing effects
   - `material` - Google Material Design
   - `ios-classic` - Traditional iOS with subtle gradients
   - `pixel` - Retro 8-bit/16-bit game art style
   - `geometric` - Bold, angular compositions

## Step 1: Detect Available Backend

Check backends in order:

```bash
# 1. Check ComfyUI
curl -s http://localhost:8188/system_stats 2>/dev/null || curl -s http://localhost:8881/system_stats 2>/dev/null

# 2. Check for API keys
echo $GOOGLE_API_KEY  # Gemini
echo $XAI_API_KEY     # Grok
```

## Step 2: Generate Optimized Prompt

Combine gathered context into an optimized image generation prompt:

```
Template:
"App icon for [APP_NAME], [DESCRIPTION]. Style: [STYLE].
1024x1024, transparent background, centered composition,
no text, clean edges, suitable for iOS and Android app icon."

Example:
"App icon for PDF Pages, a document viewer that extracts pages from PDFs.
Style: minimalism. Clean document/page icon with subtle fold corner,
professional blue tones. 1024x1024, transparent background, centered
composition, no text, clean edges, suitable for iOS and Android app icon."
```

If inspiration image was provided, add style notes:
```
"Inspired by: [ANALYZED_COLORS], [STYLE_NOTES], [COMPOSITION_NOTES]"
```

## Step 3: Generate Icon

### Option A: ComfyUI (Local)

Use the ComfyUI API to generate:

```bash
# Submit workflow via API
curl -X POST "http://localhost:8881/prompt" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "3": {
        "class_type": "KSampler",
        "inputs": {
          "seed": RANDOM_SEED,
          "steps": 20,
          "cfg": 7.5,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        }
      },
      "4": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {"ckpt_name": "flux1-schnell.safetensors"}
      },
      "5": {
        "class_type": "EmptyLatentImage",
        "inputs": {"width": 1024, "height": 1024, "batch_size": 1}
      },
      "6": {
        "class_type": "CLIPTextEncode",
        "inputs": {"text": "YOUR_PROMPT", "clip": ["4", 1]}
      },
      "7": {
        "class_type": "CLIPTextEncode",
        "inputs": {"text": "text, watermark, blurry, low quality", "clip": ["4", 1]}
      },
      "8": {
        "class_type": "VAEDecode",
        "inputs": {"samples": ["3", 0], "vae": ["4", 2]}
      },
      "9": {
        "class_type": "SaveImage",
        "inputs": {"filename_prefix": "app_icon", "images": ["8", 0]}
      }
    }
  }'
```

### Option B: Gemini Imagen

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:generateImages" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "YOUR_PROMPT",
    "config": {
      "numberOfImages": 1,
      "aspectRatio": "1:1"
    }
  }'
```

### Option C: Prompt-Only Mode

If no backend available, output the optimized prompt for the user to use manually in their preferred tool.

## Step 4: Create iOS 26 .icon Folder Structure

Create the new iOS 26 Liquid Glass icon format:

```bash
# Create folder structure
mkdir -p assets/app-icon.icon/Assets

# Copy generated PNG (adjust filename as needed)
cp [GENERATED_ICON].png assets/app-icon.icon/Assets/icon.png
```

Create `assets/app-icon.icon/icon.json`:

```json
{
  "fill": "automatic",
  "groups": [
    {
      "layers": [
        {
          "glass": false,
          "image-name": "icon.png",
          "name": "icon"
        }
      ],
      "shadow": {
        "kind": "neutral",
        "opacity": 0.5
      },
      "translucency": {
        "enabled": true,
        "value": 0.5
      }
    }
  ],
  "supported-platforms": {
    "circles": ["watchOS"],
    "squares": "shared"
  }
}
```

## Step 5: Create Android-Optimized Adaptive Icon

Android adaptive icons have a smaller safe area (~66% of canvas). Scale the icon:

```bash
# Using ImageMagick
convert [GENERATED_ICON].png \
  -resize 66% \
  -gravity center \
  -background transparent \
  -extent 1024x1024 \
  assets/android-icon.png
```

If ImageMagick not installed:
```bash
brew install imagemagick
```

## Step 6: Update app.json

### For iOS:
```json
{
  "expo": {
    "ios": {
      "icon": "./assets/app-icon.icon"
    }
  }
}
```

### For Android:
```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon.png",
        "backgroundImage": "./assets/android-icon.png",
        "monochromeImage": "./assets/android-icon.png"
      }
    }
  }
}
```

## Step 7: Verify and Test

```bash
# Verify folder structure
ls -la assets/app-icon.icon/

# Verify app.json is valid
cat app.json | jq .

# Test the app
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## Important Notes

- **Transparent background is critical** for iOS/macOS Liquid Glass and Android adaptive icons
- **1024x1024 resolution** is required
- **Dual-asset workflow**: Main icon for iOS/macOS, scaled 66% version for Android safe areas
- **No text in icon** - text doesn't scale well across icon sizes
- **.icon folder format** works for both iOS and macOS apps (Xcode handles both)

## macOS-Specific Usage

For native macOS apps, the `.icon` folder format works the same way:

1. **Add to Xcode project:**
   - Drag `app-icon.icon` folder into your Xcode project's Assets
   - Or copy to `YourApp/Assets.xcassets/AppIcon.appiconset/`

2. **Using Icon Composer (Xcode):**
   - Double-click the `.icon` folder to open in Icon Composer
   - Adjust Liquid Glass effects, shadows, translucency
   - macOS and iOS share the same icon format in iOS 26+/macOS 26+

3. **For older macOS versions:**
   - Generate iconset with multiple sizes:
   ```bash
   mkdir -p AppIcon.iconset
   sips -z 16 16     icon.png --out AppIcon.iconset/icon_16x16.png
   sips -z 32 32     icon.png --out AppIcon.iconset/icon_16x16@2x.png
   sips -z 32 32     icon.png --out AppIcon.iconset/icon_32x32.png
   sips -z 64 64     icon.png --out AppIcon.iconset/icon_32x32@2x.png
   sips -z 128 128   icon.png --out AppIcon.iconset/icon_128x128.png
   sips -z 256 256   icon.png --out AppIcon.iconset/icon_128x128@2x.png
   sips -z 256 256   icon.png --out AppIcon.iconset/icon_256x256.png
   sips -z 512 512   icon.png --out AppIcon.iconset/icon_256x256@2x.png
   sips -z 512 512   icon.png --out AppIcon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out AppIcon.iconset/icon_512x512@2x.png
   iconutil -c icns AppIcon.iconset
   ```

## Troubleshooting

### ComfyUI Issues
- Ensure ComfyUI is running (`curl http://localhost:8881/system_stats`)
- Verify checkpoint model is loaded
- Check ComfyUI console for errors

### Icon Display Issues
- Verify paths in app.json match actual file locations
- Ensure PNG is exactly 1024x1024
- Run `npx expo prebuild --clean` after icon changes

### ImageMagick Issues
- Install with `brew install imagemagick`
- Try reducing resize from 66% to 60% if icon still clips on Android
