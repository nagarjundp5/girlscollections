import os
from PIL import Image
import rembg

def create_top_head_cutouts():
    out_dir = 'public/categories/cutouts'
    os.makedirs(out_dir, exist_ok=True)

    categories = [
        'all-kurta-sets',
        'anarkali-kurta-suit-sets',
        'co-ord-set',
        'skirt-and-top',
        'kids-lehenga-blouse-or-pattu-pavadai',
        'kids-traditional-gown-1-pc',
        'party-wear-frocks',
        'children-co-ord-set',
    ]

    print("Extracting clean top head & shoulder cutouts using rembg...")
    for cat in categories:
        in_path = f'public/categories/{cat}.jpg'
        out_path = f'{out_dir}/{cat}_head.png'

        if not os.path.exists(in_path):
            print(f"File not found: {in_path}")
            continue

        img = Image.open(in_path).convert("RGBA")
        w, h = img.size

        # Crop ONLY the top head/shoulder portion (top 42% of the image)
        head_crop = img.crop((0, 0, w, int(h * 0.42)))

        # Remove background cleanly from head crop using rembg AI
        head_cutout = rembg.remove(head_crop)

        head_cutout.save(out_path, "PNG")
        print(f"Saved head cutout: {out_path}")

if __name__ == '__main__':
    create_top_head_cutouts()
