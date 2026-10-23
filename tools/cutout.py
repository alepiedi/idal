import sys
from PIL import Image, ImageFilter, ImageChops
import numpy as np
from collections import deque
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(int)
h, w, _ = a.shape
# "sfondo" = pixel quasi bianchi e poco saturi, collegati al bordo
mx = a.max(2); mn = a.min(2)
bgish = (mn > 232) & ((mx - mn) < 14)
mask = np.zeros((h, w), bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if bgish[y, x] and not mask[y, x]: mask[y, x] = True; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if bgish[y, x] and not mask[y, x]: mask[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and bgish[ny, nx]:
            mask[ny, nx] = True; q.append((ny, nx))
alpha = Image.fromarray(np.where(mask, 0, 255).astype('uint8'))
# bordo morbido: erode 1px poi sfuma
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
rgba = im.copy(); rgba.putalpha(alpha)
bb = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
rgba = rgba.crop(bb)
rgba.save(out, 'PNG')
print(out, rgba.size)
