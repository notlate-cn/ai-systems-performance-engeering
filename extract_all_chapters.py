#!/usr/bin/env python3
import fitz
import os
import sys

pdf_path = "/Volumes/GM9/code/AISPE/AI Systems Performance Engineering (Chris Fregly) .pdf"
doc = fitz.open(pdf_path)

# 章节定义: (章节号, 起始页码, 结束页码)
# 页码为1-based，脚本内部会转换为0-based
chapters = [
    ("01", 15, 45),      # Chapter 1
    ("02", 46, 94),      # Chapter 2
    ("03", 95, 162),     # Chapter 3
    ("04", 163, 252),    # Chapter 4
    ("05", 253, 292),    # Chapter 5
    ("06", 293, 371),    # Chapter 6
    ("07", 372, 440),    # Chapter 7
    ("08", 441, 518),    # Chapter 8
    ("09", 519, 569),    # Chapter 9
    ("10", 570, 657),    # Chapter 10
    ("11", 658, 732),    # Chapter 11
    ("12", 733, 798),    # Chapter 12
    ("13", 799, 903),    # Chapter 13
    ("14", 904, 985),    # Chapter 14
    ("15", 986, 1045),   # Chapter 15
    ("16", 1046, 1133),  # Chapter 16
    ("17", 1134, 1194),  # Chapter 17
    ("18", 1195, 1257),  # Chapter 18
    ("19", 1258, 1374),  # Chapter 19
    ("20", 1375, 1408),  # Chapter 20
    ("appendix", 1409, 1476),  # Appendix
    ("index", 1477, 1717),     # Index
]

# 可选：只提取指定章节
if len(sys.argv) > 1:
    filter_chapters = sys.argv[1:]
    chapters = [(n, s, e) for n, s, e in chapters if n in filter_chapters]

for ch_num, start_page, end_page in chapters:
    print(f"\n{'='*50}")
    print(f"提取第{ch_num}章: 第{start_page}页 - 第{end_page}页")
    print(f"{'='*50}")
    
    img_dir = f"/Volumes/GM9/code/AISPE/img/ch{ch_num}"
    os.makedirs(img_dir, exist_ok=True)
    
    full_text = ""
    # 转换为0-based索引
    for page_num in range(start_page - 1, end_page):
        page = doc[page_num]
        text = page.get_text()
        full_text += f"\n\n=== 第 {page_num + 1} 页 ===\n\n{text}"
        
        images = page.get_images()
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            img_filename = f"fig{ch_num}_{page_num+1}_{img_index+1}.{image_ext}"
            img_path = os.path.join(img_dir, img_filename)
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            print(f"  保存图片: {img_filename}")
    
    output_file = f"/Volumes/GM9/code/AISPE/ch{ch_num}_raw.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(full_text)
    
    print(f"  第{ch_num}章文本已保存，共 {end_page - start_page + 1} 页")

doc.close()
print("\n" + "="*50)
print("所有章节提取完成！")
print("="*50)
