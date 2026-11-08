# Modelo espejo (Python puro) del Plan Financiero v4 de Lumine Motors.
# Replica mes a mes las reglas del Excel, sin openpyxl ni LibreOffice, para verificar lo que calcula el libro:
# el 08-11-2026 coincidió al peso en el caso base y en los 34 casos de sensibilidad (python espejo.py).
import math, copy
from datetime import date

def rnd(x):  # REDONDEAR de Excel (mitad hacia arriba, positivo y negativo)
    return math.floor(x + 0.5) if x >= 0 else -math.floor(-x + 0.5)

def ceil(x):
    return math.ceil(x - 1e-12) if x > 0 else 0

BASE = dict(
    anio0=2027, mes_tram=-12, mes_pe=-9, mes_pe_fin=-4, mes_pre=-3,
    dolar=981.58, fwd_dif=0.0035, fwd_plazo=2, eur=1098.15, aud=679.49, uf=41295.46,
    infl={0: 0.028, 1: 0.03, 2: 0.03, 3: 0.03, 4: 0.03, 5: 0.03}, infl_lp=0.03,
    tax={0: 0.125, 1: 0.15, 2: 0.23, 3: 0.23, 4: 0.23, 5: 0.23},
    rf=0.0269, spread=0.0072, prm=0.0533, beta_u=1.02, t_lp=0.23, pct_e=0.60, kd_nom=0.084, plazo_deuda=5, primas=0.0,
    pe_iva=4290000, pp_iva=4990000, iva=0.19, mix=0.60, desc=0.10, mod1=18, mod2=12,
    com_inst=15000, com_tope=1000000, sello=5000, ref_pct=0.15, ref_monto=50000, gar_pct=0.03,
    segmento=162891, techo=1.0, p=0.0026, q=0.52, cob1=0.60, cob2=0.80,
    cap_a=15.75, mes_cambio=4, cap_b=15.0, util=0.80, max_duos=6, tec_duo=2, ant_tec=2, ant_rt=3, ant_eq=3, ant_arr=2,
    mes_eq_t1=-9,  # equipamiento del taller 1 y primer puesto: inicio del Proyecto Experimental
    red_nuevos={1: 0, 2: 0, 3: 3, 4: 5, 5: 8}, red_fact=1.0, red_derecho=3000000, red_form=1500000, red_tec=2,
    red_arancel=0, red_modelos=5, red_cuota=250000, red_hab=45000, red_curso=750000, red_audit=600000, red_com=0.05,
    pie=0.30, pct_cred=0.30, com_mp=0.02, plazo=24, tasa_nom=0.015, tasa_real=True, bono=0.05, incob=0.03, eval_cred=5000,
    prov_ant=0.30, prov_desde=4, holgura=0.0,
    r_gg=1900000, r_rt=1700000, r_ing=1500000, r_adm=900000, r_com=850000, r_aspost=692000, r_comemp=850000,
    r_plat_hon=450000, r_plat_full=900000, r_sop=900000, r_asadm=692000,
    r_n=[700000, 770000, 840000, 900000], meses_n=[2, 3, 3], bonos=[140000, 140000, 170000], senior_extra=3,
    com_por_inst=600, aspost_umbral=1000, aspost_paso=1500, comemp_umbral=5, plat_umbral=10, sop_paso=15,
    asadm_umbral=25, ing_seg_anio=4,
    factores=[(date(2027, 1, 1), 1.0938), (date(2027, 8, 1), 1.1013), (date(2028, 8, 1), 1.1088),
              (date(2029, 8, 1), 1.1193), (date(2030, 8, 1), 1.1298)],
    dino_aud=30000, dino_flete=0.10, escaner=1429000, bodega=4000000, mobiliario=4000000, habilitacion=15000000,
    elevador=2150000, herramientas=1200000, gar_meses=1, constitucion=0, arriendo=3600000, arr_t1=-9,
    pe_kits=6, pe_notaria=30000, pe_seguro=0, sw_h=[900, 350, 800], sw_tarifa=13000, sw_ini=-9, sw_fin=-1,
    sw_mant=0.15, sw_host=45, sw_resto=0,
    id_p1=30000000, id_p2=50000000, corfo=False, corfo_pct=0.80, corfo_tope=180000000, cred_id=0.35,
    vida=dict(dino=15, elev=15, esc=6, herr=3, bod=10, hab=10, mob=6, intang=5),
    servicios=700000, seguros=600000, mant_pct=0.03, curso_tec=750000,
    mk_lanz={1: 3000000, 2: 0, 3: 0, 4: 0, 5: 0}, mk_pauta={1: 14400000, 2: 18000000, 3: 24000000, 4: 24000000, 5: 30000000},
    mk_casos={1: 2400000, 2: 4800000, 3: 4800000, 4: 4800000, 5: 4800000},
    mk_mat={1: 3000000, 2: 2000000, 3: 3500000, 4: 2000000, 5: 3500000}, mk_conv={1: 0, 2: 0, 3: 4000000, 4: 4000000, 5: 4000000},
    mk_red={1: 0, 2: 0, 3: 10000000, 4: 5000000, 5: 5000000},
    pauta_pct=0.5, pauta_meses=3, casos_ini=4, casos_fin=6, lanz_meses=3,
    # costo del kit
    k_e_f3=2991086, k_p_f3=3350171, k_dolar_f3=965.71, k_coef_e=25168, k_coef_p=28886, k_pct_usd=0.82,
    k_usd_e=2314.15, k_usd_p=2605.77, k_eur=171.9, k_clp=188748, peso_real=0.5,
    atraso=0, fact_dem=1.0, fact_pre=1.0, fact_cv=1.0,
)

def kit_costs(P):
    fwd = 1 + P['k_pct_usd'] * P['fwd_dif'] * P['fwd_plazo'] / 12
    re = (P['k_e_f3'] + (P['dolar'] - P['k_dolar_f3']) / 10 * P['k_coef_e']) * fwd
    rp = (P['k_p_f3'] + (P['dolar'] - P['k_dolar_f3']) / 10 * P['k_coef_p']) * fwd
    fusd = 1 + P['fwd_dif'] * P['fwd_plazo'] / 12
    me = P['k_usd_e'] * P['dolar'] * fusd + P['k_eur'] * P['eur'] + P['k_clp']
    mp = P['k_usd_p'] * P['dolar'] * fusd + P['k_eur'] * P['eur'] + P['k_clp']
    w = P['peso_real']
    ke = (w * re + (1 - w) * me) * P['fact_cv']
    kp = (w * rp + (1 - w) * mp) * P['fact_cv']
    return dict(re=re, rp=rp, me=me, mp=mp, ke=ke, kp=kp, kp_real=rp * P['fact_cv'])

def factor_ce(P, d):
    f = None
    for desde, v in P['factores']:
        if d >= desde: f = v
    return f

def run(P):
    N = 72
    pos = list(range(1, N + 1))
    mes = [p - 13 if p <= 12 else p - 12 for p in pos]
    anio = [0 if m < 0 else ceil(m / 12) for m in mes]
    fecha = [date(P['anio0'] + (p - 1) // 12, (p - 1) % 12 + 1, 1) for p in pos]
    at = P['atraso']
    mc = [m - at if m >= 1 + at else 0 for m in mes]
    ac = [ceil(x / 12) if x > 0 else 0 for x in mc]
    kk = [x - 12 * (a - 1) if x > 0 else 0 for x, a in zip(mc, ac)]
    p_, q_ = P['p'], P['q']
    def F(t):
        if t <= 0: return 0.0
        e = math.exp(-(p_ + q_) * t)
        return (1 - e) / (1 + (q_ / p_) * e)
    m_techo = P['segmento'] * P['techo'] * P['fact_dem']
    Fv = [F(x / 12) if x > 0 else 0.0 for x in mc]
    dem = [m_techo * (Fv[i] - (Fv[i - 1] if i > 0 else 0)) for i in range(N)]
    cob = [0 if a == 0 else (P['cob1'] if a == 1 else P['cob2']) for a in ac]
    dem_at = [d * c for d, c in zip(dem, cob)]
    cap = [0 if m < 1 else (P['cap_a'] if m <= P['mes_cambio'] else P['cap_b']) for m in mes]
    nec = [0 if dem_at[i] == 0 else ceil(dem_at[i] / (cap[i] * P['util'])) for i in range(N)]
    duos = []
    for i in range(N):
        duos.append(max(duos[-1] if i else 0, nec[i]))
    talleres = [ceil(d / P['max_duos']) if d > 0 else 0 for d in duos]
    capm = [duos[i] * cap[i] for i in range(N)]
    inst = [rnd(min(dem_at[i], capm[i])) for i in range(N)]
    ie = [rnd(x * (1 - P['mix'])) for x in inst]
    ip = [inst[i] - ie[i] for i in range(N)]
    parque = []
    for i in range(N): parque.append((parque[-1] if i else 0) + inst[i])
    prim = []
    for i in range(N):
        if ac[i] == 0: prim.append(0); continue
        n = P['mod1'] if ac[i] == 1 else P['mod2']
        prim.append(min(inst[i], rnd(n * kk[i] / 12) - rnd(n * (kk[i] - 1) / 12)))
    K = kit_costs(P)
    pe_ = P['pe_iva'] / (1 + P['iva']) * P['fact_pre']
    pp_ = P['pp_iva'] / (1 + P['iva']) * P['fact_pre']
    bruto = [ie[i] * pe_ + ip[i] * pp_ for i in range(N)]
    descu = [0 if inst[i] == 0 else prim[i] * P['desc'] * bruto[i] / inst[i] for i in range(N)]
    cred_u = [rnd(x * P['pct_cred']) for x in inst]
    bono = [0 if inst[i] == 0 else (bruto[i] - descu[i]) * cred_u[i] / inst[i] * P['bono'] for i in range(N)]
    neto = [bruto[i] - descu[i] - bono[i] for i in range(N)]
    v_cred = [0 if inst[i] == 0 else (bruto[i] - descu[i]) * cred_u[i] / inst[i] - bono[i] for i in range(N)]
    v_cont = [neto[i] - v_cred[i] for i in range(N)]
    abono = [P['pie'] * (neto[i + 1] if i + 1 < N else 0) for i in range(N)]
    saldo_cont = [(1 - P['pie']) * v_cont[i] for i in range(N)]
    coloc = [(1 - P['pie']) * v_cred[i] for i in range(N)]
    r = P['tasa_nom']
    if P['tasa_real']:
        r = (1 + P['tasa_nom']) / (1 + P['infl_lp']) ** (1 / 12) - 1
    n = P['plazo']
    pmt = r / (1 - (1 + r) ** -n)
    cuota, inter, capi, saldo_b = [], [], [], []
    for i in range(N):
        vig = sum(coloc[j] for j in range(max(0, i - n), i))
        c = pmt * vig
        it = r * (saldo_b[-1] if i else 0)
        cuota.append(c); inter.append(it); capi.append(c - it)
        saldo_b.append((saldo_b[-1] if i else 0) - (c - it) + coloc[i])
    cap_cob = [(1 - P['incob']) * x for x in capi]
    int_cob = [(1 - P['incob']) * x for x in inter]
    prov = [P['incob'] * x for x in coloc]
    cxc = [(1 - P['incob']) * x for x in saldo_b]
    com_mp = [P['com_mp'] * x for x in v_cont]
    cobrado = [abono[i] + saldo_cont[i] + cap_cob[i] + int_cob[i] for i in range(N)]
    kitc = [ie[i] * K['ke'] + ip[i] * K['kp'] for i in range(N)]
    gar = [P['gar_pct'] * x for x in kitc]
    fac = [factor_ce(P, d) for d in fecha]
    # personal (se necesita para comisiones)
    gg = [1 if m >= 1 else 0 for m in mes]
    def at_pos(arr, j):  # INDEX(arr, MIN(j, N)) con j base 1
        return arr[min(j, N) - 1]
    rt = [max(1 if mes[i] >= P['mes_pe'] else 0, at_pos(talleres, pos[i] + P['ant_rt'])) for i in range(N)]
    ing = [0 if mes[i] < P['mes_pe'] else (2 if anio[i] >= P['ing_seg_anio'] else 1) for i in range(N)]
    adm = [1 if m >= P['mes_pre'] else 0 for m in mes]
    inst_ac = {}
    for i in range(N): inst_ac[ac[i]] = inst_ac.get(ac[i], 0) + inst[i]
    com = [0 if mc[i] < 1 else 1 + math.floor(inst_ac[ac[i]] / P['com_por_inst']) for i in range(N)]
    aspost = [0 if parque[i] <= P['aspost_umbral'] else 1 + math.floor((parque[i] - P['aspost_umbral']) / P['aspost_paso']) for i in range(N)]
    # red
    red_n = [0] * N; red_act = []
    for i in range(N):
        if ac[i] == 0: red_n[i] = 0
        else:
            nn = rnd(P['red_nuevos'].get(ac[i], 0) * P['red_fact'])
            def ent(k):
                if nn == 0 or k <= 0: return 0
                X = 1 + (k - 0.5) * nn / 12
                return min(nn, max(0, math.ceil(round(X, 9)) - 1))
            red_n[i] = ent(kk[i]) - ent(kk[i] - 1)
        red_act.append((red_act[-1] if i else 0) + red_n[i])
    comemp = [1 if x >= P['comemp_umbral'] else 0 for x in red_act]
    plat_h = [1 if (x >= 1 and x < P['plat_umbral']) else 0 for x in red_act]
    plat_f = [1 if x >= P['plat_umbral'] else 0 for x in red_act]
    sop = [ceil(x / P['sop_paso']) if x > 0 else 0 for x in red_act]
    hires = [P['tec_duo'] * (at_pos(duos, pos[i] + P['ant_tec']) - at_pos(duos, pos[i] + P['ant_tec'] - 1)) for i in range(N)]
    m1, m2, m3 = P['meses_n']
    def win(lo, hi, i):  # suma de hires con pos en (pos_i - lo, pos_i - hi]
        return sum(hires[j] for j in range(N) if pos[i] - lo < pos[j] <= pos[i] - hi)
    n1 = [win(m1, 0, i) for i in range(N)]
    n2 = [win(m1 + m2, m1, i) for i in range(N)]
    n3 = [win(m1 + m2 + m3, m1 + m2, i) for i in range(N)]
    n4 = [sum(hires[j] for j in range(N) if pos[j] <= pos[i] - m1 - m2 - m3) for i in range(N)]
    first = 0; tpos = []
    for i in range(N):
        if first == 0 and hires[i] > 0: first = pos[i]
        tpos.append(-1 if first == 0 else pos[i] - first)
    def lvl(t):
        if t < 0: return 0
        if t < m1: return 1
        if t < m1 + m2: return 2
        if t < m1 + m2 + m3: return 3
        return 4
    g = [lvl(t) for t in tpos]; e = [lvl(t + P['senior_extra']) if t >= 0 else 0 for t in tpos]
    N1 = [n1[i] - (g[i] == 1) + (e[i] == 1) for i in range(N)]
    N2 = [n2[i] - (g[i] == 2) + (e[i] == 2) for i in range(N)]
    N3 = [n3[i] - (g[i] == 3) + (e[i] == 3) for i in range(N)]
    N4 = [n4[i] - (g[i] == 4) + (e[i] == 4) for i in range(N)]
    tec = [N1[i] + N2[i] + N3[i] + N4[i] for i in range(N)]
    base_dot = [gg[i] + rt[i] + ing[i] + adm[i] + com[i] + aspost[i] + comemp[i] + plat_h[i] + plat_f[i] + sop[i] + tec[i] for i in range(N)]
    asadm = [1 if x > P['asadm_umbral'] else 0 for x in base_dot]
    dot = [base_dot[i] + asadm[i] for i in range(N)]
    c_gg = [gg[i] * P['r_gg'] * fac[i] for i in range(N)]
    c_rt = [rt[i] * P['r_rt'] * fac[i] for i in range(N)]
    c_ing = [ing[i] * P['r_ing'] * fac[i] for i in range(N)]
    c_adm = [adm[i] * P['r_adm'] * fac[i] for i in range(N)]
    c_com = [com[i] * P['r_com'] * fac[i] for i in range(N)]
    c_aspost = [aspost[i] * P['r_aspost'] * fac[i] for i in range(N)]
    c_asadm = [asadm[i] * P['r_asadm'] * fac[i] for i in range(N)]
    c_comemp = [comemp[i] * P['r_comemp'] * fac[i] for i in range(N)]
    c_plat = [plat_h[i] * P['r_plat_hon'] + plat_f[i] * P['r_plat_full'] * fac[i] for i in range(N)]
    c_sop = [sop[i] * P['r_sop'] * fac[i] for i in range(N)]
    rn = P['r_n']
    c_tec = [(N1[i] * rn[0] + N2[i] * rn[1] + N3[i] * rn[2] + N4[i] * rn[3]) * fac[i] for i in range(N)]
    def hires_at(j):
        return hires[j - 1] if 1 <= j <= N else 0
    c_bonos = [(P['bonos'][0] * hires_at(pos[i] - m1) + P['bonos'][1] * hires_at(pos[i] - m1 - m2)
                + P['bonos'][2] * hires_at(pos[i] - m1 - m2 - m3)) * fac[i] for i in range(N)]
    nom_op = [c_rt[i] + c_ing[i] + c_aspost[i] + c_tec[i] + c_bonos[i] for i in range(N)]
    nom_adm = [c_gg[i] + c_adm[i] + c_asadm[i] for i in range(N)]
    nom_ven = c_com
    nom_red = [c_comemp[i] + c_plat[i] + c_sop[i] for i in range(N)]
    nomina = [nom_op[i] + nom_adm[i] + nom_ven[i] + nom_red[i] for i in range(N)]
    comis = [min(inst[i] * P['com_inst'], com[i] * P['com_tope']) * fac[i] for i in range(N)]
    sello = [P['sello'] * x for x in inst]
    refe = [rnd(P['ref_pct'] * x) * P['ref_monto'] for x in inst]
    evalc = [P['eval_cred'] * x for x in cred_u]
    cv = [kitc[i] + gar[i] + comis[i] + sello[i] + refe[i] + evalc[i] + prov[i] + com_mp[i] for i in range(N)]
    # pedidos
    def mc_at(j): return mc[j - 1] if 1 <= j <= N else 0
    def inst_at(j): return inst[j - 1] if 1 <= j <= N else 0
    def kit_at(j): return kitc[j - 1] if 1 <= j <= N else 0
    ped_u, ped_v = [], []
    for i in range(N):
        j = pos[i] + 2
        if mc_at(j) == 1: ped_u.append(inst_at(j) + inst_at(j + 1)); ped_v.append(kit_at(j) + kit_at(j + 1))
        elif mc_at(j) >= 3: ped_u.append(inst_at(j)); ped_v.append(kit_at(j))
        else: ped_u.append(0); ped_v.append(0)
    nro = []; cnt = 0
    for i in range(N):
        if ped_u[i] > 0: cnt += 1; nro.append(cnt)
        else: nro.append(0)
    pago30 = [P['prov_ant'] * x for x in ped_v]
    pago70 = []
    for i in range(N):
        a = ped_v[i - 1] if (i >= 1 and 0 < nro[i - 1] < P['prov_desde']) else 0
        b = ped_v[i - 2] if (i >= 2 and nro[i - 2] >= P['prov_desde']) else 0
        pago70.append((1 - P['prov_ant']) * (a + b))
    pagoprov = [pago30[i] + pago70[i] for i in range(N)]
    ped_acum = [];
    for i in range(N): ped_acum.append((ped_acum[-1] if i else 0) + ped_u[i])
    transito = [inst_at(pos[i] + 1) + inst_at(pos[i] + 2) + (inst_at(pos[i] + 3) if mc_at(pos[i] + 2) == 1 else 0) for i in range(N)]
    ctrl_ped = [ped_acum[i] - parque[i] - transito[i] for i in range(N)]
    kits_pag = []
    for i in range(N): kits_pag.append((kits_pag[-1] if i else 0) + pagoprov[i] - kitc[i])
    # red ingresos y costos
    red_paq = [red_n[i] * (P['red_derecho'] + P['red_form'] * P['red_tec']) for i in range(N)]
    red_cuota = [red_act[i] * P['red_cuota'] for i in range(N)]
    red_habi = [red_act[i] * P['red_hab'] * P['red_tec'] for i in range(N)]
    red_aran = [red_n[i] * P['red_modelos'] * P['red_arancel'] for i in range(N)]
    red_ing = [red_paq[i] + red_cuota[i] + red_habi[i] + red_aran[i] for i in range(N)]
    mk_red = [0 if ac[i] == 0 else P['mk_red'].get(ac[i], 0) / 12 for i in range(N)]
    red_cdir = [red_n[i] * P['red_tec'] * P['red_curso'] + red_act[i] * P['red_audit'] / 12
                + P['red_com'] * red_paq[i] * fac[i] + red_aran[i] for i in range(N)]
    # gastos fijos
    locales = [max(1 if mes[i] >= P['arr_t1'] else 0, at_pos(talleres, pos[i] + P['ant_arr'])) for i in range(N)]
    arr = [locales[i] * P['arriendo'] for i in range(N)]
    serv = [locales[i] * P['servicios'] for i in range(N)]
    seg = [locales[i] * P['seguros'] for i in range(N)]
    cursos = [P['curso_tec'] * x for x in hires]
    sw_dev = sum(P['sw_h']) * P['sw_tarifa']
    soft = [0 if mes[i] < 1 else P['sw_mant'] * sw_dev / 12 + P['sw_host'] * P['dolar'] + P['sw_resto'] for i in range(N)]
    lanz, pauta, casos, mat, conv = [], [], [], [], []
    for i in range(N):
        a, k = ac[i], kk[i]
        if a == 0:
            lanz.append(0); pauta.append(0); casos.append(0); mat.append(0); conv.append(0); continue
        lanz.append(P['mk_lanz'][a] / P['lanz_meses'] if (a == 1 and k <= P['lanz_meses']) else 0)
        if a == 1:
            pauta.append(P['mk_pauta'][1] * P['pauta_pct'] / P['pauta_meses'] if k <= P['pauta_meses']
                         else P['mk_pauta'][1] * (1 - P['pauta_pct']) / (12 - P['pauta_meses']))
            nci = P['casos_fin'] - P['casos_ini'] + 1
            casos.append(P['mk_casos'][1] / nci if P['casos_ini'] <= k <= P['casos_fin'] else 0)
        else:
            pauta.append(P['mk_pauta'][a] / 12); casos.append(P['mk_casos'][a] / 12)
        mat.append(P['mk_mat'][a] / 12); conv.append(P['mk_conv'][a] / 12)
    # inversion
    t_eq = [max(1 if mes[i] >= P['mes_eq_t1'] else 0, at_pos(talleres, pos[i] + P['ant_eq'])) for i in range(N)]
    t_eq_n = [t_eq[i] - (t_eq[i - 1] if i else 0) for i in range(N)]
    d_eq = [max(1 if mes[i] >= P['mes_eq_t1'] else 0, duos[i]) for i in range(N)]
    d_eq_n = [d_eq[i] - (d_eq[i - 1] if i else 0) for i in range(N)]
    dino = P['dino_aud'] * P['aud'] * (1 + P['dino_flete'])
    eq_taller = dino + P['escaner'] + P['bodega'] + P['mobiliario'] + P['habilitacion']
    eq_duo = P['elevador'] + P['herramientas']
    inv_t = [t_eq_n[i] * eq_taller for i in range(N)]
    inv_d = [d_eq_n[i] * eq_duo for i in range(N)]
    vh = P['vida']['herr'] * 12
    repo = [(d_eq_n[i - vh] if i - vh >= 0 else 0) * P['herramientas'] for i in range(N)]
    pe_kits = [P['pe_kits'] * K['kp_real'] if mes[i] == P['mes_pe'] else 0 for i in range(N)]
    pe_otros = [P['pe_notaria'] + P['pe_seguro'] if mes[i] == P['mes_tram'] else 0 for i in range(N)]
    nsw = sum(1 for m in mes if P['sw_ini'] <= m <= P['sw_fin'])
    sw = [sw_dev / nsw if P['sw_ini'] <= mes[i] <= P['sw_fin'] else 0 for i in range(N)]
    id_anio = {0: 0, 1: P['id_p1'] / 2, 2: P['id_p1'] / 2, 3: P['id_p2'] / 2, 4: P['id_p2'] / 2, 5: 0}
    idm = [id_anio[anio[i]] / 12 if mes[i] >= 1 else 0 for i in range(N)]
    garr = [(locales[i] - (locales[i - 1] if i else 0)) * P['gar_meses'] * P['arriendo'] for i in range(N)]
    const = [P['constitucion'] if i == 0 else 0 for i in range(N)]
    preop_nom = [nomina[i] if mes[i] < 1 else 0 for i in range(N)]
    preop_loc = [arr[i] + serv[i] + seg[i] if mes[i] < 1 else 0 for i in range(N)]
    preop_cur = [cursos[i] if mes[i] < 1 else 0 for i in range(N)]
    eq_acum = []
    for i in range(N): eq_acum.append((eq_acum[-1] if i else 0) + inv_t[i] + inv_d[i] + repo[i])
    mant = [P['mant_pct'] / 12 * eq_acum[i - 1] if (mes[i] >= 1 and i > 0) else 0 for i in range(N)]
    fijos = [arr[i] + serv[i] + seg[i] + mant[i] + cursos[i] + soft[i] + lanz[i] + pauta[i] + casos[i] + mat[i] + conv[i] for i in range(N)]
    # resultado
    ingresos = [neto[i] + int_cob[i] + red_ing[i] for i in range(N)]
    ebitda = [ingresos[i] - cv[i] - (nomina[i] + fijos[i] + red_cdir[i] + mk_red[i]) if mes[i] >= 1 else 0 for i in range(N)]
    pagos_cv = [gar[i] + comis[i] + sello[i] + refe[i] + evalc[i] + com_mp[i] for i in range(N)]
    fco = [cobrado[i] + red_ing[i] - pagoprov[i] - pagos_cv[i]
           - ((nomina[i] + fijos[i] + red_cdir[i] + mk_red[i]) if mes[i] >= 1 else 0) for i in range(N)]
    acum = []
    for i in range(N): acum.append((acum[-1] if i else 0) + fco[i])
    ebitda_ac = []
    for i in range(N): ebitda_ac.append((ebitda_ac[-1] if i else 0) + ebitda[i])
    saldo_ct = [kits_pag[i] + cxc[i] - abono[i] for i in range(N)]
    ctrl_caja = [acum[i] - (ebitda_ac[i] - kits_pag[i] - cxc[i] + abono[i]) for i in range(N)]
    M = dict(pos=pos, mes=mes, anio=anio, mc=mc, ac=ac, dem=dem, dem_at=dem_at, cap=cap, nec=nec, duos=duos, talleres=talleres,
             capm=capm, inst=inst, ie=ie, ip=ip, parque=parque, prim=prim, bruto=bruto, descu=descu, cred_u=cred_u, bono=bono,
             neto=neto, v_cred=v_cred, v_cont=v_cont, abono=abono, coloc=coloc, cuota=cuota, inter=inter, capi=capi,
             saldo_b=saldo_b, cap_cob=cap_cob, int_cob=int_cob, prov=prov, cxc=cxc, com_mp=com_mp, cobrado=cobrado,
             kitc=kitc, gar=gar, comis=comis, sello=sello, refe=refe, evalc=evalc, cv=cv, ped_u=ped_u, ped_v=ped_v, nro=nro,
             pagoprov=pagoprov, transito=transito, ctrl_ped=ctrl_ped, kits_pag=kits_pag, fac=fac, gg=gg, rt=rt, ing=ing,
             adm=adm, com=com, aspost=aspost, comemp=comemp, plat_h=plat_h, plat_f=plat_f, sop=sop, hires=hires,
             N1=N1, N2=N2, N3=N3, N4=N4, tec=tec, asadm=asadm, dot=dot, nom_op=nom_op, nom_adm=nom_adm, nom_ven=nom_ven,
             nom_red=nom_red, nomina=nomina, c_tec=c_tec, c_bonos=c_bonos, red_n=red_n, red_act=red_act, red_paq=red_paq,
             red_cuota=red_cuota, red_habi=red_habi, red_aran=red_aran, red_ing=red_ing, red_cdir=red_cdir, mk_red=mk_red,
             locales=locales, arr=arr, serv=serv, seg=seg, mant=mant, cursos=cursos, soft=soft, lanz=lanz, pauta=pauta,
             casos=casos, mat=mat, conv=conv, fijos=fijos, t_eq_n=t_eq_n, d_eq_n=d_eq_n, inv_t=inv_t, inv_d=inv_d, repo=repo,
             pe_kits=pe_kits, pe_otros=pe_otros, sw=sw, idm=idm, garr=garr, const=const, preop_nom=preop_nom,
             preop_loc=preop_loc, preop_cur=preop_cur, eq_acum=eq_acum, ingresos=ingresos, ebitda=ebitda, fco=fco, acum=acum,
             saldo_ct=saldo_ct, ctrl_caja=ctrl_caja)
    M['_K'] = K; M['_r'] = r; M['_eq_taller'] = eq_taller; M['_eq_duo'] = eq_duo; M['_dino'] = dino; M['_swdev'] = sw_dev
    return M

def anual(M, key, kind='sum'):
    out = []
    for y in range(6):
        idx = [i for i in range(72) if M['anio'][i] == y]
        out.append(sum(M[key][i] for i in idx) if kind == 'sum' else M[key][idx[-1]])
    return out

def evaluar(P, M=None, detalle=False):
    if M is None: M = run(P)
    A = lambda k, kind='sum': anual(M, k, kind)
    idx = [1.0]
    for y in range(1, 6): idx.append(idx[-1] * (1 + P['infl'][y]))
    rf_l = P['rf'] - P['spread']
    ku = rf_l + P['beta_u'] * P['prm'] + P['primas']
    de = (1 - P['pct_e']) / P['pct_e']
    beta_l = P['beta_u'] * (1 + (1 - P['t_lp']) * de)
    ke = rf_l + beta_l * P['prm'] + P['primas']
    kd_real = (1 + P['kd_nom']) / (1 + P['infl_lp']) - 1
    wacc = P['pct_e'] * ke + (1 - P['pct_e']) * kd_real * (1 - P['t_lp'])
    # inversion por clase y año
    t_eq_n, d_eq_n = A('t_eq_n'), A('d_eq_n')
    sub = 1 - (min(P['corfo_pct'], 1) if P['corfo'] else 0)
    cls = {
        'dino': ([t_eq_n[y] * M['_dino'] for y in range(6)], P['vida']['dino']),
        'esc': ([t_eq_n[y] * P['escaner'] for y in range(6)], P['vida']['esc']),
        'bod': ([t_eq_n[y] * P['bodega'] for y in range(6)], P['vida']['bod']),
        'hab': ([t_eq_n[y] * P['habilitacion'] for y in range(6)], P['vida']['hab']),
        'mob': ([t_eq_n[y] * P['mobiliario'] for y in range(6)], P['vida']['mob']),
        'elev': ([d_eq_n[y] * P['elevador'] for y in range(6)], P['vida']['elev']),
        'herr': ([d_eq_n[y] * P['herramientas'] + A('repo')[y] for y in range(6)], P['vida']['herr']),
        'pe': ([A('pe_kits')[y] + A('pe_otros')[y] for y in range(6)], P['vida']['intang']),
        'sw': (A('sw'), P['vida']['intang']),
        'preop': ([A('preop_nom')[y] + A('preop_loc')[y] + A('preop_cur')[y] for y in range(6)], P['vida']['intang']),
        'const': (A('const'), P['vida']['intang']),
        'id': ([A('idm')[y] * sub for y in range(6)], P['vida']['intang']),
    }
    garr = A('garr')
    dep = [0.0] * 6; amort = [0.0] * 6; vl = 0.0
    for c, (cost, L) in cls.items():
        for t in range(6):
            s = sum(cost[k] * idx[k] / L for k in range(6) if k < t and t - k <= L) / idx[t]
            if c in ('pe', 'sw', 'preop', 'const', 'id'): amort[t] += s
            else: dep[t] += s
        vl += sum(cost[k] * idx[k] * max(0, 1 - min(5 - k, L) / L) for k in range(6)) / idx[5]
    inv_anio = [sum(cls[c][0][y] for c in cls) + garr[y] for y in range(6)]
    # capital de trabajo
    saldo = A('saldo_ct', 'end')
    deficit = -min(0, min(M['acum'][i] for i in range(24)))
    req = [0] + [max(deficit, saldo[1]) * (1 + P['holgura'])] + [saldo[y] * (1 + P['holgura']) for y in range(2, 6)]
    ct_inv = [req[y + 1] - req[y] for y in range(5)] + [0]
    ct_rec = req[5]
    # capitalizacion año 0
    inv_mes = [M['inv_t'][i] + M['inv_d'][i] + M['repo'][i] + M['pe_kits'][i] + M['pe_otros'][i] + M['sw'][i]
               + M['idm'][i] * sub + M['garr'][i] + M['const'][i] + M['preop_nom'][i] + M['preop_loc'][i] + M['preop_cur'][i]
               for i in range(72)]
    inv0_cap = sum(inv_mes[i] * (1 + ku) ** (-M['mes'][i] / 12) for i in range(12))
    inv0_nom = sum(inv_mes[i] for i in range(12))
    ing = A('ingresos'); cv = A('cv'); ebitda = A('ebitda')
    ebit = [ebitda[t] - dep[t] - amort[t] for t in range(6)]
    perd = 0.0; imp = [0.0] * 6; credid_av = 0.0
    cred_id_y = [P['cred_id'] * cls['id'][0][y] if P['corfo'] else 0 for y in range(6)]
    for t in range(6):
        base = ebit[t] - perd
        perd = max(0, -base)
        i0 = max(0, base) * P['tax'][t]
        credid_av += cred_id_y[t]
        usado = min(i0, credid_av); credid_av -= usado
        imp[t] = i0 - usado
    vd = vl + ct_rec + sum(garr[k] * idx[k] for k in range(6)) / idx[5]
    flujo = []
    for t in range(6):
        f = ebit[t] - imp[t] + dep[t] + amort[t]
        f -= inv0_cap if t == 0 else (inv_anio[t])
        f -= (req[1] if t == 0 else ct_inv[t])
        if t == 5: f += vd
        flujo.append(f)
    # el año 0 ya incluye req[1]; ct_inv[0] corresponde a req1 - req0 = req1
    def npv(rate, fl): return sum(fl[t] / (1 + rate) ** t for t in range(len(fl)))
    def irr(fl):
        lo, hi = -0.99, 5.0
        for _ in range(200):
            mid = (lo + hi) / 2
            if npv(mid, fl) > 0: lo = mid
            else: hi = mid
        return (lo + hi) / 2
    R = dict(flujo=flujo, van_ku=npv(ku, flujo), tir=irr(flujo), ku=ku, ke=ke, wacc=wacc, beta_l=beta_l, kd_real=kd_real,
             inv0_cap=inv0_cap, inv0_nom=inv0_nom, req=req, ct_inv=ct_inv, deficit=deficit, saldo=saldo, dep=dep, amort=amort,
             ebitda=ebitda, ingresos=ing, ebit=ebit, imp=imp, vd=vd, vl=vl, inv_anio=inv_anio, idx=idx,
             inst=A('inst'), capm=A('capm'), duos=A('duos', 'end'), talleres=A('talleres', 'end'), tec=A('tec', 'end'),
             dot=A('dot', 'end'), red=A('red_act', 'end'), nomina=A('nomina'))
    R['van_wacc'] = npv(wacc, flujo)
    return R

if __name__ == '__main__':
    P = copy.deepcopy(BASE)
    M = run(P); R = evaluar(P, M)
    f = lambda v: f"{v/1e6:,.1f}"
    print('kit', {k: round(v) for k, v in M['_K'].items()}, 'tasa real mensual', M['_r'])
    print('inst', R['inst'], 'cap', [round(x) for x in R['capm']])
    print('duos', R['duos'], 'talleres', R['talleres'], 'tec', R['tec'], 'dot', R['dot'], 'red', R['red'])
    print('ingresos', [f(x) for x in R['ingresos']])
    print('ebitda', [f(x) for x in R['ebitda']])
    print('nomina', [f(x) for x in R['nomina']])
    print('inv0 cap', f(R['inv0_cap']), 'nom', f(R['inv0_nom']), 'inv anual', [f(x) for x in R['inv_anio']])
    print('CT req', [f(x) for x in R['req']], 'deficit', f(R['deficit']), 'saldos', [f(x) for x in R['saldo']])
    print('dep', [f(x) for x in R['dep']], 'amort', [f(x) for x in R['amort']], 'imp', [f(x) for x in R['imp']])
    print('VD', f(R['vd']), 'VL', f(R['vl']))
    print('flujo', [f(x) for x in R['flujo']])
    print('Ku', R['ku'], 'VAN', f(R['van_ku']), 'TIR', R['tir'], 'WACC', R['wacc'], 'VANw', f(R['van_wacc']))
    print('controles', max(abs(x) for x in M['ctrl_ped']), max(abs(x) for x in M['ctrl_caja']))
