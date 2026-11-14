#!/usr/bin/env python3
"""Genera, recalcula, verifica y exporta; conserva cachés de Excel y no modifica la fuente."""
from pathlib import Path
import subprocess,sys,tempfile,shutil
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
book=ROOT/'excel/v6_academico_conciliado.xlsx'
subprocess.run([sys.executable,str(HERE/'generar_revision.py')],check=True)
with tempfile.TemporaryDirectory(prefix='lumine-build-') as temp:
 tmp=Path(temp);calc=tmp/'calc';calc.mkdir();profile=(tmp/'profile').as_uri()
 subprocess.run(['soffice',f'-env:UserInstallation={profile}','--headless','--convert-to','xlsx','--outdir',str(calc),str(book)],check=True,timeout=180)
 recalculated=calc/book.name
 if not recalculated.exists():raise RuntimeError('LibreOffice no generó el archivo recalculado')
 shutil.copyfile(recalculated,book)
 subprocess.run([sys.executable,str(HERE/'verificar_revision.py'),str(book)],check=True)
 pdf=tmp/'pdf';pdf.mkdir()
 subprocess.run(['soffice',f'-env:UserInstallation={profile}','--headless','--convert-to','pdf','--outdir',str(pdf),str(book)],check=True,timeout=180)
 shutil.copyfile(pdf/book.with_suffix('.pdf').name,book.with_suffix('.pdf'))
print('Listos:',book,book.with_suffix('.pdf'))
