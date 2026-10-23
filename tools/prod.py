import json,re,sys,html,os
S,R=sys.argv[1],sys.argv[2]
d=json.load(open(S+'/raw.json'))
FIX={'Insalatal':'Insalata','OrecchiettE':'Orecchiette','Formomaggio':'Formaggio','Ugherese':'Ungherese','Spianata.Piccante':'Spianata Piccante',
 'Grattuggiato':'Grattugiato','Spinac':'Spinaci','Ver.Tondo':'Verde Tondo','Filet.Tonno':'Filetti di Tonno','Denocc.':'Denocciolate','Colt.':'Coltura ',
 'MixAromi':'Mix Aromi','Picc.':'Piccante','Olio Extra Verg.Oliva IT':'Olio Extravergine di Oliva Italiano','Lenticchie Secchi':'Lenticchie Secche',
 'Mandarino Form.Provolone':'Provolone Mandarino','Pancettone Form.Provolone':'Provolone Pancettone','Form.Marzolino SV':'Formaggio Marzolino S.V.',
 'Pomodoro Ciliegino 1':'Pomodoro Ciliegino','Prosciutto crudo':'Prosciutto Crudo'}
ORIG={'IT':'Italia','ES':'Spagna','Grecia':'Grecia','America Mer.':'America Meridionale'}
SALUMI=re.compile(r'Prosciutto|Mortadella|Salame|Salsiccia|Pancetta|Guanciale|Speck|Coppa|Bresaola|Spianata|Ventricina|Culatta|Porchetta|Capocollo|Fiocco|Sgambatello|Tacchino|Dindò|Mattonella')
out=[]
for o in d:
    n,f=[html.unescape(x).strip() for x in o['lines']]
    m=re.match(r'^(.*?)\s+(\d[\d,]*\s*g\s*x\s*\d+)$',n)
    if m: n,f=m.group(1),m.group(2)+' · '+f
    for a,b in FIX.items(): n=n.replace(a,b)
    n=re.sub(r'\s+',' ',n).strip()
    if f=='cccccccc': f=''
    orig=''
    mo=re.search(r'\s(IT|ES|Grecia|America Mer\.)\s*1?$',f) or re.search(r'\s(IT)$',f)
    if mo: orig=ORIG[mo.group(1)]; f=f[:mo.start()].strip()
    if f and not re.search(r'\d',f) and f not in('S.V.','Forma','forma','Forma Piccola','Forma Grande'):
        n=n+' '+f; f=''
    f=re.sub(r'(\d)\s*x\s*(\d)',r'\1 × \2',f); f=re.sub(r'(g|kg|Kg|pz)x\s*(\d)',r'\1 × \2',f); f=re.sub(r'\s+x\s*(\d)',r' × \1',f)
    f=f.replace(' 6',' × 6') if re.fullmatch(r'1 kg 6',f) else f
    c=o['cat']; p=o['page']; sub=''
    if c=='ORTOFRUTTA':
        k='ortofrutta'; sub='IV Gamma' if p<=3 else ('Frutta' if p>=5 and not n.startswith(('Pomodoro','Rosso','Giallo')) else 'Verdura')
        if 'Idroponica' in n: sub='Coltura idroponica'
        if n in('Prezzemolo','Basilico','Menta'): sub='Aromi'
    elif c in('CASEARI','SEMISTAGIONATI'):
        k='caseari'; sub='Semistagionati' if c=='SEMISTAGIONATI' else ('Freschi' if p==7 else 'Stagionati e DOP')
        if SALUMI.search(n): k,sub='salumi','Preaffettati'
    elif c=='SALUMERIA':
        k='salumi'; sub='Preaffettati' if p==12 or (p==13 and o['cx']<595 and o['cy']<400) else 'Banco taglio'
        if re.search(r'Emmenthal|Provola',n): k,sub='caseari','A fette'
    elif c=='PASTA': k='pasta'; sub='Gnocchi' if re.search('Gnocchi|Chicche|Spatzle',n) else ('Pasta ripiena' if re.search('Tortellini|Ravioli',n) else ('All\'uovo' if 'uovo' in n else 'Semola di grano duro'))
    elif c=='PRODOTTI':
        k='forno'; sub='Pane e friselle'
        if re.search('Pinsa|Focaccia|Piadina',n): sub='Focacce, pinse e piadine'
        if 'Trecciolo' in n: sub='Tipici del Sannio'
        if 'Triangolino' in n: sub='Tramezzini'
        if 'Lenticchie' in n: k,sub='conserve','Legumi'
        if 'Olio' in n: k,sub='conserve','Dispensa'
    elif c=='CONSERVE': k='conserve'; sub='Sott\'olio e grigliati'
    elif c=='ITTICO': k='ittico'; sub='Salmone affumicato' if 'Salmone' in n else 'Tonno'
    img=os.path.getsize(f"{S}/prod/{o['code']}.webp")>3000 and o['code'] not in('IDA0997','IDA0998')
    r={'c':o['code'],'n':n,'f':f,'k':k,'s':sub}
    if orig: r['o']=orig
    if not img: r['x']=1
    out.append(r)
from collections import Counter
print(Counter(r['k'] for r in out)); print(Counter((r['k'],r['s']) for r in out))
js='/* Referenze a marchio IDAL — estratte dal Catalogo 2026 (aggiornato ad agosto 2026). Rigenerabile con tools/. */\nwindow.IDAL_PRODOTTI='+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{','},\n{')+';\n'
open(R+'/assets/js/prodotti.js','w').write(js)
