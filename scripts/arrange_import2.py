#!/usr/bin/env python3
"""
scripts/arrange_import2.py
Properly arrange images in girls-collections-import2 into 4-image product sets.
Generates:
  1. girls-collections-groups2.json - Product metadata mapping
  2. import2_preview.html          - Interactive visual preview dashboard
"""

import os
import re
import json
from datetime import datetime
from PIL import Image

FOLDER = "girls-collections-import2"
OUTPUT_JSON = "girls-collections-groups2.json"
OUTPUT_HTML = "import2_preview.html"

def parse_filename(f):
    m = re.match(r'^WhatsApp Image (\d{4}-\d{2}-\d{2}) at (\d{2})\.(\d{2})\.(\d{2})(?: \((\d+)\))?\.jpeg$', f, re.IGNORECASE)
    if not m:
        return None
    date_str, hh, mm, ss, idx = m.groups()
    index = int(idx) if idx else 0
    dt = datetime.strptime(f"{date_str} {hh}:{mm}:{ss}", "%Y-%m-%d %H:%M:%S")
    return {
        "filename": f,
        "filepath": os.path.join(FOLDER, f),
        "dt": dt,
        "date_str": date_str,
        "time_str": f"{hh}:{mm}:{ss}",
        "index": index,
        "size_bytes": os.path.getsize(os.path.join(FOLDER, f)),
    }

def get_color_signature(filepath):
    try:
        with Image.open(filepath) as img:
            rgb = img.convert("RGB")
            w, h = rgb.size
            # Sample center zone (dress body)
            mid = rgb.crop((w * 0.2, h * 0.25, w * 0.8, h * 0.75)).resize((3, 3))
            pixels = list(mid.getdata())
            r = sum(p[0] for p in pixels) // len(pixels)
            g = sum(p[1] for p in pixels) // len(pixels)
            b = sum(p[2] for p in pixels) // len(pixels)
            return (r, g, b), f"rgb({r},{g},{b})"
    except Exception:
        return (128, 128, 128), "rgb(128,128,128)"

def main():
    print("=== ARRANGE IMAGES IN girls-collections-import2 ===")
    if not os.path.isdir(FOLDER):
        print(f"Error: Directory {FOLDER} not found.")
        return

    raw_files = [f for f in os.listdir(FOLDER) if not f.startswith(".") and f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    print(f"Found {len(raw_files)} image files.")

    parsed = [parse_filename(f) for f in raw_files]
    parsed = [p for p in parsed if p is not None]

    # Sort strictly by (datetime, integer index)
    # This prevents the "(10) right after (1)" string sorting bug!
    parsed.sort(key=lambda x: (x["dt"], x["index"]))

    # Group into export sessions (gap > 10 mins indicates different export batch)
    sessions = []
    current_session = []
    for item in parsed:
        if not current_session:
            current_session.append(item)
        else:
            if (item["dt"] - current_session[-1]["dt"]).total_seconds() > 600:
                sessions.append(current_session)
                current_session = [item]
            else:
                current_session.append(item)
    if current_session:
        sessions.append(current_session)

    print(f"\nGrouped into {len(sessions)} WhatsApp export sessions:")
    for idx, s in enumerate(sessions):
        print(f"  Session {idx + 1}: {len(s)} photos ({s[0]['date_str']} {s[0]['time_str']} to {s[-1]['time_str']})")

    # Now partition each session into 4-image products
    # We maintain strict 4-image units. If a session has an odd remainder (e.g. 71 % 4 = 3 or 46 = 11*4 + 2),
    # we isolate the specific incomplete group and flag it clearly for user review.
    products = []
    prod_counter = 1

    for s_idx, session_items in enumerate(sessions):
        total_in_session = len(session_items)
        i = 0
        while i < total_in_session:
            # Check remaining in this session
            remaining = total_in_session - i
            
            # Standard chunk size is 4
            chunk_size = 4
            is_anomaly = False
            anomaly_note = ""

            if remaining < 4:
                chunk_size = remaining
                is_anomaly = True
                anomaly_note = f"Session {s_idx + 1} remainder: only {remaining} photo(s) available in this export batch"
            
            chunk = session_items[i : i + chunk_size]
            i += chunk_size

            # Assign roles
            # Role 1: primary (card cover)
            # Role 2: secondary (card hover)
            # Role 3: secondary (gallery)
            # Role 4: secondary (gallery)
            images_data = []
            for order_idx, img_item in enumerate(chunk):
                role = "primary" if order_idx == 0 else "secondary"
                avg_rgb, rgb_str = get_color_signature(img_item["filepath"])
                images_data.append({
                    "order": order_idx + 1,
                    "role": role,
                    "filename": img_item["filename"],
                    "filepath": img_item["filepath"],
                    "size_bytes": img_item["size_bytes"],
                    "timestamp": f"{img_item['date_str']} {img_item['time_str']}",
                    "color_rgb": rgb_str,
                })

            prod_no = f"{prod_counter:03d}"
            product_record = {
                "group_index": prod_counter,
                "product_no": prod_no,
                "product_id": f"product_batch2_{prod_no}",
                "product_name": f"New Product {prod_no}",
                "slug": f"new-product-{prod_no}",
                "session_index": s_idx + 1,
                "is_complete": len(images_data) == 4,
                "anomaly_note": anomaly_note,
                "images": images_data,
            }
            products.append(product_record)
            prod_counter += 1

    print(f"\nGenerated {len(products)} Product Units:")
    complete_count = sum(1 for p in products if p["is_complete"])
    flagged_count = len(products) - complete_count
    print(f"  - Complete 4-image products: {complete_count}")
    print(f"  - Incomplete / Flagged sets: {flagged_count}")

    # Save to JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)
    print(f"\nSaved structured group mapping to: {OUTPUT_JSON}")

    # Generate interactive HTML dashboard
    generate_html_dashboard(products, len(raw_files), complete_count, flagged_count)
    print(f"Saved visual preview dashboard to: {OUTPUT_HTML}")
    print("\nDONE! You can now open import2_preview.html in your browser to inspect and confirm.")

def generate_html_dashboard(products, total_images, complete_count, flagged_count):
    rows_html = []
    for p in products:
        status_badge = (
            "<span class='status-badge complete'>4 Images &check;</span>"
            if p["is_complete"]
            else f"<span class='status-badge incomplete'>{len(p['images'])} Images &bull; Review</span>"
        )
        anomaly_msg = f"<div class='anomaly-banner'>{p['anomaly_note']}</div>" if p['anomaly_note'] else ""

        img_cards = []
        for img in p["images"]:
            role_class = "role-primary" if img["role"] == "primary" else "role-secondary"
            role_label = "1 Primary (Cover)" if img["order"] == 1 else ("2 Secondary (Hover)" if img["order"] == 2 else f"{img['order']} Secondary")
            filesize_kb = round(img["size_bytes"] / 1024)

            card_html = f"""
            <div class="img-card">
              <div class="thumb-box">
                <span class="role-pill {role_class}">{role_label}</span>
                <span class="color-dot" style="background:{img['color_rgb']};" title="Sampled Color: {img['color_rgb']}"></span>
                <img src="{img['filepath']}" alt="{img['filename']}" loading="lazy" />
              </div>
              <div class="img-meta">
                <div class="filename" title="{img['filename']}">{img['filename']}</div>
                <div class="sub-info">{img['timestamp']} &bull; {filesize_kb} KB</div>
              </div>
            </div>
            """
            img_cards.append(card_html)

        # Pad with empty slots if < 4
        if len(p["images"]) < 4:
            for empty_idx in range(len(p["images"]) + 1, 5):
                card_html = f"""
                <div class="img-card empty-slot">
                  <div class="thumb-box empty">
                    <span class="role-pill role-empty">Slot {empty_idx} (Missing)</span>
                    <div class="empty-icon">+</div>
                  </div>
                  <div class="img-meta">
                    <div class="filename text-muted">No photo provided</div>
                  </div>
                </div>
                """
                img_cards.append(card_html)

            grid_html = "".join(img_cards)

        row_html = f"""
        <div class="product-row {'has-anomaly' if not p['is_complete'] else ''}" id="prod-{p['product_no']}" data-session="{p['session_index']}" data-complete="{str(p['is_complete']).lower()}">
          <div class="product-header">
            <div class="header-left">
              <span class="product-num">#{p['product_no']}</span>
              <span class="product-title">{p['product_name']}</span>
              <span class="session-tag">Session {p['session_index']}</span>
            </div>
            <div class="header-right">
              {status_badge}
            </div>
          </div>
          {anomaly_msg}
          <div class="images-grid">
            {''.join(img_cards)}
          </div>
        </div>
        """
        rows_html.append(row_html)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>girls-collections-import2 &mdash; 4-Image Product Arrangement Preview</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background: #0D0E15;
    color: #E2E8F0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 24px 20px 80px;
    line-height: 1.5;
  }}
  .top-header {{
    position: sticky;
    top: 12px;
    z-index: 100;
    background: rgba(22, 27, 38, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid #283347;
    border-radius: 14px;
    padding: 16px 24px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }}
  .title-group h1 {{
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #F8FAFC;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .title-group p {{
    font-size: 12px;
    color: #94A3B8;
    margin-top: 2px;
  }}
  .stats-strip {{
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }}
  .stat-pill {{
    background: #1A2130;
    border: 1px solid #2D3A50;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    color: #CBD5E1;
  }}
  .stat-pill strong {{
    color: #FBBF24;
    font-weight: 700;
  }}
  .filter-btns {{
    display: flex;
    gap: 8px;
  }}
  .filter-btn {{
    background: #1A2130;
    border: 1px solid #2D3A50;
    color: #94A3B8;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }}
  .filter-btn:hover {{
    color: #FFFFFF;
    border-color: #475569;
  }}
  .filter-btn.active {{
    background: #3B1230;
    border-color: #B08D57;
    color: #FFFFFF;
  }}
  .container {{
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }}
  .product-row {{
    background: #141824;
    border: 1px solid #222B3D;
    border-radius: 14px;
    padding: 18px 20px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }}
  .product-row:hover {{
    border-color: #B08D57;
    box-shadow: 0 4px 20px rgba(176,141,87,0.15);
  }}
  .product-row.has-anomaly {{
    border-color: #B45309;
    background: #18151E;
  }}
  .product-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #202838;
  }}
  .header-left {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .product-num {{
    background: #B08D57;
    color: #1C1417;
    font-size: 11px;
    font-weight: 900;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.04em;
  }}
  .product-title {{
    font-size: 15px;
    font-weight: 700;
    color: #F1F5F9;
  }}
  .session-tag {{
    font-size: 11px;
    background: #1E2638;
    color: #94A3B8;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #2B374D;
  }}
  .status-badge {{
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.03em;
  }}
  .status-badge.complete {{
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }}
  .status-badge.incomplete {{
    background: rgba(245, 158, 11, 0.15);
    color: #FBBF24;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }}
  .anomaly-banner {{
    background: rgba(180, 83, 9, 0.2);
    border: 1px solid #B45309;
    color: #FCD34D;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 14px;
  }}
  .images-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }}
  @media (max-width: 960px) {{
    .images-grid {{ grid-template-columns: repeat(2, 1fr); }}
  }}
  .img-card {{
    background: #0B0D13;
    border: 1px solid #1E2536;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }}
  .thumb-box {{
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    background: #111520;
    overflow: hidden;
  }}
  .thumb-box img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }}
  .thumb-box:hover img {{
    transform: scale(1.04);
  }}
  .thumb-box.empty {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #334155;
    background: #0F131D;
  }}
  .empty-icon {{
    font-size: 32px;
    color: #475569;
    margin-top: 10px;
  }}
  .role-pill {{
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    font-size: 9.5px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }}
  .role-primary {{
    background: #059669;
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(5,150,105,0.5);
  }}
  .role-secondary {{
    background: rgba(15, 23, 42, 0.85);
    color: #CBD5E1;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }}
  .role-empty {{
    background: #334155;
    color: #94A3B8;
  }}
  .color-dot {{
    position: absolute;
    top: 8px;
    right: 8px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(0,0,0,0.6);
  }}
  .img-meta {{
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }}
  .filename {{
    font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: #CBD5E1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }}
  .sub-info {{
    font-size: 10px;
    color: #64748B;
  }}
  .text-muted {{
    color: #64748B;
  }}
</style>
</head>
<body>

<header class="top-header">
  <div class="title-group">
    <h1><span>&bull;</span> The Girls Collections &mdash; Batch 2 Arrangement Preview</h1>
    <p>Directory: girls-collections-import2 &bull; Pre-Upload Verification</p>
  </div>
  <div class="stats-strip">
    <div class="stat-pill">Total Images: <strong>{total_images}</strong></div>
    <div class="stat-pill">Products: <strong>{len(products)}</strong></div>
    <div class="stat-pill">Complete 4-Image Sets: <strong style="color:#34D399;">{complete_count}</strong></div>
    {f'<div class="stat-pill">Flagged Sets: <strong style="color:#FBBF24;">{flagged_count}</strong></div>' if flagged_count else ''}
  </div>
  <div class="filter-btns">
    <button class="filter-btn active" onclick="filterRows('all', this)">All ({len(products)})</button>
    <button class="filter-btn" onclick="filterRows('flagged', this)">Flagged ({flagged_count})</button>
    <button class="filter-btn" onclick="filterRows('complete', this)">Complete 4-Pack ({complete_count})</button>
  </div>
</header>

<main class="container" id="products-container">
  {''.join(rows_html)}
</main>

<script>
function filterRows(type, btn) {{
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const rows = document.querySelectorAll('.product-row');
  rows.forEach(r => {{
    const isComplete = r.getAttribute('data-complete') === 'true';
    if (type === 'all') {{
      r.style.display = '';
    }} else if (type === 'flagged') {{
      r.style.display = isComplete ? 'none' : '';
    }} else if (type === 'complete') {{
      r.style.display = isComplete ? '' : 'none';
    }}
  }});
}}
</script>

</body>
</html>
"""
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)

if __name__ == "__main__":
    main()

