import json,re,sys,os,shutil,html
from PIL import Image
S,R=sys.argv[1],sys.argv[2]
M=S+'/pptx/ppt/media/'
for d in ['img','img/icone','img/prodotti','js','css']: os.makedirs(f'{R}/assets/{d}',exist_ok=True)
# logo
lg=Image.open(M+'image1.png').convert('RGBA'); lg=lg.crop(lg.getbbox()); lg.thumbnail((720,720),Image.LANCZOS); lg.save(f'{R}/assets/img/logo-idal.png',optimize=True)
# white icon with alpha from whiteness
icons={'salumi':'image4','caseari':'image5','conserve':'image6','ittico':'image7','legumi':'image8','ortofrutta':'image9','forno':'image10','pasta':'image11'}
for k,f in icons.items():
    im=Image.open(M+f+'.jpeg').convert('RGB'); w,h=im.size
    bg=im.getpixel((5,5))
    a=Image.new('L',im.size)
    px=im.load(); ap=a.load()
    for y in range(h):
        for x in range(w):
            r,g,b=px[x,y]
            m=min(r,g,b); bm=min(bg)
            v=(m-bm)/(255-bm) if 255>bm else 0
            ap[x,y]=max(0,min(255,int(v*255*1.15)))
    out=Image.new('RGBA',im.size,(255,255,255,0)); out.putalpha(a)
    out=Image.merge('RGBA',(Image.new('L',im.size,255),)*3+(a,))
    out=out.crop(a.getbbox()); out.thumbnail((360,360),Image.LANCZOS)
    out.save(f'{R}/assets/img/icone/{k}.png',optimize=True)
for src,dst in [('image2.png','hero-caseari.webp'),('image3.jpeg','hero-salumi.webp')]:
    im=Image.open(M+src).convert('RGB'); im.thumbnail((2200,2200),Image.LANCZOS); im.save(f'{R}/assets/img/{dst}','WEBP',quality=78,method=6)
nv=Image.open(M+'image13.png').convert('RGBA'); nv=nv.crop(nv.getbbox()); nv.save(f'{R}/assets/img/numero-verde.png',optimize=True)
