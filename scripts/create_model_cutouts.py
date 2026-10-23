import os
from PIL import Image
import rembg

def process_all_rembg():
    output_dir = 'public/categories/cutouts'
    os.makedirs(output_dir, exist_ok=True)
    
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

    print("Running rembg AI model segmentation...")
    for cat in categories:
        input_path = f'public/categories/{cat}.jpg'
        output_path = f'{output_dir}/{cat}.png'
        
        if not os.path.exists(input_path):
            print(f"Skipping missing image: {input_path}")
            continue

        img = Image.open(input_path).convert("RGBA")
        cutout = rembg.remove(img)
        cutout.save(output_path, "PNG")
        print(f"Successfully generated AI cutout for {cat} -> {output_path}")

if __name__ == '__main__':
    process_all_rembg()
