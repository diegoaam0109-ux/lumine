from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
NM='node_modules/'
def rename(f, family, sub, weight, bold=False, italic=False, width=5):
    nm=f['name']
    for nid in (16,17,21,22,25):
        nm.removeNames(nameID=nid)
    full = family if sub=='Regular' else f'{family} {sub}'
    ps = (family.replace(' ','') + '-' + sub.replace(' ','')).replace('--','-')
    for nid,val in {1:family,2:sub,3:f'Lumine;{ps}',4:full,6:ps}.items():
        nm.setName(val,nid,3,1,0x409); nm.setName(val,nid,1,0,0)
    os2=f['OS/2']; os2.usWeightClass=weight; os2.usWidthClass=width
    sel=os2.fsSelection & ~(1|32|64)
    if bold: sel|=32
    if italic: sel|=1
    if not bold and not italic: sel|=64
    os2.fsSelection=sel
    ms=0
    if bold: ms|=1
    if italic: ms|=2
    f['head'].macStyle=ms
    if 'STAT' in f: del f['STAT']
def var_instance(src, loc, out, **kw):
    f=TTFont(src); f.flavor=None
    inst=instancer.instantiateVariableFont(f, loc)
    rename(inst, **kw); inst.flavor=None; inst.save(out); print('ok',out)
def static(src,out,**kw):
    f=TTFont(src); f.flavor=None; rename(f,**kw); f.save(out); print('ok',out)
A=NM+'@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
var_instance(A,{'wght':800,'wdth':112.5},'fonts/ArchivoSemiExpanded-ExtraBold.ttf',family='Archivo SemiExpanded ExtraBold',sub='Regular',weight=800,width=6)
var_instance(A,{'wght':700,'wdth':75},'fonts/ArchivoCondensed-Bold.ttf',family='Archivo Condensed',sub='Bold',weight=700,bold=True,width=3)
var_instance(A,{'wght':400,'wdth':75},'fonts/ArchivoCondensed-Regular.ttf',family='Archivo Condensed',sub='Regular',weight=400,width=3)
F=NM+'@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'
var_instance(F,{'wght':400},'fonts/Figtree-Regular.ttf',family='Figtree',sub='Regular',weight=400)
var_instance(F,{'wght':700},'fonts/Figtree-Bold.ttf',family='Figtree',sub='Bold',weight=700,bold=True)
static(NM+'@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2','fonts/IBMPlexMono-Regular.ttf',family='IBM Plex Mono',sub='Regular',weight=400)
static(NM+'@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2','fonts/IBMPlexMono-Bold.ttf',family='IBM Plex Mono',sub='Bold',weight=700,bold=True)
static(NM+'@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2','fonts/InstrumentSerif-Italic.ttf',family='Instrument Serif',sub='Italic',weight=400,italic=True)
static(NM+'@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2','fonts/InstrumentSerif-Regular.ttf',family='Instrument Serif',sub='Regular',weight=400)
