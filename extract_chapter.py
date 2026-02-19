#!/usr/bin/env python3
import fitz
import os
import sys

pdf_path = "/Volumes/GM9/code/AISPE/AI Systems Performance Engineering (Chris Fregly) .pdf"
doc = fitz.open(pdf_path)

chapter_start = int(sys.argv[1]) if len(sys.argv) > 1 else 85
chapter_end = int(sys.argv[2]) if len(sys.argv) > 2 else 133
chapter_num = sys.argv[3] if len(sys.argv) > 3 else "03"
img_dir = f"/Volumes/GM9/code/AISPE/img/ch{chapter_num}"

full_text = ""
for page_num in range(chapter_start, chapter_end):
    page = doc[page_num]
    text = page.get_text()
    full_text += f"\n\n=== 第 {page_num + 1} 页 ===\n\n{text}"
    
    images = page.get_images()
    for img_index, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        img_filename = f"fig{chapter_num}_{page_num+1}_{img_index+1}.{image_ext}"
        img_path = os.path.join(img_dir, img_filename)
        with open(img_path, "wb") as f:
            f.write(image_bytes)
        print(f"保存图片: {img_filename}")

doc.close()

output_file = f"/Volumes/GM9/code/AISPE/ch{chapter_num}_raw.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(full_text)

print(f"\n第{chapter_num}章文本已保存，共 {chapter_end - chapter_start} 页")
print(f"图片已保存到 {img_dir}")
