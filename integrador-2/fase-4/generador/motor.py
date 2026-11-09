"""Motor mensual (cálculo) y Anual (cálculo): hojas técnicas ocultas. Las fórmulas son las mismas de la v4."""
import re

from base import C0, H_ANU, H_MEN, N, mc, q
from estilo import (B_FILA, B_TOTAL, CEN, F_ENC, FMT_DEC1, FMT_DEC2, FMT_ENTERO, FMT_FECHA, FMT_MES, FMT_PCT, FMT_PCT3, FMT_PESOS,
                    GRIS, IZQ, TINTA, bloque, celda, col, encabezado, fuente, hoja_base, titular)


MENSUAL = []  # (clave, etiqueta, unidad, plantilla, formato, tipo_anual) o ("#", título)


def S_(t):
    MENSUAL.append(("#", t))


def R_(k, et, uni, tpl, fmt=FMT_PESOS, kind="sum"):
    MENSUAL.append((k, et, uni, tpl, fmt, kind))


# ---- definición del motor (plantillas: {clave} = celda del mes; {clave^} = mes anterior; {clave:} = fila completa)
S_("1. CALENDARIO")
R_("mes", "Mes del proyecto (no existe mes 0)", "mes", "=IF({pos}<=12,{pos}-13,{pos}-12)", FMT_MES, "none")
R_("anio", "Año del proyecto", "año", "=IF({mes}<0,0,ROUNDUP({mes}/12,0))", "0", "none")
R_("fecha", "Fecha (mes calendario)", "", "=DATE(Anio0,{pos},1)", FMT_FECHA, "none")
R_("pos", "Posición (1 a 72)", "", "=COLUMN()-COLUMN($C$1)", "0", "none")
R_("mc", "Mes comercial (cuenta desde la apertura de ventas; cambia con el atraso del reglamento)", "mes", "=IF({mes}>=1+Atraso,{mes}-Atraso,0)", "0", "none")
R_("ac", "Año comercial", "año", "=IF({mc}=0,0,ROUNDUP({mc}/12,0))", "0", "none")
R_("kk", "Mes dentro del año comercial", "mes", "=IF({mc}=0,0,{mc}-12*({ac}-1))", "0", "none")
S_("2. DEMANDA (bloque F)")
R_("F", "F(t) acumulada de Bass, t = mes comercial / 12", "%",
   "=IF({mc}=0,0,(1-EXP(-(pBass+qBass)*{mc}/12))/(1+(qBass/pBass)*EXP(-(pBass+qBass)*{mc}/12)))", FMT_PCT3, "end")
R_("dem", "Demanda bruta del mes = m × [F(t) − F(t − 1)] (sin redondear)", "vehículos", "=mBass*({F}-N({F^}))", FMT_DEC1, "sum")
R_("cob", "Cobertura de la biblioteca", "%", "=IF({ac}=0,0,IF({ac}=1,CobAnio1,CobAnio2))", FMT_PCT, "none")
R_("dem_at", "Demanda atendible = demanda × cobertura", "vehículos", "={dem}*{cob}", FMT_DEC1, "sum")
S_("3. CAPACIDAD E INSTALACIONES (bloque G)")
R_("cap", "Capacidad por dúo", "veh./mes", "=IF({mes}<1,0,IF({mes}<=CapMesCambio,CapDuoA,CapDuoB))", FMT_DEC2, "none")
R_("nec", "Dúos necesarios = REDONDEAR.MAS(demanda / (capacidad × regla del 80%))", "dúos",
   "=IF({dem_at}=0,0,ROUNDUP({dem_at}/({cap}*Util),0))", FMT_ENTERO, "end")
R_("duos", "Dúos activos (nunca bajan)", "dúos", "=MAX(N({duos^}),{nec})", FMT_ENTERO, "end")
R_("talleres", "Talleres propios abiertos (máximo 6 dúos por taller)", "talleres", "=IF({duos}=0,0,ROUNDUP({duos}/MaxDuos,0))", FMT_ENTERO, "end")
R_("capm", "Capacidad nominal del mes = dúos × capacidad por dúo", "vehículos", "={duos}*{cap}", FMT_DEC1, "sum")
R_("cap80", "Capacidad planificada (regla del 80%)", "vehículos", "={capm}*Util", FMT_DEC1, "sum")
R_("inst", "Instalaciones = MIN(demanda atendible, capacidad), enteras", "vehículos", "=ROUND(MIN({dem_at},{capm}),0)", FMT_ENTERO, "sum")
R_("util", "Utilización de la capacidad nominal", "%", "=IF({capm}=0,0,{inst}/{capm})", FMT_PCT, "none")
R_("ie", "Instalaciones Esencial = REDONDEAR(instalaciones × (1 − mezcla Plus))", "vehículos", "=ROUND({inst}*(1-Mix),0)", FMT_ENTERO, "sum")
R_("ip", "Instalaciones Plus", "vehículos", "={inst}-{ie}", FMT_ENTERO, "sum")
R_("parque", "Parque instalado acumulado", "vehículos", "=N({parque^})+{inst}", FMT_ENTERO, "end")
R_("prim", "Primeros clientes de un modelo nuevo (enteros, repartidos en el año comercial)", "vehículos",
   "=IF({ac}=0,0,MIN({inst},ROUND(IF({ac}=1,ModNuevos1,ModNuevos2)*{kk}/12,0)-ROUND(IF({ac}=1,ModNuevos1,ModNuevos2)*({kk}-1)/12,0)))",
   FMT_ENTERO, "sum")
S_("4. VENTAS, COBROS Y CRÉDITO DIRECTO (bloques E e I)")
R_("bruto", "Ingreso bruto por instalaciones", "$", "={ie}*PrecioE+{ip}*PrecioP")
R_("descu", "Descuento de 10% al primer cliente de un modelo nuevo", "$", "=IF({inst}=0,0,{prim}*DescPrimer*{bruto}/{inst})")
R_("cred_u", "Ventas con crédito directo (enteras)", "vehículos", "=ROUND({inst}*VtaCred,0)", FMT_ENTERO, "sum")
R_("bono", "Bono financiamiento (5% del precio en las ventas con crédito)", "$", "=IF({inst}=0,0,({bruto}-{descu})*{cred_u}/{inst}*Bono)")
R_("neto", "Ingreso neto por instalaciones", "$", "={bruto}-{descu}-{bono}")
R_("v_cred", "Ventas con crédito (valor neto)", "$", "=IF({inst}=0,0,({bruto}-{descu})*{cred_u}/{inst}-{bono})")
R_("v_cont", "Ventas al contado o con tarjeta (valor neto)", "$", "={neto}-{v_cred}")
R_("abono", "Pie de 30% cobrado (de las instalaciones del mes siguiente)", "$", "=IF({pos}+1>NPos,0,Pie*INDEX({neto:},{pos}+1))")
R_("abono_s", "Abonos recibidos al cierre (pie de ventas aún no instaladas)", "$", "={abono}", FMT_PESOS, "end")
R_("saldo_cont", "Saldo de 70% cobrado a la entrega (contado o tarjeta)", "$", "=(1-Pie)*{v_cont}")
R_("coloc", "Monto financiado con crédito directo (colocación del mes)", "$", "=(1-Pie)*{v_cred}")
R_("cuota", "Cuotas programadas = PAGO × colocaciones vigentes (primera cuota el mes siguiente)", "$",
   '=FactorCuota*SUMIFS({coloc:},{pos:},">="&({pos}-Plazo),{pos:},"<"&{pos})')
R_("inter", "Intereses programados = saldo de la cartera al inicio × tasa real", "$", "=TasaCredReal*N({saldo_b^})")
R_("capi", "Capital programado = cuota − interés", "$", "={cuota}-{inter}")
R_("saldo_b", "Saldo bruto de la cartera de crédito directo", "$", "=N({saldo_b^})-{capi}+{coloc}", FMT_PESOS, "end")
R_("cap_cob", "Capital cobrado (neto de incobrables)", "$", "=(1-Incob)*{capi}")
R_("int_cob", "Ingreso por financiamiento a clientes (intereses cobrados)", "$", "=(1-Incob)*{inter}")
R_("prov", "Provisión de incobrables (3% del monto financiado, en el mes de la venta)", "$", "=Incob*{coloc}")
R_("cxc", "Cuentas por cobrar netas de provisión", "$", "=(1-Incob)*{saldo_b}", FMT_PESOS, "end")
R_("com_mp", "Comisión de medio de pago (2% de las ventas al contado o con tarjeta)", "$", "=ComMP*{v_cont}")
R_("cobrado", "Total cobrado a clientes", "$", "={abono}+{saldo_cont}+{cap_cob}+{int_cob}")
S_("5. COSTOS VARIABLES")
R_("kitc", "Kits instalados (costo directo del kit, punto medio con forward)", "$", "={ie}*KitE+{ip}*KitP")
R_("gar", "Garantía (3% del costo del kit)", "$", "=GarPct*{kitc}")
R_("comis", "Comisiones de venta (con cargas y tope por persona)", "$", "=MIN({inst}*ComInst,{com}*ComTope)*{fac}")
R_("sello", "Sello", "$", "=Sello*{inst}")
R_("refe", "Referidos (enteros)", "$", "=ROUND(RefPct*{inst},0)*RefMonto")
R_("evalc", "Evaluación crediticia", "$", "=EvalCred*{cred_u}")
R_("cv", "Total costos variables (incluye provisión de incobrables y comisión de medio de pago)", "$",
   "={kitc}+{gar}+{comis}+{sello}+{refe}+{evalc}+{prov}+{com_mp}")
S_("6. COMPRAS DE KITS Y PAGOS AL PROVEEDOR (bloque I)")
R_("ped_u", "Kits pedidos (2 meses antes de instalar; el primer pedido cubre los meses 1 y 2)", "kits",
   "=IF({pos}+2>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({inst:},{pos}+2)+IF({pos}+3>NPos,0,INDEX({inst:},{pos}+3)),"
   "IF(INDEX({mc:},{pos}+2)>=3,INDEX({inst:},{pos}+2),0)))", FMT_ENTERO, "sum")
R_("ped_v", "Valor del pedido (costo de los kits)", "$",
   "=IF({pos}+2>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({kitc:},{pos}+2)+IF({pos}+3>NPos,0,INDEX({kitc:},{pos}+3)),"
   "IF(INDEX({mc:},{pos}+2)>=3,INDEX({kitc:},{pos}+2),0)))")
R_("nro", "N.º de pedido", "", '=IF({ped_u}>0,COUNTIF($D${ped_u#}:{ped_u},">0"),0)', FMT_ENTERO, "none")
R_("pago30", "Pago del 30% al pedir", "$", "=ProvAnt*{ped_v}")
R_("pago70", "Pago del 70% (al embarque; desde el 4.º pedido, a 30 días)", "$",
   '=(1-ProvAnt)*(SUMIFS({ped_v:},{pos:},{pos}-1,{nro:},">0",{nro:},"<"&ProvDesde)+SUMIFS({ped_v:},{pos:},{pos}-2,{nro:},">="&ProvDesde))')
R_("pagoprov", "Total pagado al proveedor", "$", "={pago30}+{pago70}")
R_("ped_acum", "Kits pedidos acumulados", "kits", "=N({ped_acum^})+{ped_u}", FMT_ENTERO, "end")
R_("transito", "Kits en tránsito (pedidos y aún no instalados)", "kits",
   "=IF({pos}+1>NPos,0,INDEX({inst:},{pos}+1))+IF({pos}+2>NPos,0,INDEX({inst:},{pos}+2))"
   "+IF({pos}+3>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({inst:},{pos}+3),0))", FMT_ENTERO, "end")
R_("ctrl_ped", "Control: pedidos acumulados − parque − tránsito (debe dar 0)", "kits", "={ped_acum}-{parque}-{transito}", FMT_ENTERO, "none")
R_("kits_pag", "Saldo de kits pagados y aún no instalados", "$", "=ROUND(N({kits_pag^})+{pagoprov}-{kitc},2)", FMT_PESOS, "end")
S_("7. NÓMINA POR CARGO (bloque J): personas y costo empresa")
R_("fac", "Factor de costo empresa (Ley 21.735)", "×", "=LOOKUP({fecha},FactDesde,FactValor)", "0.0000", "none")
R_("gg", "Gerente General", "personas", "=IF({mes}>=1,1,0)", FMT_ENTERO, "end")
R_("rt", "Responsable Técnico (taller 1 desde el mes −9; los demás 3 meses antes de abrir)", "personas",
   "=MAX(IF({mes}>=MesPEIni,1,0),INDEX({talleres:},MIN({pos}+AntRT,NPos)))", FMT_ENTERO, "end")
R_("ing", "Ingeniería de Calibración", "personas", "=IF({mes}<MesPEIni,0,IF({anio}>=IngSegAnio,2,1))", FMT_ENTERO, "end")
R_("adm", "Administración y Personas", "personas", "=IF({mes}>=MesPreIni,1,0)", FMT_ENTERO, "end")
R_("com", "Comercial y Postventa (1 + 1 por cada 600 instalaciones del año comercial)", "personas",
   "=IF({mc}<1,0,1+ROUNDDOWN(SUMIFS({inst:},{ac:},{ac})/ComPorInst,0))", FMT_ENTERO, "end")
R_("aspost", "Asistente de Postventa", "personas",
   "=IF({parque}>AsPostUmbral,1+ROUNDDOWN(({parque}-AsPostUmbral)/AsPostPaso,0),0)", FMT_ENTERO, "end")
R_("comemp", "Comercial de Empresas (red con 5 talleres o más)", "personas", "=IF({red_act}>=ComEmpUmbral,1,0)", FMT_ENTERO, "end")
R_("plat_h", "Administrador de plataforma y red: honorarios part-time", "personas",
   "=IF(AND({red_act}>=1,{red_act}<AdmPlatUmbral),1,0)", FMT_ENTERO, "end")
R_("plat_f", "Administrador de plataforma y red: jornada completa", "personas", "=IF({red_act}>=AdmPlatUmbral,1,0)", FMT_ENTERO, "end")
R_("sop", "Soporte técnico de red (1 por cada 15 talleres)", "personas", "=IF({red_act}=0,0,ROUNDUP({red_act}/SopPaso,0))", FMT_ENTERO, "end")
R_("hires", "Técnicos que ingresan (2 meses antes de que su dúo empiece a instalar)", "personas",
   "=TecDuo*(INDEX({duos:},MIN({pos}+AntTec,NPos))-INDEX({duos:},MIN({pos}+AntTec-1,NPos)))", FMT_ENTERO, "sum")
R_("first", "Posición del primer ingreso de técnicos", "", "=IF(N({first^})>0,N({first^}),IF({hires}>0,{pos},0))", "0", "none")
R_("tsen", "Meses desde el ingreso del primer dúo", "meses", "=IF({first}=0,-1,{pos}-{first})", "0", "none")
R_("gen", "Nivel genérico del técnico senior del primer dúo", "nivel",
   "=IF({tsen}<0,0,IF({tsen}<MesesN1,1,IF({tsen}<MesesN1+MesesN2,2,IF({tsen}<MesesN1+MesesN2+MesesN3,3,4))))", "0", "none")
R_("efe", "Nivel efectivo del técnico senior (abre como N3)", "nivel",
   "=IF({tsen}<0,0,IF({tsen}+SeniorExtra<MesesN1,1,IF({tsen}+SeniorExtra<MesesN1+MesesN2,2,IF({tsen}+SeniorExtra<MesesN1+MesesN2+MesesN3,3,4))))",
   "0", "none")
R_("N1", "Técnicos N1", "personas", '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1),{pos:},"<="&{pos})-({gen}=1)+({efe}=1)', FMT_ENTERO, "end")
R_("N2", "Técnicos N2", "personas",
   '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1-MesesN2),{pos:},"<="&({pos}-MesesN1))-({gen}=2)+({efe}=2)', FMT_ENTERO, "end")
R_("N3", "Técnicos N3", "personas",
   '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1-MesesN2-MesesN3),{pos:},"<="&({pos}-MesesN1-MesesN2))-({gen}=3)+({efe}=3)', FMT_ENTERO, "end")
R_("N4", "Técnicos N4", "personas", '=SUMIFS({hires:},{pos:},"<="&({pos}-MesesN1-MesesN2-MesesN3))-({gen}=4)+({efe}=4)', FMT_ENTERO, "end")
R_("tec", "Técnicos: total", "personas", "={N1}+{N2}+{N3}+{N4}", FMT_ENTERO, "end")
R_("ctrl_tec", "Control: técnicos − 2 × dúos que instalarán en 2 meses (debe dar 0)", "personas",
   "={tec}-TecDuo*INDEX({duos:},MIN({pos}+AntTec,NPos))", FMT_ENTERO, "none")
R_("asadm", "Asistente de Administración (dotación sobre 25)", "personas",
   "=IF({gg}+{rt}+{ing}+{adm}+{com}+{aspost}+{comemp}+{plat_h}+{plat_f}+{sop}+{tec}>AsAdmUmbral,1,0)", FMT_ENTERO, "end")
R_("dot", "Dotación total", "personas", "={gg}+{rt}+{ing}+{adm}+{com}+{aspost}+{comemp}+{plat_h}+{plat_f}+{sop}+{tec}+{asadm}", FMT_ENTERO, "end")
R_("c_gg", "Gerente General: costo empresa", "$", "={gg}*R_GG*{fac}")
R_("c_rt", "Responsable Técnico: costo empresa", "$", "={rt}*R_RT*{fac}")
R_("c_ing", "Ingeniería de Calibración: costo empresa", "$", "={ing}*R_Ing*{fac}")
R_("c_adm", "Administración y Personas: costo empresa", "$", "={adm}*R_Adm*{fac}")
R_("c_com", "Comercial y Postventa: costo empresa (sin comisión)", "$", "={com}*R_Com*{fac}")
R_("c_aspost", "Asistente de Postventa: costo empresa", "$", "={aspost}*R_AsPost*{fac}")
R_("c_asadm", "Asistente de Administración: costo empresa", "$", "={asadm}*R_AsAdm*{fac}")
R_("c_comemp", "Comercial de Empresas: costo empresa", "$", "={comemp}*R_ComEmp*{fac}")
R_("c_plat", "Administrador de plataforma y red: honorarios (sin factor) o costo empresa", "$", "={plat_h}*R_PlatHon+{plat_f}*R_PlatFull*{fac}")
R_("c_sop", "Soporte técnico de red: costo empresa", "$", "={sop}*R_Sop*{fac}")
R_("c_tec", "Técnicos N1 a N4: costo empresa", "$", "=({N1}*RentaN1+{N2}*RentaN2+{N3}*RentaN3+{N4}*RentaN4)*{fac}")
R_("c_bonos", "Bonos únicos al validar nivel (con cargas)", "$",
   "=(BonoN2*SUMIFS({hires:},{pos:},{pos}-MesesN1)+BonoN3*SUMIFS({hires:},{pos:},{pos}-MesesN1-MesesN2)"
   "+BonoN4*SUMIFS({hires:},{pos:},{pos}-MesesN1-MesesN2-MesesN3))*{fac}")
R_("nom_op", "Subtotal operación del taller propio (RT, Ingeniería, técnicos, bonos y postventa)", "$",
   "={c_rt}+{c_ing}+{c_tec}+{c_bonos}+{c_aspost}")
R_("nom_adm", "Subtotal administración (GG, Administración y Personas, asistente)", "$", "={c_gg}+{c_adm}+{c_asadm}")
R_("nom_ven", "Subtotal ventas del taller propio (Comercial y Postventa)", "$", "={c_com}")
R_("nom_red", "Subtotal red (Comercial de Empresas, plataforma y soporte)", "$", "={c_comemp}+{c_plat}+{c_sop}")
R_("nomina", "Total nómina", "$", "={nom_op}+{nom_adm}+{nom_ven}+{nom_red}")
S_("8. RED DE TALLERES (bloque H): se cobra por taller")
R_("red_ent", "Talleres incorporados en el año comercial hasta este mes (reparto parejo)", "talleres",
   "=IF({ac}=0,0,MIN(INDEX(RedNuevos,{ac}),MAX(0,ROUNDUP(ROUND(1+({kk}-0.5)*INDEX(RedNuevos,{ac})/12,9),0)-1)))", FMT_ENTERO, "none")
R_("red_n", "Talleres nuevos de la red en el mes", "talleres", "=IF({kk}<=1,{red_ent},{red_ent}-N({red_ent^}))", FMT_ENTERO, "sum")
R_("red_act", "Talleres de la red activos", "talleres", "=N({red_act^})+{red_n}", FMT_ENTERO, "end")
R_("red_paq", "Ingreso: paquetes de entrada (derecho + formación de 2 técnicos)", "$", "={red_n}*RedPaquete")
R_("red_cuota", "Ingreso: suscripción, cuota base", "$", "={red_act}*RedCuota")
R_("red_habi", "Ingreso: suscripción, Lumine Habilita (2 técnicos por taller)", "$", "={red_act}*RedHab*RedTec")
R_("red_aran", "Ingreso: arancel del 3CV cobrado al costo", "$", "={red_n}*RedModelos*RedArancel")
R_("red_ing", "Total ingresos de la red", "$", "={red_paq}+{red_cuota}+{red_habi}+{red_aran}")
R_("red_c_curso", "Costo: curso externo de alta tensión (2 técnicos al entrar)", "$", "={red_n}*RedTec*RedCursoAT")
R_("red_c_audit", "Costo: auditoría anual con viaje (proporcional al mes)", "$", "={red_act}*RedAudit/12")
R_("red_c_com", "Costo: comisión de 5% del paquete (con cargas)", "$", "=RedComPct*{red_paq}*{fac}")
R_("red_c_aran", "Costo: arancel del 3CV pagado", "$", "={red_aran}")
R_("red_cdir", "Total costos directos de la red (sin personal ni marketing)", "$", "={red_c_curso}+{red_c_audit}+{red_c_com}+{red_c_aran}")
S_("9. GASTOS FIJOS Y MARKETING (bloques K, L y M)")
R_("locales", "Locales con arriendo (taller 1 desde el mes −9; los demás 2 meses antes de abrir)", "locales",
   "=MAX(IF({mes}>=ArrT1Desde,1,0),INDEX({talleres:},MIN({pos}+AntArr,NPos)))", FMT_ENTERO, "end")
R_("arr", "Arriendo", "$", "={locales}*Arriendo")
R_("serv", "Servicios básicos", "$", "={locales}*Servicios")
R_("seg", "Seguros", "$", "={locales}*Seguros")
R_("mant", "Mantención de equipos (3% anual del equipamiento acumulado)", "$", "=IF({mes}<1,0,MantPct/12*N({eq_acum^}))")
R_("cursos", "Cursos externos y EPP de técnicos nuevos", "$", "=CursoTec*{hires}")
R_("soft", "Software: mantención 15% anual + hosting + resto", "$", "=IF({mes}<1,0,SWMant*SWDev/12+SWHostUSD*Dolar+SWResto)")
R_("lanz", "Marketing: lanzamiento", "$", "=IF(AND({ac}=1,{kk}<=LanzMeses),INDEX(MkLanz,1)/LanzMeses,0)")
R_("pauta", "Marketing: pauta digital (año comercial 1: 50% en los meses 1 a 3)", "$",
   "=IF({ac}=0,0,IF({ac}=1,IF({kk}<=PautaMeses,INDEX(MkPauta,1)*PautaPct/PautaMeses,INDEX(MkPauta,1)*(1-PautaPct)/(12-PautaMeses)),INDEX(MkPauta,{ac})/12))")
R_("casos", "Marketing: casos con ahorro medido (año comercial 1: meses 4 a 6)", "$",
   "=IF({ac}=0,0,IF({ac}=1,IF(AND({kk}>=CasosIni,{kk}<=CasosFin),INDEX(MkCasos,1)/(CasosFin-CasosIni+1),0),INDEX(MkCasos,{ac})/12))")
R_("mat", "Marketing: material para mecánicos y paraderos", "$", "=IF({ac}=0,0,INDEX(MkMat,{ac})/12)")
R_("conv", "Marketing: convenios con líneas de colectivos", "$", "=IF({ac}=0,0,INDEX(MkConv,{ac})/12)")
R_("mk", "Marketing del taller propio (total)", "$", "={lanz}+{pauta}+{casos}+{mat}+{conv}")
R_("mk_red", "Marketing a talleres (red)", "$", "=IF({ac}=0,0,INDEX(MkRed,{ac})/12)")
R_("fijos", "Total gastos fijos del taller propio (incluye marketing)", "$", "={arr}+{serv}+{seg}+{mant}+{cursos}+{soft}+{mk}")
S_("10. INVERSIÓN DEL MES (bloque K)")
R_("t_eq", "Talleres con equipamiento comprado (taller 1 en el mes −9; los demás 3 meses antes de abrir)", "talleres",
   "=MAX(IF({mes}>=MesEqT1,1,0),INDEX({talleres:},MIN({pos}+AntEq,NPos)))", FMT_ENTERO, "end")
R_("t_eq_n", "Talleres equipados en el mes", "talleres", "={t_eq}-N({t_eq^})", FMT_ENTERO, "sum")
R_("d_eq", "Puestos de dúo equipados (el primero, para el Proyecto Experimental)", "puestos", "=MAX(IF({mes}>=MesEqT1,1,0),{duos})", FMT_ENTERO, "end")
R_("d_eq_n", "Puestos equipados en el mes", "puestos", "={d_eq}-N({d_eq^})", FMT_ENTERO, "sum")
R_("inv_t", "Equipamiento de talleres", "$", "={t_eq_n}*EqTaller")
R_("inv_d", "Equipamiento de puestos (elevador y herramientas)", "$", "={d_eq_n}*EqDuo")
R_("repo", "Reposición de herramientas (al cumplir su vida útil)", "$", "=Herramientas*SUMIFS({d_eq_n:},{pos:},{pos}-V_Herr*12)")
R_("pe_kits", "Proyecto Experimental: kits Plus (lote piloto a costo realista)", "$", "=IF({mes}=MesPEIni,PEKits*KitP_Real,0)")
R_("pe_otros", "Proyecto Experimental: notaría y seguro de responsabilidad civil", "$", "=IF({mes}=MesTramIni,PENotaria+PESeguro,0)")
R_("sw", "Desarrollo de software (parejo entre los meses −9 y −1)", "$",
   '=IF(AND({mes}>=SWIni,{mes}<=SWFin),SWDev/COUNTIFS({mes:},">="&SWIni,{mes:},"<="&SWFin),0)')
R_("idm", "I+D (bruto)", "$", "=IF({mes}<1,0,INDEX(IDAnio,{anio})/12)")
R_("id_neto", "I+D neto de subsidio (CORFO solo si se activa en Anexos)", "$", "={idm}*(1-IDSub)")
R_("garr", "Garantía de arriendo de locales nuevos (recuperable)", "$", "=({locales}-N({locales^}))*GarArrMeses*Arriendo")
R_("const", "Constitución de la SpA y marca", "$", "=IF({pos}=1,Constitucion,0)")
R_("preop_nom", "Puesta en marcha: nómina de los meses negativos", "$", "=IF({mes}<1,{nomina},0)")
R_("preop_loc", "Puesta en marcha: arriendo, servicios y seguros previos", "$", "=IF({mes}<1,{arr}+{serv}+{seg},0)")
R_("preop_cur", "Puesta en marcha: cursos y EPP de técnicos previos", "$", "=IF({mes}<1,{cursos},0)")
R_("inv_mes", "Inversión total del mes", "$",
   "={inv_t}+{inv_d}+{repo}+{pe_kits}+{pe_otros}+{sw}+{id_neto}+{garr}+{const}+{preop_nom}+{preop_loc}+{preop_cur}")
R_("eq_acum", "Equipamiento acumulado (base de la mantención)", "$", "=N({eq_acum^})+{inv_t}+{inv_d}+{repo}", FMT_PESOS, "end")
S_("11. RESULTADO Y CAJA DE OPERACIÓN")
R_("ingresos", "Ingresos (instalaciones netas + financiamiento + red)", "$", "={neto}+{int_cob}+{red_ing}")
R_("costos_op", "Nómina, gastos fijos y costos de la red (desde el mes 1; antes se capitalizan)", "$",
   "=IF({mes}<1,0,{nomina}+{fijos}+{red_cdir}+{mk_red})")
R_("ebitda", "EBITDA del mes", "$", "={ingresos}-{cv}-{costos_op}")
R_("fco", "Flujo de caja operativo del mes (cobros − pagos)", "$",
   "={cobrado}+{red_ing}-{pagoprov}-({gar}+{comis}+{sello}+{refe}+{evalc}+{com_mp})-{costos_op}")
R_("acum", "Saldo acumulado de caja operativa (déficit si es negativo)", "$", "=N({acum^})+{fco}", FMT_PESOS, "end")
R_("ebitda_ac", "Composición: resultado acumulado (EBITDA)", "$", "=N({ebitda_ac^})+{ebitda}", FMT_PESOS, "end")
R_("ctrl_caja", "Control: saldo − (resultado − kits pagados − cuentas por cobrar + abonos) (debe dar 0)", "$",
   "=ROUND({acum}-({ebitda_ac}-{kits_pag}-{cxc}+{abono}),0)", FMT_PESOS, "none")
R_("saldo_ct", "Saldo de capital de trabajo = kits pagados + cuentas por cobrar − abonos", "$", "={kits_pag}+{cxc}-{abono}", FMT_PESOS, "end")



def hoja_motor(L):
    ws = L.ws[H_MEN]
    hoja_base(ws, 85, visible=False)
    ws.page_setup.fitToWidth = 6  # 12 meses por página al imprimir
    titular(ws, "MOTOR MENSUAL (CÁLCULO)",
            "Meses −12 a −1 y 1 a 60, con la misma fórmula en toda la fila: demanda, dúos, ventas, crédito, kits, nómina, red, gastos, inversión y caja.", 10)
    ws.column_dimensions["A"].width = 66
    ws.column_dimensions["B"].width = 10
    ws.column_dimensions["C"].width = 2
    for i in range(1, N + 1):
        ws.column_dimensions[mc(i)].width = 11.5
    filas, r = {}, 6
    for e in MENSUAL:
        if e[0] == "#":
            r += 1
            filas["#" + e[1]] = r
            r += 1
            continue
        filas[e[0]] = r
        r += 1
    L.filas_men = filas
    L.nombre("NPos", H_MEN, "$D$9:$BW$9")  # se redefine abajo como COLUMNS
    patron = re.compile(r"\{([A-Za-z0-9_]+)(\^|:|#)?\}")

    def render(tpl, i):
        def rep(m):
            k, suf = m.group(1), m.group(2)
            rr = filas[k]
            if suf == "^":
                return f"{mc(i - 1) if i > 1 else 'C'}{rr}"
            if suf == ":":
                return f"${mc(1)}${rr}:${mc(N)}${rr}"
            if suf == "#":
                return str(rr)
            return f"{mc(i)}{rr}"
        return patron.sub(rep, tpl)

    for e in MENSUAL:
        if e[0] == "#":
            bloque(ws, filas["#" + e[1]], e[1], 3)
            continue
        k, et, uni, tpl, fmt, kind = e
        rr = filas[k]
        ctrl = k.startswith("ctrl")
        total = k in ("neto", "cv", "nomina", "fijos", "inv_mes", "ebitda", "red_ing", "cobrado", "saldo_ct", "tec", "dot", "inst", "duos")
        celda(ws, f"A{rr}", et, negrita=total, alin=IZQ, borde=B_FILA)
        celda(ws, f"B{rr}", uni, color=GRIS, tam=9, borde=B_FILA)
        for i in range(1, N + 1):
            c = ws.cell(row=rr, column=C0 + i - 1, value=render(tpl, i))
            c.number_format = fmt
            c.font = fuente(9, total, TINTA)
            c.border = B_TOTAL if total else B_FILA
        if ctrl:
            L.control(f"Motor mensual: {et}", H_MEN, f"=SUMPRODUCT(ABS({q(H_MEN)}!{mc(1)}{rr}:{mc(N)}{rr}))")
        if fmt == FMT_ENTERO and uni != "$":  # unidades físicas (kits, vehículos, dúos, talleres, personas)
            L.entero(f"Motor mensual: {et}", H_MEN, f"{mc(1)}{rr}:{mc(N)}{rr}")
    # encabezados de calendario destacados
    for k in ("mes", "anio", "fecha"):
        for i in range(1, N + 1):
            c = ws.cell(row=filas[k], column=C0 + i - 1)
            c.font = fuente(9, True, "FFFFFFFF" if k == "mes" else TINTA)
            if k == "mes":
                c.fill = F_ENC
            c.alignment = CEN
    for k in ("pos", "mc", "ac", "kk", "first", "tsen", "gen", "efe", "red_ent"):
        ws.row_dimensions[filas[k]].outlineLevel = 1
    ws.freeze_panes = ws[f"D{filas['fecha'] + 1}"]
    del L.nombres["NPos"]
    L.nombres["NPos"] = f"COLUMNS({q(H_MEN)}!$D${filas['mes']}:$BW${filas['mes']})"
    # renombra la fila de posición para COLUMN(): usa $C$1 como origen (columna C)
    ws.print_title_cols = "A:B"
    ws.print_title_rows = f"{filas['mes']}:{filas['fecha']}"



def hoja_anual(L):
    ws = L.ws[H_ANU]
    hoja_base(ws, 90, visible=False)
    titular(ws, "ANUAL (CÁLCULO)",
            "Las mismas filas del motor mensual, una columna por año: suma del año (flujos) o saldo al cierre (personas, dúos, talleres, saldos).", 9)
    ws.column_dimensions["A"].width = 66
    ws.column_dimensions["B"].width = 10
    for k in range(3, 9):
        ws.column_dimensions[col(k)].width = 15
    ws.column_dimensions["I"].width = 14
    fm = L.filas_men
    r = 5
    encabezado(ws, r, ["Concepto", "Unidad"] + [""] * 6 + ["Suma o cierre"])
    for y in range(6):
        c = ws.cell(row=r, column=3 + y, value="=COLUMN()-COLUMN($C$5)")
        c.number_format = '"Año "0'
    r = 6
    for y in range(6):
        celda(ws, f"{col(3 + y)}{r}", f"=Anio0+{col(3 + y)}5", "0", tam=9, color=GRIS, alin=CEN)
    filas = {}
    r = 7
    anio_rng = f"{q(H_MEN)}!$D${fm['anio']}:$BW${fm['anio']}"
    for e in MENSUAL:
        if e[0] == "#":
            r += 1
            bloque(ws, r, e[1], 9)
            r += 1
            continue
        k, et, uni, tpl, fmt, kind = e
        if kind == "none":
            continue
        filas[k] = r
        total = k in ("neto", "cv", "nomina", "fijos", "inv_mes", "ebitda", "red_ing", "cobrado", "saldo_ct", "tec", "dot", "inst", "duos")
        celda(ws, f"A{r}", et, negrita=total, borde=B_FILA)
        celda(ws, f"B{r}", uni, color=GRIS, tam=9, borde=B_FILA)
        rng = f"{q(H_MEN)}!$D${fm[k]}:$BW${fm[k]}"
        for y in range(6):
            cc = col(3 + y)
            if kind == "sum":
                f = f"=SUMIF({anio_rng},{cc}$5,{rng})"
            else:
                f = f"=INDEX({rng},12*{cc}$5+12)"
            celda(ws, f"{cc}{r}", f, fmt, negrita=total, borde=B_TOTAL if total else B_FILA)
        celda(ws, f"I{r}", "suma" if kind == "sum" else "cierre", color=GRIS, tam=9, alin=CEN, borde=B_FILA)
        if fmt == FMT_ENTERO and uni != "$":
            L.entero(f"Anual: {et}", H_ANU, f"C{r}:H{r}")
        r += 1
    # filas derivadas
    r += 1
    bloque(ws, r, "INDICADORES FÍSICOS DERIVADOS", 9)
    r += 1
    filas["util_a"] = r
    celda(ws, f"A{r}", "Utilización de la capacidad nominal (instalaciones / capacidad del año)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"=IF({cc}{filas['capm']}=0,0,{cc}{filas['inst']}/{cc}{filas['capm']})", FMT_PCT, borde=B_FILA)
    r += 1
    filas["util80_a"] = r
    celda(ws, f"A{r}", "Utilización de la capacidad planificada al 80% (instalaciones / capacidad al 80%)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"=IF({cc}{filas['cap80']}=0,0,{cc}{filas['inst']}/{cc}{filas['cap80']})", FMT_PCT, borde=B_FILA)
    r += 1
    filas["dif80"] = r
    celda(ws, f"A{r}", "Capacidad sobre la regla del 80% por dúos enteros (capacidad − instalaciones / 80%)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"={cc}{filas['capm']}-{cc}{filas['inst']}/Util", FMT_ENTERO, borde=B_FILA)
    L.filas_anu = filas
    ws.freeze_panes = "C7"


