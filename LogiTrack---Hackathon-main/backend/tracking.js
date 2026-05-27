// ─── City coordinates ─────────────────────────────────────────────────────────
const CITIES = {
  'São Paulo - SP':        [-23.5505, -46.6333],
  'Campinas - SP':         [-22.9056, -47.0608],
  'Ribeirão Preto - SP':   [-21.1775, -47.8103],
  'Santos - SP':           [-23.9535, -46.3322],
  'Rio de Janeiro - RJ':   [-22.9068, -43.1729],
  'Belo Horizonte - MG':   [-19.9191, -43.9386],
  'Juiz de Fora - MG':     [-21.7642, -43.3503],
  'Brasília - DF':         [-15.7801, -47.9292],
  'Curitiba - PR':         [-25.4284, -49.2733],
  'Porto Alegre - RS':     [-30.0277, -51.2287],
  'Salvador - BA':         [-12.9714, -38.5014],
  'Recife - PE':           [-8.0476,  -34.8770],
  'Fortaleza - CE':        [-3.7172,  -38.5433],
  'Manaus - AM':           [-3.1190,  -60.0217],
  'Belém - PA':            [-1.4558,  -48.4902],
  'Goiânia - GO':          [-16.6869, -49.2648],
  'Florianópolis - SC':    [-27.5954, -48.5480],
  'Vitória - ES':          [-20.3155, -40.3128],
  'Natal - RN':            [-5.7945,  -35.2110],
  'João Pessoa - PB':      [-7.1195,  -34.8450],
  'Maceió - AL':           [-9.6658,  -35.7350],
  'São Luís - MA':         [-2.5297,  -44.3028],
  'Teresina - PI':         [-5.0892,  -42.8019],
  'Campo Grande - MS':     [-20.4697, -54.6201],
  'Cuiabá - MT':           [-15.5989, -56.0949],
  'Porto Velho - RO':      [-8.7612,  -63.9004],
  'Rio Branco - AC':       [-9.9754,  -67.8249],
  'Macapá - AP':           [0.0389,   -51.0664],
  'Boa Vista - RR':        [2.8235,   -60.6758],
  'Palmas - TO':           [-10.1837, -48.3336],
  'Xangai - China':        [31.2304, 121.4737],
  'Hong Kong':             [22.3193, 114.1694],
  'Frankfurt - Alemanha':  [50.1109,  8.6821],
  'Miami - EUA':           [25.7617, -80.1918],
  'Lisboa - Portugal':     [38.7223,  -9.1393],
  'Aeroporto de Viracopos - Campinas/SP': [-23.0074, -47.1344],
  'Aeroporto Internacional de Guarulhos/SP': [-23.4356, -46.4731],
  'Receita Federal - São Paulo/SP': [-23.5489, -46.6388],
  'CDD São Paulo - SP':    [-23.5441, -46.6291],
  'CTE São Paulo - SP':    [-23.5320, -46.6150],
};

function coordsOf(city) {
  return CITIES[city] || [-23.5505, -46.6333];
}

// ─── Carrier detection ─────────────────────────────────────────────────────────
export function detectCarrier(code) {
  const c = code.trim().toUpperCase();
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(c))       return 'Correios';
  if (/^1Z[A-Z0-9]{16}$/.test(c))               return 'UPS';
  if (/^(JD)\d{18}$/.test(c))                   return 'DHL';
  if (/^\d{12}$/.test(c))                        return 'FedEx';
  if (/^\d{15}$/.test(c))                        return 'FedEx';
  if (/^LOG\d+/.test(c))                         return 'Loggi';
  if (/^TE\d+/.test(c))                          return 'Total Express';
  if (/^TBA\d{12}$/.test(c))                     return 'Amazon Logistics';
  if (/^(LP|LS|LX)\d{10,15}[A-Z]{2}$/.test(c))  return 'Cainiao / AliExpress';
  if (/^SPX[A-Z0-9]+/.test(c))                   return 'Shopee Xpress';
  if (/^(MELI|ME)\d+/.test(c))                   return 'Mercado Livre';
  if (/^(SEQ|SQ)\d+/.test(c))                    return 'Sequoia';
  if (/^(JT|JNT)\d+/.test(c))                    return 'J&T Express';
  return 'Transportadora';
}

export function isValidTrackingCode(code) {
  return code.trim().length >= 6;
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
function daysAgo(now, d)  { return new Date(now.getTime() - d * 86_400_000); }
function hoursAgo(now, h) { return new Date(now.getTime() - h * 3_600_000); }
function fmtDate(d) { return d.toLocaleDateString('pt-BR'); }
function fmtTime(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function pad(n) { return String(n).padStart(2, '0'); }

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Nacional ─────────────────────────────────────────────────────────────────
function buildNationalTracking(code, carrier, now) {
  const h = hashCode(code);
  const statuses = ['in_transit', 'out_for_delivery', 'delivered'];
  const status = statuses[h % statuses.length];

  const pairs = [
    ['São Paulo - SP', 'Rio de Janeiro - RJ'],
    ['São Paulo - SP', 'Belo Horizonte - MG'],
    ['São Paulo - SP', 'Curitiba - PR'],
    ['São Paulo - SP', 'Porto Alegre - RS'],
    ['Rio de Janeiro - RJ', 'Belo Horizonte - MG'],
    ['São Paulo - SP', 'Brasília - DF'],
    ['Fortaleza - CE', 'São Paulo - SP'],
    ['Salvador - BA', 'São Paulo - SP'],
    ['São Paulo - SP', 'Recife - PE'],
    ['São Paulo - SP', 'Campinas - SP'],
  ];
  const [origin, destination] = pairs[h % pairs.length];

  const transitMap = {
    'São Paulo - SP': {
      'Rio de Janeiro - RJ': ['CTE São Paulo - SP', 'Juiz de Fora - MG'],
      'Belo Horizonte - MG': ['CTE São Paulo - SP', 'Juiz de Fora - MG'],
      'Curitiba - PR': ['CTE São Paulo - SP'],
      'Porto Alegre - RS': ['CTE São Paulo - SP', 'Curitiba - PR', 'Florianópolis - SC'],
      'Brasília - DF': ['CTE São Paulo - SP', 'Goiânia - GO'],
      'Recife - PE': ['CTE São Paulo - SP', 'Salvador - BA'],
      'Campinas - SP': [],
    },
    'Rio de Janeiro - RJ': { 'Belo Horizonte - MG': ['Juiz de Fora - MG'] },
    'Fortaleza - CE': { 'São Paulo - SP': ['Recife - PE', 'Salvador - BA', 'CTE São Paulo - SP'] },
    'Salvador - BA': { 'São Paulo - SP': ['CTE São Paulo - SP'] },
  };

  const transits = transitMap[origin]?.[destination] ?? [];
  const events = [];
  let id = 1;
  const postDay = transits.length + (status === 'delivered' ? 3 : status === 'out_for_delivery' ? 2 : 1);

  events.push({ id: String(id++), status: 'Objeto postado', description: `Objeto postado${carrier === 'Correios' ? ' na agência dos Correios' : ` na unidade da ${carrier}`}`, location: origin, date: fmtDate(daysAgo(now, postDay + 1)), time: `${pad(8+(h%4))}:${pad((h*7)%60)}`, coords: coordsOf(origin) });
  events.push({ id: String(id++), status: 'Em trânsito - por favor aguarde', description: `Objeto encaminhado de ${origin}`, location: origin, date: fmtDate(daysAgo(now, postDay)), time: `${pad(14+(h%6))}:${pad((h*3)%60)}`, coords: coordsOf(origin) });
  transits.forEach((city, i) => {
    events.push({ id: String(id++), status: 'Em trânsito - por favor aguarde', description: `Objeto chegou à unidade de distribuição de ${city}`, location: city, date: fmtDate(daysAgo(now, postDay-1-i)), time: `${pad(6+(h%8))}:${pad((h*11+i*13)%60)}`, coords: coordsOf(city) });
  });
  if (status === 'out_for_delivery' || status === 'delivered') {
    events.push({ id: String(id++), status: 'Objeto saiu para entrega ao destinatário', description: 'Objeto saiu para entrega ao destinatário', location: destination, date: fmtDate(daysAgo(now,1)), time: `${pad(7+(h%3))}:${pad((h*17)%60)}`, coords: coordsOf(destination), isCurrentLocation: status === 'out_for_delivery' });
  }
  if (status === 'delivered') {
    events.push({ id: String(id++), status: 'Objeto entregue ao destinatário', description: 'Objeto entregue ao destinatário', location: destination, date: fmtDate(daysAgo(now,0)), time: `${pad(10+(h%4))}:${pad((h*23)%60)}`, coords: coordsOf(destination), isCurrentLocation: true });
  }

  const allCities = [origin, ...transits, destination];
  const routePoints = allCities.map((city, i) => {
    let type;
    if (i === 0) type = 'origin';
    else if (i === allCities.length - 1) type = 'destination';
    else if (status === 'in_transit' && i === Math.min(transits.length, allCities.length - 2)) type = 'current';
    else type = 'transit';
    return { lat: coordsOf(city)[0], lng: coordsOf(city)[1], label: city, type };
  });
  const currentIdx = status === 'out_for_delivery' ? allCities.length - 1 : status === 'in_transit' ? Math.max(1, Math.min(transits.length, allCities.length - 2)) : allCities.length - 1;
  if (routePoints[currentIdx] && status !== 'delivered') routePoints[currentIdx].type = 'current';
  const progress = status === 'delivered' ? 100 : status === 'out_for_delivery' ? 70+(h%25) : Math.round((currentIdx/(allCities.length-1))*60);

  return { code, carrier, status, estimatedDelivery: status !== 'delivered' ? fmtDate(new Date(now.getTime()+2*86_400_000)) : undefined, origin, destination, events: [...events].reverse(), lastUpdate: `${fmtDate(now)} às ${fmtTime(now)}`, routePoints, deliveryProgress: progress, isInternational: false };
}

// ─── Internacional ────────────────────────────────────────────────────────────
function buildInternationalTracking(code, carrier, now) {
  const h = hashCode(code);
  const statuses = ['in_transit', 'out_for_delivery', 'delivered'];
  const status = statuses[h % statuses.length];
  const origin = 'Xangai - China';
  const destination = 'São Paulo - SP';

  const events = [
    { id:'1', status:'Objeto postado', description:'Encomenda recebida no centro de distribuição de origem', location:origin, date:fmtDate(daysAgo(now,18)), time:`${pad(9+(h%4))}:${pad((h*7)%60)}`, coords:coordsOf(origin) },
    { id:'2', status:'Aguardando despacho aduaneiro', description:'Documentação submetida para processamento alfandegário de exportação', location:'Hong Kong', date:fmtDate(daysAgo(now,16)), time:`${pad(22)}:${pad((h*3)%60)}`, coords:coordsOf('Hong Kong') },
    { id:'3', status:'Em trânsito internacional', description:'Objeto em voo internacional — rota Ásia › América do Sul', location:'Em voo (estimado Frankfurt - Alemanha)', date:fmtDate(daysAgo(now,13)), time:`${pad(3+(h%5))}:${pad((h*11)%60)}`, coords:coordsOf('Frankfurt - Alemanha') },
    { id:'4', status:'Chegou ao Brasil', description:'Objeto chegou ao aeroporto de desembarque — aguardando vistoria', location:'Aeroporto Internacional de Guarulhos/SP', date:fmtDate(daysAgo(now,10)), time:`${pad(14+(h%6))}:${pad((h*17)%60)}`, coords:coordsOf('Aeroporto Internacional de Guarulhos/SP') },
    { id:'5', status:'Em análise aduaneira', description:'Objeto sob análise pela Receita Federal do Brasil (RFB)', location:'Aeroporto Internacional de Guarulhos/SP', date:fmtDate(daysAgo(now,8)), time:`${pad(8+(h%3))}:${pad((h*5)%60)}`, coords:coordsOf('Aeroporto Internacional de Guarulhos/SP') },
    { id:'6', status:'Desembaraço aduaneiro realizado', description:'Objeto liberado pela Receita Federal — encaminhado à unidade de distribuição', location:'Receita Federal - São Paulo/SP', date:fmtDate(daysAgo(now,6)), time:`${pad(11+(h%4))}:${pad((h*13)%60)}`, coords:coordsOf('Receita Federal - São Paulo/SP') },
    { id:'7', status:'Em trânsito nacional', description:`Objeto encaminhado dos Correios para entrega em ${destination}`, location:'CDD São Paulo - SP', date:fmtDate(daysAgo(now,3)), time:`${pad(8+(h%2))}:${pad((h*19)%60)}`, coords:coordsOf('CDD São Paulo - SP'), isCurrentLocation: status === 'in_transit' },
  ];
  if (status === 'out_for_delivery' || status === 'delivered') {
    events.push({ id:'8', status:'Objeto saiu para entrega ao destinatário', description:'Objeto saiu para entrega ao destinatário', location:destination, date:fmtDate(daysAgo(now,1)), time:`${pad(7+(h%3))}:${pad((h*17)%60)}`, coords:coordsOf(destination), isCurrentLocation: status === 'out_for_delivery' });
  }
  if (status === 'delivered') {
    events.push({ id:'9', status:'Objeto entregue ao destinatário', description:'Objeto entregue ao destinatário com sucesso', location:destination, date:fmtDate(now), time:`${pad(13+(h%4))}:${pad((h*23)%60)}`, coords:coordsOf(destination), isCurrentLocation:true });
  }

  const routePoints = [
    { lat:coordsOf(origin)[0], lng:coordsOf(origin)[1], label:origin, type:'origin' },
    { lat:coordsOf('Hong Kong')[0], lng:coordsOf('Hong Kong')[1], label:'Hong Kong', type:'transit' },
    { lat:coordsOf('Frankfurt - Alemanha')[0], lng:coordsOf('Frankfurt - Alemanha')[1], label:'Frankfurt', type:'transit' },
    { lat:coordsOf('Aeroporto Internacional de Guarulhos/SP')[0], lng:coordsOf('Aeroporto Internacional de Guarulhos/SP')[1], label:'Guarulhos - SP', type: status==='in_transit'?'current':'transit' },
    { lat:coordsOf('CDD São Paulo - SP')[0], lng:coordsOf('CDD São Paulo - SP')[1], label:'CDD São Paulo', type: status==='in_transit'?'current':'transit' },
    { lat:coordsOf(destination)[0], lng:coordsOf(destination)[1], label:destination, type: status==='delivered'||status==='out_for_delivery'?'current':'destination' },
  ];

  const progress = status==='delivered'?100:status==='out_for_delivery'?80+(h%15):45+(h%25);
  return { code, carrier, status, estimatedDelivery: status!=='delivered'?fmtDate(new Date(now.getTime()+3*86_400_000)):undefined, origin, destination, events:[...events].reverse(), lastUpdate:`${fmtDate(now)} às ${fmtTime(hoursAgo(now,h%3))}`, routePoints, deliveryProgress:progress, isInternational:true };
}

const INTERNATIONAL_CARRIERS = new Set(['DHL','UPS','FedEx','Cainiao / AliExpress','Amazon Logistics']);

export function fetchTracking(code) {
  const carrier = detectCarrier(code);
  const now = new Date();
  return INTERNATIONAL_CARRIERS.has(carrier)
    ? buildInternationalTracking(code, carrier, now)
    : buildNationalTracking(code, carrier, now);
}
