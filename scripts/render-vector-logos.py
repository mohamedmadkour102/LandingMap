"""Render the client's vector logos (.ai / .pdf) to transparent PNGs for scripts/build-assets.mjs.

    python -I scripts/render-vector-logos.py

Needs PyMuPDF (pip install pymupdf). Writes scripts/.staged/*.png.
"""
import pathlib
import fitz

root = pathlib.Path(__file__).resolve().parent.parent
pack = root / "Neusoft - ITI Website"
out = root / "scripts" / ".staged"
out.mkdir(parents=True, exist_ok=True)

for name, src in {
    "royal": pack / "Royal Elminya Cement" / "Royal Logo" / "logo- Royal.pdf",
    "cleopatra": pack / "Cleopatra Cement" / "logo 1.pngCleo.ai",
}.items():
    page = fitz.open(str(src), filetype="pdf")[0]
    page.get_pixmap(dpi=110, alpha=True).save(str(out / f"{name}.png"))
    print("rendered", name)
