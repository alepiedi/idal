import json,sys,os
from PIL import Image, ImageChops
S=sys.argv[1]; OUT=sys.argv[2]
os.makedirs(OUT,exist_ok=True)
d=json.load(open(S+'/raw.json'))
k=220/72
cache={}
for o in d:
    p=o['page']
    if p not in cache: cache={p:Image.open(f"{S}/hi/p-{p:02d}.png").convert('RGB')}
    im=cache[p]
    x0,x1=(o['cx']-66)*k,(o['cx']+66)*k
    y0,y1=(o['cy']-174)*k,(o['cy']-5)*k
    c=im.crop((int(x0),int(y0),int(x1),int(y1)))
    bg=Image.new('RGB',c.size,(255,255,255))
    diff=ImageChops.difference(c,bg).convert('L').point(lambda v:255 if v>18 else 0)
    bb=diff.getbbox()
    if bb:
        pad=8
        c=c.crop((max(0,bb[0]-pad),max(0,bb[1]-pad),min(c.size[0],bb[2]+pad),min(c.size[1],bb[3]+pad)))
    c.thumbnail((420,420),Image.LANCZOS)
    c.save(f"{OUT}/{o['code']}.webp",'WEBP',quality=80,method=6)
print('done')
