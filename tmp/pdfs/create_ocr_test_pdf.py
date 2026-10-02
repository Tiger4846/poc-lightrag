from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "ocr-test-10-pages.pdf"
pdfmetrics.registerFont(TTFont("TestSans", r"C:\Windows\Fonts\LeelawUI.ttf"))
pdfmetrics.registerFont(TTFont("TestSansBold", r"C:\Windows\Fonts\tahomabd.ttf"))

INK = colors.HexColor("#1f2937")
BLUE = colors.HexColor("#2563eb")
MUTED = colors.HexColor("#64748b")
BORDER = colors.HexColor("#cbd5e1")
LIGHT = colors.HexColor("#eff6ff")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("TitleThai", fontName="TestSansBold", fontSize=25, leading=32, alignment=TA_CENTER, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle("H1Thai", fontName="TestSansBold", fontSize=18, leading=24, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle("H2Thai", fontName="TestSansBold", fontSize=12, leading=17, textColor=BLUE, spaceBefore=5, spaceAfter=6))
styles.add(ParagraphStyle("BodyThai", fontName="TestSans", fontSize=10.5, leading=16, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle("SmallThai", fontName="TestSans", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle("CenterThai", fontName="TestSans", fontSize=11, leading=17, alignment=TA_CENTER, textColor=INK, spaceAfter=7))


def p(text, style="BodyThai"):
    return Paragraph(text, styles[style])


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.line(18 * mm, A4[1] - 16 * mm, A4[0] - 18 * mm, A4[1] - 16 * mm)
    canvas.setFont("TestSans", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, A4[1] - 12 * mm, "OCR Test Document")
    canvas.drawRightString(A4[0] - 18 * mm, 12 * mm, f"หน้า {doc.page}")
    canvas.restoreState()


def table(data, widths):
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
        ("FONTNAME", (0, 0), (-1, 0), "TestSansBold"),
        ("FONTNAME", (0, 1), (-1, -1), "TestSans"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("LEADING", (0, 0), (-1, -1), 12),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


story = []

# 1
story += [Spacer(1, 45 * mm), p("เอกสารทดสอบ OCR", "TitleThai"), p("10-Page PDF Sample", "CenterThai"), Spacer(1, 12 * mm)]
story += [table([[p("ใช้สำหรับทดสอบการอ่านข้อความจาก PDF", "CenterThai")]], [150 * mm]), Spacer(1, 14 * mm)]
story += [p("ไฟล์นี้มีภาษาไทย ภาษาอังกฤษ ตัวเลข วันที่ ตาราง และรูปแบบเอกสารหลายชนิด เพื่อทดสอบตั้งแต่การอัปโหลดจนถึงการสร้าง Markdown", "CenterThai"), Spacer(1, 22 * mm), p("Generated for document platform testing", "CenterThai"), PageBreak()]

# 2
story += [p("1. ข้อความภาษาไทยและภาษาอังกฤษ", "H1Thai"), p("Thai + English Recognition", "H2Thai")]
story += [p("ระบบจัดการเอกสารนี้ใช้สำหรับจัดเก็บไฟล์ ค้นหาเอกสาร และแปลงข้อมูลจากภาพหรือ PDF ให้เป็นข้อความที่สามารถนำไปใช้งานต่อได้ ผู้ใช้สามารถอัปโหลดไฟล์ ตรวจสอบสถานะ OCR และอ่านผลลัพธ์ได้จากหน้าเดียว")]
story += [p("This document is a sample for testing optical character recognition. The system should preserve headings, paragraphs, punctuation, and the order of content. English text is included to verify bilingual recognition.")]
story += [p("ประโยคสั้น: แมวสีขาวนั่งอยู่บนเก้าอี้ใกล้หน้าต่าง และมีแสงแดดส่องเข้ามาในห้อง")]
story += [p("ผลลัพธ์ที่คาดหวังคือข้อความมีความครบถ้วน อ่านง่าย และไม่มีการสลับลำดับบรรทัด", "SmallThai"), PageBreak()]

# 3
story += [p("2. ตัวเลข วันที่ และข้อมูลติดต่อ", "H1Thai"), p("Numbers, Dates, Times, and Contact Data", "H2Thai")]
data = [[p("รายการ", "SmallThai"), p("ค่า", "SmallThai"), p("หมายเหตุ", "SmallThai")], [p("วันที่เริ่มต้น"), p("1 ตุลาคม 2569 / 2026-10-01"), p("รูปแบบไทยและ ISO")], [p("เวลา"), p("09:30 - 17:45 น."), p("เวลาทำการ")], [p("จำนวนเอกสาร"), p("1,250 ไฟล์"), p("comma คั่นหลักพัน")], [p("ราคาโดยประมาณ"), p("฿ 12,345.67"), p("สกุลเงินบาท")], [p("รหัสทดสอบ"), p("OCR-TH-010-2026"), p("ตัวอักษรและตัวเลข")]]
story += [table(data, [42 * mm, 60 * mm, 65 * mm]), Spacer(1, 10 * mm), p("ผู้ประสานงาน: คุณทดสอบ ระบบเอกสาร | โทรศัพท์: 02-123-4567 | อีเมล: test@example.com"), p("The quick brown fox jumps over the lazy dog. 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ"), PageBreak()]

# 4
story += [p("3. รายการขั้นตอนการทำงาน", "H1Thai"), p("Workflow Checklist", "H2Thai")]
for i, text in enumerate(["อัปโหลดไฟล์ PDF หรือรูปภาพเข้าสู่ระบบ", "ตรวจสอบว่าไฟล์ปรากฏในรายการเอกสาร", "กดปุ่ม OCR และรอให้สถานะเปลี่ยนเป็นเสร็จแล้ว", "เปิดดูผลลัพธ์ข้อความที่ระบบสร้างขึ้น", "ตรวจสอบหัวข้อ ตาราง ตัวเลข และภาษาไทย"], 1):
    story += [p(f"<b>{i}.</b> {text}")]
story += [p("รายการย่อยสำหรับผู้ตรวจสอบ", "H2Thai")]
for text in ["ข้อความไม่หาย", "ลำดับหน้าไม่เปลี่ยน", "ตารางยังอ่านได้", "ตัวเลขสำคัญตรงกับต้นฉบับ", "ไม่มีอักขระแปลกปลอม"]:
    story += [p(f"• {text}")]
story += [p("หมายเหตุ: เอกสารจริงอาจมีรูปภาพ ตาราง หรือแบบฟอร์มที่ซับซ้อนกว่าตัวอย่างนี้", "SmallThai"), PageBreak()]

# 5
story += [p("4. ตารางข้อมูลตัวอย่าง", "H1Thai"), p("Structured Table Recognition", "H2Thai")]
data = [[p("ลำดับ", "SmallThai"), p("ชื่อเอกสาร", "SmallThai"), p("ประเภท", "SmallThai"), p("สถานะ", "SmallThai"), p("คะแนน", "SmallThai")], [p("1"), p("คู่มือการใช้งานระบบ"), p("PDF"), p("พร้อมใช้งาน"), p("98.5")], [p("2"), p("แบบฟอร์มลงทะเบียน"), p("Image"), p("รอ OCR"), p("-")], [p("3"), p("รายงานผลประจำเดือน"), p("PDF"), p("เสร็จแล้ว"), p("87.0")], [p("4"), p("ใบเสร็จรับเงิน"), p("PNG"), p("ตรวจสอบแล้ว"), p("100")], [p("5"), p("เอกสารประกอบการประชุม"), p("DOCX"), p("ไม่รองรับ"), p("N/A")]]
story += [table(data, [18 * mm, 63 * mm, 28 * mm, 42 * mm, 22 * mm]), Spacer(1, 10 * mm), p("ตารางนี้ใช้ตรวจสอบการอ่านแถวและคอลัมน์ รวมถึงข้อมูลที่เป็นตัวเลข เครื่องหมายขีด และคำภาษาอังกฤษ"), PageBreak()]

# 6
story += [p("5. ย่อหน้าขนาดยาว", "H1Thai"), p("Long Paragraph and Line Wrapping", "H2Thai")]
long_text = "การจัดการเอกสารที่มีประสิทธิภาพควรเริ่มจากการจัดเก็บไฟล์อย่างเป็นระบบ ตั้งชื่อไฟล์ให้สื่อความหมาย แบ่งเอกสารตามโครงการหรือหน่วยงาน และกำหนดสิทธิ์การเข้าถึงให้เหมาะสม เมื่อผู้ใช้ส่งไฟล์ PDF หรือรูปภาพเข้าสู่ระบบ กระบวนการ OCR จะช่วยอ่านข้อความจากเอกสารและสร้างผลลัพธ์ที่ค้นหาได้ง่ายขึ้น อย่างไรก็ตาม คุณภาพของผลลัพธ์ขึ้นอยู่กับความคมชัดของภาพ การจัดวางเอกสาร ภาษาในเอกสาร และความซับซ้อนของตารางหรือแบบฟอร์ม ดังนั้นควรตรวจสอบผลลัพธ์หลังการประมวลผลทุกครั้ง โดยเฉพาะข้อมูลสำคัญ เช่น ชื่อบุคคล เลขที่เอกสาร วันที่ จำนวนเงิน และเงื่อนไขในสัญญา"
story += [p(long_text), p(long_text), p("This paragraph is repeated intentionally to verify line wrapping and page order."), PageBreak()]

# 7
story += [p("6. เครื่องหมายและสัญลักษณ์", "H1Thai"), p("Punctuation and Special Characters", "H2Thai"), p("เครื่องหมายที่ควรอ่านได้: ! ? , . : ; / \\ ( ) [ ] { } + - = _ # @ % & *"), p("ภาษาอังกฤษ: OCR, API, PDF, JSON, Markdown, HTTP 200 OK, status_code, file_id"), p("ข้อความตัวอย่าง: หากสถานะเป็น SUCCESS ให้เปิดดูผลลัพธ์ หากเป็น FAILED ให้กดปุ่ม Retry และตรวจสอบ log ของ Worker")]
data = [[p("Field", "SmallThai"), p("Example", "SmallThai")], [p("file_name"), p("sample_document_010.pdf")], [p("page_count"), p("10")], [p("ocr_status"), p("SUCCESS")], [p("confidence"), p("0.987")]]
story += [table(data, [45 * mm, 105 * mm]), PageBreak()]

# 8
story += [p("7. แบบฟอร์มข้อมูล", "H1Thai"), p("Form-like Layout", "H2Thai")]
data = [[p("ชื่อโครงการ"), p("โครงการทดสอบระบบจัดการเอกสาร")], [p("หน่วยงาน"), p("ฝ่ายเทคโนโลยีสารสนเทศ")], [p("ผู้รับผิดชอบ"), p("Ramin Piyanuluk")], [p("วันที่ตรวจสอบ"), p("01/10/2569")], [p("ผลการทดสอบ"), p("ผ่านบางส่วน - ต้องตรวจสอบตาราง")]]
form = Table(data, colWidths=[48 * mm, 102 * mm])
form.setStyle(TableStyle([("FONTNAME", (0, 0), (-1, -1), "TestSans"), ("FONTSIZE", (0, 0), (-1, -1), 10), ("GRID", (0, 0), (-1, -1), 0.5, BORDER), ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
story += [form, Spacer(1, 12 * mm), p("ลายเซ็นผู้ตรวจสอบ: ________________________________"), Spacer(1, 6 * mm), p("หมายเหตุเพิ่มเติม: เอกสารตัวอย่างนี้ไม่มีข้อมูลส่วนบุคคลจริง", "SmallThai"), PageBreak()]

# 9
story += [p("8. ตัวระบุหน้าและลำดับเนื้อหา", "H1Thai"), p("Page Markers and Reading Order", "H2Thai")]
for i in range(1, 6):
    story += [p(f"[BLOCK {i}] เอกสารทดสอบ OCR หน้า 9 ส่วนที่ {i} - ข้อความนี้ใช้ตรวจสอบว่าระบบรักษาลำดับของเนื้อหาได้ถูกต้อง")]
story += [p("BEGIN_DOCUMENT_SECTION"), p("เนื้อหาตรงกลางเอกสาร: ข้อมูลนี้ควรอยู่หลังหัวข้อและก่อนส่วนสรุป"), p("END_DOCUMENT_SECTION"), p("ลำดับที่คาดหวัง: BLOCK 1 → BLOCK 2 → BLOCK 3 → BLOCK 4 → BLOCK 5 → BEGIN → เนื้อหา → END"), PageBreak()]

# 10
story += [p("9. สรุปการทดสอบ", "H1Thai"), p("Final OCR Verification Checklist", "H2Thai")]
data = [[p("รายการตรวจสอบ", "SmallThai"), p("ผลที่คาดหวัง", "SmallThai")], [p("จำนวนหน้า"), p("10 หน้า")], [p("ภาษาไทย"), p("อ่านได้ครบและไม่สลับบรรทัด")], [p("ภาษาอังกฤษ"), p("อ่านคำศัพท์ได้ถูกต้อง")], [p("ตัวเลขและวันที่"), p("รักษารูปแบบและค่าตัวเลข")], [p("ตาราง"), p("แยกแถวและคอลัมน์ได้")], [p("ลำดับหน้า"), p("หน้า 1 ถึงหน้า 10 ต่อเนื่อง")]]
story += [table(data, [55 * mm, 95 * mm]), Spacer(1, 12 * mm), p("จบเอกสารทดสอบ OCR", "CenterThai"), p("Thank you for testing.", "CenterThai")]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=23 * mm, bottomMargin=18 * mm, title="OCR Test Document - 10 Pages", author="Document Platform")
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUTPUT)
