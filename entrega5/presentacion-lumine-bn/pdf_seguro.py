"""PDF RGB desde las láminas verificadas: evita máscaras y degradados PDF del navegador."""
from pathlib import Path
from reportlab.pdfgen import canvas
from PIL import Image
import fitz,json
P=Path(__file__).resolve().parent;OUT=P/'salida'
def crear():
 target=OUT/'Lumine_IA_Presentacion_7_min.pdf'
 pdf=canvas.Canvas(str(target),pagesize=(960,540),pageCompression=1)
 pdf.setTitle('Lumine Motors · IA aplicada · Presentación de siete minutos')
 pdf.setAuthor('Diego Alarcón, Benjamín Torres y Lukas Verdugo')
 for i in range(1,18):
  pdf.drawImage(str(OUT/'slides'/f'{i:02d}.png'),0,0,960,540,mask=None)
  pdf.showPage()
 pdf.save()
 doc=fitz.open(target);assert len(doc)==17
 checks=[]
 for i,page in enumerate(doc):
  pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
  img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
  sample=img.resize((192,108));pink=sum(r>180 and b>80 and r>g*1.5 and b>g*1.3 for r,g,b in sample.getdata())
  checks.append({'lamina':i+1,'pixeles_fucsia':pink})
  assert pink<10,(i+1,pink)
  if i==11:img.save(OUT/'cierre-pdf-verificado.png')
 (OUT/'verificacion-pdf.json').write_text(json.dumps(checks,indent=2))
 print('PDF RGB: 17 páginas verificadas, sin fondos fucsia detectados.')
if __name__=='__main__':crear()
