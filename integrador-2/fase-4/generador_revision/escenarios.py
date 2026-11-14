#!/usr/bin/env python3
"""Recalcula escenarios completos con LibreOffice; no cambia el caso base publicado."""
from pathlib import Path
import tempfile,subprocess,json,shutil
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'excel/v6_academico_conciliado.xlsx'
cases={
 'kit_mas_5pct':{'C50':3031028*1.05,'C51':3396013*1.05},
 'kit_mas_10pct':{'C50':3031028*1.10,'C51':3396013*1.10},
 'precio_menos_5pct':{'C46':4590000*.95,'C47':5290000*.95},
 'embudo_bajo':{'C43':1},
 'comision_tarjeta_2_35pct_bruto':{'C54':.0235*1.19},
 'recuperacion_CT_75pct':{'C34':.75},
 'sin_deuda':{'C9':0}}
results={}
with tempfile.TemporaryDirectory(prefix='lumine-scenarios-') as temp:
 tmp=Path(temp);out=tmp/'calc';out.mkdir()
 for name,changes in cases.items():
  w=openpyxl.load_workbook(base)
  for addr,value in changes.items():w['Datos'][addr]=value
  w.save(tmp/(name+'.xlsx'))
 cmd=['soffice',f'-env:UserInstallation={(tmp/"profile").as_uri()}','--headless','--convert-to','xlsx','--outdir',str(out)]+[str(tmp/(name+'.xlsx'))for name in cases]
 subprocess.run(cmd,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
 for name in cases:
  w=openpyxl.load_workbook(out/(name+'.xlsx'),data_only=True)
  errors=[(s.title,c.coordinate,c.value)for s in w for row in s for c in row if c.data_type=='e']
  assert not errors,(name,errors[:5])
  # La búsqueda VAN=0 y sensibilidad parcial pueden salir del rango bajo otros escenarios.
  critical=[r for r in range(6,44) if r not in [14,22]]
  failures=[(r,w['Controles'].cell(r,2).value,w['Controles'].cell(r,3).value)for r in critical if abs(w['Controles'].cell(r,3).value)>1e-5]
  assert not failures,(name,failures)
  results[name]={'inputs':cases[name],'tir':w['Flujo puro']['C71'].value,'van_mm':w['Flujo puro']['C70'].value,'caja_max_mm':w['Capital de trabajo']['C23'].value,'unidades':[w['Flujo puro'].cell(6,c).value for c in range(4,9)],'controles_excluidos':{'VAN_0_por_rango':w['Controles']['C14'].value,'anticipos_limite_sensibilidad':w['Controles']['C22'].value}}
(ROOT/'generador_revision/escenarios.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n');print(json.dumps(results,ensure_ascii=False))
