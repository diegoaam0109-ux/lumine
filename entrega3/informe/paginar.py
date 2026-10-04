import subprocess, json, re, sys
pdf='/tmp/render/TIG_IA_Grupo01_LumineMotors_Entrega03.pdf'
n=int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo',pdf],capture_output=True,text=True).stdout).group(1))
pages=[subprocess.run(['pdftotext','-f',str(i),'-l',str(i),'-layout',pdf,'-'],capture_output=True,text=True).stdout for i in range(1,n+1)]
titulos=["1. La Entrega 2 corregida","2. Propuesta de valor","3. Tipo de IA y herramienta","4. Diseño funcional","5. Arquitectura de instrucciones RAFA","6. Prototipo mínimo","7. Protocolo de prueba","8. Resultados e iteración","9. Limitaciones","10. Conclusiones y próximos pasos","Referencias","Anexos","Anexo A. Prompts completos","Anexo B. Registro de pruebas de la capa generativa","Anexo C. Nota técnica del simulador","Anexo D. Datos de conducción y calibración con Santiago","Anexo E. Nota técnica del modelo predictivo","Anexo F. Evidencia del prototipo","Anexo G. Protocolo de levantamiento de datos en Santiago","Anexo H. Registro de uso de inteligencia artificial","Anexo I. Registro de supuestos actualizado"]
res={}
for t in titulos:
    for i,p in enumerate(pages[2:],start=3):
        if any(l.strip()==t for l in p.split('\n')):
            res[t]=i; break
res['__fin_cuerpo']=res['Referencias']-1
viejo=json.load(open('informe/paginas.json')) if len(sys.argv)>1 else {}
json.dump(res,open('informe/paginas.json','w'),ensure_ascii=False)
print(res); print('cambió' if res!=viejo else 'estable')
