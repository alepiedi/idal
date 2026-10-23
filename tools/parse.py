import re,json,sys
S=sys.argv[1]
html=open(S+'/bbox.html').read()
pages=re.split(r'<page ',html)[1:]
CATS=['ORTOFRUTTA','CONSERVE','SEMISTAGIONATI','CASEARI','SALUMERIA','PASTA','PRODOTTI','ITTICO','TRAMEZZINI']
out=[]
for pi,pg in enumerate(pages):
    pno=pi+2
    W=[(float(a),float(b),float(c),float(d),t) for a,b,c,d,t in re.findall(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<',pg)]
    head={}
    for x0,y0,x1,y1,t in W:
        if 60<y0<110 and t in CATS:
            side='L' if x0<595 else 'R'
            head.setdefault(side,t)
    for x0,y0,x1,y1,t in W:
        if re.fullmatch(r'IDA\d{4}',t):
            cx=(x0+x1)/2
            lines={}
            for a,b,c,d,u in W:
                ux=(a+c)/2
                if abs(ux-cx)<66 and y0+8<b<y0+48:
                    lines.setdefault(round(b),[]).append((a,u))
            ls=[' '.join(u for a,u in sorted(v)) for k,v in sorted(lines.items())]
            side='L' if cx<595 else 'R'
            other='R' if side=='L' else 'L'
            out.append(dict(code=t,page=pno,cx=cx,cy=y0,cat=head.get(side) or head.get(other),lines=ls))
json.dump(out,open(S+'/raw.json','w'),indent=1,ensure_ascii=False)
from collections import Counter
print(len(out),Counter(o['cat'] for o in out))
for o in out:
    if len(o['lines'])!=2: print(o)
