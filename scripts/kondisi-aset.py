"""Aset bagian "Kapan datang" (#kondisi): lapisan kontur bermask luminance.

Pakai: python scripts/kondisi-aset.py [folder-sumber]
(bawaan: .gen/kondisi-sumber di akar repo; keluar dengan kode 1 bila folder/berkas kurang)
(jalankan dengan `python` biasa, tanpa -I: Pillow ada di site-packages pengguna)

Folder sumber berisi kand-G.png, batu-1.png, batu-kecil-b.png, dan orang/A-5.png,
orang/B-{1,2,3,5,6,7,8}.png (hasil generate yang sudah disetujui).

Hasil:
- src/assets/img/kondisi/*.webp : tebing, bongkahan, batu, orang-* sebagai mask
  luminance (putih di atas hitam), rumus sama dengan aset Turun.
- src/assets/img/kondisi/posisi.json : kotak tiap lapisan dalam persen bidang
  komposit 1536x1024 (left, top, width, height), disalin ke CSS.
- .gen/kondisi-aset-pratinjau.jpg : rakitan semua lapisan di latar gelap.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SUMBER = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / ".gen/kondisi-sumber"
_PERLU = ["kand-G.png", "batu-1.png", "batu-kecil-b.png", "orang/A-5.png"] + [f"orang/B-{n}.png" for n in (1, 2, 3, 5, 6, 7, 8)]
_kurang = [b for b in _PERLU if not (SUMBER / b).is_file()]
if _kurang:
    sys.exit(f"Pakai: python scripts/kondisi-aset.py [folder-sumber]; kurang di {SUMBER}: {', '.join(_kurang)}")
KELUAR = ROOT / "src/assets/img/kondisi"
PRATINJAU = ROOT / ".gen/kondisi-aset-pratinjau.jpg"

BIDANG = (1536, 1024)
KERTAS = (252, 247, 233)
LATAR = (12, 22, 30)
EMAS = (241, 210, 150)
PUTIH = (245, 247, 246)

# id: (x kiri, y kaki, tinggi) dalam px bidang komposit
ORANG = {
    "a5": (476, 540, 90),
    "b1": (438, 114, 48),
    "b2": (392, 94, 62),
    "b3": (496, 142, 58),
    "b5": (690, 772, 70),
    "b6": (950, 768, 46),
    "b7": (790, 778, 66),
    "b8": (600, 910, 60),
}


def mask(im):
    """Gambar sepia di kertas krem -> mask luminance (L)."""
    return im.convert("L").point(
        lambda v: 0 if v > 225 else 255 if v < 80 else int((225 - v) / 145 * 255)
    )


def simpan(m, nama):
    m.convert("RGB").save(KELUAR / f"{nama}.webp", quality=90, method=6)


def persen(x, y, w, h):
    W, H = BIDANG
    return {
        "left": round(x / W * 100, 2),
        "top": round(y / H * 100, 2),
        "width": round(w / W * 100, 2),
        "height": round(h / H * 100, 2),
    }


KELUAR.mkdir(parents=True, exist_ok=True)
PRATINJAU.parent.mkdir(exist_ok=True)
posisi = {}
lapisan = []  # (mask, kotak px, warna) untuk pratinjau

# Tebing: hapus bongkahan kecil di kaki dan garis riak di tepi bawah dengan warna kertas, lalu crop ke tinta
g = Image.open(SUMBER / "kand-G.png").convert("RGB")
kertas_g = g.getpixel((820, 900))
g.paste(kertas_g, (628, 868, 772, 962))
g.paste(kertas_g, (0, 968, g.width, g.height))  # garis riak laut diganti lapisan CSS
g.paste(kertas_g, (760, 944, g.width, g.height))  # sisa riak di kanan kaki tebing
m = mask(g)
x0, y0, x1, y1 = m.point(lambda v: 255 if v > 16 else 0).getbbox()
simpan(m.crop((x0, y0, x1, y1)), "tebing")
posisi["tebing"] = persen(x0, y0, x1 - x0, y1 - y0)
lapisan.append((m.crop((x0, y0, x1, y1)), (x0, y0, x1 - x0, y1 - y0), EMAS))

# Bongkahan dan batu rendah: crop, simpan pada 2x tinggi komposit
for nama, berkas, kotak, tinggi, (x, y) in (
    ("bongkahan", "batu-1.png", (60, 180, 980, 775), 250, (660, 725)),
    ("batu", "batu-kecil-b.png", (160, 250, 1400, 650), 110, (556, 868)),
):
    c = Image.open(SUMBER / berkas).convert("RGB").crop(kotak)
    lebar = c.width * tinggi / c.height
    m = mask(c.resize((round(c.width * 2 * tinggi / c.height), tinggi * 2), Image.LANCZOS))
    simpan(m, nama)
    posisi[nama] = persen(x, y, lebar, tinggi)
    lapisan.append((m, (x, y, lebar, tinggi), EMAS))

# Orang: PNG transparan yang sudah ter-crop; garis ditebalkan supaya terbaca kecil
for id_, (x, kaki, h) in ORANG.items():
    berkas = SUMBER / "orang" / f"{id_[0].upper()}-{id_[1:]}.png"
    o = Image.open(berkas).convert("RGBA")
    lebar = h * o.width / o.height
    dasar = Image.new("RGB", o.size, KERTAS)
    dasar.paste(o, mask=o.getchannel("A"))
    dasar = dasar.resize((round(o.width * 2 * h / o.height), h * 2), Image.LANCZOS)
    m = mask(dasar).filter(ImageFilter.MaxFilter(3))
    simpan(m, f"orang-{id_}")
    posisi[f"orang-{id_}"] = persen(x, kaki - h, lebar, h)
    lapisan.append((m, (x, kaki - h, lebar, h), PUTIH))

(KELUAR / "posisi.json").write_text(json.dumps(posisi, indent=2) + "\n")

# Pratinjau: emas untuk batuan, putih untuk figur, di latar gelap
kanvas = Image.new("RGB", BIDANG, LATAR)
for m, (x, y, w, h), warna in lapisan:
    ukuran = (max(1, round(w)), max(1, round(h)))
    kanvas.paste(Image.new("RGB", ukuran, warna), (round(x), round(y)), m.resize(ukuran, Image.LANCZOS))
kanvas.save(PRATINJAU, quality=88)
print("ok", len(posisi), "lapisan")
