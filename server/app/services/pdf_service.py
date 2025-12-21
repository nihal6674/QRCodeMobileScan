from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pathlib import Path


def image_to_pdf(image_path: Path) -> Path:
    """
    Convert a processed image to a single-page A4 PDF.
    Returns the PDF file path.
    """
    pdf_path = image_path.parent / f"{image_path.stem}.pdf"

    c = canvas.Canvas(str(pdf_path), pagesize=A4)
    width, height = A4

    img = ImageReader(str(image_path))
    img_width, img_height = img.getSize()

    # Maintain aspect ratio
    scale = min(width / img_width, height / img_height)
    new_width = img_width * scale
    new_height = img_height * scale

    x = (width - new_width) / 2
    y = (height - new_height) / 2

    c.drawImage(
        img,
        x,
        y,
        width=new_width,
        height=new_height,
        preserveAspectRatio=True,
        mask="auto",
    )

    c.showPage()
    c.save()

    return pdf_path
