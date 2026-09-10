import os
import math
from PIL import Image, ImageDraw

def create_svg_favicon():
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="favBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#081220"/>
      <stop offset="100%" stop-color="#040912"/>
    </linearGradient>
  </defs>

  <!-- Circular Nautical Base -->
  <circle cx="32" cy="32" r="30" fill="url(#favBg)" stroke="#1e3a5f" stroke-width="1.8"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#132742" stroke-width="1" stroke-dasharray="2 2"/>

  <!-- Compass Cardinal Crosshairs -->
  <line x1="32" y1="6" x2="32" y2="58" stroke="#0f2b4c" stroke-width="1"/>
  <line x1="6" y1="32" x2="58" y2="32" stroke="#0f2b4c" stroke-width="1"/>

  <!-- 8-Point Compass Rose Facets -->
  <!-- North Arrow -->
  <polygon points="32,9 32,32 27,32" fill="#0284c7"/>
  <polygon points="32,9 32,32 37,32" fill="#38bdf8"/>
  <!-- South Arrow -->
  <polygon points="32,55 32,32 27,32" fill="#0f2238"/>
  <polygon points="32,55 32,32 37,32" fill="#1e3a5f"/>
  <!-- East Arrow -->
  <polygon points="55,32 32,32 32,27" fill="#38bdf8"/>
  <polygon points="55,32 32,32 32,37" fill="#0284c7"/>
  <!-- West Arrow -->
  <polygon points="9,32 32,32 32,27" fill="#1e3a5f"/>
  <polygon points="9,32 32,32 32,37" fill="#0f2238"/>

  <!-- Intercardinal Corner Points -->
  <polygon points="48,16 32,32 34,26" fill="#0284c7" opacity="0.85"/>
  <polygon points="48,16 32,32 40,30" fill="#38bdf8" opacity="0.85"/>
  <polygon points="16,16 32,32 26,26" fill="#162e4a" opacity="0.85"/>
  <polygon points="16,16 32,32 24,30" fill="#0f2238" opacity="0.85"/>
  <polygon points="48,48 32,32 34,38" fill="#162e4a" opacity="0.85"/>
  <polygon points="48,48 32,32 40,34" fill="#0f2238" opacity="0.85"/>
  <polygon points="16,48 32,32 26,38" fill="#0f2238" opacity="0.85"/>
  <polygon points="16,48 32,32 24,34" fill="#162e4a" opacity="0.85"/>

  <!-- True North Gold Marker -->
  <polygon points="32,5 34,8 30,8" fill="#f59e0b"/>

  <!-- Central Telemetry Transducer Core -->
  <circle cx="32" cy="32" r="7" fill="#050e1c" stroke="#38bdf8" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="3.5" fill="#f59e0b"/>
  <circle cx="31" cy="31" r="1" fill="#ffffff"/>
</svg>
"""

def create_svg_logo_mark():
    # Build 36 azimuth degree ticks
    ticks_svg = []
    cx, cy = 128, 128
    for deg in range(0, 360, 10):
        rad = math.radians(deg)
        is_major = (deg % 30 == 0)
        is_cardinal = (deg % 90 == 0)
        
        r_outer = 116
        r_inner = 104 if is_cardinal else (107 if is_major else 110)
        col = "#38bdf8" if is_cardinal else ("#0284c7" if is_major else "#1e3a5f")
        width = 2.0 if is_cardinal else (1.4 if is_major else 0.9)
        
        x1 = cx + r_outer * math.sin(rad)
        y1 = cy - r_outer * math.cos(rad)
        x2 = cx + r_inner * math.sin(rad)
        y2 = cy - r_inner * math.cos(rad)
        ticks_svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col}" stroke-width="{width}"/>')

    ticks_str = "\n    ".join(ticks_svg)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="markGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a182d"/>
      <stop offset="70%" stop-color="#071120"/>
      <stop offset="100%" stop-color="#030811"/>
    </radialGradient>
    <linearGradient id="northFacetL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#034d82"/>
    </linearGradient>
    <linearGradient id="northFacetR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>

  <!-- Deep Nautical Base -->
  <circle cx="128" cy="128" r="122" fill="url(#markGrad)" stroke="#1e3454" stroke-width="2"/>
  
  <!-- Outer Azimuth Scale Rings -->
  <circle cx="128" cy="128" r="116" fill="none" stroke="#1b3353" stroke-width="1.5"/>
  <circle cx="128" cy="128" r="104" fill="none" stroke="#12253f" stroke-width="1.2"/>
  <circle cx="128" cy="128" r="94" fill="none" stroke="#0e1d32" stroke-width="1" stroke-dasharray="3 4"/>

  <!-- Azimuth Dial Graduations (360 degrees) -->
  <g id="azimuth-ticks">
    {ticks_str}
  </g>

  <!-- Bathymetric Depth Contours (Sub-surface Isobaths in Southern Quadrant) -->
  <path d="M 44,140 C 70,165 110,168 128,158 C 146,148 186,165 212,140" fill="none" stroke="#034d82" stroke-width="1.8" opacity="0.6"/>
  <path d="M 36,155 C 68,185 112,188 128,178 C 144,168 188,185 220,155" fill="none" stroke="#0284c7" stroke-width="1.5" opacity="0.5"/>
  <path d="M 52,175 C 80,205 114,204 128,198 C 142,192 176,205 204,175" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.4"/>

  <!-- Compass Rose 8-Point Navigational Architecture -->
  <!-- Intercardinal Points (NE, SE, SW, NW) - Reach r=68 -->
  <!-- NE -->
  <polygon points="176,80 128,128 135,110" fill="#0284c7" opacity="0.9"/>
  <polygon points="176,80 128,128 146,121" fill="#38bdf8" opacity="0.9"/>
  <!-- NW -->
  <polygon points="80,80 128,128 110,121" fill="#142a47" opacity="0.9"/>
  <polygon points="80,80 128,128 121,110" fill="#0e1f36" opacity="0.9"/>
  <!-- SE -->
  <polygon points="176,176 128,128 146,135" fill="#0e1f36" opacity="0.9"/>
  <polygon points="176,176 128,128 135,146" fill="#142a47" opacity="0.9"/>
  <!-- SW -->
  <polygon points="80,176 128,128 121,146" fill="#0e1f36" opacity="0.9"/>
  <polygon points="80,176 128,128 110,135" fill="#142a47" opacity="0.9"/>

  <!-- Cardinal Points (N, S, E, W) - Reach r=94 -->
  <!-- South Point -->
  <polygon points="128,222 128,128 114,128" fill="#0d1c30"/>
  <polygon points="128,222 128,128 142,128" fill="#162e4d"/>
  <!-- West Point -->
  <polygon points="34,128 128,128 128,114" fill="#162e4d"/>
  <polygon points="34,128 128,128 128,142" fill="#0d1c30"/>
  <!-- East Point -->
  <polygon points="222,128 128,128 128,114" fill="#38bdf8"/>
  <polygon points="222,128 128,128 128,142" fill="#0284c7"/>
  <!-- North Point (Prominent Cardinal Beacon) -->
  <polygon points="128,34 128,128 114,128" fill="url(#northFacetL)"/>
  <polygon points="128,34 128,128 142,128" fill="url(#northFacetR)"/>

  <!-- True North Gold Arrowhead / Diamond -->
  <polygon points="128,20 134,30 128,26 122,30" fill="#f59e0b"/>
  <line x1="128" y1="12" x2="128" y2="20" stroke="#f59e0b" stroke-width="2"/>

  <!-- In-Situ Sonar Acoustic Propagation Rings -->
  <circle cx="128" cy="128" r="32" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3 4" opacity="0.6"/>
  <circle cx="128" cy="128" r="44" fill="none" stroke="#0284c7" stroke-width="1" stroke-dasharray="4 6" opacity="0.35"/>

  <!-- Central Scientific Sensor / Argo Telemetry Core -->
  <circle cx="128" cy="128" r="16" fill="#061224" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="128" cy="128" r="8" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
  <circle cx="125" cy="125" r="2.5" fill="#ffffff" opacity="0.95"/>
</svg>
"""

def create_svg_full_logo():
    # Mini version of the emblem for left side (centered at x=64, y=65, radius=48)
    ticks_svg = []
    cx, cy = 64, 65
    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        is_cardinal = (deg % 90 == 0)
        r_outer = 48
        r_inner = 42 if is_cardinal else 45
        col = "#38bdf8" if is_cardinal else "#1e3a5f"
        w = 1.6 if is_cardinal else 0.8
        x1 = cx + r_outer * math.sin(rad)
        y1 = cy - r_outer * math.cos(rad)
        x2 = cx + r_inner * math.sin(rad)
        y2 = cy - r_inner * math.cos(rad)
        ticks_svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col}" stroke-width="{w}"/>')

    ticks_str = "\n    ".join(ticks_svg)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 130" width="680" height="130">
  <defs>
    <radialGradient id="logoEmblemBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a182d"/>
      <stop offset="80%" stop-color="#06101e"/>
      <stop offset="100%" stop-color="#030811"/>
    </radialGradient>
    <linearGradient id="logoNorthL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#034d82"/>
    </linearGradient>
    <linearGradient id="logoNorthR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>

  <!-- Left: Institutional Navigational Emblem -->
  <g id="emblem-group">
    <!-- Base Shield -->
    <circle cx="64" cy="65" r="50" fill="url(#logoEmblemBg)" stroke="#1e3454" stroke-width="1.5"/>
    <circle cx="64" cy="65" r="48" fill="none" stroke="#1b3353" stroke-width="1"/>
    <circle cx="64" cy="65" r="42" fill="none" stroke="#12253f" stroke-width="0.8"/>

    <!-- Azimuth Ticks -->
    <g id="emblem-ticks">
      {ticks_str}
    </g>

    <!-- Bathymetry Curves -->
    <path d="M 30,71 C 42,82 56,83 64,79 C 72,75 86,82 98,71" fill="none" stroke="#0284c7" stroke-width="1.2" opacity="0.6"/>
    <path d="M 26,79 C 40,92 58,93 64,89 C 70,85 88,92 102,79" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.4"/>

    <!-- Intercardinal Points -->
    <polygon points="84,45 64,65 67,57" fill="#0284c7" opacity="0.9"/>
    <polygon points="84,45 64,65 72,62" fill="#38bdf8" opacity="0.9"/>
    <polygon points="44,45 64,65 56,62" fill="#142a47" opacity="0.9"/>
    <polygon points="44,45 64,65 61,57" fill="#0e1f36" opacity="0.9"/>
    <polygon points="84,85 64,65 72,68" fill="#0e1f36" opacity="0.9"/>
    <polygon points="84,85 64,65 67,73" fill="#142a47" opacity="0.9"/>
    <polygon points="44,85 64,65 61,73" fill="#0e1f36" opacity="0.9"/>
    <polygon points="44,85 64,65 56,68" fill="#142a47" opacity="0.9"/>

    <!-- Cardinal Points (N, S, E, W) -->
    <!-- South -->
    <polygon points="64,103 64,65 58,65" fill="#0d1c30"/>
    <polygon points="64,103 64,65 70,65" fill="#162e4d"/>
    <!-- West -->
    <polygon points="26,65 64,65 64,59" fill="#162e4d"/>
    <polygon points="26,65 64,65 64,71" fill="#0d1c30"/>
    <!-- East -->
    <polygon points="102,65 64,65 64,59" fill="#38bdf8"/>
    <polygon points="102,65 64,65 64,71" fill="#0284c7"/>
    <!-- North Point -->
    <polygon points="64,27 64,65 58,65" fill="url(#logoNorthL)"/>
    <polygon points="64,27 64,65 70,65" fill="url(#logoNorthR)"/>

    <!-- North Gold Pip -->
    <polygon points="64,20 67,25 64,23 61,25" fill="#f59e0b"/>

    <!-- Sonar Ring & Telemetry Core -->
    <circle cx="64" cy="65" r="14" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 3" opacity="0.7"/>
    <circle cx="64" cy="65" r="7.5" fill="#061224" stroke="#38bdf8" stroke-width="1.8"/>
    <circle cx="64" cy="65" r="3.8" fill="#f59e0b"/>
    <circle cx="62.5" cy="63.5" r="1.2" fill="#ffffff"/>
  </g>

  <!-- Vertical Hairline Divider -->
  <line x1="130" y1="22" x2="130" y2="108" stroke="#1e293b" stroke-width="1.2"/>

  <!-- Right: Official Typography & Institutional Credentials -->
  <g transform="translate(148, 0)">
    <!-- Header Line: Real-World Credentials -->
    <g transform="translate(0, 32)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="9.5" font-weight="700" fill="#475569" letter-spacing="1.6">
        OCEANOGRAPHIC DIGITAL TWIN • MARITIME OBSERVATION
      </text>
      <!-- Operational Tag -->
      <rect x="375" y="-10" width="105" height="15" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
      <text x="382" y="1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" fill="#e2e8f0" letter-spacing="1.0">
        OPERATIONAL v2.4
      </text>
    </g>

    <!-- Main Title: SAMUDRADRISHTI -->
    <g transform="translate(0, 72)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="32" font-weight="800" fill="#0f172a" letter-spacing="2.8">
        SAMUDRA<tspan fill="#005a9c">DRISHTI</tspan>
      </text>
    </g>

    <!-- Subtitle: Scientific Mission -->
    <g transform="translate(0, 98)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b" letter-spacing="1.4">
        3D OCEAN DIGITAL TWIN &amp; IN-SITU OBSERVATION PLATFORM
      </text>
    </g>
  </g>
</svg>
"""

def generate_raster_assets(public_dir, app_dir):
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2

    # Draw dark circular background
    r_bg = 240
    draw.ellipse([cx - r_bg, cy - r_bg, cx + r_bg, cy + r_bg], fill=(7, 16, 29, 255), outline=(30, 52, 84, 255), width=4)

    # Concentric Azimuth Dial Rings
    draw.ellipse([cx - 228, cy - 228, cx + 228, cy + 228], outline=(27, 51, 83, 255), width=3)
    draw.ellipse([cx - 204, cy - 204, cx + 204, cy + 204], outline=(18, 37, 63, 255), width=2)
    
    # 36 Azimuth Dial Graduations
    for deg in range(0, 360, 10):
        rad = math.radians(deg)
        is_cardinal = (deg % 90 == 0)
        is_major = (deg % 30 == 0)
        
        r_out = 228
        r_in = 204 if is_cardinal else (210 if is_major else 216)
        col = (56, 189, 248, 255) if is_cardinal else ((2, 132, 199, 255) if is_major else (30, 58, 95, 255))
        w = 4 if is_cardinal else (3 if is_major else 2)
        
        x1 = cx + r_out * math.sin(rad)
        y1 = cy - r_out * math.cos(rad)
        x2 = cx + r_in * math.sin(rad)
        y2 = cy - r_in * math.cos(rad)
        draw.line([x1, y1, x2, y2], fill=col, width=w)

    # Sub-surface Bathymetric Depth Waves in Lower Half
    for offset, col in [(25, (3, 77, 130, 200)), (55, (2, 132, 199, 180)), (85, (56, 189, 248, 150))]:
        pts = []
        for x in range(cx - 170, cx + 171, 6):
            prog = (x - (cx - 170)) / 340.0
            sine_wave = math.sin(prog * math.pi * 2) * 18
            y = cy + offset + sine_wave
            pts.append((x, y))
        draw.line(pts, fill=col, width=3)

    # 8-Point Compass Rose Facets
    # Intercardinal points (NE, NW, SE, SW) - Reach r=135
    inter_r = 135
    for deg, is_dark in [(45, False), (135, True), (225, True), (315, True)]:
        rad = math.radians(deg)
        tx = cx + inter_r * math.sin(rad)
        ty = cy - inter_r * math.cos(rad)
        
        rad_l = math.radians(deg - 22.5)
        rad_r = math.radians(deg + 22.5)
        lx = cx + 38 * math.sin(rad_l)
        ly = cy - 38 * math.cos(rad_l)
        rx = cx + 38 * math.sin(rad_r)
        ry = cy - 38 * math.cos(rad_r)
        
        c_left = (2, 132, 199, 240) if not is_dark else (14, 31, 54, 240)
        c_right = (56, 189, 248, 240) if not is_dark else (20, 42, 71, 240)
        draw.polygon([(tx, ty), (cx, cy), (lx, ly)], fill=c_left)
        draw.polygon([(tx, ty), (cx, cy), (rx, ry)], fill=c_right)

    # Cardinal points (N, S, E, W) - Reach r=185
    card_r = 185
    base_w = 40
    # South
    draw.polygon([(cx, cy + card_r), (cx, cy), (cx - base_w, cy)], fill=(13, 28, 48, 255))
    draw.polygon([(cx, cy + card_r), (cx, cy), (cx + base_w, cy)], fill=(22, 46, 77, 255))
    # West
    draw.polygon([(cx - card_r, cy), (cx, cy), (cx, cy - base_w)], fill=(22, 46, 77, 255))
    draw.polygon([(cx - card_r, cy), (cx, cy), (cx, cy + base_w)], fill=(13, 28, 48, 255))
    # East
    draw.polygon([(cx + card_r, cy), (cx, cy), (cx, cy - base_w)], fill=(56, 189, 248, 255))
    draw.polygon([(cx + card_r, cy), (cx, cy), (cx, cy + base_w)], fill=(2, 132, 199, 255))
    # North
    draw.polygon([(cx, cy - card_r), (cx, cy), (cx - base_w, cy)], fill=(2, 132, 199, 255))
    draw.polygon([(cx, cy - card_r), (cx, cy), (cx + base_w, cy)], fill=(56, 189, 248, 255))

    # True North Gold Arrow / Diamond
    draw.polygon([(cx, cy - card_r - 26), (cx + 12, cy - card_r - 8), (cx, cy - card_r - 14), (cx - 12, cy - card_r - 8)], fill=(245, 158, 11, 255))
    draw.line([cx, cy - card_r - 40, cx, cy - card_r - 26], fill=(245, 158, 11, 255), width=3)

    # Concentric Acoustic Sonar Range Rings
    draw.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], outline=(56, 189, 248, 140), width=2)
    draw.ellipse([cx - 90, cy - 90, cx + 90, cy + 90], outline=(2, 132, 199, 90), width=2)

    # Central In-Situ Sensor Hub / Argo Beacon
    draw.ellipse([cx - 32, cy - 32, cx + 32, cy + 32], fill=(6, 18, 36, 255), outline=(56, 189, 248, 255), width=5)
    draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(245, 158, 11, 255), outline=(217, 119, 6, 255), width=2)
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 255, 255, 240))

    # Save 512x512 PNG
    logo_512_path = os.path.join(public_dir, "logo-512.png")
    img.save(logo_512_path, format="PNG")
    print(f"Saved {logo_512_path}")

    # Save Apple Touch Icon (180x180)
    apple_img = img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(public_dir, "apple-touch-icon.png")
    apple_img.save(apple_path, format="PNG")
    print(f"Saved {apple_path}")

    # Save to Next.js app directory
    app_apple_path = os.path.join(app_dir, "apple-icon.png")
    apple_img.save(app_apple_path, format="PNG")
    print(f"Saved {app_apple_path}")

    # Save Multi-resolution ICO (16x16, 32x32, 48x48)
    ico_path = os.path.join(public_dir, "favicon.ico")
    img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Saved {ico_path}")

    app_ico_path = os.path.join(app_dir, "favicon.ico")
    img.save(app_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Saved {app_ico_path}")

def main():
    base_dir = r"c:\Users\agamp\Downloads\SamudraDrishti\client"
    public_dir = os.path.join(base_dir, "public")
    app_dir = os.path.join(base_dir, "src", "app")

    # 1. Favicon SVG
    fav_svg = create_svg_favicon()
    fav_path = os.path.join(public_dir, "favicon.svg")
    with open(fav_path, "w", encoding="utf-8") as f:
        f.write(fav_svg)
    print(f"Saved {fav_path}")

    # Next.js app/icon.svg
    app_icon_path = os.path.join(app_dir, "icon.svg")
    with open(app_icon_path, "w", encoding="utf-8") as f:
        f.write(fav_svg)
    print(f"Saved {app_icon_path}")

    # 2. Logo Mark SVG (Square Institutional Crest)
    mark_svg = create_svg_logo_mark()
    mark_path = os.path.join(public_dir, "logo-mark.svg")
    with open(mark_path, "w", encoding="utf-8") as f:
        f.write(mark_svg)
    print(f"Saved {mark_path}")

    # 3. Full Horizontal Brand Logo SVG
    logo_svg = create_svg_full_logo()
    logo_path = os.path.join(public_dir, "logo.svg")
    with open(logo_path, "w", encoding="utf-8") as f:
        f.write(logo_svg)
    print(f"Saved {logo_path}")

    # 4. Raster Assets
    generate_raster_assets(public_dir, app_dir)
    print("All professional institutional brand assets generated successfully!")

if __name__ == "__main__":
    main()
