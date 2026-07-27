# -*- coding: utf-8 -*-
"""Render the Lernzettel markdown to an open-book optimised A4 PDF:
thumb-index tabs, table of contents and keyword index with page numbers."""
import io, re, sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, Flowable)

MD, PDF = sys.argv[1], sys.argv[2]
D = "/usr/share/fonts/truetype/dejavu/"
L = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("F", D + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("F-B", D + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("F-I", L + "LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("F-BI", L + "LiberationSans-BoldItalic.ttf"))
pdfmetrics.registerFontFamily("F", normal="F", bold="F-B", italic="F-I",
                              boldItalic="F-BI")

PW, PH = A4
ML, MR, MT, MB = 1.4 * cm, 2.05 * cm, 1.55 * cm, 1.45 * cm
AW = PW - ML - MR
TABW = 0.72 * cm

NAVY = colors.HexColor("#17314F")
GREY = colors.HexColor("#6B7684")
LINE = colors.HexColor("#C3CCD6")
GREEN_BG, GREEN_ED = colors.HexColor("#E7F2E3"), colors.HexColor("#4C7A34")
BLUE_BG, BLUE_ED = colors.HexColor("#E4EFF7"), colors.HexColor("#2E6E9E")
ORNG_BG, ORNG_ED = colors.HexColor("#FFF2D8"), colors.HexColor("#C77D0A")

CHAPCOL = [colors.HexColor(c) for c in
           ["#5B6B7C", "#1F6F8B", "#2E8B57", "#B8860B", "#C05621", "#9B2C56",
            "#6B46C1", "#2C7A7B", "#8B3A3A", "#334E68"]]

body = ParagraphStyle("b", fontName="F", fontSize=8.9, leading=12.3, spaceAfter=3.6)
b1 = ParagraphStyle("b1", parent=body, leftIndent=11, bulletIndent=2, spaceAfter=2.2)
b2 = ParagraphStyle("b2", parent=body, leftIndent=25, bulletIndent=14, spaceAfter=2.2)
num = ParagraphStyle("n", parent=body, leftIndent=15, bulletIndent=1, spaceAfter=2.2)
num2 = ParagraphStyle("n2", parent=num, leftIndent=29, bulletIndent=15)
h2s = ParagraphStyle("h2", fontName="F-B", fontSize=11.3, leading=14.5,
                     textColor=NAVY, spaceBefore=9, spaceAfter=4)
h3s = ParagraphStyle("h3", fontName="F-B", fontSize=9.7, leading=12.6,
                     spaceBefore=7, spaceAfter=2.5)
boxs = ParagraphStyle("box", parent=body, spaceAfter=0)
tc = ParagraphStyle("tc", parent=body, fontSize=8.0, leading=10.4, spaceAfter=0)
tch = ParagraphStyle("tch", parent=tc, fontName="F-B", textColor=colors.white)
tocs = ParagraphStyle("toc", fontName="F", fontSize=9.2, leading=13.6, spaceAfter=0)
idxs = ParagraphStyle("idx", fontName="F", fontSize=7.9, leading=10.5, spaceAfter=0)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inl(t):
    t = esc(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t, flags=re.S)
    t = re.sub(r"(?<!\w)\*([^*\n]+?)\*(?!\w)", r"<i>\1</i>", t)
    return t


class Mark(Flowable):
    """zero-height marker used to capture the page number during build"""
    def __init__(self, kind, key):
        Flowable.__init__(self)
        self.kind, self.key = kind, key
        self.width = self.height = 0
    def draw(self):
        pass


def box(lines, bg, ed):
    p = Paragraph("<br/>".join(inl(x) for x in lines), boxs)
    t = Table([[p]], colWidths=[AW])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg),
                           ("LINEBEFORE", (0, 0), (0, -1), 2.6, ed),
                           ("TOPPADDING", (0, 0), (-1, -1), 5),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                           ("LEFTPADDING", (0, 0), (-1, -1), 8),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 6)]))
    return [t, Spacer(1, 5)]


def mdtable(rows):
    nc = max(len(r) for r in rows)
    rows = [r + [""] * (nc - len(r)) for r in rows]
    data = [[Paragraph(inl(c), tch if i == 0 else tc) for c in r]
            for i, r in enumerate(rows)]
    if nc == 2:
        w = [AW * .30, AW * .70]
    elif nc == 3:
        w = [AW * .215, AW * .425, AW * .36]
    elif nc == 4:
        w = [AW * .16, AW * .30, AW * .24, AW * .30]
    else:
        w = [AW / nc] * nc
    t = Table(data, colWidths=w, repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), NAVY),
          ("GRID", (0, 0), (-1, -1), 0.4, LINE),
          ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("TOPPADDING", (0, 0), (-1, -1), 3),
          ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
          ("LEFTPADDING", (0, 0), (-1, -1), 4.5),
          ("RIGHTPADDING", (0, 0), (-1, -1), 4.5)]
    for i in range(2, len(data), 2):
        st.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F2F6FA")))
    t.setStyle(TableStyle(st))
    return [t, Spacer(1, 6)]


# ------------------------------------------------------------------ parse md
raw = io.open(MD, encoding="utf-8").read().split("\n")
title = raw[0].lstrip("# ").strip()
intro, i = [], 1
while i < len(raw) and not raw[i].startswith("#") and raw[i].strip() != "---":
    if raw[i].strip():
        intro.append(raw[i].strip())
    i += 1
BODY = raw[i:]

chapters = [l.strip()[2:] for l in BODY if l.startswith("# ")]
toc_entries = [(l.strip()[2:], 1) if l.startswith("# ") else (l.strip()[3:], 2)
               for l in BODY if l.startswith("# ") or l.startswith("## ")]
terms = {}
for l in BODY:
    if l.startswith("^^ "):
        for t in l[3:].split("|"):
            terms.setdefault(t.strip(), None)
TERMS = sorted(terms, key=lambda s: s.lower())


def chapter_index(name):
    m = re.match(r"^(\d+)\.", name)
    return int(m.group(1)) if m else 0


def build_story(pages):
    """pages: dict for TOC ('toc:<title>') and index ('idx:<term>') numbers"""
    st = []
    # ---- title page
    rows = [[Paragraph(esc(title), ParagraphStyle(
        "t", fontName="F-B", fontSize=19.5, leading=24, textColor=colors.white))]]
    for p in intro:
        rows.append([Paragraph(inl(p), ParagraphStyle(
            "s", fontName="F", fontSize=8.8, leading=12.4,
            textColor=colors.HexColor("#D7E3EF")))])
    tt = Table(rows, colWidths=[AW])
    tt.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), NAVY),
                            ("TOPPADDING", (0, 0), (-1, 0), 13),
                            ("BOTTOMPADDING", (0, 0), (-1, 0), 3),
                            ("TOPPADDING", (0, 1), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, -1), (-1, -1), 13),
                            ("LEFTPADDING", (0, 0), (-1, -1), 13),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 13)]))
    st += [tt, Spacer(1, 12), Paragraph("Inhaltsverzeichnis", h2s)]
    # ---- TOC
    data = []
    for t, lvl in toc_entries:
        pg = pages.get("toc:" + t, "")
        stl = ParagraphStyle("x", parent=tocs,
                             fontName="F-B" if lvl == 1 else "F",
                             leftIndent=0 if lvl == 1 else 14,
                             textColor=NAVY if lvl == 1 else colors.black,
                             spaceBefore=3 if lvl == 1 else 0)
        data.append([Paragraph(esc(t), stl),
                     Paragraph('<para align="right">%s</para>' % pg, stl)])
    tb = Table(data, colWidths=[AW - 1.3 * cm, 1.3 * cm])
    tb.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, -1), 0.6),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 0.6),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    st.append(tb)

    # ---- body
    i = 0
    while i < len(BODY):
        line = BODY[i]
        s = line.strip()
        if not s or s == "---":
            i += 1
            continue
        if s.startswith("^^ "):
            for t in s[3:].split("|"):
                st.append(Mark("idx", t.strip()))
            i += 1
            continue
        if s.startswith("|"):
            rows = []
            while i < len(BODY) and BODY[i].strip().startswith("|"):
                cells = [c.strip() for c in BODY[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            st += mdtable(rows)
            continue
        if s.startswith("# "):
            name = s[2:]
            st += [PageBreak(), Mark("chap", name), Mark("toc", name)]
            ci = chapter_index(name)
            hp = Paragraph(esc(name), ParagraphStyle(
                "h1", fontName="F-B", fontSize=15, leading=19,
                textColor=colors.white))
            t = Table([[hp]], colWidths=[AW])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), CHAPCOL[ci % len(CHAPCOL)]),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 10)]))
            st += [t, Spacer(1, 8)]
            i += 1
            continue
        if s.startswith("## "):
            st += [Mark("toc", s[3:]), Paragraph(inl(s[3:]), h2s)]
            i += 1
            continue
        if s.startswith("### "):
            st.append(Paragraph(inl(s[4:]), ParagraphStyle(
                "h3", parent=h3s, textColor=NAVY)))
            i += 1
            continue
        if re.match(r"^\*\*(MERKE|DEFINITION|FORMEL|BEISPIEL|\[EXTRA|Rechenbeispiel \[)", s):
            buf = [s]
            i += 1
            while (i < len(BODY) and BODY[i].strip()
                   and not BODY[i].startswith("#")
                   and not BODY[i].strip().startswith("|")):
                buf.append(BODY[i].rstrip())
                i += 1
            if s.startswith("**BEISPIEL"):
                st += box(buf, BLUE_BG, BLUE_ED)
            elif s.startswith("**[EXTRA") or s.startswith("**Rechenbeispiel ["):
                st += box(buf, ORNG_BG, ORNG_ED)
            else:
                st += box(buf, GREEN_BG, GREEN_ED)
            continue
        m = re.match(r"^(\s{2,})- (.*)$", line)
        if m:
            st.append(Paragraph(inl(m.group(2)), b2, bulletText="–"))
            i += 1
            continue
        if s.startswith("- "):
            st.append(Paragraph(inl(s[2:]), b1, bulletText="•"))
            i += 1
            continue
        mn = re.match(r"^(\s*)(\d+)\.\s+(.*)$", line)
        if mn:
            st.append(Paragraph(inl(mn.group(3)),
                                num if not mn.group(1) else num2,
                                bulletText=mn.group(2) + "."))
            i += 1
            continue
        st.append(Paragraph(inl(s), body))
        i += 1

    # ---- keyword index
    st += [PageBreak(), Mark("chap", "Stichwortverzeichnis")]
    hp = Paragraph("Stichwortverzeichnis (alphabetisch, mit Seitenzahl)",
                   ParagraphStyle("h1", fontName="F-B", fontSize=15,
                                  leading=19, textColor=colors.white))
    t = Table([[hp]], colWidths=[AW])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#334E68")),
                           ("TOPPADDING", (0, 0), (-1, -1), 7),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10)]))
    st += [t, Spacer(1, 4),
           Paragraph("Leserichtung: zeilenweise von links nach rechts. "
                     "Die Zahl rechts neben dem Begriff ist die Seitenzahl.",
                     ParagraphStyle("hint", parent=body, fontSize=7.8,
                                    textColor=GREY, spaceAfter=6))]
    col, cur = [], None
    for t_ in TERMS:
        ini = t_[0].upper()
        if ini != cur:
            cur = ini
            col.append(("H", ini))
        col.append(("T", t_))
    ihs = ParagraphStyle("ih", parent=idxs, textColor=NAVY, fontName="F-B")

    def cell(entry):
        if entry is None:
            return [Paragraph("", idxs), Paragraph("", idxs)]
        kind, val = entry
        if kind == "H":
            return [Paragraph(esc(val), ihs), Paragraph("", idxs)]
        pg = pages.get("idx:" + val, "")
        return [Paragraph(esc(val), idxs),
                Paragraph('<para align="right">%s</para>' % pg, idxs)]

    pw_ = 0.85 * cm
    gap = 0.55 * cm
    tw = (AW - gap) / 2.0 - pw_
    rows, styles = [], []
    for k in range(0, len(col), 2):
        pair = col[k:k + 2]
        while len(pair) < 2:
            pair.append(None)
        rows.append(cell(pair[0]) + cell(pair[1]))
        for cidx, e in enumerate(pair):
            if e and e[0] == "H":
                styles.append(("LINEBELOW", (cidx * 2, len(rows) - 1),
                               (cidx * 2 + 1, len(rows) - 1), 0.5, LINE))
    it = Table(rows, colWidths=[tw, pw_, tw + gap, pw_])
    it.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, -1), 0.7),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 0.7),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                            ("LEFTPADDING", (2, 0), (2, -1), gap),
                            ("VALIGN", (0, 0), (-1, -1), "TOP")] + styles))
    st.append(it)
    return st


TABS = ["S"] + [str(k) for k in range(1, 10)] + ["A-Z"]


class Doc(BaseDocTemplate):
    def __init__(self, *a, **kw):
        BaseDocTemplate.__init__(self, *a, **kw)
        self.pages = {}
        self.chapstart = []
    def afterFlowable(self, f):
        if isinstance(f, Mark):
            if f.kind == "chap":
                self.chapstart.append((self.page, f.key))
            else:
                self.pages["%s:%s" % (f.kind, f.key)] = self.page


def make(pages, chapmap, path):
    doc = Doc(path, pagesize=A4, leftMargin=ML, rightMargin=MR,
              topMargin=MT, bottomMargin=MB,
              title="Lernzettel Beratungs- und Servicemanagement",
              author="Zusammenfassung aus Studienbrief & PPTs (DHfPG)")

    def onpage(cv, d):
        cv.saveState()
        cur = None
        for start, name in chapmap:
            if d.page >= start:
                cur = name
        if cur:
            ci = 0 if cur.startswith("Schnellzugriff") else (
                10 if cur.startswith("Stichwort") else chapter_index(cur))
            lbl = TABS[ci] if ci < len(TABS) else "?"
            colr = CHAPCOL[(ci if ci < 10 else 9) % len(CHAPCOL)]
            slot = (PH - 3.4 * cm) / len(TABS)
            y = PH - 2.2 * cm - (ci + 1) * slot
            cv.setFillColor(colr)
            cv.rect(PW - TABW, y, TABW, slot - 3, stroke=0, fill=1)
            cv.setFillColor(colors.white)
            cv.setFont("F-B", 8.5)
            cv.saveState()
            cv.translate(PW - TABW / 2.0, y + (slot - 3) / 2.0)
            cv.rotate(90)
            cv.drawCentredString(0, -3, lbl)
            cv.restoreState()
            cv.setFillColor(GREY)
            cv.setFont("F", 7.2)
            cv.drawString(ML, PH - 1.05 * cm, cur[:78])
            cv.setStrokeColor(LINE)
            cv.setLineWidth(0.4)
            cv.line(ML, PH - 1.2 * cm, PW - MR, PH - 1.2 * cm)
        cv.setFillColor(GREY)
        cv.setFont("F", 7.2)
        cv.drawString(ML, 0.72 * cm,
                      "Lernzettel Beratungs- und Servicemanagement (DHfPG)")
        cv.drawRightString(PW - MR, 0.72 * cm, "Seite %d" % d.page)
        cv.setStrokeColor(LINE)
        cv.setLineWidth(0.4)
        cv.line(ML, 0.98 * cm, PW - MR, 0.98 * cm)
        cv.restoreState()

    fr = Frame(ML, MB, AW, PH - MT - MB, id="m")
    doc.addPageTemplates([PageTemplate(id="p", frames=[fr], onPage=onpage)])
    doc.build(build_story(pages))
    return doc


scratch = "/tmp/claude-0/-home-user-Experiments/b6535a1a-9137-5a6f-9f19-8cb4fa12e65e/scratchpad/bsm/_pass1.pdf"
d1 = make({}, [], scratch)
d2 = make(d1.pages, d1.chapstart, PDF)
assert d1.pages == d2.pages, "Seitenzahlen instabil"
print("PDF:", PDF, "| Seiten:", d2.page, "| Stichwörter:", len(TERMS),
      "| TOC-Einträge:", len(toc_entries))
