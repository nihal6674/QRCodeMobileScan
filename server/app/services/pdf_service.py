from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from pathlib import Path

def image_to_pdf(image_path: Path, output_path: Path):
    c = canvas.Canvas(str(output_path), pagesize=A4)
    c.drawImage(str(image_path), 0, 0, width=A4[0], height=A4[1])
    c.save()
