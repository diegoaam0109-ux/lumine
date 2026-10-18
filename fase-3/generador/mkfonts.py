# Crea las tipografías estáticas de la opción B (familia Archivo) desde los paquetes de npm.
# Uso: npm i @fontsource-variable/archivo && pip install fonttools brotli && python3 mkfonts.py
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
N='node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
I='node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-italic.woff2'
var_instance(N,{'wght':800,'wdth':125},'../fuentes/ArchivoExpanded-ExtraBold.ttf',family='Archivo Expanded ExtraBold',sub='Regular',weight=800,width=7)
var_instance(I,{'wght':300,'wdth':125},'../fuentes/ArchivoExpandedLight-Italic.ttf',family='Archivo Expanded Light',sub='Italic',weight=300,italic=True,width=7)
var_instance(N,{'wght':300,'wdth':125},'../fuentes/ArchivoExpandedLight-Regular.ttf',family='Archivo Expanded Light',sub='Regular',weight=300,width=7)
var_instance(N,{'wght':400,'wdth':100},'../fuentes/Archivo-Regular.ttf',family='Archivo',sub='Regular',weight=400)
var_instance(N,{'wght':700,'wdth':100},'../fuentes/Archivo-Bold.ttf',family='Archivo',sub='Bold',weight=700,bold=True)
var_instance(N,{'wght':500,'wdth':87.5},'../fuentes/ArchivoSemiCondensed-Medium.ttf',family='Archivo SemiCondensed Medium',sub='Regular',weight=500,width=4)
var_instance(N,{'wght':700,'wdth':87.5},'../fuentes/ArchivoSemiCondensed-Bold.ttf',family='Archivo SemiCondensed Medium',sub='Bold',weight=700,bold=True,width=4)
