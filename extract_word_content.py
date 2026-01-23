import zipfile
import os
import shutil
from pathlib import Path

# Extract images and content from Word document
docx_file = "Experience Luxury Living with World.docx"
output_dir = "temp_extract"
images_dir = "assets/images/blog"

# Create directories
os.makedirs(output_dir, exist_ok=True)
os.makedirs(images_dir, exist_ok=True)

# Extract all files from docx (it's a zip file)
with zipfile.ZipFile(docx_file, 'r') as zip_ref:
    zip_ref.extractall(output_dir)

# Extract images from word/media/
media_path = os.path.join(output_dir, "word", "media")
if os.path.exists(media_path):
    for img_file in os.listdir(media_path):
        src = os.path.join(media_path, img_file)
        dst = os.path.join(images_dir, f"blog-{img_file}")
        shutil.copy2(src, dst)
        print(f"Extracted: {img_file} -> blog-{img_file}")

# Extract text content from word/document.xml
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import QName

document_xml = os.path.join(output_dir, "word", "document.xml")
if os.path.exists(document_xml):
    tree = ET.parse(document_xml)
    root = tree.getroot()
    
    # Namespace for Word documents
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    # Extract all text
    text_content = []
    for para in root.findall('.//w:p', ns):
        para_text = []
        for t in para.findall('.//w:t', ns):
            if t.text:
                para_text.append(t.text)
        if para_text:
            text_content.append(' '.join(para_text))
    
    # Save text content
    with open("extracted_content.txt", "w", encoding="utf-8") as f:
        f.write("\n\n".join(text_content))
    print(f"\nExtracted {len(text_content)} paragraphs of text")

print("\nExtraction complete!")

