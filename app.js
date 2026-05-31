/**
 * Klyro App — app.js
 * Auth · Store · Utilities · Sidebar · Currency · AI Analysis
 */

'use strict';

/* ══════════════════════════════════════
   THEME PERSISTENCE — apply before render
   Reads dark mode from localStorage immediately
   so there's no white flash on navigation.
══════════════════════════════════════ */
(function() {
  try {
    const uid = sessionStorage.getItem('exmo_session') || localStorage.getItem('exmo_session') || 'guest';
    const s = JSON.parse(localStorage.getItem('exmo_settings_' + uid) || '{}');
    if (s.darkMode) document.documentElement.classList.add('dark-pre');
  } catch {}
})();

/* ══════════════════════════════════════
   WORLD CURRENCY LIST
   Symbol + name for every major currency.
   formatCurrency() reads from here so
   changing currency in Settings instantly
   updates every number across the app.
══════════════════════════════════════ */
const CURRENCIES = [
  // ── Major ──────────────────────────────────────────────────────────────────
  { code:'USD', symbol:'$',    name:'US Dollar' },
  { code:'EUR', symbol:'€',    name:'Euro' },
  { code:'GBP', symbol:'£',    name:'British Pound' },
  { code:'JPY', symbol:'¥',    name:'Japanese Yen' },
  { code:'CHF', symbol:'Fr',   name:'Swiss Franc' },
  { code:'CAD', symbol:'CA$',  name:'Canadian Dollar' },
  { code:'AUD', symbol:'A$',   name:'Australian Dollar' },
  { code:'NZD', symbol:'NZ$',  name:'New Zealand Dollar' },
  { code:'SGD', symbol:'S$',   name:'Singapore Dollar' },
  { code:'HKD', symbol:'HK$',  name:'Hong Kong Dollar' },
  // ── Europe ─────────────────────────────────────────────────────────────────
  { code:'SEK', symbol:'kr',   name:'Swedish Krona' },
  { code:'NOK', symbol:'kr',   name:'Norwegian Krone' },
  { code:'DKK', symbol:'kr',   name:'Danish Krone' },
  { code:'PLN', symbol:'zł',   name:'Polish Zloty' },
  { code:'CZK', symbol:'Kč',   name:'Czech Koruna' },
  { code:'HUF', symbol:'Ft',   name:'Hungarian Forint' },
  { code:'RON', symbol:'lei',  name:'Romanian Leu' },
  { code:'BGN', symbol:'лв',   name:'Bulgarian Lev' },
  { code:'HRK', symbol:'kn',   name:'Croatian Kuna' },
  { code:'UAH', symbol:'₴',    name:'Ukrainian Hryvnia' },
  { code:'RUB', symbol:'₽',    name:'Russian Ruble' },
  { code:'TRY', symbol:'₺',    name:'Turkish Lira' },
  { code:'ILS', symbol:'₪',    name:'Israeli Shekel' },
  { code:'GEL', symbol:'₾',    name:'Georgian Lari' },
  { code:'AMD', symbol:'֏',    name:'Armenian Dram' },
  { code:'AZN', symbol:'₼',    name:'Azerbaijani Manat' },
  { code:'BYN', symbol:'Br',   name:'Belarusian Ruble' },
  { code:'MDL', symbol:'L',    name:'Moldovan Leu' },
  { code:'MKD', symbol:'ден',  name:'Macedonian Denar' },
  { code:'ALL', symbol:'L',    name:'Albanian Lek' },
  { code:'BAM', symbol:'KM',   name:'Bosnian Mark' },
  { code:'RSD', symbol:'din',  name:'Serbian Dinar' },
  { code:'ISK', symbol:'kr',   name:'Icelandic Krona' },
  // ── Africa ─────────────────────────────────────────────────────────────────
  { code:'NGN', symbol:'₦',    name:'Nigerian Naira' },
  { code:'GHS', symbol:'₵',    name:'Ghana Cedi' },
  { code:'ZAR', symbol:'R',    name:'South African Rand' },
  { code:'KES', symbol:'KSh',  name:'Kenyan Shilling' },
  { code:'EGP', symbol:'E£',   name:'Egyptian Pound' },
  { code:'MAD', symbol:'MAD',  name:'Moroccan Dirham' },
  { code:'ETB', symbol:'Br',   name:'Ethiopian Birr' },
  { code:'TZS', symbol:'TSh',  name:'Tanzanian Shilling' },
  { code:'UGX', symbol:'USh',  name:'Ugandan Shilling' },
  { code:'XOF', symbol:'CFA',  name:'West African CFA Franc' },
  { code:'XAF', symbol:'FCFA', name:'Central African CFA Franc' },
  { code:'TND', symbol:'DT',   name:'Tunisian Dinar' },
  { code:'DZD', symbol:'DA',   name:'Algerian Dinar' },
  { code:'LYD', symbol:'LD',   name:'Libyan Dinar' },
  { code:'SDG', symbol:'SDG',  name:'Sudanese Pound' },
  { code:'ZMW', symbol:'ZK',   name:'Zambian Kwacha' },
  { code:'BWP', symbol:'P',    name:'Botswana Pula' },
  { code:'MZN', symbol:'MT',   name:'Mozambican Metical' },
  { code:'MWK', symbol:'MK',   name:'Malawian Kwacha' },
  { code:'ZWL', symbol:'Z$',   name:'Zimbabwean Dollar' },
  { code:'NAD', symbol:'N$',   name:'Namibian Dollar' },
  { code:'SZL', symbol:'L',    name:'Swazi Lilangeni' },
  { code:'LSL', symbol:'L',    name:'Lesotho Loti' },
  { code:'MGA', symbol:'Ar',   name:'Malagasy Ariary' },
  { code:'RWF', symbol:'FRw',  name:'Rwandan Franc' },
  { code:'BIF', symbol:'Fr',   name:'Burundian Franc' },
  { code:'DJF', symbol:'Fr',   name:'Djiboutian Franc' },
  { code:'ERN', symbol:'Nfk',  name:'Eritrean Nakfa' },
  { code:'SOS', symbol:'Sh',   name:'Somali Shilling' },
  { code:'GMD', symbol:'D',    name:'Gambian Dalasi' },
  { code:'SLL', symbol:'Le',   name:'Sierra Leonean Leone' },
  { code:'LRD', symbol:'L$',   name:'Liberian Dollar' },
  { code:'GNF', symbol:'FG',   name:'Guinean Franc' },
  { code:'CVE', symbol:'$',    name:'Cape Verde Escudo' },
  { code:'STN', symbol:'Db',   name:'São Tomé Dobra' },
  { code:'KMF', symbol:'Fr',   name:'Comorian Franc' },
  { code:'SCR', symbol:'₨',    name:'Seychellois Rupee' },
  { code:'MUR', symbol:'₨',    name:'Mauritian Rupee' },
  { code:'AOA', symbol:'Kz',   name:'Angolan Kwanza' },
  { code:'CDF', symbol:'Fr',   name:'Congolese Franc' },
  // ── Asia ───────────────────────────────────────────────────────────────────
  { code:'INR', symbol:'₹',    name:'Indian Rupee' },
  { code:'CNY', symbol:'¥',    name:'Chinese Yuan' },
  { code:'KRW', symbol:'₩',    name:'South Korean Won' },
  { code:'TWD', symbol:'NT$',  name:'Taiwan Dollar' },
  { code:'PHP', symbol:'₱',    name:'Philippine Peso' },
  { code:'IDR', symbol:'Rp',   name:'Indonesian Rupiah' },
  { code:'MYR', symbol:'RM',   name:'Malaysian Ringgit' },
  { code:'THB', symbol:'฿',    name:'Thai Baht' },
  { code:'VND', symbol:'₫',    name:'Vietnamese Dong' },
  { code:'PKR', symbol:'₨',    name:'Pakistani Rupee' },
  { code:'BDT', symbol:'৳',    name:'Bangladeshi Taka' },
  { code:'LKR', symbol:'₨',    name:'Sri Lankan Rupee' },
  { code:'NPR', symbol:'₨',    name:'Nepalese Rupee' },
  { code:'MMK', symbol:'K',    name:'Myanmar Kyat' },
  { code:'KHR', symbol:'₫',    name:'Cambodian Riel' },
  { code:'LAK', symbol:'₭',    name:'Lao Kip' },
  { code:'MNT', symbol:'₮',    name:'Mongolian Tugrik' },
  { code:'KZT', symbol:'₸',    name:'Kazakhstani Tenge' },
  { code:'UZS', symbol:'soʻm', name:'Uzbekistani Som' },
  { code:'KGS', symbol:'с',    name:'Kyrgyzstani Som' },
  { code:'TJS', symbol:'SM',   name:'Tajikistani Somoni' },
  { code:'TMT', symbol:'T',    name:'Turkmenistani Manat' },
  { code:'AFN', symbol:'؋',    name:'Afghan Afghani' },
  { code:'BND', symbol:'B$',   name:'Brunei Dollar' },
  { code:'BTN', symbol:'Nu',   name:'Bhutanese Ngultrum' },
  { code:'MVR', symbol:'Rf',   name:'Maldivian Rufiyaa' },
  // ── Middle East ────────────────────────────────────────────────────────────
  { code:'AED', symbol:'د.إ',  name:'UAE Dirham' },
  { code:'SAR', symbol:'﷼',    name:'Saudi Riyal' },
  { code:'QAR', symbol:'﷼',    name:'Qatari Riyal' },
  { code:'KWD', symbol:'KD',   name:'Kuwaiti Dinar' },
  { code:'BHD', symbol:'BD',   name:'Bahraini Dinar' },
  { code:'OMR', symbol:'﷼',    name:'Omani Rial' },
  { code:'JOD', symbol:'JD',   name:'Jordanian Dinar' },
  { code:'IQD', symbol:'ع.د',  name:'Iraqi Dinar' },
  { code:'IRR', symbol:'﷼',    name:'Iranian Rial' },
  { code:'LBP', symbol:'L£',   name:'Lebanese Pound' },
  { code:'SYP', symbol:'£',    name:'Syrian Pound' },
  { code:'YER', symbol:'﷼',    name:'Yemeni Rial' },
  // ── Americas ───────────────────────────────────────────────────────────────
  { code:'BRL', symbol:'R$',   name:'Brazilian Real' },
  { code:'MXN', symbol:'MX$',  name:'Mexican Peso' },
  { code:'ARS', symbol:'$',    name:'Argentine Peso' },
  { code:'CLP', symbol:'CL$',  name:'Chilean Peso' },
  { code:'COP', symbol:'CO$',  name:'Colombian Peso' },
  { code:'PEN', symbol:'S/.',  name:'Peruvian Sol' },
  { code:'UYU', symbol:'$U',   name:'Uruguayan Peso' },
  { code:'PYG', symbol:'₲',    name:'Paraguayan Guarani' },
  { code:'BOB', symbol:'Bs.',  name:'Bolivian Boliviano' },
  { code:'VES', symbol:'Bs.S', name:'Venezuelan Bolívar' },
  { code:'GTQ', symbol:'Q',    name:'Guatemalan Quetzal' },
  { code:'HNL', symbol:'L',    name:'Honduran Lempira' },
  { code:'NIO', symbol:'C$',   name:'Nicaraguan Córdoba' },
  { code:'CRC', symbol:'₡',    name:'Costa Rican Colón' },
  { code:'PAB', symbol:'B/.',  name:'Panamanian Balboa' },
  { code:'DOP', symbol:'RD$',  name:'Dominican Peso' },
  { code:'HTG', symbol:'G',    name:'Haitian Gourde' },
  { code:'JMD', symbol:'J$',   name:'Jamaican Dollar' },
  { code:'TTD', symbol:'TT$',  name:'Trinidad Dollar' },
  { code:'BBD', symbol:'Bds$', name:'Barbadian Dollar' },
  { code:'XCD', symbol:'EC$',  name:'East Caribbean Dollar' },
  { code:'BSD', symbol:'B$',   name:'Bahamian Dollar' },
  { code:'GYD', symbol:'G$',   name:'Guyanese Dollar' },
  { code:'SRD', symbol:'$',    name:'Surinamese Dollar' },
  { code:'BZD', symbol:'BZ$',  name:'Belize Dollar' },
  // ── Pacific ────────────────────────────────────────────────────────────────
  { code:'FJD', symbol:'FJ$',  name:'Fijian Dollar' },
  { code:'PGK', symbol:'K',    name:'Papua New Guinean Kina' },
  { code:'WST', symbol:'WS$',  name:'Samoan Tala' },
  { code:'TOP', symbol:'T$',   name:'Tongan Paʻanga' },
  { code:'SBD', symbol:'SI$',  name:'Solomon Islands Dollar' },
  { code:'VUV', symbol:'VT',   name:'Vanuatu Vatu' },
];

/* Returns current currency object — falls back to USD */
function getCurrency() {
  const s = Store.getSettings();
  const code = s.currencyCode || 'USD';
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

/* ══════════════════════════════════════
   EXCHANGE RATES (for currency conversion)
   All rates normalized against USD base
══════════════════════════════════════ */
// Exchange rates last updated: May 30, 2026
// Source: XE.com mid-market rates (May 28, 2026) + supplementary data
// All rates = units of currency per 1 USD
const EXCHANGE_RATES = {
  // ── Major ──────────────────────────────────────────────────────────────────
  'USD': 1.0,
  'EUR': 0.8584,    // Euro
  'GBP': 0.7442,    // British Pound
  'JPY': 159.29,    // Japanese Yen
  'CHF': 0.7845,    // Swiss Franc
  'CAD': 1.3800,    // Canadian Dollar
  'AUD': 1.3970,    // Australian Dollar
  'NZD': 1.6875,    // New Zealand Dollar
  'SGD': 1.2763,    // Singapore Dollar
  'HKD': 7.8352,    // Hong Kong Dollar
  // ── Europe ─────────────────────────────────────────────────────────────────
  'SEK': 9.2630,    // Swedish Krona
  'NOK': 9.2568,    // Norwegian Krone
  'DKK': 6.4154,    // Danish Krone
  'PLN': 3.6293,    // Polish Zloty
  'CZK': 20.846,    // Czech Koruna
  'HUF': 303.996,   // Hungarian Forint
  'RON': 4.5045,    // Romanian Leu
  'BGN': 1.6799,    // Bulgarian Lev (pegged to EUR)
  'HRK': 6.4700,    // Croatian Kuna
  'UAH': 44.292,    // Ukrainian Hryvnia
  'RUB': 82.50,     // Russian Ruble (restricted market)
  'TRY': 45.898,    // Turkish Lira
  'ILS': 2.8191,    // Israeli Shekel
  'GEL': 2.6619,    // Georgian Lari
  'AMD': 397.50,    // Armenian Dram
  'AZN': 1.7000,    // Azerbaijani Manat
  'BYN': 3.2700,    // Belarusian Ruble
  'MDL': 17.85,     // Moldovan Leu
  'MKD': 52.91,     // Macedonian Denar
  'ALL': 94.20,     // Albanian Lek
  'BAM': 1.6799,    // Bosnian Mark (pegged to EUR)
  'RSD': 100.50,    // Serbian Dinar
  'ISK': 137.50,    // Icelandic Krona
  // ── Africa ─────────────────────────────────────────────────────────────────
  'NGN': 1374.59,   // Nigerian Naira
  'GHS': 11.66,     // Ghana Cedi (XE.com, May 30 2026)
  'ZAR': 16.268,    // South African Rand
  'KES': 129.509,   // Kenyan Shilling
  'EGP': 52.227,    // Egyptian Pound
  'MAD': 9.1906,    // Moroccan Dirham
  'ETB': 142.00,    // Ethiopian Birr
  'TZS': 2720.00,   // Tanzanian Shilling
  'UGX': 3775.23,   // Ugandan Shilling
  'XOF': 563.09,    // West African CFA Franc
  'XAF': 563.09,    // Central African CFA Franc
  'TND': 2.8982,    // Tunisian Dinar
  'DZD': 135.20,    // Algerian Dinar
  'LYD': 4.8700,    // Libyan Dinar
  'SDG': 600.00,    // Sudanese Pound
  'ZMW': 27.85,     // Zambian Kwacha
  'BWP': 13.62,     // Botswana Pula
  'MZN': 63.90,     // Mozambican Metical
  'MWK': 1730.00,   // Malawian Kwacha
  'ZWL': 361.90,    // Zimbabwean Dollar
  'NAD': 16.27,     // Namibian Dollar (pegged to ZAR)
  'SZL': 16.27,     // Swazi Lilangeni (pegged to ZAR)
  'LSL': 16.27,     // Lesotho Loti (pegged to ZAR)
  'MGA': 4540.00,   // Malagasy Ariary
  'RWF': 1430.00,   // Rwandan Franc
  'BIF': 2920.00,   // Burundian Franc
  'DJF': 177.72,    // Djiboutian Franc
  'ERN': 15.00,     // Eritrean Nakfa (fixed)
  'SOS': 571.50,    // Somali Shilling
  'GMD': 71.50,     // Gambian Dalasi
  'SLL': 22750.00,  // Sierra Leonean Leone
  'LRD': 194.50,    // Liberian Dollar
  'GNF': 8640.00,   // Guinean Franc
  'CVE': 94.70,     // Cape Verde Escudo
  'STN': 21.00,     // São Tomé Dobra
  'KMF': 422.00,    // Comorian Franc
  'SCR': 14.20,     // Seychellois Rupee
  'MUR': 45.80,     // Mauritian Rupee
  'AOA': 920.00,    // Angolan Kwanza
  'CDF': 2820.00,   // Congolese Franc
  // ── Asia ───────────────────────────────────────────────────────────────────
  'INR': 95.781,    // Indian Rupee
  'CNY': 6.7786,    // Chinese Yuan
  'KRW': 1495.89,   // South Korean Won
  'TWD': 31.378,    // Taiwan New Dollar
  'PHP': 61.411,    // Philippine Peso
  'IDR': 17819.29,  // Indonesian Rupiah
  'MYR': 3.9782,    // Malaysian Ringgit
  'THB': 32.590,    // Thai Baht
  'VND': 26326.92,  // Vietnamese Dong
  'PKR': 278.429,   // Pakistani Rupee
  'BDT': 122.722,   // Bangladeshi Taka
  'LKR': 328.470,   // Sri Lankan Rupee
  'NPR': 133.20,    // Nepalese Rupee
  'MMK': 2098.00,   // Myanmar Kyat
  'KHR': 4055.00,   // Cambodian Riel
  'LAK': 21900.00,  // Lao Kip
  'MNT': 3430.00,   // Mongolian Tugrik
  'KZT': 505.00,    // Kazakhstani Tenge
  'UZS': 12850.00,  // Uzbekistani Som
  'KGS': 86.50,     // Kyrgyzstani Som
  'TJS': 10.92,     // Tajikistani Somoni
  'TMT': 3.5000,    // Turkmenistani Manat (fixed)
  'AFN': 71.50,     // Afghan Afghani
  'BND': 1.2763,    // Brunei Dollar (pegged to SGD)
  'BTN': 95.781,    // Bhutanese Ngultrum (pegged to INR)
  'MVR': 15.42,     // Maldivian Rufiyaa
  // ── Middle East ────────────────────────────────────────────────────────────
  'AED': 3.6725,    // UAE Dirham (pegged to USD)
  'SAR': 3.7500,    // Saudi Riyal (pegged to USD)
  'QAR': 3.6400,    // Qatari Riyal (pegged to USD)
  'KWD': 0.3095,    // Kuwaiti Dinar
  'BHD': 0.3760,    // Bahraini Dinar (pegged to USD)
  'OMR': 0.3846,    // Omani Rial (pegged to USD)
  'JOD': 0.7090,    // Jordanian Dinar (pegged to USD)
  'IQD': 1309.82,   // Iraqi Dinar
  'IRR': 42300.00,  // Iranian Rial
  'LBP': 89700.00,  // Lebanese Pound
  'SYP': 13000.00,  // Syrian Pound
  'YER': 250.30,    // Yemeni Rial
  // ── Americas ───────────────────────────────────────────────────────────────
  'BRL': 5.0493,    // Brazilian Real
  'MXN': 17.343,    // Mexican Peso
  'ARS': 1409.82,   // Argentine Peso
  'CLP': 891.17,    // Chilean Peso
  'COP': 3648.38,   // Colombian Peso
  'PEN': 3.4105,    // Peruvian Sol
  'UYU': 42.50,     // Uruguayan Peso
  'PYG': 7890.00,   // Paraguayan Guarani
  'BOB': 6.9100,    // Bolivian Boliviano (semi-fixed)
  'VES': 46.80,     // Venezuelan Bolívar
  'GTQ': 7.7600,    // Guatemalan Quetzal
  'HNL': 25.30,     // Honduran Lempira
  'NIO': 36.80,     // Nicaraguan Córdoba
  'CRC': 517.00,    // Costa Rican Colón
  'PAB': 1.0000,    // Panamanian Balboa (pegged to USD)
  'DOP': 60.50,     // Dominican Peso
  'HTG': 132.50,    // Haitian Gourde
  'JMD': 157.20,    // Jamaican Dollar
  'TTD': 6.7900,    // Trinidad & Tobago Dollar
  'BBD': 2.0000,    // Barbadian Dollar (fixed to USD)
  'XCD': 2.7000,    // East Caribbean Dollar (fixed to USD)
  'BSD': 1.0000,    // Bahamian Dollar (pegged to USD)
  'GYD': 209.50,    // Guyanese Dollar
  'SRD': 36.80,     // Surinamese Dollar
  'BZD': 2.0000,    // Belize Dollar (fixed to USD)
  // ── Pacific ────────────────────────────────────────────────────────────────
  'FJD': 2.2590,    // Fijian Dollar
  'PGK': 3.9800,    // Papua New Guinean Kina
  'WST': 2.7800,    // Samoan Tala
  'TOP': 2.3700,    // Tongan Paʻanga
  'SBD': 8.4300,    // Solomon Islands Dollar
  'VUV': 120.50,    // Vanuatu Vatu
};

/* ══════════════════════════════════════
   MAKE.COM WEBHOOK INTEGRATION
══════════════════════════════════════ */
const MakeWebhook = (() => {
  const _h = [
    'aHR0cHM6Ly9ob29rLnVzMi5tYWtlLmNvbS83aXNj',
    'YTUwcWdjOHBjbHJnZ3VyY3JqMTRvOWJ0N3JyZg=='
  ].join('');
  const _u = () => atob(_h);

  return {
    async send(event, data) {
      const user = Auth.getUser();
      const cur  = getCurrency();
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        user:     { name: user?.name || 'Unknown', email: user?.email || '' },
        currency: { code: cur.code, symbol: cur.symbol },
        data
      };
      try {
        await fetch(_u(), {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });
      } catch (_) { /* silent */ }
    }
  };
})();

/* ══════════════════════════════════════
   CURRENCY CONVERTER SYSTEM
══════════════════════════════════════ */
const CurrencyConverter = {
  convert(amount, fromCode, toCode) {
    if (fromCode === toCode) return parseFloat(amount);
    const fromRate = EXCHANGE_RATES[fromCode] || 1.0;
    const toRate = EXCHANGE_RATES[toCode] || 1.0;
    const usdAmount = parseFloat(amount) / fromRate;
    return parseFloat((usdAmount * toRate).toFixed(2));
  },
  convertAllTransactions(oldCurrencyCode, newCurrencyCode) {
    const txns = Store.getTransactions();
    if (!txns.length) return { count: 0, totalOld: 0, totalNew: 0 };
    let totalOld = 0, totalNew = 0;
    const converted = txns.map(txn => {
      const origCurrency = txn.originalCurrency || oldCurrencyCode;
      if (origCurrency === oldCurrencyCode) {
        const oldAmount = parseFloat(txn.amount);
        const newAmount = this.convert(oldAmount, oldCurrencyCode, newCurrencyCode);
        totalOld += oldAmount;
        totalNew += newAmount;
        return {...txn, amount: newAmount, originalCurrency: newCurrencyCode, lastConvertedAt: new Date().toISOString()};
      }
      return txn;
    });
    Store.saveTransactions(converted);
    return {count: converted.length, totalOld: parseFloat(totalOld.toFixed(2)), totalNew: parseFloat(totalNew.toFixed(2)), rate: totalOld > 0 ? (totalNew / totalOld).toFixed(4) : 1};
  },
  convertAllGoals(oldCurrencyCode, newCurrencyCode) {
    const goals = Store.getGoals();
    if (!goals.length) return { count: 0 };
    const converted = goals.map(goal => {
      const origCurrency = goal.originalCurrency || oldCurrencyCode;
      if (origCurrency === oldCurrencyCode) {
        return {...goal, target: this.convert(goal.target, oldCurrencyCode, newCurrencyCode), saved: this.convert(goal.saved || 0, oldCurrencyCode, newCurrencyCode), originalCurrency: newCurrencyCode, lastConvertedAt: new Date().toISOString()};
      }
      return goal;
    });
    Store.saveGoals(converted);
    return { count: converted.length };
  },
  getConversionPreview(oldCurrencyCode, newCurrencyCode) {
    const txns = Store.getTransactions();
    const goals = Store.getGoals();
    const totals = Utils.calcTotals(txns);
    return {
      txns: {count: txns.length, income: this.convert(totals.income, oldCurrencyCode, newCurrencyCode), expense: this.convert(totals.expense, oldCurrencyCode, newCurrencyCode), balance: this.convert(totals.balance, oldCurrencyCode, newCurrencyCode)},
      goals: {count: goals.length, totalTarget: this.convert(goals.reduce((sum, g) => sum + parseFloat(g.target || 0), 0), oldCurrencyCode, newCurrencyCode), totalSaved: this.convert(goals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0), oldCurrencyCode, newCurrencyCode)},
      rate: (EXCHANGE_RATES[newCurrencyCode] / EXCHANGE_RATES[oldCurrencyCode]).toFixed(4),
      oldCurrency: CURRENCIES.find(c => c.code === oldCurrencyCode),
      newCurrency: CURRENCIES.find(c => c.code === newCurrencyCode)
    };
  }
};

/* ══════════════════════════════════════
   AUTH  (localStorage-based)
══════════════════════════════════════ */
const Auth = {
  KEY_USERS:   'exmo_users',
  KEY_SESSION: 'exmo_session',

  _getUsers() {
    try { return JSON.parse(localStorage.getItem(this.KEY_USERS) || '[]'); }
    catch { return []; }
  },
  _saveUsers(u) { localStorage.setItem(this.KEY_USERS, JSON.stringify(u)); },

  getUser() {
    try {
      const sid = sessionStorage.getItem(this.KEY_SESSION) || localStorage.getItem(this.KEY_SESSION);
      if (!sid) return null;
      return this._getUsers().find(u => u.id === sid) || null;
    } catch { return null; }
  },

  register({ name, email, password }) {
    const users = this._getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, message: 'An account with this email already exists.' };
    const user = { id: Date.now().toString(), name, email, password, avatar: null, createdAt: new Date().toISOString() };
    users.push(user);
    this._saveUsers(users);
    sessionStorage.setItem(this.KEY_SESSION, user.id);
    localStorage.setItem(this.KEY_SESSION, user.id);

    // ── Make.com: new signup ──
    MakeWebhook.send('user.signup', { name, email, signupDate: user.createdAt });

    return { success: true, user };
  },

  login(email, password) {
    const user = this._getUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Incorrect email or password.' };
    sessionStorage.setItem(this.KEY_SESSION, user.id);
    localStorage.setItem(this.KEY_SESSION, user.id);

    // ── Make.com: user logged in ──
    MakeWebhook.send('user.login', { name: user.name, email: user.email, loginDate: new Date().toISOString() });

    return { success: true, user };
  },

  updateUserAvatar(base64Str) {
    const currentUser = this.getUser();
    if (!currentUser) return false;
    
    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      users[idx].avatar = base64Str;
      this._saveUsers(users);
      return true;
    }
    return false;
  },

  syncProfileDetails(name, email) {
    const currentUser = this.getUser();
    if (!currentUser) return false;
    
    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      users[idx].name = name;
      users[idx].email = email;
      this._saveUsers(users);
      return true;
    }
    return false;
  },

  destroyCurrentAccount() {
    const currentUser = this.getUser();
    if (!currentUser) return;
    
    const uid = currentUser.id;
    
    // 1. Notify remote webhooks first before deleting client records
    MakeWebhook.send('user.deleted', { name: currentUser.name, email: currentUser.email, deletedAt: new Date().toISOString() });
    
    // 2. Erase user-scoped transaction, goal and settings files
    localStorage.removeItem('exmo_transactions_' + uid);
    localStorage.removeItem('exmo_goals_' + uid);
    localStorage.removeItem('exmo_settings_' + uid);
    
    // 3. Remove entry completely from the shared users registry bank
    const globalUsers = this._getUsers();
    const updatedRegistry = globalUsers.filter(u => u.id !== uid);
    this._saveUsers(updatedRegistry);
    
    // 4. Wipe operational sessions and bounce back to login wall
    sessionStorage.removeItem(this.KEY_SESSION);
    localStorage.removeItem(this.KEY_SESSION);
    
    window.location.replace('login.html');
  },

  logout() {
    sessionStorage.removeItem(this.KEY_SESSION);
    localStorage.removeItem(this.KEY_SESSION);
    window.location.href = 'login.html';
  },

  require() {
    if (!this.getUser()) window.location.replace('login.html');
  }
};


/* ══════════════════════════════════════
   PLAN GATE  (feature access control)
══════════════════════════════════════ */
const PlanGate = {

  // ── Plan hierarchy ────────────────────────────────────────────────────────
  LEVELS: { free: 0, students: 1, individuals: 2, businesses: 3, enterprise: 4 },

  // ── Feature matrix ────────────────────────────────────────────────────────
  FEATURES: {
    ai_chat:              { minPlan: 'students',     label: 'Klyro AI Chat' },
    ai_web_search:        { minPlan: 'individuals',  label: 'Klyro AI Web Search' },
    analysis:             { minPlan: 'students',     label: 'Analysis & Charts' },
    savings_goals:        { minPlan: 'students',     label: 'Savings Goals' },
    currency_conversion:  { minPlan: 'individuals',  label: 'Currency Conversion' },
    pdf_export:           { minPlan: 'students',     label: 'PDF Export' },
    csv_export:           { minPlan: 'free',         label: 'CSV Export' },
    advanced_analysis:    { minPlan: 'individuals',  label: 'Advanced Analysis' },
    team_features:        { minPlan: 'businesses',   label: 'Team Features' },
    invoices:             { minPlan: 'businesses',   label: 'Invoices & Receipts' },
    automated_invoicing:  { minPlan: 'enterprise',   label: 'Automated Invoicing' },
    api_access:           { minPlan: 'enterprise',   label: 'API Access' },
    transaction_limit:    { free: 20 },  // monthly limit for free plan only
    category_limit:       { free: 3 },   // category limit for free plan only
  },

  // ── Upgrade copy per plan ─────────────────────────────────────────────────
  UPGRADE_COPY: {
    students:    { price: '$8/mo', cta: 'Upgrade to Students' },
    individuals: { price: '$10/mo', cta: 'Upgrade to Individuals' },
    businesses:  { price: '$20/mo', cta: 'Upgrade to Businesses' },
    enterprise:  { price: '$40/mo', cta: 'Upgrade to Enterprise' },
  },

  // ── Get current plan ──────────────────────────────────────────────────────
  currentPlan() {
    const s = Store ? Store.getSettings() : {};
    return (s.plan || 'free').toLowerCase();
  },

  planLevel(plan) {
    return this.LEVELS[plan] || 0;
  },

  // ── Check if a feature is accessible ─────────────────────────────────────
  can(featureKey) {
    const feature = this.FEATURES[featureKey];
    if (!feature || !feature.minPlan) return true;
    return this.planLevel(this.currentPlan()) >= this.planLevel(feature.minPlan);
  },

  // ── Check free-tier numeric limits ───────────────────────────────────────
  monthlyTransactionCount() {
    if (!Store) return 0;
    const txns  = Store.getTransactions();
    const now   = new Date();
    const month = now.getMonth();
    const year  = now.getFullYear();
    return txns.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  },

  canAddTransaction() {
    if (this.currentPlan() !== 'free') return { allowed: true };
    const count = this.monthlyTransactionCount();
    const limit = this.FEATURES.transaction_limit.free;
    if (count >= limit) {
      return {
        allowed: false,
        message: `Free plan limit reached (${limit} transactions/month). Upgrade to Students for unlimited tracking.`,
        upgradeFeature: 'ai_chat', // students is the next level
        upgradePlan: 'students'
      };
    }
    return { allowed: true, remaining: limit - count };
  },

  // ── Show upgrade modal ────────────────────────────────────────────────────
  showUpgradeModal(featureKey) {
    const feature = this.FEATURES[featureKey];
    if (!feature) return;
    const plan     = feature.minPlan;
    const copy     = this.UPGRADE_COPY[plan] || { price: '', cta: 'Upgrade' };
    const current  = this.currentPlan();

    // Build modal HTML and inject into body
    const existingModal = document.getElementById('plangate-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'plangate-modal';
    modal.innerHTML = `
      <div id="plangate-overlay" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.6);
        backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
        z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;
        animation:pgFadeIn 0.2s ease;">
        <div style="
          background:var(--surface,#1a1612);
          border:1px solid var(--glass-border);
          border-radius:var(--radius);
          box-shadow:0 32px 80px rgba(0,0,0,0.5);
          padding:40px 36px;width:100%;max-width:420px;
          text-align:center;position:relative;
          animation:pgSlideIn 0.25s cubic-bezier(0.16,1,0.3,1);">
          <button onclick="PlanGate.closeUpgradeModal()" style="
            position:absolute;top:14px;right:14px;
            background:var(--glass-dim);border:1px solid var(--glass-border);
            border-radius:8px;width:30px;height:30px;
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;color:var(--text-dim);font-size:0.8rem;
            font-family:inherit;">✕</button>
          <div style="
            width:56px;height:56px;border-radius:16px;
            background:var(--gold-dim);color:var(--gold);
            display:flex;align-items:center;justify-content:center;
            font-size:1.4rem;margin:0 auto 20px;">🔒</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--text);margin-bottom:8px;">
            ${feature.label}
          </div>
          <div style="font-size:0.88rem;color:var(--text-dim);line-height:1.6;margin-bottom:24px;">
            This feature requires the <strong style="color:var(--text);">${plan.charAt(0).toUpperCase()+plan.slice(1)}</strong> plan or higher.
            You're currently on <strong style="color:var(--text);">${current.charAt(0).toUpperCase()+current.slice(1)}</strong>.
          </div>
          <div style="
            background:var(--glass-dim);border:1px solid var(--glass-border);
            border-radius:var(--radius-sm);padding:16px;margin-bottom:24px;">
            <div style="font-size:1.8rem;font-weight:900;font-family:var(--font-display);color:var(--text);">${copy.price}</div>
            <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">per month · cancel any time</div>
          </div>
          <a href="pricing.html" style="
            display:flex;align-items:center;justify-content:center;gap:8px;
            width:100%;padding:14px;
            background:linear-gradient(135deg,var(--gold),var(--gold-light));
            color:#03071e;font-weight:700;font-size:0.9rem;
            border:none;border-radius:var(--radius-sm);
            text-decoration:none;cursor:pointer;
            font-family:var(--font-body);
            box-shadow:0 4px 16px rgba(212,160,23,0.35);">
            🚀 ${copy.cta}
          </a>
          <button onclick="PlanGate.closeUpgradeModal()" style="
            display:block;width:100%;margin-top:10px;padding:10px;
            background:transparent;border:1px solid var(--glass-border);
            border-radius:var(--radius-sm);color:var(--text-dim);
            font-family:var(--font-body);font-size:0.85rem;cursor:pointer;">
            Maybe later
          </button>
        </div>
      </div>
      <style>
        @keyframes pgFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pgSlideIn { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      </style>`;
    document.body.appendChild(modal);

    // Close on backdrop click
    document.getElementById('plangate-overlay').addEventListener('click', function(e) {
      if (e.target === this) PlanGate.closeUpgradeModal();
    });
  },

  closeUpgradeModal() {
    const m = document.getElementById('plangate-modal');
    if (m) m.remove();
  },

  // ── Render an inline locked banner for full-page gates ───────────────────
  renderLockedBanner(featureKey, containerId) {
    const feature = this.FEATURES[featureKey];
    if (!feature) return;
    const plan = feature.minPlan;
    const copy = this.UPGRADE_COPY[plan] || { price: '', cta: 'Upgrade' };
    const el   = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div style="
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        min-height:320px;text-align:center;padding:40px 24px;">
        <div style="
          width:64px;height:64px;border-radius:20px;
          background:var(--gold-dim);color:var(--gold);
          display:flex;align-items:center;justify-content:center;
          font-size:1.6rem;margin-bottom:20px;">🔒</div>
        <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--text);margin-bottom:10px;">
          ${feature.label}
        </div>
        <div style="font-size:0.9rem;color:var(--text-dim);line-height:1.7;margin-bottom:28px;max-width:380px;">
          Upgrade to the <strong style="color:var(--text);">${plan.charAt(0).toUpperCase()+plan.slice(1)}</strong> plan 
          to unlock this feature — starting at <strong style="color:var(--gold);">${copy.price}</strong>.
        </div>
        <a href="pricing.html" style="
          display:inline-flex;align-items:center;gap:8px;
          padding:13px 28px;
          background:linear-gradient(135deg,var(--gold),var(--gold-light));
          color:#03071e;font-weight:700;font-size:0.9rem;
          border-radius:var(--radius-pill);text-decoration:none;
          box-shadow:0 4px 16px rgba(212,160,23,0.35);
          font-family:var(--font-body);">
          🚀 ${copy.cta}
        </a>
      </div>`;
  },

  // ── Soft warning banner (for approaching limits) ─────────────────────────
  renderLimitWarning(remaining, containerId) {
    const el = document.getElementById(containerId);
    if (!el || remaining > 5) return;
    el.innerHTML = `
      <div style="
        background:rgba(212,160,23,0.08);border:1px solid var(--gold-border);
        border-radius:var(--radius-sm);padding:12px 16px;
        display:flex;align-items:center;gap:10px;
        font-size:0.83rem;color:var(--text-mid);margin-bottom:16px;">
        <span style="font-size:1rem;">⚠️</span>
        <span>You have <strong style="color:var(--gold);">${remaining} transaction${remaining !== 1 ? 's' : ''}</strong> left this month on the Free plan.
        <a href="pricing.html" style="color:var(--gold);font-weight:600;text-decoration:none;margin-left:4px;">Upgrade →</a></span>
      </div>`;
    el.style.display = 'block';
  }
};

/* ══════════════════════════════════════
   DATA STORE  (per-user, namespaced)
══════════════════════════════════════ */
const Store = {
  _uid() { const u = Auth.getUser(); return u ? u.id : 'guest'; },
  _key(base) { return base + '_' + this._uid(); },

  getTransactions() {
    try { return JSON.parse(localStorage.getItem(this._key('exmo_transactions')) || '[]'); }
    catch { return []; }
  },
  saveTransactions(txns) { localStorage.setItem(this._key('exmo_transactions'), JSON.stringify(txns)); },
  addTransaction(txn) {
    // ── Plan gate: enforce free-tier monthly transaction limit ──
    const limitCheck = PlanGate.canAddTransaction();
    if (!limitCheck.allowed) {
      if (typeof showToast === 'function') showToast(limitCheck.message, 'error');
      PlanGate.showUpgradeModal('ai_chat'); // students plan unlocks unlimited
      return null;
    }

    const txns = this.getTransactions();
    txn.id   = Date.now().toString();
    txn.date = txn.date || new Date().toISOString().split('T')[0];
    txn.originalCurrency = txn.originalCurrency || getCurrency().code;
    txns.unshift(txn);
    this.saveTransactions(txns);

    // ── Make.com: fire on every new transaction ──
    MakeWebhook.send('transaction.added', {
      type:        txn.type,
      amount:      txn.amount,
      description: txn.description,
      category:    txn.category,
      date:        txn.date,
      currency:    txn.originalCurrency
    });

    return txn;
  },
  deleteTransaction(id) {
    this.saveTransactions(this.getTransactions().filter(t => t.id !== id));
  },
  updateTransaction(id, fields) {
    const txns = this.getTransactions();
    const idx = txns.findIndex(t => t.id === id);
    if (idx > -1) {
      txns[idx] = { ...txns[idx], ...fields };
      this.saveTransactions(txns);
      return txns[idx];
    }
    return null;
  },

  getSettings() {
    try { return JSON.parse(localStorage.getItem(this._key('exmo_settings')) || '{}'); }
    catch { return {}; }
  },
  saveSettings(s) { localStorage.setItem(this._key('exmo_settings'), JSON.stringify(s)); },

  getGoals() {
    try { return JSON.parse(localStorage.getItem(this._key('exmo_goals')) || '[]'); }
    catch { return []; }
  },
  saveGoals(goals) { localStorage.setItem(this._key('exmo_goals'), JSON.stringify(goals)); },
  addGoal(goal) {
    const goals = this.getGoals();
    goal.id = Date.now().toString();
    goal.originalCurrency = goal.originalCurrency || getCurrency().code;
    goals.push(goal);
    this.saveGoals(goals);

    // ── Make.com: fire on every new goal ──
    MakeWebhook.send('goal.created', {
      name:     goal.name,
      target:   goal.target,
      saved:    goal.saved    || 0,
      deadline: goal.deadline || null,
      emoji:    goal.emoji    || '🎯'
    });

    return goal;
  },
  deleteGoal(id) { this.saveGoals(this.getGoals().filter(g => g.id !== id)); },
  updateGoal(id, fields) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx > -1) {
      goals[idx] = { ...goals[idx], ...fields };
      this.saveGoals(goals);
      return goals[idx];
    }
    return null;
  },
  updateGoalSaved(id, amount) {
    const goals = this.getGoals();
    const g = goals.find(g => g.id === id);
    if (g) {
      g.saved = Math.min(parseFloat(g.target), (parseFloat(g.saved) || 0) + parseFloat(amount));
      this.saveGoals(goals);
    }
  },

  // ── Invoices ──────────────────────────────────────────────────────────────
  getInvoices() {
    try { return JSON.parse(localStorage.getItem(this._key('klyro_invoices')) || '[]'); }
    catch { return []; }
  },
  saveInvoices(list) { localStorage.setItem(this._key('klyro_invoices'), JSON.stringify(list)); },
  addInvoice(inv) {
    const list = this.getInvoices();
    inv.id        = 'INV-' + Date.now();
    inv.createdAt = new Date().toISOString();
    inv.status    = inv.status || 'draft';
    list.unshift(inv);
    this.saveInvoices(list);
    return inv;
  },
  updateInvoice(id, fields) {
    const list = this.getInvoices();
    const idx  = list.findIndex(i => i.id === id);
    if (idx > -1) { list[idx] = { ...list[idx], ...fields }; this.saveInvoices(list); return list[idx]; }
    return null;
  },
  deleteInvoice(id) { this.saveInvoices(this.getInvoices().filter(i => i.id !== id)); },
  getInvoice(id)    { return this.getInvoices().find(i => i.id === id) || null; },

  // ── Receipts (converted from paid invoices) ───────────────────────────────
  getReceipts() {
    try { return JSON.parse(localStorage.getItem(this._key('klyro_receipts')) || '[]'); }
    catch { return []; }
  },
  saveReceipts(list) { localStorage.setItem(this._key('klyro_receipts'), JSON.stringify(list)); },
  addReceipt(receipt) {
    const list = this.getReceipts();
    receipt.id        = 'REC-' + Date.now();
    receipt.createdAt = new Date().toISOString();
    list.unshift(receipt);
    this.saveReceipts(list);
    return receipt;
  }
};

/* ══════════════════════════════════════
   UTILITIES
══════════════════════════════════════ */
const Utils = {
  /* Always reads current currency from settings so swapping is instant */
  formatCurrency(amount, forceAbs = false) {
    const cur = getCurrency();
    const num = parseFloat(amount) || 0;
    const abs = Math.abs(num);
    const formatted = abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // Show negative sign when amount is genuinely negative (e.g. net balance in deficit)
    // forceAbs = true is used for income/expense display (always positive)
    const prefix = (!forceAbs && num < 0) ? '-' : '';
    return `${prefix}${cur.symbol}${formatted}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  },

  isThisWeek(dateStr) {
    const d = new Date(dateStr + 'T00:00:00'), now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
    return d >= start;
  },
  isThisMonth(dateStr) {
    const d = new Date(dateStr + 'T00:00:00'), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  },
  isThisYear(dateStr) {
    return new Date(dateStr + 'T00:00:00').getFullYear() === new Date().getFullYear();
  },
  filterByPeriod(txns, period) {
    if (period === 'week')  return txns.filter(t => this.isThisWeek(t.date));
    if (period === 'month') return txns.filter(t => this.isThisMonth(t.date));
    if (period === 'year')  return txns.filter(t => this.isThisYear(t.date));
    return txns;
  },

  calcTotals(txns) {
    let income = 0, expense = 0;
    txns.forEach(t => {
      if (t.type === 'income')  income  += parseFloat(t.amount) || 0;
      if (t.type === 'expense') expense += parseFloat(t.amount) || 0;
    });
    return { income, expense, balance: income - expense };
  },

  groupByCategory(txns) {
    const map = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + (parseFloat(t.amount) || 0);
    });
    return map;
  },

  getCategoryIcon(cat) {
    const icons = {
      /* Existing */
      groceries:'fa-cart-shopping', food:'fa-utensils', dining:'fa-utensils',
      transport:'fa-car', internet:'fa-wifi', bills:'fa-file-invoice',
      rent:'fa-house', entertainment:'fa-film', health:'fa-heart-pulse',
      clothing:'fa-shirt', savings:'fa-piggy-bank', salary:'fa-briefcase',
      freelance:'fa-laptop', investment:'fa-chart-line', other:'fa-ellipsis',
      shopping:'fa-bag-shopping', education:'fa-graduation-cap', travel:'fa-plane',
      utilities:'fa-bolt', insurance:'fa-shield-halved', subscriptions:'fa-rotate',
      personal:'fa-person', gifts:'fa-gift', childcare:'fa-baby',
      pets:'fa-paw', sports:'fa-dumbbell', beauty:'fa-spa',
      /* New — Transfers & Payments */
      transfer:'fa-arrow-right-arrow-left', 'bank transfer':'fa-building-columns',
      payment:'fa-credit-card', 'card payment':'fa-credit-card',
      loan:'fa-hand-holding-dollar', 'loan repayment':'fa-hand-holding-dollar',
      mortgage:'fa-house-chimney', tax:'fa-landmark', 'tax refund':'fa-rotate-left',
      /* New — Income */
      bonus:'fa-star', commission:'fa-percent', pension:'fa-umbrella',
      rental:'fa-key', dividends:'fa-chart-line', allowance:'fa-coins',
      /* New — Lifestyle */
      coffee:'fa-mug-hot', alcohol:'fa-wine-glass', gym:'fa-dumbbell',
      gaming:'fa-gamepad', books:'fa-book', streaming:'fa-play',
      phone:'fa-mobile-screen', repair:'fa-screwdriver-wrench',
      cleaning:'fa-broom', parking:'fa-square-parking',
      toll:'fa-road', fuel:'fa-gas-pump', charity:'fa-heart',
      medical:'fa-stethoscope', dental:'fa-tooth', pharmacy:'fa-pills',
      haircut:'fa-scissors', laundry:'fa-shirt',
    };
    return icons[cat?.toLowerCase()] || 'fa-circle-dot';
  },

  /* Deep AI analysis helpers */
  getSavingsRate(totals) {
    return totals.income > 0 ? ((totals.income - totals.expense) / totals.income * 100) : 0;
  },

  getFinancialHealth(totals, txns) {
    const sr = this.getSavingsRate(totals);
    const cats = this.groupByCategory(txns);
    const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
    const topPct = totals.income > 0 && topCat ? (topCat[1]/totals.income*100) : 0;

    let score = 50;
    if (sr >= 20) score += 25;
    else if (sr >= 10) score += 10;
    else if (sr < 0) score -= 25;
    if (topPct < 30) score += 10;
    else if (topPct > 50) score -= 15;
    if (txns.length > 10) score += 5; // active tracker bonus

    return Math.max(0, Math.min(100, score));
  },

  buildAIContext(period = 'month') {
    const txns   = Store.getTransactions();
    const filt   = this.filterByPeriod(txns, period);
    const totals = this.calcTotals(filt);
    const cats   = this.groupByCategory(filt);
    const goals  = Store.getGoals();
    const cur    = getCurrency();
    const sr     = this.getSavingsRate(totals).toFixed(1);
    const health = this.getFinancialHealth(totals, filt);

    const sortedCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    const topCatsStr = sortedCats.slice(0,5).map(([k,v])=>`${k}: ${cur.symbol}${v.toFixed(2)}`).join(', ');

    // Month-over-month comparison
    const prevTxns   = this.filterByPeriod(txns, 'month').length
      ? txns.filter(t => {
          const d = new Date(t.date + 'T00:00:00'), now = new Date();
          const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
          const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
          return d >= prevMonth && d <= prevEnd;
        })
      : [];
    const prevTotals = this.calcTotals(prevTxns);

    const expenseChange = prevTotals.expense > 0
      ? (((totals.expense - prevTotals.expense)/prevTotals.expense)*100).toFixed(1)
      : null;

    return {
      currency: cur.code,
      symbol: cur.symbol,
      income: totals.income,
      expense: totals.expense,
      balance: totals.balance,
      savingsRate: sr,
      healthScore: health,
      topCategories: topCatsStr || 'none yet',
      topCat: sortedCats[0] || null,
      goals: goals.map(g=>`${g.emoji||'🎯'} ${g.name}: ${cur.symbol}${g.saved||0}/${cur.symbol}${g.target}`).join(', ') || 'none',
      totalTransactions: txns.length,
      periodTransactions: filt.length,
      expenseChange,
      prevExpense: prevTotals.expense,
      isOverspending: totals.expense > totals.income,
      period
    };
  }
};

/* ══════════════════════════════════════
   TOAST  (with sound)
══════════════════════════════════════ */
function _playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'success') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    }
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* audio not available */ }
}

function showToast(msg, type = 'success') {
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
  t.className = `toast ${type} show`;
  _playSound(type);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
function renderSidebar() {
  const user = Auth.getUser();
  const name    = user?.name?.split(' ')[0] || 'User';
  
  // Custom image display logic inside sidebar
  let avatarMarkup = '';
  if (user && user.avatar) {
    avatarMarkup = `<img src="${user.avatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  } else {
    const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
    avatarMarkup = initial;
  }

  return `
  <button class="sidebar-toggle-btn" id="sidebar-toggle" aria-label="Toggle menu">
    <i class="fas fa-bars"></i>
  </button>
  <nav class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <img src="exmo_logo.png" alt="Exmo" onerror="this.style.display='none'">
      <span class="sidebar-logo-text">Klyro</span>
    </div>
    <div class="sidebar-user">
      <div class="sidebar-avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">${avatarMarkup}</div>
      <div class="sidebar-username">${name}</div>
    </div>
    <span class="nav-section-label">Main</span>
    <a href="dashboard.html" class="nav-item" data-page="dashboard"><i class="fas fa-house"></i> Home</a>
    <a href="transactions.html" class="nav-item" data-page="transactions"><i class="fas fa-right-left"></i> Transactions</a>
    <a href="analysis.html" class="nav-item" data-page="analysis"><i class="fas fa-chart-pie"></i> Analysis</a>
    <span class="nav-section-label">Intelligence</span>
    <a href="ai.html" class="nav-item" data-page="ai"><i class="fas fa-brain"></i> Klyro AI</a>
    <span class="nav-section-label">Business</span>
    <a href="invoices.html" class="nav-item" data-page="invoices"><i class="fas fa-file-invoice-dollar"></i> Invoices</a>
    <span class="nav-section-label">Account</span>
    <a href="settings.html" class="nav-item" data-page="settings"><i class="fas fa-gear"></i> Settings</a>
    <div class="sidebar-bottom">
      <button class="nav-item logout-btn" onclick="handleLogout()">
        <i class="fas fa-right-from-bracket"></i> Logout
      </button>
    </div>
  </nav>
  <div id="toast" class="toast"></div>`;
}

function initSidebar() {
  const sidebar   = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const page      = window.location.pathname.split('/').pop() || 'dashboard.html';

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    const p = item.dataset.page;
    if (page.includes(p) || (p==='dashboard' && ['','index.html','dashboard.html'].includes(page)))
      item.classList.add('active');
  });

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.toggle('open'); });
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target))
        sidebar.classList.remove('open');
    });
  }

  const s = Store.getSettings();
  if (s.darkMode) {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark-pre');
  } else {
    document.documentElement.classList.remove('dark-pre');
  }
}

function handleLogout() {
  if (confirm('Log out of Klyro?')) {
    showToast('Logged out. See you soon!');
    setTimeout(() => Auth.logout(), 900);
  }
}

/* ══════════════════════════════════════
   SEED / DEMO  — no-op; clean slate
══════════════════════════════════════ */
function seedDemoData() {}

function _loadDemoData() {
  const s  = getCurrency().symbol;
  const demo = [
    { type:'income',  amount:3200, description:'Monthly Salary',    category:'salary',       date:'2026-04-01' },
    { type:'income',  amount:450,  description:'Freelance Project',  category:'freelance',    date:'2026-04-05' },
    { type:'expense', amount:950,  description:'Rent',               category:'rent',         date:'2026-04-02' },
    { type:'expense', amount:86,   description:'Electricity Bill',   category:'bills',        date:'2026-04-03' },
    { type:'expense', amount:42,   description:'Internet Broadband', category:'internet',     date:'2026-04-04' },
    { type:'expense', amount:112,  description:'Weekly Groceries',   category:'groceries',    date:'2026-04-07' },
    { type:'expense', amount:38,   description:'Lunch & Coffee',     category:'dining',       date:'2026-04-08' },
    { type:'expense', amount:24,   description:'Bus Pass',           category:'transport',    date:'2026-04-09' },
    { type:'expense', amount:15,   description:'Netflix',            category:'entertainment',date:'2026-04-10' },
    { type:'income',  amount:200,  description:'Side Project',       category:'freelance',    date:'2026-04-12' },
    { type:'expense', amount:67,   description:'Pharmacy',           category:'health',       date:'2026-04-15' },
    { type:'expense', amount:55,   description:'New Jacket',         category:'clothing',     date:'2026-04-18' },
    { type:'expense', amount:98,   description:'Supermarket Shop',   category:'groceries',    date:'2026-04-20' },
    { type:'expense', amount:32,   description:'Spotify + Apps',     category:'entertainment',date:'2026-04-21' },
  ];
  demo.forEach(t => Store.addTransaction(t));
  Store.addGoal({ name:'Europe Trip',    target:2000, saved:640,  emoji:'✈️', deadline:'2026-08-01' });
  Store.addGoal({ name:'Emergency Fund', target:5000, saved:1800, emoji:'🛡️', deadline:'2026-12-01' });
  Store.addGoal({ name:'New Laptop',     target:1200, saved:300,  emoji:'💻', deadline:'2026-06-01' });
}