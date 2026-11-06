#!/usr/bin/env python3
import os
import json
import urllib.parse

def main():
    folder = "girls-collections-import"
    if not os.path.isdir(folder):
        print(f"Error: Folder '{folder}' not found.")
        return

    # List all image files ignoring hidden files
    files = [f for f in os.listdir(folder) if not f.startswith(".") and f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    
    # Sort strictly by birthtime (creation/added date), oldest first
    files.sort(key=lambda f: os.stat(os.path.join(folder, f)).st_birthtime)

    total_images = len(files)
    remainder = total_images % 4
    total_groups = total_images // 4

    print(f"Total Images: {total_images}")
    print(f"Total Product Groups: {total_groups}")
    if remainder != 0:
        print(f"WARNING: Image count {total_images} is NOT a multiple of 4! Remainder is {remainder}.")
    else:
        print("CONFIRMATION: Image count is an exact multiple of 4 (308 images = 77 products).")

    groups = []
    # Start from bottom (newest):
    # The bottom-most 4 images are Product 001, going upwards.
    # Within each group, the image nearest the bottom is Image 1 (primary), then 2, 3, 4.
    for g_idx in range(total_groups):
        prod_num = f"{g_idx + 1:03d}"
        start_offset = (g_idx * 4) + 1
        p_files = [files[-(start_offset + i)] for i in range(4)]
        
        group_data = {
            "group_index": g_idx + 1,
            "product_id": f"product_{prod_num}",
            "product_no": prod_num,
            "product_name": f"New Product {prod_num}",
            "slug": f"new-product-{prod_num}",
            "images": [
                {
                    "order": 1,
                    "role": "primary",
                    "filename": p_files[0],
                    "filepath": os.path.join(folder, p_files[0]),
                    "size_bytes": os.path.getsize(os.path.join(folder, p_files[0])),
                },
                {
                    "order": 2,
                    "role": "secondary",
                    "filename": p_files[1],
                    "filepath": os.path.join(folder, p_files[1]),
                    "size_bytes": os.path.getsize(os.path.join(folder, p_files[1])),
                },
                {
                    "order": 3,
                    "role": "secondary",
                    "filename": p_files[2],
                    "filepath": os.path.join(folder, p_files[2]),
                    "size_bytes": os.path.getsize(os.path.join(folder, p_files[2])),
                },
                {
                    "order": 4,
                    "role": "secondary",
                    "filename": p_files[3],
                    "filepath": os.path.join(folder, p_files[3]),
                    "size_bytes": os.path.getsize(os.path.join(folder, p_files[3])),
                },
            ]
        }
        groups.append(group_data)

    # Save JSON mapping
    json_path = "girls-collections-groups.json"
    with open(json_path, "w", encoding="utf-8") as jf:
        json.dump(groups, jf, indent=2)
    print(f"Saved group mapping to {json_path}")

    # Generate preview.html
    html_lines = [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='UTF-8'>",
        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        "  <title>The Girls Collections — Product Import Preview (Step 1)</title>",
        "  <style>",
        "    * { box-sizing: border-box; margin: 0; padding: 0; }",
        "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e2e8f0; padding: 24px; }",
        "    .header { background: #1a1e29; border: 1px solid #2d3748; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; position: sticky; top: 12px; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(12px); }",
        "    .header h1 { font-size: 20px; font-weight: 800; color: #f8fafc; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }",
        "    .stats-row { display: flex; gap: 20px; flex-wrap: wrap; font-size: 13px; }",
        "    .stat-pill { background: #252b3b; border: 1px solid #3b4252; padding: 6px 12px; rounded: 6px; border-radius: 6px; }",
        "    .stat-pill strong { color: #fbbf24; }",
        "    .success-badge { color: #34d399; font-weight: 700; }",
        "    .products-container { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; margin: 0 auto; }",
        "    .product-row { background: #161b26; border: 1px solid #262f40; border-radius: 12px; padding: 18px 20px; transition: border-color 0.2s; }",
        "    .product-row:hover { border-color: #d97706; }",
        "    .product-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #232b3a; }",
        "    .product-title { font-size: 15px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 10px; }",
        "    .product-badge { background: #d97706; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em; }",
        "    .images-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }",
        "    @media (max-width: 900px) { .images-grid { grid-template-columns: repeat(2, 1fr); } }",
        "    .image-card { background: #0c0e14; border: 1px solid #202736; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }",
        "    .image-thumb-wrapper { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #131722; }",
        "    .image-thumb-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }",
        "    .image-thumb-wrapper:hover img { transform: scale(1.04); }",
        "    .role-badge { position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 3px 7px; border-radius: 4px; letter-spacing: 0.05em; }",
        "    .role-primary { background: #059669; color: #fff; box-shadow: 0 2px 8px rgba(5,150,105,0.4); }",
        "    .role-secondary { background: rgba(30, 41, 59, 0.85); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.2); }",
        "    .image-info { padding: 10px; font-size: 11px; color: #94a3b8; display: flex; flex-direction: column; gap: 4px; }",
        "    .filename-text { font-family: monospace; font-size: 10.5px; color: #cbd5e1; word-break: break-all; }",
        "    .filesize-text { color: #64748b; font-size: 10px; }",
        "  </style>",
        "</head>",
        "<body>",
        "  <div class='header'>",
        "    <h1>The Girls Collections — Product Import Preview</h1>",
        "    <div class='stats-row'>",
        f"      <div class='stat-pill'>Total Images: <strong>{total_images}</strong></div>",
        f"      <div class='stat-pill'>Total Products: <strong>{total_groups}</strong> (4 images / product)</div>",
        "      <div class='stat-pill'>Order: <strong>Date Added / Birthtime (Bottom-Up)</strong></div>",
        f"      <div class='stat-pill'>Multiple of 4: <span class='success-badge'>Valid ({total_images} % 4 == 0)</span></div>",
        "    </div>",
        "  </div>",
        "  <div class='products-container'>"
    ]

    for g in groups:
        html_lines.append(f"    <div class='product-row' id='{g['product_id']}'>")
        html_lines.append("      <div class='product-meta'>")
        html_lines.append(f"        <div class='product-title'><span class='product-badge'>{g['product_no']}</span> {g['product_name']} &middot; <span style='font-size:12px; color:#94a3b8;'>slug: {g['slug']}</span></div>")
        html_lines.append(f"        <div style='font-size:11px; color:#64748b;'>4 Assets Scheduled for Signed Cloudinary Upload</div>")
        html_lines.append("      </div>")
        html_lines.append("      <div class='images-grid'>")

        for img in g["images"]:
            role_class = "role-primary" if img["role"] == "primary" else "role-secondary"
            role_label = f"Image {img['order']} (Primary)" if img["role"] == "primary" else f"Image {img['order']}"
            size_kb = round(img["size_bytes"] / 1024, 1)
            # URL encode filename for img src
            encoded_path = f"girls-collections-import/{urllib.parse.quote(img['filename'])}"

            html_lines.append("        <div class='image-card'>")
            html_lines.append("          <div class='image-thumb-wrapper'>")
            html_lines.append(f"            <span class='role-badge {role_class}'>{role_label}</span>")
            html_lines.append(f"            <img src='{encoded_path}' alt='{img['filename']}' loading='lazy' />")
            html_lines.append("          </div>")
            html_lines.append("          <div class='image-info'>")
            html_lines.append(f"            <div class='filename-text'>{img['filename']}</div>")
            html_lines.append(f"            <div class='filesize-text'>{size_kb} KB</div>")
            html_lines.append("          </div>")
            html_lines.append("        </div>")

        html_lines.append("      </div>")
        html_lines.append("    </div>")

    html_lines.append("  </div>")
    html_lines.append("</body>")
    html_lines.append("</html>")

    preview_path = "preview.html"
    with open(preview_path, "w", encoding="utf-8") as hf:
        hf.write("\n".join(html_lines))
    print(f"Generated preview file at: {preview_path}")

if __name__ == "__main__":
    main()
