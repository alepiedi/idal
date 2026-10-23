import json,math,random,sys
S=sys.argv[1]
d=json.load(open(S+'/geo/reg.geojson'))
LON0,LAT0=6.6,47.1; C=math.cos(math.radians(42)); K=1000/((18.55-6.6)*C)
def P(lon,lat): return ((lon-LON0)*C*K,(LAT0-lat)*K)
def dp(pts,eps):
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1]; dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy) or 1e-9
    i,m=0,0
    for j in range(1,len(pts)-1):
        p=pts[j]; dd=abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L if L>1e-9 else math.hypot(p[0]-a[0],p[1]-a[1])
        if dd>m: i,m=j,dd
    if m>eps: return dp(pts[:i+1],eps)[:-1]+dp(pts[i:],eps)
    return [a,b]
def area(r): return abs(sum(r[i][0]*r[i-1][1]-r[i-1][0]*r[i][1] for i in range(len(r))))/2
HI={'Campania':.52,'Puglia':.28,'Basilicata':.1,'Molise':.1}
out=[];polys={}
for f in d['features']:
    n=f['properties']['reg_name'].split('/')[0]
    g=f['geometry']; cs=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    path=[];rings=[]
    for poly in cs:
        r=[P(*c) for c in poly[0]]
        if area(r)<6: continue
        s=dp(r,0.45)
        if len(s)<4: continue
        rings.append(r)
        path.append('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in s)+'Z')
    out.append({'n':n,'d':''.join(path),'hi':n in HI})
    if n in HI: polys[n]=rings
def inside(pt,ring):
    x,y=pt;c=False;j=len(ring)-1
    for i in range(len(ring)):
        xi,yi=ring[i];xj,yj=ring[j]
        if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: c=not c
        j=i
    return c
random.seed(7);pts=[]
for n,w in HI.items():
    rings=polys[n];xs=[p[0] for r in rings for p in r];ys=[p[1] for r in rings for p in r]
    need=round(2700*w);got=0
    while got<need:
        p=(random.uniform(min(xs),max(xs)),random.uniform(min(ys),max(ys)))
        if any(inside(p,r) for r in rings): pts+= [round(p[0]),round(p[1])];got+=1
cities={'Benevento':(14.7819,41.1298),'Durazzano':(14.4497,41.0636),'Napoli':(14.2681,40.8518),'Bari':(16.8719,41.1171),'Campobasso':(14.6594,41.5603),'Potenza':(15.8055,40.6404),'Salerno':(14.7681,40.6824),'Foggia':(15.5443,41.4622),'Lecce':(18.1710,40.3529),'Matera':(16.6043,40.6664),'Avellino':(14.7900,40.9146),'Caserta':(14.3324,41.0742),'Isernia':(14.2333,41.5960),'Taranto':(17.2470,40.4644)}
cities={k:[round(v,1) for v in P(*c)] for k,c in cities.items()}
json.dump({'proj':[LON0,LAT0,round(C*K,4),round(K,4)],'regions':out,'pts':pts,'cities':cities,'w':1000,'h':round((47.1-35.49)*K)},open(S+'/geo/geo.json','w'),separators=(',',':'),ensure_ascii=False)
print(len(json.dumps(out)),len(pts)//2, round((47.1-35.49)*K))
