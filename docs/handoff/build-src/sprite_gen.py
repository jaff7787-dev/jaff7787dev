"""달리는 병아리 4프레임 런 사이클 스프라이트 (앱 팔레트, 오른쪽으로 달림)"""
from PIL import Image, ImageDraw
import base64, io

INK = (43, 33, 67, 255)
YELLOW = (255, 212, 59, 255)
YELLOW_D = (255, 190, 40, 255)
ORANGE = (255, 154, 60, 255)
PINK = (255, 111, 165, 150)
WHITE = (255, 255, 255, 255)

S = 256
def frame(pose):
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    low = pose in (0, 2)
    bob = 8 if low else -10
    cx, cy = 126, 118 + bob
    O = 13

    # ---- 다리 (몸 아래로 확실히 보이게) ----
    def leg(hip_dx, foot_dx, foot_dy):
        hx, hy = cx + hip_dx, cy + 42
        fx, fy = cx + foot_dx, cy + 56 + foot_dy
        d.line([(hx, hy), (fx, fy)], fill=INK, width=24)
        d.line([(hx, hy), (fx, fy)], fill=ORANGE, width=11)
        d.line([(fx - 2, fy), (fx + 20, fy - 3)], fill=INK, width=22)
        d.line([(fx, fy), (fx + 16, fy - 2)], fill=ORANGE, width=10)
    if pose == 0:
        leg(14, 52, 40); leg(-14, -50, 30)
    elif pose == 2:
        leg(14, -44, 36); leg(-14, 46, 34)
    else:
        leg(12, 26, 22); leg(-12, -20, 16)

    # ---- 몸통 ----
    d.ellipse([cx-58, cy-52, cx+58, cy+56], fill=YELLOW, outline=INK, width=O)

    # ---- 날개 (몸 옆 작은 날개, 프레임별 파닥) ----
    ang = {0: 16, 1: -10, 2: 16, 3: -24}[pose]
    wing = Image.new('RGBA', (70, 46), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wing)
    wd.ellipse([5, 5, 65, 41], fill=YELLOW_D, outline=INK, width=8)
    wing = wing.rotate(ang, expand=True, resample=Image.BICUBIC)
    img.paste(wing, (cx - 40, cy - 8 - (7 if ang < 0 else 0)), wing)

    # ---- 얼굴 ----
    d.ellipse([cx+18, cy-28, cx+38, cy-8], fill=INK)                 # 눈
    d.ellipse([cx+23, cy-24, cx+31, cy-16], fill=WHITE)              # 눈 하이라이트
    d.ellipse([cx+20, cy+4, cx+40, cy+20], fill=PINK)                # 볼
    # 부리 (크게, 낮은 포즈에서 벌림)
    if low:
        d.polygon([(cx+52, cy-16), (cx+82, cy-5), (cx+52, cy+6)], fill=ORANGE)
        d.line([(cx+52, cy-16), (cx+82, cy-5), (cx+52, cy+6), (cx+52, cy-16)], fill=INK, width=9, joint='curve')
    else:
        d.polygon([(cx+52, cy-14), (cx+80, cy-8), (cx+54, cy+4)], fill=ORANGE)
        d.line([(cx+52, cy-14), (cx+80, cy-8), (cx+54, cy+4), (cx+52, cy-14)], fill=INK, width=9, joint='curve')

    # ---- 머리 깃털 ----
    d.line([(cx-8, cy-52), (cx-18, cy-78)], fill=INK, width=11)
    d.line([(cx+8, cy-50), (cx+14, cy-78)], fill=INK, width=11)
    return img

FRAME_OUT = 68
sheet = Image.new('RGBA', (FRAME_OUT*4, FRAME_OUT), (0,0,0,0))
for i in range(4):
    f = frame(i).resize((FRAME_OUT, FRAME_OUT), Image.LANCZOS)
    sheet.paste(f, (i*FRAME_OUT, 0))
sheet.save('runner_sheet.png')
prev = sheet.resize((FRAME_OUT*4*3, FRAME_OUT*3), Image.NEAREST)
bg = Image.new('RGBA', prev.size, (255, 247, 232, 255))
bg.paste(prev, (0,0), prev)
bg.convert('RGB').save('runner_preview.png')
buf = io.BytesIO(); sheet.save(buf, 'PNG', optimize=True)
print('sprite bytes:', len(buf.getvalue()))
