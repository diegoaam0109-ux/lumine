#!/usr/bin/env python3
"""v6 académica: conserva el motor operativo recibido y reconstruye la evaluación.
Ejecutar desde cualquier directorio. Luego recalcular con LibreOffice y verificar.
"""
from pathlib import Path
from copy import copy
from datetime import datetime
import re, json, hashlib
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.worksheet.pagebreak import Break
from openpyxl.workbook.properties import CalcProperties

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'revision-13-11-2026/fuentes/base/Lumine_Plan_Financiero_Fase4_recibido.xlsx'
OUT=ROOT/'excel/v6_academico_conciliado.xlsx'
w=openpyxl.load_workbook(SOURCE)
cached=openpyxl.load_workbook(SOURCE,data_only=True)
BLUE='12AAE9'; PALE='EAF7FD'; BLACK='000000'
NUM='#,##0.00;(#,##0.00);–'; INT='#,##0;(#,##0);–'; PCT='0.00%;(0.00%);–'
source_inputs=[]
for row in w['Supuestos']:
 source_inputs.append([c.value for c in row])
original_rates={r:w['6 Tasa de descuento'].cell(r,3).value for r in range(6,14)}
original_lives={r:w['1 Inversión'].cell(r,4).value for r in range(6,13)}
original_results={k:cached[s][a].value for k,s,a in [('tir','4 Flujo puro','C30'),('van','4 Flujo puro','C29'),('i0','4 Flujo puro','C24'),('ct','3 Capital de trabajo','C21')]}
# Conservamos sólo motores necesarios. El original íntegro se conserva como fuente.
keep=['Mensual','Anual','1 Inversión','2 Ingresos y costos']
for s in list(w.sheetnames):
 if s not in keep:del w[s]
w['1 Inversión'].title='Calc inversión';w['2 Ingresos y costos'].title='Calc resultados'
# Las referencias de los motores no dependen de las antiguas hojas de evaluación.
def remap(f):
 f=re.sub(r"(?:'Supuestos'|Supuestos)!\$?C\$?(\d+)",lambda m:f"Datos!$C${int(m.group(1))+40}",f)
 f=f.replace("'1 Inversión'!","'Calc inversión'!").replace("'2 Ingresos y costos'!","'Calc resultados'!")
 return f
for s in w:
 for row in s:
  for c in row:
   if c.data_type=='f':c.value=remap(c.value)
for r in [37,38]:w['Calc inversión'].cell(r,3,'=0')
for s in w:s.sheet_state='hidden'

# Las hojas nuevas se diseñan sin rangos combinados sobre los números.
def sheet(name,title,subtitle='',end=8):
 s=w.create_sheet(name);s.sheet_view.showGridLines=False;s.sheet_properties.pageSetUpPr.fitToPage=True
 s.merge_cells(start_row=1,start_column=1,end_row=1,end_column=end);s['A1']=title;s['A1'].font=Font(name='Aptos',size=20,bold=True,color=BLACK)
 s.merge_cells(start_row=2,start_column=1,end_row=3,end_column=end);s['A2']=subtitle;s['A2'].alignment=Alignment(wrap_text=True,vertical='center');s.row_dimensions[2].height=21;s.row_dimensions[3].height=18
 s.column_dimensions['A'].width=3;s.column_dimensions['B'].width=48
 for c in range(3,end+1):s.column_dimensions[openpyxl.utils.get_column_letter(c)].width=17
 s.freeze_panes='D6';s.sheet_properties.tabColor=BLUE
 s.page_setup.orientation='landscape';s.page_setup.paperSize=s.PAPERSIZE_A3;s.page_setup.fitToWidth=1;s.page_setup.fitToHeight=1
 s.page_margins.left=.25;s.page_margins.right=.25;s.page_margins.top=.3;s.page_margins.bottom=.3
 s.oddFooter.center.text='Lumine Motors · Modelo de evaluación · &P / &N'
 return s

def cell(s,r,c,v,fmt=None):
 z=s.cell(r,c,v);z.font=Font(name='Aptos',size=11,color=BLACK);z.alignment=Alignment(vertical='center',wrap_text=c==2)
 if fmt:z.number_format=fmt
 elif isinstance(v,(int,float)) or (isinstance(v,str) and v.startswith('=')):z.number_format=NUM
 return z

def band(s,r,label,end=8):
 cell(s,r,2,label)
 for c in range(2,end+1):s.cell(r,c).fill=PatternFill('solid',fgColor=BLUE);s.cell(r,c).font=Font(name='Aptos',size=11,bold=True,color=BLACK)
 s.row_dimensions[r].height=30
 for cc in range(2,end+1):s.cell(r,cc).alignment=Alignment(wrap_text=True,vertical='center')

def years(s,r,start=3):
 cell(s,r,2,'Concepto')
 for y in range(6):cell(s,r,start+y,f'Año {y}')
 band(s,r,'Concepto',start+5)

def total(s,r):
 for c in range(2,9):s.cell(r,c).fill=PatternFill('solid',fgColor=PALE);s.cell(r,c).font=Font(name='Aptos',size=11,bold=True,color=BLACK);s.cell(r,c).border=Border(top=Side(style='thin',color=BLUE))

def q(s,addr):return f"'{s}'!{addr}"
def D(r):return f'Datos!$C${r}'
def S(r):return D(r+40)
def series(s,r,label,form):
 cell(s,r,2,label)
 for y in range(6):cell(s,r,3+y,form(y,openpyxl.utils.get_column_letter(3+y)))

# Hoja única de entradas: tasas arriba, negocio y calendarios debajo.
d=sheet('Datos','LUMINE · Datos y supuestos','Única hoja de entradas. Fondo celeste claro: editable. Fórmulas en blanco. Pesos constantes de 2026; importes netos salvo precios al público.',7)
for c,label in enumerate(['Parámetro','Valor','Unidad','Estado','Fuente / criterio','Alcance'],2):cell(d,5,c,label)
for r in range(6,14):
 cell(d,r,2,cached['6 Tasa de descuento'].cell(r,2).value);cell(d,r,3,original_rates[r],PCT if r!=8 else NUM);cell(d,r,6,cached['6 Tasa de descuento'].cell(r,9).value)
cell(d,11,6,'BCCh mayo 2026: 8,1%, promedio anual base 360. Asimilado a efectiva anual como supuesto; confirmar contrato.')
cell(d,11,5,'Referencia, no oferta')
cell(d,6,5,'Observación exacta por adjuntar')
cell(d,12,2,'Recargo de DEUDA por empresa nueva');cell(d,12,5,'Supuesto, no oferta bancaria')
for r,label,f in [(16,'Ku real · proyecto sin deuda',f'={D(6)}+{D(8)}*{D(7)}'),(17,'Beta apalancado',f'={D(8)}*(1+(1-{D(10)})*{D(9)})'),(18,'Ke real · patrimonio',f'={D(6)}+{D(17)}*{D(7)}'),(19,'Kd real · crédito indexado ilustrativo',f'=(1+{D(11)}+{D(12)})/(1+{D(13)})-1'),(20,'D/V de referencia sectorial',f'={D(9)}/(1+{D(9)})'),(21,'WACC real · referencia',f'=(1-{D(20)})*{D(18)}+{D(20)}*{D(19)}*(1-{D(10)})'),(22,'Tasa mensual del proyecto',f'=(1+{D(16)})^(1/12)-1')]:
 cell(d,r,2,label);cell(d,r,3,f,NUM if r==17 else PCT)
for r,label,val,unit,note in [(25,'Software productivo: horas',2050,'h','Estimación heredada, sin cotización ni WBS'),(26,'Software productivo: tarifa por hora',13000,'CLP/h','Supuesto heredado; no tarifa contratada'),(28,'Amortización preoperativos + software',3,'años','Convención académica; revisar deducibilidad por partida'),(29,'Plazo de la deuda',5,'años','Escenario ilustrativo; no aprobación de banco'),(30,'Gracia de capital',1,'años','Interés pagado; cuatro cuotas posteriores'),(31,'Mes de pago anual de renta',4,'mes','Abril del año siguiente; liquidación final al cierre'),(32,'IDPC general 2027',.255,'%','Ley 21.850, art. 6 transitorio'),(33,'IDPC general 2028',.24,'%','Ley 21.850, art. 6 transitorio'),(34,'Recuperación del CT al cierre',1,'%','Supuesto de liquidación a valor contable; sin descuento'),(35,'Recuperación de activos a valor libro',1,'%','Método contable, no avalúo comercial')]:
 cell(d,r,2,label);cell(d,r,3,val,PCT if unit=='%' else NUM);cell(d,r,4,unit);cell(d,r,6,note)
cell(d,27,2,'Presupuesto de software');cell(d,27,3,f'={D(25)}*{D(26)}/1000000');cell(d,27,4,'MM CLP')
for r,values in enumerate(source_inputs,41):
 for c,value in enumerate(values,1):
  if value is not None:cell(d,r,c,remap(value) if isinstance(value,str) and value.startswith('=') else value)
cell(d,54,2,'Comisión agregada de medios de pago externos');cell(d,54,6,'2% de venta neta: supuesto heredado; no incluye crédito propio ni prueba convenio.')
cell(d,143,6,'Piloto vigente: 1 Esencial y 2 Plus, según último Excel recibido.')
cell(d,144,6,'Piloto vigente: 1 Esencial y 2 Plus, según último Excel recibido.')
band(d,164,'Vida útil normal · clasificación por confirmar',7)
for r in range(6,13):
 rr=165+r-6;cell(d,rr,2,cached['1 Inversión'].cell(r,2).value);cell(d,rr,3,original_lives[r],INT);cell(d,rr,4,'años');cell(d,rr,6,cached['1 Inversión'].cell(r,9).value);w['Calc inversión'].cell(r,4,f'={D(rr)}')
w['Calc inversión']['F25']=f'={D(27)}'
# Traslada series exógenas del motor mensual a intervalos en Datos; no inventa valores.
band(d,175,'Calendarios operativos recibidos · meses 1–78 desde enero de 2027',7)
for c,txt in enumerate(['Concepto','Valor','Unidad','Desde mes','Hasta mes','Procedencia'],2):cell(d,176,c,txt)
rr=177
m=w['Mensual']
for row in m:
 r=row[0].row
 if r in [3,6,7]:continue
 values=[m.cell(r,c).value for c in range(4,82)];start=0
 while start<len(values):
  value=values[start]
  if not isinstance(value,(int,float)) or value==0:start+=1;continue
  end=start
  while end+1<len(values) and values[end+1]==value:end+=1
  cell(d,rr,2,m.cell(r,1).value or f'Mensual fila {r}');cell(d,rr,3,value);cell(d,rr,4,m.cell(r,2).value);cell(d,rr,5,start+1,INT);cell(d,rr,6,end+1,INT);cell(d,rr,7,'Calendario del Excel recibido; modificar duración exige revisar motor.')
  for i in range(start,end+1):m.cell(r,4+i,f'={D(rr)}')
  rr+=1;start=end+1
for row in d:
 for z in row:
  if z.column==3 and isinstance(z.value,(int,float)):z.fill=PatternFill('solid',fgColor=PALE)
d.column_dimensions['B'].width=55;d.column_dimensions['C'].width=19;d.column_dimensions['D'].width=18;d.column_dimensions['E'].width=23;d.column_dimensions['F'].width=62;d.column_dimensions['G'].width=45
for row in d:
 if row[2].value is not None and row[3].value and '%' in str(row[3].value):row[2].number_format=PCT
for r in range(6,rr):
 height=24
 for cc in [2,4,5,6,7]:
  zz=d.cell(r,cc);zz.alignment=Alignment(wrap_text=True,vertical='center')
  if isinstance(zz.value,str) and not zz.value.startswith('='):
   width=d.column_dimensions[openpyxl.utils.get_column_letter(cc)].width
   height=max(height,14*(1+int(len(zz.value)/max(10,width))))
 d.row_dimensions[r].height=min(height,70)
d.freeze_panes='D6';d.page_setup.fitToHeight=0;d.print_title_rows='1:5';d.print_area=f'B1:G{rr}'

# Resultado operativo: mismo motor y mismos precios/costos que el archivo recibido.
co=sheet('Costos','LUMINE · Ingresos y costos','MM CLP constantes de 2026. Resumen anual; unidad y promedio mensual permiten explicar cada rubro.',10)
cell(co,5,2,'Concepto');cell(co,5,3,'Unidad');cell(co,5,4,'Unitario / mes A1')
for y in range(1,6):cell(co,5,4+y,f'Año {y}')
band(co,5,'Concepto',10)
for r in range(6,43):
 label=cached['2 Ingresos y costos'].cell(r,2).value
 if not label:continue
 if r in [11,16,25,32,40]:
  band(co,r,label,10);continue
 cell(co,r,2,label)
 for y in range(1,6):cell(co,r,4+y,f"='Calc resultados'!{openpyxl.utils.get_column_letter(y+3)}{r}")
 if r in [6,7,8,9]:
  cell(co,r,3,'unidades');cell(co,r,4,f'=E{r}/12');
  for c in range(4,10):co.cell(r,c).number_format=INT if c>4 else NUM
 elif r in [17,18,19,20]:cell(co,r,3,'MM/instalación');cell(co,r,4,f'=IFERROR(E{r}/E6,0)')
 else:cell(co,r,3,'MM/mes');cell(co,r,4,f'=E{r}/12')
 if r in [14,22,23,30,38,41]:total(co,r)
cell(co,21,2,'Comisiones por incorporación de talleres')
cell(co,7,2,'Esencial · distribución anual aproximada');cell(co,8,2,'Plus · distribución anual aproximada')
cell(co,42,3,'% ventas');cell(co,42,4,'=E42',PCT)
for cc in range(5,10):co.cell(42,cc).number_format=PCT
cell(co,44,2,'Modelo con costo/precio ponderado por mezcla; instalaciones y compras enteras. El desglose Esencial/Plus es ilustrativo.');co.merge_cells('B44:J45');co['B44'].alignment=Alignment(wrap_text=True)
co.print_area='B1:J45'

inv=sheet('Inversión','LUMINE · Inversión y depreciación','MM CLP. Desembolsos separados de su costo de oportunidad. Vidas útiles normales heredadas; validar clasificación tributaria.',10)
for c,txt in enumerate(['Activo','Valor unitario','Cantidad inicial','Monto','Vida normal','Vida acelerada ref.','Deprec. anual','Fuente'],2):cell(inv,5,c,txt)
band(inv,5,'Activo',10)
for r in range(6,13):
 cell(inv,r,2,cached['1 Inversión'].cell(r,2).value);cell(inv,r,3,f"='Calc inversión'!C{r}");cell(inv,r,4,'=1',INT);cell(inv,r,5,f'=C{r}*D{r}');cell(inv,r,6,f'={D(165+r-6)}',INT);cell(inv,r,7,f'=MAX(1,INT(F{r}/3))',INT);cell(inv,r,8,f'=E{r}/F{r}');cell(inv,r,9,'Normal aplicada')
cell(inv,13,2,'Total activo fijo inicial');cell(inv,13,5,'=SUM(E6:E12)');total(inv,13)
for r in range(16,25):
 cell(inv,r,2,cached['1 Inversión'].cell(r,2).value)
 for c in range(3,7):cell(inv,r,c,f"='Calc inversión'!{openpyxl.utils.get_column_letter(c)}{r}")
for c,txt in enumerate(['Puesta en marcha','Piloto','Transición','Preapertura','Total'],2):cell(inv,15,c,txt)
band(inv,15,'Puesta en marcha',10)
cell(inv,25,2,'Software estimado: horas × tarifa');cell(inv,25,6,f'={D(27)}')
cell(inv,27,2,'Stock, anticipos e IVA antes de abrir');cell(inv,27,6,"='Capital de trabajo'!C16")
cell(inv,28,2,'Garantía de arriendo');cell(inv,28,6,"='Calc inversión'!C30")
cell(inv,29,2,'Desembolso previo sin capitalizar');cell(inv,29,6,'=E13+F24+F25+F27+F28');total(inv,29)
cell(inv,30,2,'Costo de oportunidad hasta apertura');cell(inv,30,6,"=Calendario!U18-F29")
cell(inv,31,2,'Equivalente económico en momento 0');cell(inv,31,6,'=F29+F30');total(inv,31)
years(inv,34)
for r,lab in [(35,'Nuevos puestos'),(36,'Reinversión en elevadores y herramientas'),(37,'Depreciación desde entrada en servicio'),(38,'Amortización de gastos y software'),(39,'Valor libro al cierre')]:cell(inv,r,2,lab)
for y in range(1,6):
 l=openpyxl.utils.get_column_letter(3+y);a=openpyxl.utils.get_column_letter(22+12*(y-1));b=openpyxl.utils.get_column_letter(33+12*(y-1))
 cell(inv,35,3+y,f"='Calc inversión'!{l}42",INT);cell(inv,36,3+y,f"='Calc inversión'!{l}43");cell(inv,37,3+y,f"=SUM('Calc financiero'!{a}10:{b}10)");cell(inv,38,3+y,f"=SUM('Calc financiero'!{a}11:{b}11)");cell(inv,39,3+y,f'=$E$13+SUM($D$36:{l}36)-SUM($D$37:{l}37)')
inv.print_area='B1:J40'

cal=sheet('Calendario','LUMINE · Calendario de inversiones','18 meses reales de etapas previas. Desembolsos al cierre del mes; el software se ubica en el mes 0 por falta de calendario contractual. MM CLP.',21)
cell(cal,5,2,'Concepto')
for c in range(3,21):
 mc=openpyxl.utils.get_column_letter(c+1);cell(cal,5,c,f'=Mensual!{mc}7',INT)
 for r,label,formula in [(6,'Activos fijos',f'Mensual!{mc}128/1000000'),(7,'Puesta en marcha',f'(Mensual!{mc}137+Mensual!{mc}138)/1000000'),(8,'Variación stock, anticipos e IVA',f'(Mensual!{mc}150-'+(f'Mensual!{openpyxl.utils.get_column_letter(c)}150' if c>3 else '0')+')/1000000'),(9,'Garantía de arriendo',f'Mensual!{mc}130/1000000'),(10,'Software',f'IF({mc}5=0,0,0)')]:
  cell(cal,r,2,label);cell(cal,r,c,'='+formula if r!=10 else (f'={D(27)}' if c==20 else '=0'))
 l=openpyxl.utils.get_column_letter(c);cell(cal,12,c,f'=SUM({l}6:{l}10)');cell(cal,14,c,f'=(1+{D(16)})^(-{l}5/12)');cell(cal,15,c,f'={l}12*{l}14');cell(cal,17,c,f'=(1+{D(18)})^(-{l}5/12)');cell(cal,18,c,f'={l}12*{l}17')
for r,label in [(12,'Desembolso sin capitalizar'),(14,'Factor de capitalización a Ku'),(15,'Equivalente en apertura a Ku'),(17,'Factor de capitalización a Ke'),(18,'Equivalente en apertura a Ke')]:cell(cal,r,2,label)
cell(cal,5,21,'Total')
for r in [6,7,8,9,10,12,15,18]:cell(cal,r,21,f'=SUM(C{r}:T{r})')
# U18 es el total a Ke; U15 a Ku, usado para la inversión económica pura.
inv['F30']='=Calendario!U15-F29'
for cc in range(3,21):cal.column_dimensions[openpyxl.utils.get_column_letter(cc)].width=10
cal.column_dimensions['B'].width=43;cal.column_dimensions['U'].width=13
cal.print_area='B1:U19';cal.page_setup.fitToHeight=1

# Depreciación por activo y por cohorte, prorrateada por mes desde puesta en uso.
dep=sheet('Calc depreciación','Depreciación mensual por activo','Motor interno: MM CLP, valor real indexado; normal, sin acelerada.',81);dep.sheet_state='hidden'
for r in range(6,13):cell(dep,r,2,cached['1 Inversión'].cell(r,2).value)
for c in range(4,82):
 l=openpyxl.utils.get_column_letter(c);op=f'Mensual!{l}7'
 for r in range(6,13):
  base=f'IF(AND({op}>0,{op}<=Inversión!$F${r}*12),Inversión!$E${r}/(Inversión!$F${r}*12),0)'
  if r in [8,9]:
   value=S(94 if r==8 else 93)
   terms=[f'IF(AND({S(sr)}>1,{op}>={S(sr)},{op}<{S(sr)}+Inversión!$F${r}*12),{value}/1000000/(Inversión!$F${r}*12),0)' for sr in range(49,54)]
   base+='+'+'+'.join(terms)
  cell(dep,r,c,'='+base)
 cell(dep,14,c,f'=SUM({l}6:{l}12)')

ct=sheet('Capital de trabajo','LUMINE · Capital de trabajo y caja','Se recuperan activos realizables, no las pérdidas de arranque. El déficit acumulado se muestra como necesidad de financiación.',8)
years(ct,5)
for r,label in [(7,'Inventario físico'),(8,'Kits en tránsito y anticipos pagados'),(9,'Crédito fiscal de IVA'),(10,'Anticipos recibidos de clientes (netos)'),(12,'CTN operativo al cierre'),(13,'Variación de CTN'),(16,'CT inicial ya pagado antes de abrir'),(17,'Recuperación final (hipótesis contable)'),(20,'Mayor déficit operativo desde apertura'),(21,'Mes del déficit operativo'),(23,'Financiación máxima total sin deuda'),(24,'Incluye desembolsos previos, software, capex e impuesto'),(26,'CTN recuperable / financiación necesaria son conceptos distintos')]:cell(ct,r,2,label)
for y in range(6):
 mc=openpyxl.utils.get_column_letter(21+12*y);l=openpyxl.utils.get_column_letter(3+y);prev=openpyxl.utils.get_column_letter(2+y)
 for r,mr,den in [(7,45,1),(8,46,1),(9,134,1),(10,48,None)]:cell(ct,r,3+y,f'=Mensual!{mc}{mr}/1000000'+(f'/(1+{S(4)})' if den is None else ''))
 cell(ct,12,3+y,f'=SUM({l}7:{l}9)-{l}10');cell(ct,13,3+y,f'={l}12'+(f'-{prev}12' if y else ''))
cell(ct,16,3,'=C12');cell(ct,17,8,f'=H12*{D(34)}')
cell(ct,20,3,"=-MIN(0,'CT mensual'!D18:BK18)")
cell(ct,21,3,"=MATCH(MIN('CT mensual'!D18:BK18),'CT mensual'!D18:BK18,0)",INT)
cell(ct,23,3,"=-MIN(0,'Calc financiero'!D23:CC23)")
ct.merge_cells('B24:H24');ct.merge_cells('B26:H27');ct['B26'].alignment=Alignment(wrap_text=True)
for r in [12,13,17,20,23]:total(ct,r)
ct.print_area='B1:H28'

# Impuesto por año calendario, con arrastre y pago en abril; liquidación final al cierre.
tax=sheet('Impuestos','LUMINE · Renta y pérdidas tributarias','Año calendario. Régimen general; flujo real con corrección monetaria perfecta como aproximación académica. Sin PPM; no reemplaza una determinación tributaria.',10)
band(tax,5,'Concepto',10)
for j,yr in enumerate(range(2027,2034),3):
 l=openpyxl.utils.get_column_letter(j);prev=openpyxl.utils.get_column_letter(j-1);cell(tax,5,j,yr,INT)
 cell(tax,6,j,f'=IF({l}$5=2027,{D(32)},IF({l}$5=2028,{D(33)},{D(10)}))',PCT)
 cell(tax,8,j,f'=SUMIF(\'Calc financiero\'!$D$7:$CC$7,{l}$5,\'Calc financiero\'!$D$12:$CC$12)')
 cell(tax,9,j,'=0' if j==3 else f'={prev}13')
 cell(tax,10,j,f'=MIN({l}9,MAX(0,{l}8))');cell(tax,11,j,f'=MAX(0,{l}8-{l}9)');cell(tax,12,j,f'={l}11*{l}6');cell(tax,13,j,f'=MAX(0,{l}9-{l}8)')
 cell(tax,16,j,f'=SUMIF(\'Calc financiero\'!$D$7:$CC$7,{l}$5,\'Calc financiero\'!$D$14:$CC$14)');cell(tax,17,j,'=0' if j==3 else f'={prev}21')
 cell(tax,18,j,f'=MIN({l}17,MAX(0,{l}16))');cell(tax,19,j,f'=MAX(0,{l}16-{l}17)');cell(tax,20,j,f'={l}19*{l}6');cell(tax,21,j,f'=MAX(0,{l}17-{l}16)')
for r,label in [(6,'Tasa general aplicable'),(8,'Resultado tributario puro'),(9,'Pérdida inicial'),(10,'Pérdida utilizada'),(11,'Base positiva'),(12,'Renta devengada · puro'),(13,'Pérdida final'),(16,'Resultado tributario con deuda'),(17,'Pérdida inicial'),(18,'Pérdida utilizada'),(19,'Base positiva'),(20,'Renta devengada · inversionista'),(21,'Pérdida final')]:cell(tax,r,2,label)
tax.print_area='B1:I22'

fin=sheet('Calc financiero','Motor financiero mensual','MM CLP reales; cierre al mes 60.',81);fin.sheet_state='hidden'
for c in range(4,82):
 l=openpyxl.utils.get_column_letter(c);p=openpyxl.utils.get_column_letter(c-1)
 cell(fin,4,c,f'=DATE(2027,Mensual!{l}3,1)','mmm yyyy');cell(fin,5,c,f'=Mensual!{l}7',INT);cell(fin,6,c,f'=Mensual!{l}6',INT);cell(fin,7,c,f'=YEAR({l}4)',INT)
 cell(fin,8,c,f'=IF({l}5>0,Mensual!{l}139/1000000,0)')
 cell(fin,9,c,f'=(Mensual!{l}141-Mensual!{l}142+Mensual!{l}135)/1000000')
 cell(fin,10,c,f"='Calc depreciación'!{l}14")
 cell(fin,11,c,f'=IF(AND({l}5>0,{l}5<={D(28)}*12),(Inversión!$F$24+{D(27)})/({D(28)}*12),0)')
 cell(fin,12,c,f'={l}8-{l}10-{l}11')
 cell(fin,13,c,f'=IF({l}5>0,INDEX(Deuda!$D$9:$H$9,1,MAX(1,{l}6))/12,0)')
 cell(fin,30,c,f'=IF(AND({l}5>0,MOD({l}5,12)=0),INDEX(Deuda!$D$9:$H$9,1,MAX(1,{l}6)),0)')
 cell(fin,14,c,f'={l}12-{l}13')
 for r,tr in [(15,12),(16,20)]:
  cell(fin,r,c,f'=IF(AND(MONTH({l}4)={D(31)},{l}7>2027),INDEX(Impuestos!$C${tr}:$I${tr},1,{l}7-2027),0)+IF({l}5=60,Impuestos!$I${tr},0)')
 cell(fin,17,c,f'=IF({l}5>0,Mensual!{l}128/1000000,0)')
 cell(fin,18,c,f'=Mensual!{l}150/1000000')
 cell(fin,19,c,f'={l}18-'+(f'{p}18' if c>4 else '0'))
 cell(fin,20,c,f'=IF({l}5>0,{l}8-{l}15-{l}17-{l}19,0)')
 cell(fin,21,c,f'=IF({l}5<=0,Mensual!{l}144/1000000-IF({l}5=0,{D(27)},0),0)')
 cell(fin,22,c,f'={l}20+{l}21');cell(fin,23,c,f'=SUM($D$22:{l}22)')
 cell(fin,24,c,f'=MAX(0,-{l}23)')
 cell(fin,25,c,f'=IF({l}5=0,Deuda!$C$6,IF(AND({l}5>0,MOD({l}5,12)=0),-INDEX(Deuda!$D$10:$H$10,1,{l}6),0))')
 cell(fin,26,c,f'={l}22+{l}15-{l}16-{l}30+{l}25')
 cell(fin,27,c,f'=SUM($D$26:{l}26)')

loan=sheet('Deuda','LUMINE · Financiamiento y amortización','Escenario de crédito indexado: cuota constante REAL. D/V sectorial aplicado a la necesidad máxima sin deuda; no constituye una oferta ni aprobación bancaria.',8)
years(loan,5);cell(loan,6,2,'Préstamo ilustrativo');cell(loan,6,3,f"='Capital de trabajo'!$C$23*{D(20)}")
for offset,kind in [(0,'Francés · aplicado'),(13,'Alemán · comparación'),(26,'Americano · comparación')]:
 band(loan,7+offset,kind)
 for y in range(1,6):
  c=3+y;l=openpyxl.utils.get_column_letter(c);p=openpyxl.utils.get_column_letter(c-1);o=offset
  cell(loan,8+o,c,'=$C$6' if y==1 else f'={p}{11+o}')
  cell(loan,9+o,c,f'={l}{8+o}*{D(19)}')
  if offset==0:
   principal=f'IF({y}<={D(30)},0,MIN({l}{8+o},-PMT({D(19)},{D(29)}-{D(30)},$C$6)-{l}{9+o}))'
  elif offset==13:principal=f'IF({y}<={D(30)},0,MIN({l}{8+o},$C$6/({D(29)}-{D(30)})))'
  else:principal=f'IF({y}={D(29)},{l}{8+o},0)'
  cell(loan,10+o,c,'='+principal);cell(loan,11+o,c,f'=MAX(0,{l}{8+o}-{l}{10+o})');cell(loan,12+o,c,f'=SUM({l}{9+o}:{l}{10+o})')
 for r,label in [(8,'Saldo inicial'),(9,'Interés'),(10,'Amortización de capital'),(11,'Saldo final'),(12,'Servicio de deuda')]:cell(loan,r+offset,2,label)
 total(loan,12+offset)
cell(loan,42,2,'Socios: aportes necesarios según flujo mensual');cell(loan,42,3,"=-MIN(0,'Calc financiero'!D27:CC27)")
cell(loan,44,2,'No se contabilizan subsidios CORFO no adjudicados. Inversionista ángel/capital privado requieren compromiso; el supuesto de deuda requiere cotización, garantías y evaluación.');loan.merge_cells('B44:H47');loan['B44'].alignment=Alignment(wrap_text=True)
years(loan,49)
cell(loan,50,2,'Flujo de deuda + ahorro tributario efectivo');cell(loan,50,3,'=C6')
for yy in range(1,6):
 ll=openpyxl.utils.get_column_letter(3+yy);cell(loan,50,3+yy,f"=-{ll}9-{ll}10+'Flujo inversionista'!{ll}43-'Flujo puro'!{ll}43")
cell(loan,52,2,'Valor actual del financiamiento a Kd');cell(loan,52,3,f'=NPV({D(19)},D50:H50)+C50')
cell(loan,53,2,'VAN ajustado (APV)');cell(loan,53,3,"='Flujo puro'!C70+C52");total(loan,53)
loan.print_area='B1:H54'
# Devengo tributario reconocido al cierre fiscal, con liquidación al horizonte.
for c in range(4,82):
 l=openpyxl.utils.get_column_letter(c)
 for r,tr in [(28,12),(29,20)]:cell(fin,r,c,f'=IF(OR(MONTH({l}4)=12,{l}5=60),INDEX(Impuestos!$C${tr}:$I${tr},1,{l}7-2026),0)')

flow_labels={6:'Instalaciones (unidades)',7:'Precio neto de lista promedio (MM)',8:'Costo variable por instalación (MM)',9:'Costos fijos y administración (MM)',10:'Descuentos de pilotos comerciales (MM)',12:'Ingresos por instalaciones',13:'Ingresos de la Red Lumine',14:'Ingresos totales',15:'Costo de kits',16:'Garantías',17:'Comisiones de medios de pago',18:'Otros variables / red / fletes',19:'Costos variables totales',20:'Margen de contribución',21:'Técnicos instaladores',22:'Responsable técnico y calibración',23:'Arriendo',24:'Otros costos fijos',25:'Administración y ventas',26:'EBITDA',35:'Amortización de preoperativos y software',36:'Utilidad operacional',37:'Intereses',38:'Utilidad antes de impuestos',39:'Pérdida fiscal disponible al inicio del calendario',40:'Impuesto devengado en cierres fiscales',41:'Resultado después de impuesto devengado',42:'Se revierte impuesto devengado',43:'Impuesto efectivamente pagado / liquidado',44:'Se revierten depreciaciones y amortización',45:'Caja operacional después de impuestos',54:'Puesta en marcha y software',55:'Inversión / liberación incremental de CTN',56:'Garantía de arriendo inicial',57:'Recuperación de CTN al cierre',58:'Recuperación de garantía de arriendo',59:'Liquidación de activos a valor libro',60:'Desembolso del préstamo',61:'Amortización del préstamo',62:'Costo de oportunidad de desembolsos previos',64:'Flujo de caja',65:'Flujo descontado',66:'Flujo acumulado',67:'Flujo descontado acumulado',69:'Tasa de descuento',70:'VAN',71:'TIR',72:'Payback simple (años)',73:'Payback descontado (años)',74:'VAN sin recuperaciones de cierre',75:'PV de recuperaciones / PV de flujos positivos'}
for is_equity,name,rate in [(False,'Flujo puro',16),(True,'Flujo inversionista',18)]:
 s=sheet(name,'LUMINE · '+('Flujo del inversionista' if is_equity else 'Flujo puro'),('Patrimonio, descontado a Ke real.' if is_equity else 'Proyecto sin deuda, descontado a Ku real; WACC se informa por separado.')+' MM CLP de 2026. Años operativos julio–junio.',8)
 years(s,5)
 for r,label in flow_labels.items():cell(s,r,2,label)
 for i in range(7):cell(s,28+i,2,'Depreciación · '+str(cached['1 Inversión'].cell(6+i,2).value));cell(s,47+i,2,'Inversión · '+str(cached['1 Inversión'].cell(6+i,2).value))
 for y in range(6):
  c=y+3;l=openpyxl.utils.get_column_letter(c);prev=openpyxl.utils.get_column_letter(c-1);a=openpyxl.utils.get_column_letter(22+12*(y-1));b=openpyxl.utils.get_column_letter(33+12*(y-1))
  for r in list(flow_labels)+list(range(28,35))+list(range(47,54)):cell(s,r,c,'=0')
  if y:
   for r,src in [(6,6),(12,12),(13,13),(15,17),(16,18),(17,19),(21,26),(22,27),(23,28),(24,29),(25,38)]:cell(s,r,c,f"={'-' if r>=15 else ''}'Calc resultados'!{l}{src}",INT if r==6 else NUM)
   cell(s,7,c,f'={S(9)}/1000000');cell(s,8,c,f'=-{l}19/{l}6');cell(s,9,c,f'=-SUM({l}21:{l}25)')
   cell(s,10,c,f'={l}12-{l}6*{l}7');cell(s,14,c,f'=SUM({l}12:{l}13)');cell(s,18,c,f"=-SUM('Calc resultados'!{l}20:{l}21)");cell(s,19,c,f'=SUM({l}15:{l}18)');cell(s,20,c,f'={l}14+{l}19');cell(s,26,c,f'={l}20+SUM({l}21:{l}25)')
   for i in range(7):cell(s,28+i,c,f"=-SUM('Calc depreciación'!{a}{6+i}:{b}{6+i})")
   cell(s,35,c,f'=-Inversión!{l}38');cell(s,36,c,f'={l}26+SUM({l}28:{l}35)')
   cell(s,37,c,f'=-Deuda!{l}9' if is_equity else '=0');cell(s,38,c,f'=SUM({l}36:{l}37)')
   cell(s,39,c,f'=Impuestos!{openpyxl.utils.get_column_letter(y+3)}{17 if is_equity else 9}')
   cell(s,40,c,f"=-SUM('Calc financiero'!{a}{29 if is_equity else 28}:{b}{29 if is_equity else 28})")
   cell(s,41,c,f'={l}38+{l}40');cell(s,42,c,f'=-{l}40');cell(s,43,c,f"=-SUM('Calc financiero'!{a}{16 if is_equity else 15}:{b}{16 if is_equity else 15})")
   cell(s,44,c,f'=-SUM({l}28:{l}35)');cell(s,45,c,f'=SUM({l}41:{l}44)')
   for rr,sr in [(49,94),(50,93)]:cell(s,rr,c,f'=-Inversión!{l}35*{S(sr)}/1000000')
   cell(s,55,c,f"=-'Capital de trabajo'!{l}13")
   if is_equity:cell(s,61,c,f'=-Deuda!{l}10')
  else:
   for i in range(7):cell(s,47+i,c,f'=-Inversión!E{6+i}')
   cell(s,54,c,'=-Inversión!F24-Inversión!F25');cell(s,55,c,"=-'Capital de trabajo'!C12");cell(s,56,c,'=-Inversión!F28')
   cell(s,62,c,f'=-Calendario!U{18 if is_equity else 15}+Calendario!U12')
   if is_equity:cell(s,60,c,'=Deuda!C6')
  if y==5:
   cell(s,57,c,"='Capital de trabajo'!H17");cell(s,58,c,'=Inversión!F28');cell(s,59,c,f'=Inversión!H39*{D(35)}')
  cell(s,64,c,f'=SUM({l}45:{l}62)');cell(s,65,c,f'={l}64/(1+$C$69)^{y}');cell(s,66,c,f'=SUM($C$64:{l}64)');cell(s,67,c,f'=SUM($C$65:{l}65)')
 cell(s,69,3,f'={D(rate)}',PCT);cell(s,70,3,'=NPV(C69,D64:H64)+C64');cell(s,71,3,'=IFERROR(IRR(C64:H64),IFERROR(IRR(C64:H64,-0.1),IFERROR(IRR(C64:H64,-0.5),"TIR no convergente")))',PCT)
 for r,acc,flow in [(72,66,64),(73,67,65)]:
  for y in range(1,6):
   col=10+y;l=openpyxl.utils.get_column_letter(3+y);p=openpyxl.utils.get_column_letter(2+y)
   cell(s,r,col,f'=IF(AND({l}{acc}>=0,{p}{acc}<0,{l}{flow}>0),{y-1}-{p}{acc}/{l}{flow},99)')
  cell(s,r,3,f'=IF(MIN(K{r}:O{r})=99,"No recupera en 5 años",MIN(K{r}:O{r}))')
 cell(s,74,3,'=C70-SUM(H57:H59)/(1+C69)^5');cell(s,75,3,'=SUM(H57:H59)/(1+C69)^5/SUMIF(D65:H65,">0",D65:H65)',PCT)
 for r in [14,20,26,36,41,45,64,65,70,71]:total(s,r)
 for c in range(10,17):s.column_dimensions[openpyxl.utils.get_column_letter(c)].hidden=True
 for r in range(4,76):s.row_dimensions[r].height=18
 s.column_dimensions['B'].width=54;s.page_setup.orientation='portrait';s.page_setup.paperSize=s.PAPERSIZE_A3;s.print_area='B1:H75'

cm=sheet('CT mensual','LUMINE · Capital de trabajo mensual','60 meses desde la apertura. Caja operativa antes de capex e impuesto a la renta; el déficit sirve para dimensionar fondos, no para crear un activo.',63)
for r,label in [(7,'Instalaciones'),(9,'Cobros netos'),(10,'Pagos operativos netos'),(11,'Liberación / inversión en IVA'),(12,'Caja operativa del mes'),(14,'Stock y kits pagados'),(15,'Crédito fiscal IVA'),(16,'Anticipos clientes netos'),(17,'CTN operativo'),(18,'Caja operativa acumulada'),(20,'EBITDA'),(21,'Variación CTN'),(22,'Control: caja − (EBITDA − ΔCTN)')]:cell(cm,r,2,label)
for j,c in enumerate(range(22,82),4):
 l=openpyxl.utils.get_column_letter(j);mc=openpyxl.utils.get_column_letter(c);pc=openpyxl.utils.get_column_letter(c-1)
 cell(cm,5,j,f"='Calc financiero'!{mc}4",'mmm yyyy');cell(cm,6,j,f'=Mensual!{mc}7',INT)
 for r,formula in [(7,f'Mensual!{mc}33'),(9,f'Mensual!{mc}141/1000000'),(10,f'-Mensual!{mc}142/1000000'),(11,f'Mensual!{mc}135/1000000'),(12,f'SUM({l}9:{l}11)'),(14,f'(Mensual!{mc}45+Mensual!{mc}46)/1000000'),(15,f'Mensual!{mc}134/1000000'),(16,f'Mensual!{mc}48/(1+{S(4)})/1000000'),(17,f'SUM({l}14:{l}15)-{l}16'),(18,f'SUM($D$12:{l}12)'),(20,f'Mensual!{mc}139/1000000'),(21,f'(Mensual!{mc}150-Mensual!{pc}150)/1000000'),(22,f'{l}12-({l}20-{l}21)')]:cell(cm,r,j,'='+formula,INT if r==7 else NUM)
cm.print_area='B1:BK23';cm.page_setup.fitToWidth=0;cm.page_setup.fitToHeight=1;cm.print_title_cols='B:C';cm.print_title_rows='1:6'
for c in [16,28,40,52]:cm.col_breaks.append(Break(id=c-1))
monthly=sheet('3 años','LUMINE · Flujo mensual de los primeros 3 años','MM CLP. Se observa la rampa, el inventario, el impuesto y la necesidad de aportes antes de mirar la TIR.',39)
for r,label in [(7,'Instalaciones'),(8,'Dúos en operación'),(10,'Ingresos'),(11,'Kits y otros variables'),(12,'Costos fijos, administración y ventas'),(13,'EBITDA'),(15,'Depreciación'),(16,'Amortización'),(17,'Resultado antes de impuesto'),(19,'Impuesto pagado'),(20,'Reinversiones'),(21,'Variación CTN'),(23,'Flujo puro del mes'),(24,'Caja acumulada, incluidos desembolsos previos'),(26,'Intereses'),(27,'Amortización de deuda'),(28,'Ahorro / diferencia de impuesto por deuda'),(29,'Flujo del inversionista del mes')]:cell(monthly,r,2,label)
for j,c in enumerate(range(22,58),4):
 l=openpyxl.utils.get_column_letter(j);mc=openpyxl.utils.get_column_letter(c)
 cell(monthly,5,j,f"='Calc financiero'!{mc}4",'mmm yyyy')
 forms={7:f'Mensual!{mc}33',8:f'Mensual!{mc}26',10:f'(Mensual!{mc}52+Mensual!{mc}55)/1000000',11:f'-(Mensual!{mc}58+Mensual!{mc}59+Mensual!{mc}60+Mensual!{mc}61+Mensual!{mc}138)/1000000',12:f'-Mensual!{mc}137/1000000',13:f'SUM({l}10:{l}12)',15:f"-'Calc financiero'!{mc}10",16:f"-'Calc financiero'!{mc}11",17:f'SUM({l}13:{l}16)',19:f"-'Calc financiero'!{mc}15",20:f"-'Calc financiero'!{mc}17",21:f"-'Calc financiero'!{mc}19",23:f'SUM({l}13,{l}19:{l}21)',24:f"'Calc financiero'!{mc}23",26:f"-'Calc financiero'!{mc}30",27:f"'Calc financiero'!{mc}25",28:f"'Calc financiero'!{mc}15-'Calc financiero'!{mc}16",29:f'SUM({l}23,{l}26:{l}28)'}
 for r,f in forms.items():cell(monthly,r,j,'='+f,INT if r in [7,8] else NUM)
for sh,ccmax in [(monthly,39),(cm,63)]:
 sh.column_dimensions['C'].width=3
 for cc in range(4,ccmax+1):sh.column_dimensions[openpyxl.utils.get_column_letter(cc)].width=11
monthly.print_area='B1:AM30';monthly.page_setup.fitToWidth=0;monthly.page_setup.fitToHeight=1;monthly.print_title_cols='B:C';monthly.print_title_rows='1:5'
for c in [16,28]:monthly.col_breaks.append(Break(id=c-1))

# Sensibilidad viva de precio: constantes volumen/costos/stock. Renta recalculada por calendario.
# Los anticipos de clientes al cierre son cero en la base; si cambian, este límite queda controlado.
ss=sheet('Calc sensibilidad','Sensibilidad de precio · cálculo','No se estima elasticidad. Se mantiene volumen, mezcla y stock del caso activo.',10);ss.sheet_state='hidden'
def pricecase(r,pct):
 cell(ss,r,2,'Variación precio');cell(ss,r,3,pct,PCT)
 for j,yr in enumerate(range(2027,2034),4):
  l=openpyxl.utils.get_column_letter(j);p=openpyxl.utils.get_column_letter(j-1);tc=openpyxl.utils.get_column_letter(j-1)
  cell(ss,r+1,j,yr,INT)
  cell(ss,r+2,j,f'=Impuestos!{tc}8+$C${r}*(1-{S(14)})*SUMIF(\'Calc financiero\'!$D$7:$CC$7,{l}{r+1},Mensual!$D$52:$CC$52)/1000000')
  cell(ss,r+3,j,'=0' if j==4 else f'={p}{r+5}')
  cell(ss,r+4,j,f'=MAX(0,{l}{r+2}-{l}{r+3})*Impuestos!{tc}6')
  cell(ss,r+5,j,f'=MAX(0,{l}{r+3}-{l}{r+2})')
 for y in range(6):
  l=openpyxl.utils.get_column_letter(y+3)
  if y==0:f="='Flujo puro'!C64"
  else:
   fiscalcol=openpyxl.utils.get_column_letter(y+4)
   taxsum=f'{fiscalcol}{r+4}'+(f'+J{r+4}' if y==5 else '')
   f=f"='Flujo puro'!{l}64+'Calc resultados'!{l}12*$C${r}*(1-{S(14)})-'Flujo puro'!{l}43-({taxsum})"
  cell(ss,r+8,y+3,f)
 cell(ss,r+10,3,f'=NPV({D(16)},D{r+8}:H{r+8})+C{r+8}')
 return r+8,r+10
se=sheet('Sensibilidad','LUMINE · Sensibilidad de precio y tasa','VAN en MM CLP. Tabla bidimensional con fórmulas: precio con volumen constante; incorpora comisiones de pago y arrastre fiscal. No supone que subir precio conserve demanda real.',8)
cell(se,5,2,'Ku real / cambio de precio')
for j,delta in enumerate([-.1,-.05,0,.05,.1],3):
 # Porcentajes de ensayo, no supuestos del negocio.
 cell(se,5,j,delta,PCT);fr,nr=pricecase(5+(j-3)*16,f"=Sensibilidad!{openpyxl.utils.get_column_letter(j)}$5")
 for i,dr in enumerate([-.02,-.01,0,.01,.02],6):
  cell(se,i,2,f'={D(16)}+({dr})',PCT);cell(se,i,j,f"=NPV($B{i},'Calc sensibilidad'!D{fr}:H{fr})+'Calc sensibilidad'!C{fr}")
cell(se,13,2,'VAN sin recuperaciones finales');cell(se,13,3,"='Flujo puro'!C74")
cell(se,14,2,'Control: centro de tabla menos VAN base');cell(se,14,3,"=E8-'Flujo puro'!C70")
cell(se,16,2,'La recuperación final se presume a valor contable. Bajar Datos!C34 permite probar pérdidas de realización del stock. La tabla de precio mantiene esos activos constantes.');se.merge_cells('B16:H19');se['B16'].alignment=Alignment(wrap_text=True)
# Bisección explícita para VAN=0 a Ku, con rango de variación -80% a +100%.
prevrow=None
for iteration in range(42):
 r=100+iteration*16
 cell(ss,r-1,3,'=-0.8' if iteration==0 else f'=IF(C{prevrow+10}>0,C{prevrow-1},C{prevrow})')
 cell(ss,r-1,4,'=1' if iteration==0 else f'=IF(C{prevrow+10}>0,C{prevrow},D{prevrow-1})')
 pricecase(r,f'=AVERAGE(C{r-1}:D{r-1})');prevrow=r
be=sheet('Equilibrio','LUMINE · Punto de equilibrio','Equilibrio contable de operación y precio de equilibrio financiero a VAN=0. El segundo mantiene volúmenes; no equivale a un precio comercial validado.',8)
years(be,5)
for r,label in [(7,'Instalaciones proyectadas'),(8,'Contribución por instalación (MM)'),(9,'Fijos + depreciación + amortización − aporte neto red'),(11,'Instalaciones de equilibrio (continuas)'),(12,'Mínimo de instalaciones enteras'),(14,'Comprobación: utilidad = 0 con cantidad continua'),(15,'Utilidad con mínimo entero'),(18,'Precio neto promedio que lleva VAN a 0'),(19,'Cambio de precio frente a base'),(20,'VAN residual de la búsqueda'),(22,'Ku aplicado')]:cell(be,r,2,label)
for y in range(1,6):
 l=openpyxl.utils.get_column_letter(3+y)
 cell(be,7,3+y,f"='Calc resultados'!{l}6",INT)
 cell(be,8,3+y,f"=('Calc resultados'!{l}12-SUM('Calc resultados'!{l}17:{l}20))/{l}7")
 cell(be,9,3+y,f"=SUM('Calc resultados'!{l}30,'Calc resultados'!{l}38,Inversión!{l}37:{l}38)-('Calc resultados'!{l}13-'Calc resultados'!{l}21)")
 cell(be,11,3+y,f'=IF({l}8>0,MAX(0,{l}9/{l}8),0)');cell(be,12,3+y,f'=ROUNDUP({l}11,0)',INT);cell(be,14,3+y,f'={l}11*{l}8-{l}9');cell(be,15,3+y,f'={l}12*{l}8-{l}9')
cell(be,18,3,f'={S(9)}*(1+\'Calc sensibilidad\'!C{prevrow})',INT);cell(be,19,3,f"='Calc sensibilidad'!C{prevrow}",PCT);cell(be,20,3,f"='Calc sensibilidad'!C{prevrow+10}");cell(be,22,3,f'={D(16)}',PCT)
be.print_area='B1:H23';se.print_area='B1:H20'

ctrl=sheet('Controles','LUMINE · Controles del modelo','Todos deben dar cero. Son controles de cálculo y conciliación; no acreditan una cotización, permiso ni contrato.',6)
checks=[('Conciliación previa: calendario vs inversión','=Calendario!U12-Inversión!F29'),('Inversión pura en t0',"='Flujo puro'!C64+Calendario!U15"),('Saldo final deuda francesa','=Deuda!H11'),('Saldo final deuda alemana','=Deuda!H24'),('Saldo final deuda americana','=Deuda!H37'),('Principal amortizado menos desembolso','=SUM(Deuda!D10:H10)-Deuda!C6'),('CT recuperado menos activo realizable',f"='Flujo puro'!H57-'Capital de trabajo'!H12*{D(34)}"),('Centro sensibilidad menos VAN',"=Sensibilidad!C14"),('Equilibrio financiero VAN=0',"=Equilibrio!C20"),('Capitalización sin duplicar desembolsos',"='Flujo puro'!C62+Calendario!U15-Calendario!U12"),('Libro activos conciliado','=Inversión!H39-Inversión!E13-SUM(Inversión!D36:H36)+SUM(Inversión!D37:H37)'),('Caja operativa vs EBITDA−ΔCT',"=SUMPRODUCT(ABS('CT mensual'!D22:BK22))"),('Unidades enteras', '=SUMPRODUCT(ABS(Mensual!V33:CC33-ROUND(Mensual!V33:CC33,0)))'),('Compras enteras','=SUMPRODUCT(ABS(Mensual!D39:CC39-ROUND(Mensual!D39:CC39,0)))'),('Inventario físico no negativo','=MIN(0,MIN(Mensual!D40:CC40))'),('Sin superar capacidad','=SUMPRODUCT((Mensual!V33:CC33>Mensual!V25:CC25)*1)'),('Anticipos al cierre (límite sensibilidad precio)',"=SUM('Capital de trabajo'!C10:H10)"),('Pérdidas fiscales no negativas','=MIN(0,MIN(Impuestos!C13:I13),MIN(Impuestos!C21:I21))')]
for y in range(1,6):
 l=openpyxl.utils.get_column_letter(y+3);a=openpyxl.utils.get_column_letter(22+12*(y-1));b=openpyxl.utils.get_column_letter(33+12*(y-1))
 checks.append((f'Flujo puro anual / mensual, año {y}',f"='Flujo puro'!{l}64-SUM('Calc financiero'!{a}20:{b}20)-SUM('Flujo puro'!{l}57:{l}59)"))
 checks.append((f'Flujo inversionista anual / mensual, año {y}',f"='Flujo inversionista'!{l}64-SUM('Calc financiero'!{a}26:{b}26)-SUM('Flujo inversionista'!{l}57:{l}59)"))
 checks.append((f'EBITDA anual / motor, año {y}',f"='Flujo puro'!{l}26-SUM(Mensual!{a}139:{b}139)/1000000"))
 checks.append((f'Equilibrio contable, año {y}',f'=Equilibrio!{l}14'))
band(ctrl,5,'Control',6);cell(ctrl,5,3,'Diferencia (MM o unidades)')
for r,(label,f) in enumerate(checks,6):cell(ctrl,r,2,label);cell(ctrl,r,3,f)
cell(ctrl,46,2,'Suma absoluta de controles');cell(ctrl,46,3,'=SUMPRODUCT(ABS(C6:C43))');total(ctrl,46)
ctrl.column_dimensions['B'].width=65;ctrl.column_dimensions['C'].width=28;ctrl.print_area='B1:F47'

notes=sheet('Notas y cambios','LUMINE · Criterios y conciliación','Base: Lumine_Plan_Financiero_Fase4 (3).xlsx recibido del equipo. El Excel del curso se usó sólo para estructura y presentación.',8)
notelist=[
('Qué se conserva','Precios $4.590.000 / $5.290.000 con IVA; kit $3.031.028 / $3.396.013; mezcla Plus 60%; piloto de 3 autos; embudo y dotación del último archivo. No se trasladan números ni tecnología del Excel del curso.'),
('Capital de trabajo','Método contable mensual: inventario + tránsito pagado + IVA − anticipos netos de clientes. Sólo su variación afecta caja; se recupera el saldo final, ajustable. El déficit acumulado se usa para dimensionar financiación y NO se suma además como otro activo.'),
('Año 0 y fondos requeridos','La inversión económica t0 reúne gastos previos capitalizados a Ku (puro) o Ke (inversionista). El máximo de caja se calcula con desembolsos efectivos, sin sumar el costo de oportunidad como un pago. Los años siguientes pueden exigir aportes adicionales.'),
('Tributos y moneda','Renta por calendario: general 25,5% en 2027; 24% en 2028; 23% desde 2029. Pérdidas arrastradas, sin devolución automática. Pago en abril siguiente y liquidación de la obligación final al cierre. Sin PPM. Depreciación y pérdidas expresadas en moneda real indexada: aproximación de corrección monetaria, no declaración SII.'),
('Depreciación','Normal mensual desde puesta en servicio al abrir o entrar el nuevo dúo. No se retrasa hasta el año siguiente. Las vidas útiles recibidas son clasificaciones de trabajo; escáner y mobiliario/computadores deben validarse. Vida acelerada es informativa. Agotar vida tributaria no implica reemplazo físico automático.'),
('Software y preoperativos','Se conserva $26,65 M = 2.050 horas × $13.000. Estimación sin cotización; desembolso supuesto en t0 por ausencia de hitos. Amortización de ambos en 3 años es convención académica; revisar tratamiento específico de gastos/licencias/desarrollo. Aporte de trabajo no desembolsado queda fuera del FCF.'),
('Deuda','Se aplica D/V sectorial a la necesidad máxima total sin deuda. Crédito hipotético indexado, 5 años, uno de gracia de capital. Kd real por Fisher; no usar esta tabla como préstamo nominal de cuota CLP fija. El recargo 3% sólo corresponde a deuda, no a Ku/Ke. Aportes y deuda no están comprometidos.'),
('Valor final','Liquidación contable de activos, stock pagado, IVA remanente y depósito. Es supuesto de recuperación, no tasación ni efectivo asegurado. No hay perpetuidad. La hoja Sensibilidad y el VAN sin cierre muestran la dependencia de estas recuperaciones.'),
('Pagos de clientes','Financiamiento por terceros; no cartera propia. 30% al agendar y saldo al instalar. El 2% sobre venta neta se mantiene como supuesto agregado, no tarifa contratada. No se presume que toda tarjeta pague igual; debe cotizarse comisión, base bruta y plazo de abono.'),
('Unidades y mezcla','Instalaciones, compras y dúos son enteros. La economía unitaria usa la mezcla promedio recibida; los conteos Esencial/Plus en Costos son distribución ilustrativa. Para costeo por número de serie se necesita demanda e inventario separados por versión.'),
('IVA','Motor heredado de crédito remanente; usa importaciones/egresos supuestos y liberación contra débito. No se ha modelado calendario F29 ni totalidad de créditos deducibles. No presupone devolución 27 bis automática. Su desfase y tratamiento de anticipos requieren validación.'),
('Qué no queda acreditado','BOM vigente por fabricante/URL/precio, descuento 4,55%, arancel/origen, ensayos y permisos, seguro, garantía real de baterías, software de producción, calendario legal, convenio de pagos y acceso a deuda. Los supuestos identificados permiten evaluar, pero no equivalen a evidencia comercial.'),
('Fuentes oficiales contrastadas','Ley 21.850, art. 6 transitorio (BCN); Damodaran Auto Parts enero 2026, beta ajustada por caja 1,13 y D/E 41,46%; SII regímenes y vidas útiles; Transbank modalidades de cuotas y tarifas. Enlaces y limitaciones en auditoria/actual_v6.md.'),
('Cómo revisar','Cambiar inputs en Datos; comprobar Controles = 0. Leer Resumen → Datos → Costos → Inversión → Calendario → Capital de trabajo → flujos. Cálculos internos ocultos pueden mostrarse; no contienen una TIR objetivo. Fórmulas y generador se publican junto al libro.')]
for i,(title,body) in enumerate(notelist):
 r=5+i*4;band(notes,r,title);notes.merge_cells(start_row=r+1,start_column=2,end_row=r+3,end_column=8);cell(notes,r+1,2,body);notes.cell(r+1,2).alignment=Alignment(wrap_text=True,vertical='center');notes.row_dimensions[r+1].height=25;notes.row_dimensions[r+2].height=25;notes.row_dimensions[r+3].height=25
r=63;band(notes,r,'Conciliación con el archivo recibido')
for c,txt in enumerate(['Indicador','Recibido','v6'],2):cell(notes,64,c,txt)
for rr,label,val,f,fmt in [(65,'TIR pura',original_results['tir'],"='Flujo puro'!C71",PCT),(66,'VAN puro',original_results['van'],"='Flujo puro'!C70",NUM),(67,'Inversión equivalente en t0',-original_results['i0'],"=-'Flujo puro'!C64",NUM),(68,'Déficit operativo (referencia)',original_results['ct'],"='Capital de trabajo'!C20",NUM)]:
 cell(notes,rr,2,label);cell(notes,rr,3,val,fmt);cell(notes,rr,4,f,fmt)
notes.print_area='B1:H69';notes.page_setup.fitToHeight=0
for br in [21,37,53]:notes.row_breaks.append(Break(id=br-1))

su=sheet('Resumen','LUMINE MOTORS · Plan financiero','Versión académica conciliada · cinco años de operación · MM CLP constantes de 2026 · resultados sujetos a los supuestos y recuperaciones detallados.',10)
metrics=[(5,'TIR pura',"='Flujo puro'!C71",PCT),(8,'VAN puro a Ku',"='Flujo puro'!C70",NUM),(11,'Inversión previa equivalente en t0',"=-'Flujo puro'!C64",NUM),(5,'Financiación máxima sin deuda',"='Capital de trabajo'!C23",NUM),(8,'CTN al abrir',"='Capital de trabajo'!C12",NUM),(11,'Payback descontado',"='Flujo puro'!C73",NUM)]
for i,(r,title,f,fmt) in enumerate(metrics):
 c=2 if i<3 else 6;su.merge_cells(start_row=r,start_column=c,end_row=r,end_column=c+3);cell(su,r,c,title);su.merge_cells(start_row=r+1,start_column=c,end_row=r+2,end_column=c+3);z=cell(su,r+1,c,f,fmt);z.font=Font(name='Aptos',size=26,bold=True,color=BLACK);z.fill=PatternFill('solid',fgColor=PALE)
cell(su,15,2,'De dónde sale el resultado');su.merge_cells('B16:J18');cell(su,16,2,'Los precios y costos dejan pérdidas al arrancar. El margen mejora con el volumen; el stock y los anticipos a proveedores absorben caja. La recuperación final pesa en el VAN: revisar también el resultado sin liquidación. Ningún supuesto se ajustó para obtener una TIR objetivo.');su['B16'].alignment=Alignment(wrap_text=True)
for j,y in enumerate(range(6),3):
 l=openpyxl.utils.get_column_letter(j);cell(su,40,j,y,'0');cell(su,41,j,f"='Flujo puro'!{l}64");cell(su,42,j,f"='Flujo puro'!{l}67");cell(su,43,j,f"='Flujo puro'!{l}6",INT)
for r,txt in [(41,'Flujo puro'),(42,'Acumulado descontado'),(43,'Instalaciones')]:cell(su,r,2,txt)
bar=BarChart();bar.title='Flujo puro por año';bar.y_axis.title='MM CLP';bar.x_axis.title='Año';bar.add_data(Reference(su,min_col=2,max_col=8,min_row=41,max_row=41),from_rows=True,titles_from_data=True);bar.set_categories(Reference(su,min_col=3,max_col=8,min_row=40,max_row=40));bar.height=8;bar.width=15;bar.legend=None;bar.series[0].graphicalProperties.solidFill=BLUE;su.add_chart(bar,'B20')
line=LineChart();line.title='Recuperación descontada';line.y_axis.title='MM CLP';line.x_axis.title='Año';line.add_data(Reference(su,min_col=2,max_col=8,min_row=42,max_row=42),from_rows=True,titles_from_data=True);line.set_categories(Reference(su,min_col=3,max_col=8,min_row=40,max_row=40));line.height=8;line.width=15;line.legend=None;line.series[0].graphicalProperties.line.solidFill=BLUE;su.add_chart(line,'G20')
cell(su,37,2,'Controles (deben ser 0)');cell(su,37,4,'=Controles!C46');cell(su,38,2,'VAN a WACC de referencia');cell(su,38,4,f"=NPV({D(21)},'Flujo puro'!D64:H64)+'Flujo puro'!C64");cell(su,38,6,'VAN sin cierre');cell(su,38,8,"='Flujo puro'!C74")
# Datos de gráficos visibles fuera del área de impresión; ocultarlos vacía el gráfico en Calc.
bar.visible_cells_only=False;line.visible_cells_only=False;line.smooth=False;line.series[0].smooth=False
su.print_area='B1:K38';su.sheet_view.zoomScale=80
# Orden de lectura y presentación. Los motores nunca se borran para que la auditoría sea trazable.
order=['Resumen','Datos','Costos','Inversión','Calendario','Capital de trabajo','Flujo puro','Flujo inversionista','Deuda','Impuestos','3 años','CT mensual','Equilibrio','Sensibilidad','Controles','Notas y cambios']
w._sheets=[w[n] for n in order]+[s for s in w if s.title not in order]
for s in w:
 s.sheet_view.showGridLines=False
 if s.title not in order:s.sheet_state='hidden'
 for row in s:
  for z in row:
   if z.value is None:continue
   if z.font.color is not None and z.font.color.type=='rgb' and z.font.color.rgb!=BLACK:
    f=copy(z.font);f.color=BLACK;z.font=f
   if isinstance(z.value,str) and z.value.startswith('=') and ('#REF!' in z.value or '[' in z.value):raise ValueError((s.title,z.coordinate,z.value))
 if s.title in order:
  if s.print_area:s.print_area=str(s.print_area).replace('$B$1:', '$A$1:')
  s.sheet_view.zoomScale=85
  for r in range(4,s.max_row+1):
   if s.row_dimensions[r].height is None:s.row_dimensions[r].height=22
w.active=0;w.calculation=CalcProperties(calcId=191029,fullCalcOnLoad=True)
OUT.parent.mkdir(parents=True,exist_ok=True);w.save(OUT)
manifest={'source':str(SOURCE.relative_to(ROOT)),'sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'output':str(OUT.relative_to(ROOT)),'original_results':original_results,'formulas':sum(c.data_type=='f' for s in w for row in s for c in row),'visible_sheets':order}
(ROOT/'generador_revision/manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(manifest,ensure_ascii=False))
