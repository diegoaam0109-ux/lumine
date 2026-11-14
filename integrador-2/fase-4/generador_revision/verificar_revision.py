#!/usr/bin/env python3
"""Comprueba errores, preservación del motor y evaluación independiente desde sus series."""
from pathlib import Path
from datetime import date
import json, math, argparse
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('libro',nargs='?',default=str(ROOT/'excel/v6_academico_conciliado.xlsx'));args=a.parse_args()
p=Path(args.libro);v=openpyxl.load_workbook(p,data_only=True);f=openpyxl.load_workbook(p,data_only=False)
src=openpyxl.load_workbook(ROOT/'revision-13-11-2026/fuentes/base/Lumine_Plan_Financiero_Fase4_recibido.xlsx',data_only=True)
errors=[(s.title,c.coordinate,c.value)for s in v for row in s for c in row if c.data_type=='e'];assert not errors,errors[:20]
missing=[(s.title,c.coordinate)for s in f for row in s for c in row if c.data_type=='f' and v[s.title][c.coordinate].value is None and '""' not in c.value];assert not missing,missing[:20]
checks={v['Controles'].cell(r,2).value:v['Controles'].cell(r,3).value for r in range(6,44)}
assert all(isinstance(x,(int,float)) and abs(x)<1e-6 for x in checks.values()),checks
compared=0
for sname in ['Mensual','Anual']:
 for row in src[sname]:
  for c in row:
   if isinstance(c.value,(int,float)):
    x=v[sname][c.coordinate].value;assert math.isclose(c.value,x,rel_tol=1e-11,abs_tol=1e-5),(sname,c.coordinate,c.value,x);compared+=1
# Modelo independiente: usa sólo series operativas/inputs, no fórmulas financieras del Excel.
m=v['Mensual'];d=v['Datos'];ku=d['C16'].value;ke=d['C18'].value;kd=d['C19'].value
soft=d['C25'].value*d['C26'].value/1e6
pre=[];eb=[];dep=[];am=[];delta=[];cap=[];ct=[];year=[]
for c in range(4,82):
 n=c-3;op=n-18;yr=2027+(n-1)//12;year.append(yr);stock=m.cell(150,c).value/1e6;ct.append(stock)
 delta.append(stock-(ct[-2] if c>4 else 0));cap.append(m.cell(128,c).value/1e6 if op>0 else 0)
 pre.append(m.cell(144,c).value/1e6-(soft if op==0 else 0) if op<=0 else 0)
 eb.append(m.cell(139,c).value/1e6 if op>0 else 0)
 z=0
 for r in range(6,13):
  amount=src['1 Inversión'].cell(r,3).value;life=d.cell(165+r-6,3).value
  if 0<op<=life*12:z+=amount/(life*12)
  if r in [8,9]:
   for sr in range(49,54):
    start=d.cell(sr+40,3).value
    if start>1 and start<=op<start+life*12:z+=amount/(life*12)
 dep.append(z);am.append((src['1 Inversión']['F24'].value+soft)/(d['C28'].value*12) if 0<op<=d['C28'].value*12 else 0)
def taxes(interest):
 losses=0;due={};bases={}
 for yr in range(2027,2034):
  profit=sum(eb[i]-dep[i]-am[i]-interest[i] for i,y in enumerate(year) if y==yr)
  rate=d['C32'].value if yr==2027 else d['C33'].value if yr==2028 else d['C10'].value
  due[yr]=max(0,profit-losses)*rate;losses=max(0,losses-profit);bases[yr]=profit
 cash=[]
 for i,yr in enumerate(year):
  n=i+1;month=(n-1)%12+1
  cash.append((due.get(yr-1,0) if month==d['C31'].value else 0)+(due[2033] if n==78 else 0))
 return cash,due,bases
ptax,_,_=taxes([0]*78)
raw=[pre[i] if i<18 else eb[i]-ptax[i]-cap[i]-delta[i] for i in range(78)]
peak=-min(0,*[sum(raw[:i+1]) for i in range(78)])
loan=peak*d['C20'].value;bal=loan;interest=[];principal=[]
nper=d['C29'].value-d['C30'].value;payment=loan*kd/(1-(1+kd)**-nper) if kd else loan/nper
for y in range(1,6):
 intr=bal*kd;amort=0 if y<=d['C30'].value else min(bal,payment-intr);interest.append(intr);principal.append(amort);bal-=amort
mi=[interest[(i-18)//12]/12 if i>=18 else 0 for i in range(78)];etax,_,_=taxes(mi)
terminal=(sum(src['1 Inversión'].cell(r,3).value for r in range(6,13))+sum(cap)-sum(dep))*d['C35'].value+ct[-1]*d['C34'].value+src['1 Inversión']['C30'].value
pflow=[sum(pre[i]*(1+ku)**((17-i)/12) for i in range(18))]
eflow=[sum(pre[i]*(1+ke)**((17-i)/12) for i in range(18))+loan]
for y in range(5):
 ids=range(18+12*y,30+12*y);pf=sum(raw[i] for i in ids);ef=sum(eb[i]-etax[i]-cap[i]-delta[i] for i in ids)-interest[y]-principal[y]
 if y==4:pf+=terminal;ef+=terminal
 pflow.append(pf);eflow.append(ef)
npv=lambda r,cf:sum(x/(1+r)**i for i,x in enumerate(cf))
def irr(cf):
 lo,hi=-.8,2
 assert npv(lo,cf)*npv(hi,cf)<0
 for _ in range(100):
  mid=(lo+hi)/2
  if npv(mid,cf)>0:lo=mid
  else:hi=mid
 return (lo+hi)/2
for s,cf,rate in [('Flujo puro',pflow,ku),('Flujo inversionista',eflow,ke)]:
 for j,x in enumerate(cf):assert abs(x-v[s].cell(64,3+j).value)<1e-6,(s,j,x,v[s].cell(64,3+j).value)
 assert abs(npv(rate,cf)-v[s]['C70'].value)<1e-6
 assert abs(irr(cf)-v[s]['C71'].value)<1e-10
assert abs(peak-v['Capital de trabajo']['C23'].value)<1e-6
out={'errors':errors,'missing_formula_cache':missing,'control_count':len(checks),'max_control_abs':max(abs(x) for x in checks.values()),'unchanged_operating_cells':compared,'independent_pure_flows_mm':pflow,'independent_equity_flows_mm':eflow,'pure_irr':irr(pflow),'pure_npv_mm':npv(ku,pflow),'equity_irr':irr(eflow),'equity_npv_mm':npv(ke,eflow),'previous_cash_mm':-sum(pre),'capitalized_i0_mm':-pflow[0],'funding_peak_mm':peak,'opening_ct_mm':ct[17],'final_ct_mm':ct[-1],'loan_mm':loan,'equity_peak_mm':v['Deuda']['C42'].value,'npv_without_terminal_mm':v['Flujo puro']['C74'].value,'break_even_price_change':v['Equilibrio']['C19'].value,'formulas':sum(c.data_type=='f'for s in f for row in s for c in row)}
(ROOT/'generador_revision/verificacion.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');print(json.dumps(out,ensure_ascii=False))
