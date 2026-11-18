/**
 * ITI Group landing page — all copy and map data, English + Arabic.
 *
 * Sources, in order of authority:
 *  1. "Group Companies Description.docx" (client, Nov 2026) — company profiles, facts, About copy, stats.
 *  2. "ITI Brief.pdf" (2026 corporate brief) — investments, project status, items the Word file does not cover.
 *  3. The brand guideline.
 * Open questions for the client (contradictions inside the Word file) are listed in docs/ITI_ASSET_MAP.md.
 *
 * Arabic copy is a first translation and must be reviewed by the ITI team before launch.
 * Photos are keys into the curated image set (see scripts/build-assets.mjs and ./media.ts).
 */

export type Lang = 'en' | 'ar'
export type L = Record<Lang, string>

export const PLACEHOLDER_URL = 'https://www.iti-spain.com'

/* ------------------------------------------------------------------ */
/* Brand palette (guideline p.27–30)                                   */
/* ------------------------------------------------------------------ */

export const BRAND = {
  navy: '#053552',
  steel: '#215c7e',
  mist: '#e2e7e8',
  copper: '#a9613a',
} as const

/* ------------------------------------------------------------------ */
/* Sectors — secondary colours are division identifiers only,          */
/* used on the map pins and card accents, never as backgrounds.        */
/* ------------------------------------------------------------------ */

export type SectorId = 'cement-plants' | 'cement-terminals' | 'metals' | 'port-terminals'

export const SECTORS: Record<SectorId, { color: string; label: L }> = {
  'cement-plants': {
    color: '#514338',
    label: { en: 'Cement Plants', ar: 'مصانع الأسمنت' },
  },
  'cement-terminals': {
    color: '#776e64',
    label: { en: 'Cement Terminals', ar: 'محطات الأسمنت' },
  },
  metals: {
    color: '#a7b0b5',
    label: { en: 'Non-Ferrous Metals', ar: 'المعادن غير الحديدية' },
  },
  'port-terminals': {
    color: '#a1b4d8',
    label: { en: 'Port Terminals', ar: 'المحطات البحرية' },
  },
}

export const SECTOR_ORDER: SectorId[] = ['cement-plants', 'cement-terminals', 'metals', 'port-terminals']

/* ------------------------------------------------------------------ */
/* Markets                                                             */
/* ------------------------------------------------------------------ */

export type MarketId = 'egypt' | 'usa' | 'europe' | 'saudi'
export type PlantMarket = 'egypt' | 'usa' | 'europe'

export interface Market {
  id: MarketId
  /** ISO 3166-1 numeric codes (world-atlas feature ids) */
  iso: string[]
  /** Countries still under construction inside the market (shown with a dashed outline) */
  isoUnderConstruction?: string[]
  name: L
  /** Shorter label for the map marker, where the full name would run under the side panels */
  mapName?: L
  /** Where the map marker sits — [lat, lng] */
  anchor: [number, number]
  /** Area the camera frames when the market is selected — [lat, lng][] */
  frame: [number, number][]
  /** "plants": zoom to site level with pins. "overview": country highlight + overview card only. */
  depth: 'plants' | 'overview'
  investment: string
  headline: L
  summary: L
  points?: L[]
  /** Image key (see media.ts) */
  photo: string
  /** Sector mood image, not a photo of the actual site */
  illustrative?: boolean
}

/** Order matters: scripts/build-globe-data.mjs tags the globe's dot matrix with these indexes */
export const MARKETS: Market[] = [
  {
    id: 'egypt',
    iso: ['818'],
    name: { en: 'Egypt', ar: 'مصر' },
    anchor: [27.2, 30.2],
    frame: [
      [31.7, 24.7],
      [31.4, 34.4],
      [21.9, 25.0],
      [22.0, 35.6],
    ],
    depth: 'plants',
    investment: '$370M',
    headline: {
      en: 'Five operational cement plants, three projects underway.',
      ar: 'خمسة مصانع أسمنت عاملة، وثلاثة مشروعات قيد التنفيذ.',
    },
    summary: {
      en: 'A long-standing industrial investor in Egypt, operating a vertically integrated cement production and logistics network, now advancing $370 million in new projects.',
      ar: 'مستثمر صناعي راسخ في مصر، يدير شبكة متكاملة رأسيًا لإنتاج الأسمنت والخدمات اللوجستية، ويمضي اليوم في مشروعات جديدة بقيمة 370 مليون دولار.',
    },
    photo: 'amreyah-aerial',
  },
  {
    id: 'usa',
    iso: ['840'],
    name: { en: 'United States', ar: 'الولايات المتحدة' },
    anchor: [33.5, -90],
    frame: [
      [48.5, -124],
      [47, -68],
      [25, -97.5],
      [25, -80.5],
      [30, -117],
    ],
    depth: 'plants',
    investment: '$450M',
    headline: {
      en: 'Multi-purpose terminals and a precast manufacturing facility.',
      ar: 'محطات متعددة الأغراض ومنشأة لتصنيع الخرسانة سابقة الصب.',
    },
    summary: {
      en: 'Through SESCO Cement, the Group imports, stores and distributes cement across the Gulf Coast and the Southeast, with around 350,000 tonnes of storage in Houston and Tampa — backed by $450 million of strategic investment.',
      ar: 'عبر SESCO للأسمنت، تستورد المجموعة الأسمنت وتخزّنه وتوزّعه على امتداد ساحل الخليج والجنوب الشرقي، بسعة تخزين تقارب 350 ألف طن في هيوستن وتامبا، تدعمها استثمارات استراتيجية بقيمة 450 مليون دولار.',
    },
    photo: 'market-usa',
  },
  {
    id: 'europe',
    iso: ['616', '528', '380', '826'],
    isoUnderConstruction: ['826'],
    name: { en: 'Europe', ar: 'أوروبا' },
    anchor: [49.5, 11],
    frame: [
      [56.4, -5.5],
      [56.2, 21.5],
      [50.6, 24.4],
      [43.4, 14.8],
      [43.6, 2.5],
      [50.2, -5.8],
    ],
    depth: 'plants',
    investment: '$110M',
    headline: {
      en: 'White cement distribution and terminals.',
      ar: 'توزيع الأسمنت الأبيض ومحطاته.',
    },
    summary: {
      en: 'Royal Cement EU represents Royal El Minya Cement across Europe from Poland, with operational cement terminals in Poland, Italy and the Netherlands.',
      ar: 'تمثّل Royal Cement EU أسمنت المنيا رويال في أنحاء أوروبا انطلاقًا من بولندا، مع محطات أسمنت عاملة في بولندا وإيطاليا وهولندا.',
    },
    points: [
      { en: 'Operational: Poland, Netherlands, Italy', ar: 'عاملة: بولندا، هولندا، إيطاليا' },
      {
        en: 'Expansion: large-scale port cement terminal under construction in the United Kingdom',
        ar: 'توسّع: محطة أسمنت بحرية كبرى قيد الإنشاء في المملكة المتحدة',
      },
    ],
    photo: 'eu-benelux',
  },
  {
    id: 'saudi',
    iso: ['682'],
    name: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    mapName: { en: 'Saudi Arabia', ar: 'السعودية' },
    anchor: [24, 45],
    frame: [
      [32.2, 36.5],
      [29.0, 48.5],
      [22.5, 55.7],
      [16.4, 42.8],
      [17.0, 52.0],
    ],
    depth: 'overview',
    investment: '$120M',
    headline: { en: 'Grinding plants.', ar: 'مصانع الطحن.' },
    summary: {
      en: 'Two secondary cementitious material plants with 4 MTons annual capacity, supporting sustainable and low-carbon construction.',
      ar: 'مصنعان للمواد الأسمنتية التكميلية بطاقة سنوية تبلغ 4 ملايين طن، يدعمان البناء المستدام منخفض الكربون.',
    },
    points: [
      {
        en: 'GGBFS, ground pozzolana and green cement (slag & pozzolanic)',
        ar: 'خبث الأفران العالية المطحون، والبوزولانا المطحونة، والأسمنت الأخضر',
      },
      { en: 'Plant 1 operational Q4 2026 · Plant 2 Q3 2027', ar: 'المصنع الأول: الربع الرابع 2026 · المصنع الثاني: الربع الثالث 2027' },
      {
        en: 'Direct distribution of Royal El Minya white cement',
        ar: 'توزيع مباشر للأسمنت الأبيض من أسمنت المنيا رويال',
      },
    ],
    photo: 'saudi',
    illustrative: true,
  },
]

/* ------------------------------------------------------------------ */
/* Assets — site-level detail for Egypt, the United States and Europe  */
/* ------------------------------------------------------------------ */

export interface Fact {
  k: L
  v: L
}

export interface Asset {
  id: string
  market: PlantMarket
  name: string
  /** Company the site belongs to, when the site name alone does not say it */
  parent?: string
  monogram: string
  city: L
  /** City cluster the pin fans out from (sites sharing a city never overlap) */
  hub?: string
  /** [lat, lng] — approximate, city-level */
  coords: [number, number]
  sector: SectorId
  status: 'operational' | 'construction'
  kind: L
  /** "Operational since 1989" / "Completion Q4 2026" etc. */
  milestone: L
  investment?: string
  headline?: L
  about: L
  facts?: Fact[]
  /** Image key (see media.ts) */
  photo: string
  /** Sector mood image, not a photo of the actual site */
  illustrative?: boolean
  logo?: string
  url: string
}

const f = (en: string, ar: string, ven: string, var_: string): Fact => ({ k: { en, ar }, v: { en: ven, ar: var_ } })

export const ASSETS: Asset[] = [
  /* ---------------- Egypt ---------------- */
  {
    id: 'amreyah',
    market: 'egypt',
    name: 'Amreyah Cement',
    monogram: 'AMR',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    hub: 'Alexandria',
    coords: [30.97, 29.78],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Cement Plant', ar: 'مصنع أسمنت رمادي' },
    milestone: { en: 'Operational since 1987', ar: 'يعمل منذ 1987' },
    headline: { en: 'Building on a legacy since 1987', ar: 'نبني على إرثٍ منذ 1987' },
    about: {
      en: 'Since 1987, Amreyah Cement has contributed to Egypt’s construction sector through integrated cement manufacturing in Alexandria. Its three production lines serve more than 700 clients across Egypt and six international markets, backed by internationally recognised quality, environmental and occupational-safety certifications.',
      ar: 'منذ عام 1987، تُسهم أسمنت العامرية في قطاع البناء المصري عبر عمليات متكاملة لتصنيع الأسمنت في الإسكندرية. وتخدم خطوطها الثلاثة أكثر من 700 عميل في مصر وستة أسواق دولية، مدعومةً بشهادات دولية في الجودة والبيئة والسلامة المهنية.',
    },
    facts: [
      f('Annual capacity', 'الطاقة السنوية', '5.5 million tonnes', '5.5 مليون طن'),
      f('Production lines', 'خطوط الإنتاج', '3', '3'),
      f('Workforce', 'القوى العاملة', '1,000+', '+1,000'),
      f('Clients', 'العملاء', '700+', '+700'),
      f('Mega projects', 'مشروعات كبرى', '50+', '+50'),
      f('Markets', 'الأسواق', 'Egypt + 6 international', 'مصر + 6 أسواق دولية'),
    ],
    photo: 'amreyah',
    logo: '/iti/logos/amreyah.png',
    url: 'https://www.amreyahcement.com',
  },
  {
    id: 'cimpor',
    market: 'egypt',
    name: 'Cimpor Cement Egypt',
    monogram: 'CIM',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    hub: 'Alexandria',
    coords: [30.83, 30.02],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Cement Plant', ar: 'مصنع أسمنت رمادي' },
    milestone: { en: 'Operational since 2004', ar: 'يعمل منذ 2004' },
    about: {
      en: 'Grey cement plant in Alexandria, part of the Group’s vertically integrated cement network.',
      ar: 'مصنع أسمنت رمادي في الإسكندرية، ضمن شبكة الأسمنت المتكاملة رأسيًا للمجموعة.',
    },
    photo: 'cimpor',
    illustrative: true,
    url: PLACEHOLDER_URL,
  },
  {
    id: 'ventura',
    market: 'egypt',
    name: 'Ventura Cables',
    monogram: 'VEN',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    hub: 'Alexandria',
    coords: [30.8, 29.53],
    sector: 'metals',
    status: 'construction',
    kind: { en: 'Power Cables & Overhead Conductors', ar: 'كابلات القوى والموصلات الهوائية' },
    milestone: { en: 'Completion Q3 2026', ar: 'الاكتمال: الربع الثالث 2026' },
    investment: '$80M',
    headline: { en: 'Connecting power to progress', ar: 'نوصل الطاقة بالتقدّم' },
    about: {
      en: 'Ventura Cables manufactures power cables and overhead conductors for the energy, infrastructure and construction sectors, with advanced European machinery across wire drawing, stranding, armouring, insulation and sheathing.',
      ar: 'تصنّع فينتورا للكابلات كابلات القوى والموصلات الهوائية لقطاعات الطاقة والبنية التحتية والإنشاءات، بمعدات أوروبية متقدمة في مراحل السحب والجدل والتسليح والعزل والتغليف.',
    },
    facts: [
      f('Range', 'المنتجات', 'Low-, medium- & high-voltage cables', 'كابلات جهد منخفض ومتوسط وعالٍ'),
      f('Also', 'إضافةً إلى', 'Overhead conductors', 'الموصلات الهوائية'),
      f('Markets', 'الأسواق', 'Egypt, Middle East, international', 'مصر والشرق الأوسط والأسواق الدولية'),
    ],
    photo: 'ventura',
    illustrative: true,
    logo: '/iti/logos/ventura.png',
    url: 'https://venturacables.com',
  },
  {
    id: 'european',
    market: 'egypt',
    name: 'European Co.',
    monogram: 'EUR',
    city: { en: 'Al Dekheila Port, Alexandria', ar: 'ميناء الدخيلة، الإسكندرية' },
    hub: 'Alexandria',
    coords: [31.13, 29.8],
    sector: 'port-terminals',
    status: 'construction',
    kind: { en: 'Cement Export Terminal', ar: 'محطة تصدير الأسمنت' },
    milestone: { en: 'Completion Q4 2026', ar: 'الاكتمال: الربع الرابع 2026' },
    headline: { en: 'Connecting cement to global markets', ar: 'نربط الأسمنت بالأسواق العالمية' },
    about: {
      en: 'European Co. operates cement export terminals at Al Dekheila Port, Alexandria — the export link between the Group’s cement manufacturing and global markets, carrying Egyptian cement beyond domestic borders.',
      ar: 'تدير European Co. محطات تصدير الأسمنت في ميناء الدخيلة بالإسكندرية، لتكون حلقة التصدير بين قدرات المجموعة في تصنيع الأسمنت والأسواق العالمية، وتنقل الأسمنت المصري إلى ما وراء الحدود.',
    },
    facts: [
      f('Operations', 'العمليات', 'Cement terminal & export handling', 'تشغيل محطات الأسمنت ومناولة التصدير'),
      f('Storage', 'سعة التخزين', '75,000 tonnes', '75 ألف طن'),
      f('Throughput', 'المناولة السنوية', '2 million+ tonnes / year', 'أكثر من مليوني طن سنويًا'),
    ],
    photo: 'european',
    logo: '/iti/logos/european.png',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'royal-elminya',
    market: 'egypt',
    name: 'Royal El Minya Cement',
    monogram: 'REC',
    city: { en: 'El Minya', ar: 'المنيا' },
    hub: 'El Minya',
    coords: [28.32, 30.6],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'White Cement Plant', ar: 'مصنع أسمنت أبيض' },
    milestone: { en: 'Producing since 2010', ar: 'ينتج منذ 2010' },
    headline: { en: 'White cement. Global reach.', ar: 'أسمنت أبيض. وصول عالمي.' },
    about: {
      en: 'Drawing on the natural quality of El Minya’s limestone, Royal El Minya Cement manufactures white Portland and white masonry cement for architectural, decorative and construction applications — reaching more than 25 countries, with direct distribution in the United States, Poland, Saudi Arabia and South Korea.',
      ar: 'تستند أسمنت المنيا رويال إلى الجودة الطبيعية لخامات الحجر الجيري في المنيا، لتصنّع الأسمنت البورتلاندي الأبيض وأسمنت المباني الأبيض للتطبيقات المعمارية والزخرفية والإنشائية، وتصل منتجاتها إلى أكثر من 25 دولة، مع توزيع مباشر في الولايات المتحدة وبولندا والسعودية وكوريا الجنوبية.',
    },
    facts: [
      f('Established', 'التأسيس', '2006', '2006'),
      f('Production since', 'بدء الإنتاج', '2010', '2010'),
      f('Workforce', 'القوى العاملة', '300+', '+300'),
      f('Export markets', 'أسواق التصدير', '25+ countries', 'أكثر من 25 دولة'),
      f('Direct distribution', 'التوزيع المباشر', '4 countries', '4 دول'),
    ],
    photo: 'royal-elminya',
    logo: '/iti/logos/royal-elminya.png',
    url: 'https://www.royalcement.com',
  },
  {
    id: 'cleopatra',
    market: 'egypt',
    name: 'Cleopatra Cement',
    monogram: 'CLC',
    city: { en: 'Samalout, El Minya', ar: 'سمالوط، المنيا' },
    hub: 'El Minya',
    coords: [28.31, 30.71],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'White Cement Plant', ar: 'مصنع أسمنت أبيض' },
    milestone: { en: 'Operational since 1989', ar: 'يعمل منذ 1989' },
    headline: { en: 'A legacy of white cement since 1989', ar: 'إرثٌ في الأسمنت الأبيض منذ 1989' },
    about: {
      en: 'Since 1989, Cleopatra Cement has manufactured white cement in Samalout, El Minya, for construction markets in Egypt and abroad. Its high-strength White Portland Cement, CEM I 52.5N, is used in more than 20 countries and backed by a verified Environmental Product Declaration.',
      ar: 'منذ عام 1989، تصنّع أسمنت كليوباترا الأسمنت الأبيض في سمالوط بالمنيا لأسواق البناء في مصر وخارجها. ويُستخدم أسمنتها البورتلاندي الأبيض عالي المقاومة CEM I 52.5N في أكثر من 20 دولة، مدعومًا بإقرار بيئي موثّق للمنتج (EPD).',
    },
    facts: [
      f('Clinker capacity', 'طاقة الكلنكر', '300,000 t / year', '300 ألف طن سنويًا'),
      f('Cement capacity', 'طاقة الأسمنت', '420,000 t / year', '420 ألف طن سنويًا'),
      f('International presence', 'الحضور الدولي', '20+ countries', 'أكثر من 20 دولة'),
      f('Flagship product', 'المنتج الرئيسي', 'CEM I 52.5N white', 'CEM I 52.5N أبيض'),
    ],
    photo: 'cleopatra',
    logo: '/iti/logos/cleopatra.png',
    url: 'https://cleopatracement.com',
  },
  {
    id: 'cyprometal',
    market: 'egypt',
    name: 'Cyprometal Industries',
    monogram: 'CYP',
    city: { en: 'El Minya', ar: 'المنيا' },
    hub: 'El Minya',
    coords: [27.84, 30.62],
    sector: 'metals',
    status: 'construction',
    kind: { en: 'Zinc Refining — SHG Zinc', ar: 'تكرير الزنك عالي الجودة' },
    milestone: { en: 'Completion Q4 2026', ar: 'الاكتمال: الربع الرابع 2026' },
    investment: '$200M',
    headline: { en: 'Advancing Egypt’s non-ferrous metals industry', ar: 'نرتقي بصناعة المعادن غير الحديدية في مصر' },
    about: {
      en: 'Established in 2021, Cyprometal Industries is developing zinc refining that turns primary and secondary raw materials into Special High Grade zinc to London Metal Exchange standards, using enclosed hybrid technology focused on dust containment, material recovery and waste reduction.',
      ar: 'تأسست سيبروميتال للصناعات عام 2021، وتطوّر عمليات لتكرير الزنك تحوّل الخامات الأولية والثانوية إلى زنك عالي الجودة (SHG) وفق معايير بورصة لندن للمعادن، بتقنية هجينة مغلقة تركّز على احتواء الغبار واسترجاع المواد وتقليل المخلفات.',
    },
    facts: [
      f('Established', 'التأسيس', '2021', '2021'),
      f('Phase one', 'المرحلة الأولى', '50,000 t / year', '50 ألف طن سنويًا'),
      f('Planned', 'الطاقة المخططة', '100,000 t / year', '100 ألف طن سنويًا'),
      f('Roadmap', 'خطة التوسّع', 'Copper, lead, rare earths', 'النحاس والرصاص والعناصر الأرضية النادرة'),
    ],
    photo: 'cyprometal',
    illustrative: true,
    logo: '/iti/logos/cyprometal.png',
    url: 'https://cyprometalindustries.com',
  },
  {
    id: 'bmic',
    market: 'egypt',
    name: 'BMIC',
    parent: 'Building Materials Industry Company',
    monogram: 'BMIC',
    city: { en: 'Assiut', ar: 'أسيوط' },
    coords: [27.18, 31.18],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Portland Cement Plant', ar: 'مصنع أسمنت بورتلاندي رمادي' },
    milestone: { en: 'Producing since 2012', ar: 'ينتج منذ 2012' },
    headline: { en: 'Strengthening construction in Upper Egypt', ar: 'نعزّز قطاع البناء في صعيد مصر' },
    about: {
      en: 'Founded in 2007 with an investment exceeding EGP 2 billion, BMIC brought modern cement manufacturing to Upper Egypt. Since production began in 2012, its Al Tameer brand has supplied residential, commercial and national infrastructure projects across Egypt.',
      ar: 'تأسست BMIC عام 2007 باستثمارات تتجاوز ملياري جنيه مصري، لتجلب صناعة الأسمنت الحديثة إلى صعيد مصر. ومنذ بدء الإنتاج عام 2012، تورّد علامتها «التعمير» لمشروعات سكنية وتجارية وبنية تحتية قومية في أنحاء مصر.',
    },
    facts: [
      f('Established', 'التأسيس', '2007', '2007'),
      f('Annual capacity', 'الطاقة السنوية', '1.5 million tonnes', '1.5 مليون طن'),
      f('Founding investment', 'الاستثمار التأسيسي', 'EGP 2 billion+', 'أكثر من ملياري جنيه'),
      f('Brand', 'العلامة التجارية', 'Al Tameer', 'التعمير'),
    ],
    photo: 'bmic',
    logo: '/iti/logos/bmic.png',
    url: 'https://bmicement.com',
  },

  /* ---------------- United States ---------------- */
  {
    id: 'sesco-houston',
    market: 'usa',
    name: 'SESCO Cement',
    parent: 'Houston Terminal',
    monogram: 'SES',
    city: { en: 'Houston, Texas', ar: 'هيوستن، تكساس' },
    coords: [29.73, -95.05],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'Port Cement Terminal', ar: 'محطة أسمنت بحرية' },
    milestone: { en: 'Largest privately held port cement terminal globally', ar: 'أكبر محطة أسمنت بحرية مملوكة للقطاع الخاص عالميًا' },
    headline: { en: 'Connecting cement to global markets', ar: 'نربط الأسمنت بالأسواق العالمية' },
    about: {
      en: 'Established in 2014, SESCO Cement imports, stores and distributes cement across the U.S. Gulf Coast and Southeast. Its Houston terminal combines direct port access, advanced vessel unloading, bulk storage, automated packing lines and rail connectivity.',
      ar: 'تأسست SESCO للأسمنت عام 2014، وتعمل في استيراد الأسمنت وتخزينه وتوزيعه على امتداد ساحل الخليج والجنوب الشرقي للولايات المتحدة. وتجمع محطتها في هيوستن بين الوصول المباشر إلى الميناء، وأنظمة متقدمة لتفريغ السفن، والتخزين السائب، وخطوط تعبئة آلية، والربط بالسكك الحديدية.',
    },
    facts: [
      f('Established', 'التأسيس', '2014', '2014'),
      f('Houston storage', 'سعة هيوستن', '250,000 tonnes', '250 ألف طن'),
      f('Network storage', 'سعة الشبكة', '≈350,000 tonnes', 'نحو 350 ألف طن'),
      f('Connectivity', 'الربط', 'Deep-water berth · rail', 'رصيف بحري · سكك حديدية'),
    ],
    photo: 'sesco-houston',
    logo: '/iti/logos/sesco.png',
    url: 'https://sescocement.com',
  },
  {
    id: 'sesco-tampa',
    market: 'usa',
    name: 'SESCO Cement',
    parent: 'Tampa Terminal',
    monogram: 'SES',
    city: { en: 'Tampa, Florida', ar: 'تامبا، فلوريدا' },
    coords: [27.9, -82.44],
    sector: 'cement-terminals',
    status: 'construction',
    kind: { en: 'Port Cement Terminal', ar: 'محطة أسمنت بحرية' },
    milestone: { en: 'Operational mid-year', ar: 'التشغيل: منتصف العام' },
    about: {
      en: 'Positioned to become the second largest cement terminal globally, SESCO’s Tampa terminal adds 100,000 tonnes of storage and strengthens the network across the U.S. Southeast.',
      ar: 'في طريقها لتصبح ثاني أكبر محطة أسمنت في العالم، تضيف محطة SESCO في تامبا سعة تخزين تبلغ 100 ألف طن، وتعزّز الشبكة على امتداد الجنوب الشرقي للولايات المتحدة.',
    },
    facts: [
      f('Tampa storage', 'سعة تامبا', '100,000 tonnes', '100 ألف طن'),
      f('Coast', 'الساحل', 'Florida Gulf Coast', 'ساحل خليج فلوريدا'),
    ],
    photo: 'sesco-tampa',
    logo: '/iti/logos/sesco.png',
    url: 'https://sescocement.com',
  },

  /* ---------------- Europe ---------------- */
  {
    id: 'royal-eu',
    market: 'europe',
    name: 'Royal Cement EU',
    monogram: 'RCE',
    city: { en: 'Pszczółki, Poland', ar: 'بشتشوكي، بولندا' },
    hub: 'Gdansk',
    coords: [54.17, 18.7],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'White Cement Distribution', ar: 'توزيع الأسمنت الأبيض' },
    milestone: { en: 'European representative of Royal El Minya', ar: 'الممثل الأوروبي لأسمنت المنيا رويال' },
    headline: { en: 'Bringing Egyptian white cement to Europe', ar: 'نحمل الأسمنت الأبيض المصري إلى أوروبا' },
    about: {
      en: 'Royal Cement EU is the European commercial representative of Royal El Minya Cement. From Poland it supports product availability, regulatory documentation and market access, connecting Royal El Minya’s white cement with customers and partners across Europe.',
      ar: 'Royal Cement EU هي الممثل التجاري الأوروبي لأسمنت المنيا رويال. ومن بولندا تدعم توافر المنتجات والوثائق التنظيمية والنفاذ إلى الأسواق، لتربط الأسمنت الأبيض من رويال المنيا بالعملاء والشركاء في أنحاء أوروبا.',
    },
    facts: [
      f('Parent manufacturer', 'الشركة المصنّعة', 'Royal El Minya Cement', 'أسمنت المنيا رويال'),
      f('Manufacturing base', 'قاعدة التصنيع', 'El Minya, Egypt', 'المنيا، مصر'),
      f('Market focus', 'السوق المستهدف', 'European Union', 'الاتحاد الأوروبي'),
    ],
    photo: 'royal-elminya',
    logo: '/iti/logos/royal-elminya.png',
    url: 'https://www.royalcement.eu',
  },
  {
    id: 'eu-gdansk',
    market: 'europe',
    name: 'Gdańsk Terminal',
    parent: 'Royal Cement EU',
    monogram: 'GDN',
    city: { en: 'Gdańsk, Poland', ar: 'غدانسك، بولندا' },
    hub: 'Gdansk',
    coords: [54.39, 18.66],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'Cement Terminal', ar: 'محطة أسمنت' },
    milestone: { en: 'Operational', ar: 'قيد التشغيل' },
    about: {
      en: 'A Royal Cement EU terminal in Gdańsk, Poland, supporting the availability of Royal El Minya white cement in European markets.',
      ar: 'محطة تابعة لـ Royal Cement EU في غدانسك ببولندا، تدعم توافر الأسمنت الأبيض من رويال المنيا في الأسواق الأوروبية.',
    },
    photo: 'eu-gdansk',
    logo: '/iti/logos/royal-elminya.png',
    url: 'https://www.royalcement.eu',
  },
  {
    id: 'eu-benelux',
    market: 'europe',
    name: 'Benelux Terminal',
    parent: 'Royal Cement EU',
    monogram: 'BNL',
    city: { en: 'Netherlands', ar: 'هولندا' },
    coords: [51.92, 4.4],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'Cement Terminal', ar: 'محطة أسمنت' },
    milestone: { en: 'Operational', ar: 'قيد التشغيل' },
    about: {
      en: 'A Royal Cement EU terminal in the Netherlands, serving the Benelux markets with Royal El Minya white cement.',
      ar: 'محطة تابعة لـ Royal Cement EU في هولندا، تخدم أسواق البنلوكس بالأسمنت الأبيض من رويال المنيا.',
    },
    photo: 'eu-benelux',
    logo: '/iti/logos/royal-elminya.png',
    url: 'https://www.royalcement.eu',
  },
  {
    id: 'eu-ravenna',
    market: 'europe',
    name: 'Ravenna Terminal',
    parent: 'Royal Cement EU',
    monogram: 'RAV',
    city: { en: 'Ravenna, Italy', ar: 'رافينا، إيطاليا' },
    coords: [44.46, 12.26],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'Cement Terminal', ar: 'محطة أسمنت' },
    milestone: { en: 'Operational', ar: 'قيد التشغيل' },
    about: {
      en: 'A Royal Cement EU terminal in Ravenna, Italy, supporting the availability of Royal El Minya white cement in southern Europe.',
      ar: 'محطة تابعة لـ Royal Cement EU في رافينا بإيطاليا، تدعم توافر الأسمنت الأبيض من رويال المنيا في جنوب أوروبا.',
    },
    photo: 'eu-ravenna',
    logo: '/iti/logos/royal-elminya.png',
    url: 'https://www.royalcement.eu',
  },
]

/** City labels on the zoomed maps — `at` is the city point [lat, lng]; offsets are applied by the map */
export const CITY_LABELS: { market: PlantMarket; name: L; at: [number, number] }[] = [
  { market: 'egypt', name: { en: 'Alexandria', ar: 'الإسكندرية' }, at: [31.12, 29.88] },
  { market: 'egypt', name: { en: 'El Minya', ar: 'المنيا' }, at: [28.1, 30.75] },
  { market: 'egypt', name: { en: 'Assiut', ar: 'أسيوط' }, at: [27.18, 31.18] },
  { market: 'usa', name: { en: 'Houston', ar: 'هيوستن' }, at: [29.73, -95.05] },
  { market: 'usa', name: { en: 'Tampa', ar: 'تامبا' }, at: [27.9, -82.44] },
  { market: 'europe', name: { en: 'Gdańsk', ar: 'غدانسك' }, at: [54.3, 18.68] },
  { market: 'europe', name: { en: 'Ravenna', ar: 'رافينا' }, at: [44.46, 12.26] },
  { market: 'europe', name: { en: 'Netherlands', ar: 'هولندا' }, at: [51.92, 4.4] },
]

/**
 * Export & distribution lanes drawn on the globe — all from the Word profiles:
 * European Co. exports from Al Dekheila; Royal El Minya distributes directly in the
 * United States, Poland, Saudi Arabia and South Korea; Royal Cement EU terminals in PL / IT / NL.
 */
export const LANE_ORIGIN: [number, number] = [31.13, 29.8]
export const LANES: { id: string; to: [number, number]; label?: L }[] = [
  { id: 'houston', to: [29.73, -95.05] },
  { id: 'tampa', to: [27.9, -82.44] },
  { id: 'gdansk', to: [54.39, 18.66] },
  { id: 'ravenna', to: [44.46, 12.26] },
  { id: 'benelux', to: [51.92, 4.4] },
  { id: 'saudi', to: [24, 45] },
  { id: 'korea', to: [36.3, 127.9], label: { en: 'South Korea', ar: 'كوريا الجنوبية' } },
]

/* ------------------------------------------------------------------ */
/* Group businesses — company-level view, grouped as in the Word file  */
/* ------------------------------------------------------------------ */

export interface Business {
  id: string
  name: string
  location: L
  headline: L
  logo?: string
  monogram: string
  /** The map site this company opens */
  asset: string
}

export const BUSINESS_GROUPS: { id: string; title: L; items: Business[] }[] = [
  {
    id: 'grey',
    title: { en: 'Grey Cement', ar: 'الأسمنت الرمادي' },
    items: [
      {
        id: 'amreyah',
        name: 'Amreyah Cement',
        location: { en: 'Alexandria, Egypt', ar: 'الإسكندرية، مصر' },
        headline: { en: 'Building on a legacy since 1987', ar: 'نبني على إرثٍ منذ 1987' },
        logo: '/iti/logos/amreyah.png',
        monogram: 'AMR',
        asset: 'amreyah',
      },
      {
        id: 'bmic',
        name: 'BMIC',
        location: { en: 'Assiut, Egypt', ar: 'أسيوط، مصر' },
        headline: { en: 'Strengthening construction in Upper Egypt', ar: 'نعزّز قطاع البناء في صعيد مصر' },
        logo: '/iti/logos/bmic.png',
        monogram: 'BMIC',
        asset: 'bmic',
      },
    ],
  },
  {
    id: 'white',
    title: { en: 'White Cement', ar: 'الأسمنت الأبيض' },
    items: [
      {
        id: 'royal-elminya',
        name: 'Royal El Minya Cement',
        location: { en: 'El Minya, Egypt', ar: 'المنيا، مصر' },
        headline: { en: 'White cement. Global reach.', ar: 'أسمنت أبيض. وصول عالمي.' },
        logo: '/iti/logos/royal-elminya.png',
        monogram: 'REC',
        asset: 'royal-elminya',
      },
      {
        id: 'cleopatra',
        name: 'Cleopatra Cement',
        location: { en: 'Samalout, El Minya, Egypt', ar: 'سمالوط، المنيا، مصر' },
        headline: { en: 'A legacy of white cement since 1989', ar: 'إرثٌ في الأسمنت الأبيض منذ 1989' },
        logo: '/iti/logos/cleopatra.png',
        monogram: 'CLC',
        asset: 'cleopatra',
      },
    ],
  },
  {
    id: 'industrial',
    title: { en: 'Other Industrial Sectors', ar: 'قطاعات صناعية أخرى' },
    items: [
      {
        id: 'cyprometal',
        name: 'Cyprometal Industries',
        location: { en: 'El Minya, Egypt', ar: 'المنيا، مصر' },
        headline: { en: 'Advancing Egypt’s non-ferrous metals industry', ar: 'نرتقي بصناعة المعادن غير الحديدية في مصر' },
        logo: '/iti/logos/cyprometal.png',
        monogram: 'CYP',
        asset: 'cyprometal',
      },
      {
        id: 'ventura',
        name: 'Ventura Cables',
        location: { en: 'Alexandria, Egypt', ar: 'الإسكندرية، مصر' },
        headline: { en: 'Connecting power to progress', ar: 'نوصل الطاقة بالتقدّم' },
        logo: '/iti/logos/ventura.png',
        monogram: 'VEN',
        asset: 'ventura',
      },
    ],
  },
  {
    id: 'terminals',
    title: { en: 'Cement Terminals', ar: 'محطات الأسمنت' },
    items: [
      {
        id: 'european',
        name: 'European Co.',
        location: { en: 'Al Dekheila Port, Egypt', ar: 'ميناء الدخيلة، مصر' },
        headline: { en: 'Connecting cement to global markets', ar: 'نربط الأسمنت بالأسواق العالمية' },
        // white background keyed out (colour-to-alpha) so the mark sits on Mist Gray
        logo: '/iti/logos/european-clear.png',
        monogram: 'EUR',
        asset: 'european',
      },
      {
        id: 'sesco',
        name: 'SESCO Cement',
        location: { en: 'Houston · Tampa, USA', ar: 'هيوستن · تامبا، الولايات المتحدة' },
        headline: { en: 'Cement import, terminals and distribution', ar: 'استيراد الأسمنت ومحطاته وتوزيعه' },
        // white background keyed out (colour-to-alpha) so the mark sits on Mist Gray
        logo: '/iti/logos/sesco-clear.png',
        monogram: 'SES',
        asset: 'sesco-houston',
      },
      {
        id: 'royal-eu',
        name: 'Royal Cement EU',
        location: { en: 'Pszczółki, Poland', ar: 'بشتشوكي، بولندا' },
        headline: { en: 'Bringing Egyptian white cement to Europe', ar: 'نحمل الأسمنت الأبيض المصري إلى أوروبا' },
        logo: '/iti/logos/royal-elminya.png',
        monogram: 'RCE',
        asset: 'royal-eu',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Page copy                                                           */
/* ------------------------------------------------------------------ */

export const COPY = {
  meta: {
    title: { en: 'ITI Group — Building Industries That Move The World', ar: 'مجموعة ITI — نبني صناعات تُحرّك العالم' },
  },
  nav: {
    about: { en: 'About', ar: 'من نحن' },
    vision: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' },
    values: { en: 'Values', ar: 'القيم' },
    businesses: { en: 'Businesses', ar: 'شركاتنا' },
    footprint: { en: 'Global Footprint', ar: 'حضورنا العالمي' },
    contact: { en: 'Contact', ar: 'تواصل معنا' },
    switchLang: { en: 'العربية', ar: 'English' },
    menu: { en: 'Menu', ar: 'القائمة' },
    close: { en: 'Close', ar: 'إغلاق' },
  },
  hero: {
    eyebrow: { en: 'Built for Global Growth', ar: 'مبنيّة للنمو العالمي' },
    title: { en: 'Building industries that move the world', ar: 'نبني صناعات تُحرّك العالم' },
    lead: {
      en: 'A global industrial platform driving strategic investments across infrastructure, building materials, mining, and non-ferrous metals.',
      ar: 'منصة صناعية عالمية تقود استثمارات استراتيجية في البنية التحتية ومواد البناء والتعدين والمعادن غير الحديدية.',
    },
    ctaPrimary: { en: 'Explore our footprint', ar: 'اكتشف حضورنا العالمي' },
    ctaSecondary: { en: 'About ITI Group', ar: 'تعرّف على المجموعة' },
    countries: { en: 'Egypt · United States · Saudi Arabia · United Kingdom · Poland · Netherlands · Italy', ar: 'مصر · الولايات المتحدة · السعودية · المملكة المتحدة · بولندا · هولندا · إيطاليا' },
    scroll: { en: 'Scroll', ar: 'مرّر' },
    /** Background slider — real Group sites only (photos from the Neusoft brand pack), Egypt and the U.S. alternating */
    slides: [
      { photo: 'hero', pos: '62% 50%', caption: { en: 'Royal El Minya Cement · El Minya, Egypt', ar: 'أسمنت المنيا رويال · المنيا، مصر' } },
      { photo: 'sesco-houston', pos: '50% 55%', caption: { en: 'SESCO Cement · Houston, Texas', ar: 'SESCO للأسمنت · هيوستن، تكساس' } },
      { photo: 'amreyah-aerial', pos: '50% 60%', caption: { en: 'Amreyah Cement · Alexandria, Egypt', ar: 'أسمنت العامرية · الإسكندرية، مصر' } },
      { photo: 'sesco-tampa', pos: '55% 55%', caption: { en: 'SESCO Cement · Tampa, Florida', ar: 'SESCO للأسمنت · تامبا، فلوريدا' } },
      { photo: 'cleopatra', pos: '50% 50%', caption: { en: 'Cleopatra Cement · Samalout, El Minya', ar: 'أسمنت كليوباترا · سمالوط، المنيا' } },
      { photo: 'bmic', pos: '60% 50%', caption: { en: 'BMIC · Assiut, Egypt', ar: 'BMIC · أسيوط، مصر' } },
    ] as { photo: string; pos: string; caption: L }[],
  },
  about: {
    eyebrow: { en: 'About Us', ar: 'من نحن' },
    /** a newline marks the display line break; the last words carry the copper accent */
    title: { en: 'An integrated industrial group\nwith a lasting legacy.', ar: 'مجموعة صناعية متكاملة\nذات إرثٍ راسخ.' },
    lead: {
      en: 'Rooted in Egypt and operating across North America, Europe and the Middle East, ITI Group builds and runs the industrial businesses that infrastructure depends on — and invests in them for the long term.',
      ar: 'انطلاقًا من مصر، وبعمليات في أمريكا الشمالية وأوروبا والشرق الأوسط، تبني مجموعة ITI وتدير الأعمال الصناعية التي تقوم عليها البنية التحتية، وتستثمر فيها على المدى الطويل.',
    },
    definesTitle: { en: 'Built to endure', ar: 'بُنيت لتدوم' },
    pillars: [
      {
        title: { en: 'Diversified industrial portfolio', ar: 'محفظة صناعية متنوعة' },
        body: {
          en: 'Infrastructure, building materials, mining and non-ferrous metals under one Group.',
          ar: 'البنية التحتية ومواد البناء والتعدين والمعادن غير الحديدية تحت مظلة مجموعة واحدة.',
        },
      },
      {
        title: { en: 'Integrated capabilities', ar: 'قدرات متكاملة' },
        body: {
          en: 'From production to storage, logistics and distribution — the value chain run end to end.',
          ar: 'من الإنتاج إلى التخزين والخدمات اللوجستية والتوزيع، ندير سلسلة القيمة من بدايتها إلى نهايتها.',
        },
      },
      {
        title: { en: 'Long-term value creation', ar: 'قيمة تدوم على المدى الطويل' },
        body: {
          en: 'Patient, strategic investment in businesses built to last for their markets and communities.',
          ar: 'استثمار استراتيجي طويل الأمد في أعمال تُبنى لتدوم لأسواقها ومجتمعاتها.',
        },
      },
    ] as { title: L; body: L }[],
  },
  /** Group figures — a snapshot strip in About */
  stats: [
    { value: 50, prefix: '', suffix: '+', label: { en: 'Years of Experience', ar: 'عامًا من الخبرة' } },
    { value: 2, prefix: '$', suffix: 'B+', label: { en: 'Annual Revenue', ar: 'إيرادات سنوية' } },
    { value: 8500, prefix: '', suffix: '', label: { en: 'Employees', ar: 'موظف' } },
    { value: 5, prefix: '', suffix: '', label: { en: 'Continents of Operations', ar: 'قارات نعمل فيها' } },
    { value: 40, prefix: '', suffix: 'M', label: { en: 'Tons of Materials Handled', ar: 'طن من المواد المُتداولة' } },
  ] as { value: number; prefix: string; suffix: string; label: L }[],
  /** Vision & Mission — today's mission, tomorrow's vision. Statements are the official ones, split into headline + supporting line */
  purpose: {
    eyebrow: { en: 'Our Purpose', ar: 'غايتنا' },
    /** a newline marks the display line break; the second line carries the copper accent */
    title: { en: 'What We Do &\nWhere We’re Going', ar: 'ما نفعله\nوإلى أين نتجه' },
    lead: { en: 'A clear mission for today and a bold vision for tomorrow.', ar: 'رسالة واضحة لليوم، ورؤية طموحة للغد.' },
  },
  mission: {
    eyebrow: { en: 'Our Mission', ar: 'رسالتنا' },
    headline: { en: 'We build and operate world-class industrial businesses.', ar: 'نبني ونُدير أعمالًا صناعية بمستوى عالمي.' },
    body: {
      en: 'Combining investment, expertise and integrated supply chains to create sustainable long-term value.',
      ar: 'نجمع فيها بين الاستثمار والخبرة وسلاسل الإمداد المتكاملة، لنصنع قيمة مستدامة على المدى الطويل.',
    },
  },
  vision: {
    eyebrow: { en: 'Our Vision', ar: 'رؤيتنا' },
    headline: { en: 'To be a global force in industrial investment.', ar: 'أن نكون قوة عالمية في الاستثمار الصناعي.' },
    body: {
      en: 'Building businesses that shape markets, connect industries, and create lasting value.',
      ar: 'نبني أعمالًا تُشكّل الأسواق، وتربط الصناعات، وتصنع قيمة تدوم.',
    },
  },
  values: {
    eyebrow: { en: 'Our Core Values', ar: 'قيمنا الأساسية' },
    title: { en: 'Six principles behind\nevery investment.', ar: 'ستة مبادئ وراء\nكل استثمار.' },
    lead: {
      en: 'The values that guide our decisions and shape how we build, operate, and grow our businesses.',
      ar: 'القيم التي توجّه قراراتنا، وتشكّل طريقتنا في بناء أعمالنا وتشغيلها وتنميتها.',
    },
    items: [
      {
        id: 'integrity',
        title: { en: 'Integrity', ar: 'النزاهة' },
        body: { en: 'We build trust through accountability, transparency, and doing what is right.', ar: 'نبني الثقة بالمساءلة والشفافية وفعل ما هو صواب.' },
      },
      {
        id: 'excellence',
        title: { en: 'Excellence', ar: 'التميّز' },
        body: { en: 'We set high standards, challenge performance, and continuously improve.', ar: 'نضع معايير عالية، ونرتقي بالأداء، ونتطوّر باستمرار.' },
      },
      {
        id: 'integration',
        title: { en: 'Integration', ar: 'التكامل' },
        body: { en: 'We connect businesses, capabilities, and supply chains to create greater value.', ar: 'نربط الأعمال والقدرات وسلاسل الإمداد لنصنع قيمة أكبر.' },
      },
      {
        id: 'innovation',
        title: { en: 'Innovation', ar: 'الابتكار' },
        body: { en: 'We challenge convention, embrace new ideas, and build better ways to operate and grow.', ar: 'نتحدّى المألوف، ونتبنّى الأفكار الجديدة، ونبتكر طرقًا أفضل للعمل والنمو.' },
      },
      {
        id: 'sustainability',
        title: { en: 'Sustainability', ar: 'الاستدامة' },
        body: {
          en: 'We build responsibly, creating long-term value for our businesses, people, communities, and environment.',
          ar: 'نبني بمسؤولية، ونصنع قيمة طويلة الأمد لأعمالنا وموظفينا ومجتمعاتنا وبيئتنا.',
        },
      },
      {
        id: 'value-creation',
        title: { en: 'Value Creation', ar: 'صناعة القيمة' },
        body: { en: 'We invest with discipline, execute with purpose, and create enduring value.', ar: 'نستثمر بانضباط، وننفّذ بهدف، ونصنع قيمة تدوم.' },
      },
    ] as { id: string; title: L; body: L }[],
  },
  businesses: {
    eyebrow: { en: 'Our Businesses', ar: 'شركاتنا' },
    title: { en: 'Independent strengths.\nOne integrated group.', ar: 'قوة كل شركة.\nمجموعة واحدة متكاملة.' },
    body: {
      en: 'From grey and white cement to non-ferrous metals and cement terminals, our businesses work together across the industrial value chain.',
      ar: 'من الأسمنت الرمادي والأبيض إلى المعادن غير الحديدية ومحطات الأسمنت، تعمل شركاتنا معًا على امتداد سلسلة القيمة الصناعية.',
    },
    all: { en: 'All', ar: 'الكل' },
    filterLabel: { en: 'Filter by sector', ar: 'تصفية حسب القطاع' },
    onMap: { en: 'View on the map', ar: 'اعرضها على الخريطة' },
    explore: { en: 'Explore our Global Footprint', ar: 'استكشف حضورنا العالمي' },
  },
  footprint: {
    eyebrow: { en: 'Global Footprint', ar: 'حضورنا العالمي' },
    title: { en: 'Global Operations & Strategic Expansion', ar: 'العمليات العالمية والتوسّع الاستراتيجي' },
    body: {
      en: 'An integrated international logistics and production network supporting global cement, cementitious products and industrial supply chains.',
      ar: 'شبكة دولية متكاملة للإنتاج والخدمات اللوجستية، تدعم سلاسل إمداد الأسمنت والمنتجات الأسمنتية والصناعة حول العالم.',
    },
    hint: { en: 'Hover a market to preview it, click to zoom in.', ar: 'مرّر على أي سوق لمعاينته، واضغط للتكبير.' },
    hintTouch: { en: 'Tap a market to zoom in.', ar: 'اضغط على أي سوق للتكبير.' },
    mapHintTouch: { en: 'Tap to explore', ar: 'اضغط للاستكشاف' },
    hintPlants: { en: 'Select a site to see its profile.', ar: 'اختر موقعًا لعرض نبذة عنه.' },
    markets: { en: 'Markets', ar: 'الأسواق' },
    sectors: { en: 'Sectors', ar: 'القطاعات' },
    allSectors: { en: 'All', ar: 'الكل' },
    back: { en: 'Back to globe', ar: 'العودة إلى الكرة الأرضية' },
    investment: { en: 'Total investment', ar: 'إجمالي الاستثمار' },
    sites: { en: 'sites', ar: 'مواقع' },
    countries: { en: 'countries', ar: 'دول' },
    plants: { en: 'plants', ar: 'مصانع' },
    operational: { en: 'Operational', ar: 'قيد التشغيل' },
    construction: { en: 'Under construction', ar: 'قيد الإنشاء' },
    visit: { en: 'Visit official website', ar: 'زيارة الموقع الرسمي' },
    close: { en: 'Close', ar: 'إغلاق' },
    explore: { en: 'Explore sites', ar: 'استكشف المواقع' },
    mapHint: { en: 'Hover to preview · Click to explore', ar: 'مرّر للمعاينة · اضغط للاستكشاف' },
    dragHint: { en: 'Drag to turn the globe', ar: 'اسحب لتدوير الكرة الأرضية' },
    clickExplore: { en: 'Click to explore', ar: 'اضغط للاستكشاف' },
    clickProfile: { en: 'Click for profile', ar: 'اضغط لعرض النبذة' },
    hq: { en: 'Head office · Barcelona', ar: 'المقر الرئيسي · برشلونة' },
    sitesList: { en: 'Sites', ar: 'المواقع' },
    illustrative: { en: 'Illustrative image', ar: 'صورة توضيحية' },
    hqRole: { en: 'ITI Group headquarters', ar: 'المقر الرئيسي لمجموعة ITI' },
    prev: { en: 'Previous site', ar: 'الموقع السابق' },
    next: { en: 'Next site', ar: 'الموقع التالي' },
    facts: { en: 'Company facts', ar: 'حقائق عن الشركة' },
    lanes: { en: 'Export & distribution lanes', ar: 'مسارات التصدير والتوزيع' },
    hqLinks: { en: 'Head-office links', ar: 'روابط المقر الرئيسي' },
    layers: { en: 'Map layers', ar: 'طبقات الخريطة' },
    layersHint: { en: 'Hover to preview on the globe · click to keep it on', ar: 'مرّر للمعاينة على الكرة · اضغط لإبقائها ظاهرة' },
    layersHintTouch: { en: 'Tap a layer to show it on the globe', ar: 'اضغط على طبقة لعرضها على الكرة' },
    distribution: { en: 'Royal El Minya direct distribution', ar: 'توزيع مباشر لأسمنت المنيا رويال' },
    mapLabel: { en: 'Interactive globe of ITI Group operations', ar: 'كرة أرضية تفاعلية لعمليات مجموعة ITI' },
  },
  contact: {
    eyebrow: { en: 'Contact us', ar: 'تواصل معنا' },
    title: { en: 'Let’s start a\nconversation.', ar: 'لنبدأ\nحوارًا.' },
    body: {
      en: 'Whether you’re exploring a partnership, a commercial opportunity, or have a general inquiry, our team is here to help.',
      ar: 'سواء كنت تستكشف شراكة أو فرصة تجارية أو لديك استفسار عام، فريقنا هنا لمساعدتك.',
    },
    email: { en: 'Email', ar: 'البريد الإلكتروني' },
    website: { en: 'Website', ar: 'الموقع الإلكتروني' },
    office: { en: 'Head office', ar: 'المقر الرئيسي' },
    address: { en: 'Rambla de Catalunya 18, Barcelona, Spain', ar: 'رامبلا دي كاتالونيا 18، برشلونة، إسبانيا' },
    cta: { en: 'Write to us', ar: 'راسلنا' },
    copy: { en: 'Copy email', ar: 'انسخ البريد' },
    copied: { en: 'Copied', ar: 'تم النسخ' },
    localTime: { en: 'Local time in Barcelona', ar: 'الوقت الآن في برشلونة' },
    beacon: { en: 'Barcelona · Head office', ar: 'برشلونة · المقر الرئيسي' },
    photoCaption: { en: 'SESCO Cement · Houston terminal', ar: 'SESCO للأسمنت · محطة هيوستن' },
  },
  footer: {
    tagline: { en: 'Built for Global Growth', ar: 'مبنيّة للنمو العالمي' },
    rights: { en: '© 2026 ITI Group. All rights reserved.', ar: '© 2026 مجموعة ITI. جميع الحقوق محفوظة.' },
    companies: { en: 'Group companies', ar: 'شركات المجموعة' },
    top: { en: 'Back to top', ar: 'العودة إلى الأعلى' },
  },
}

export const CONTACT = {
  email: 'inquiries@iti-spain.com',
  website: 'www.iti-spain.com',
  websiteUrl: 'https://www.iti-spain.com',
}

/* ------------------------------------------------------------------ */
/* Contact form — inquiry routes drawn from what the Group actually    */
/* does: cement & SCM, SHG zinc, cables, port terminals, investment    */
/* ------------------------------------------------------------------ */

export type InquiryId = 'partnership' | 'procurement' | 'distribution' | 'general'

export interface InquiryField {
  id: string
  label: L
  options: L[]
  optional?: boolean
}

/** Four routes into the Group. Each adds at most two short questions, only where they help the team route the message */
export const INQUIRIES: { id: InquiryId; title: L; fields: InquiryField[]; placeholder: L }[] = [
  {
    id: 'partnership',
    title: { en: 'Investment & Partnerships', ar: 'الاستثمار والشراكات' },
    fields: [
      {
        id: 'organisation',
        label: { en: 'Organisation type', ar: 'نوع الجهة' },
        optional: true,
        options: [
          { en: 'Industrial company', ar: 'شركة صناعية' },
          { en: 'Investor or fund', ar: 'مستثمر أو صندوق' },
          { en: 'Financial institution', ar: 'مؤسسة مالية' },
          { en: 'Government or public entity', ar: 'جهة حكومية أو عامة' },
          { en: 'Other', ar: 'أخرى' },
        ],
      },
      {
        id: 'sector',
        label: { en: 'Sector of interest', ar: 'القطاع محل الاهتمام' },
        optional: true,
        options: [
          { en: 'Cement and building materials', ar: 'الأسمنت ومواد البناء' },
          { en: 'Terminals and logistics', ar: 'المحطات والخدمات اللوجستية' },
          { en: 'Non-ferrous metals', ar: 'المعادن غير الحديدية' },
          { en: 'Infrastructure', ar: 'البنية التحتية' },
          { en: 'Other', ar: 'أخرى' },
        ],
      },
    ],
    placeholder: { en: 'The opportunity, its scale and the role you see for ITI Group…', ar: 'الفرصة وحجمها والدور الذي تراه لمجموعة ITI…' },
  },
  {
    id: 'procurement',
    title: { en: 'Procurement & Suppliers', ar: 'المشتريات والموردون' },
    fields: [
      {
        id: 'supplies',
        label: { en: 'You supply', ar: 'ما تورّده' },
        optional: true,
        options: [
          { en: 'Equipment and spare parts', ar: 'معدات وقطع غيار' },
          { en: 'Raw materials and fuels', ar: 'مواد خام ووقود' },
          { en: 'Engineering and technical services', ar: 'خدمات هندسية وفنية' },
          { en: 'Shipping and freight', ar: 'الشحن والنقل' },
          { en: 'Other', ar: 'أخرى' },
        ],
      },
    ],
    placeholder: { en: 'What you offer, your references, and the operations it applies to…', ar: 'ما تقدّمه، ومراجعك، والعمليات المعنية…' },
  },
  {
    id: 'distribution',
    title: { en: 'Distribution & Logistics', ar: 'التوزيع والخدمات اللوجستية' },
    fields: [
      {
        id: 'product',
        label: { en: 'Product', ar: 'المنتج' },
        optional: true,
        options: [
          { en: 'Grey cement', ar: 'أسمنت رمادي' },
          { en: 'White cement', ar: 'أسمنت أبيض' },
          { en: 'Supplementary cementitious materials', ar: 'مواد أسمنتية تكميلية' },
          { en: 'Special High Grade zinc', ar: 'زنك عالي الجودة (SHG)' },
          { en: 'Cables', ar: 'كابلات' },
          { en: 'Terminal services', ar: 'خدمات المحطات' },
        ],
      },
      {
        id: 'terminal',
        label: { en: 'Terminal or region', ar: 'المحطة أو المنطقة' },
        optional: true,
        options: [
          { en: 'Alexandria, Egypt', ar: 'الإسكندرية، مصر' },
          { en: 'Houston, Texas', ar: 'هيوستن، تكساس' },
          { en: 'Tampa, Florida', ar: 'تامبا، فلوريدا' },
          { en: 'Gdańsk, Poland', ar: 'غدانسك، بولندا' },
          { en: 'Ravenna, Italy', ar: 'رافينا، إيطاليا' },
          { en: 'Benelux', ar: 'البنلوكس' },
          { en: 'Other or not sure', ar: 'أخرى أو لم أحدد' },
        ],
      },
    ],
    placeholder: { en: 'Volumes, delivery terms and timing, bulk or bagged…', ar: 'الكميات، شروط التسليم والتوقيت، سائب أو معبأ…' },
  },
  {
    id: 'general',
    title: { en: 'General Inquiry', ar: 'استفسار عام' },
    fields: [],
    placeholder: { en: 'Tell us about your inquiry, opportunity, or request…', ar: 'أخبرنا عن استفسارك أو الفرصة أو طلبك…' },
  },
]

export const CONTACT_FORM = {
  type: { en: 'Inquiry type', ar: 'نوع الاستفسار' },
  name: { en: 'Full name', ar: 'الاسم الكامل' },
  namePh: { en: 'Your full name', ar: 'اسمك الكامل' },
  email: { en: 'Business email', ar: 'البريد الإلكتروني للعمل' },
  emailPh: { en: 'name@company.com', ar: 'name@company.com' },
  company: { en: 'Company / Organization', ar: 'الشركة / الجهة' },
  companyPh: { en: 'Organization name', ar: 'اسم الجهة' },
  country: { en: 'Country', ar: 'الدولة' },
  countryPh: { en: 'Select country', ar: 'اختر الدولة' },
  message: { en: 'Your message', ar: 'رسالتك' },
  choose: { en: 'Select', ar: 'اختر' },
  required: { en: 'required', ar: 'مطلوب' },
  submit: { en: 'Send inquiry', ar: 'أرسل الاستفسار' },
  submitNote: {
    en: 'Opens your email app with the inquiry addressed to our team. Nothing is sent until you press send.',
    ar: 'يفتح تطبيق البريد لديك والرسالة موجّهة إلى فريقنا، ولا يُرسل شيء حتى تضغط إرسال.',
  },
  errors: {
    topic: { en: 'Select an inquiry type.', ar: 'اختر نوع الاستفسار.' },
    required: { en: 'This field is required.', ar: 'هذا الحقل مطلوب.' },
    email: { en: 'Enter a valid email address, e.g. name@company.com.', ar: 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@company.com.' },
    message: { en: 'Please add a few more details (at least 20 characters).', ar: 'أضف مزيدًا من التفاصيل (20 حرفًا على الأقل).' },
    summary: { en: 'Please review the highlighted fields.', ar: 'يُرجى مراجعة الحقول المحددة.' },
  },
  doneTitle: { en: 'Your inquiry is ready in your email app.', ar: 'رسالتك جاهزة في تطبيق البريد.' },
  doneBody: {
    en: 'Review it and press send to reach our team. If no email app opened, copy the inquiry and send it to',
    ar: 'راجعها واضغط إرسال لتصل إلى فريقنا. إن لم يُفتح تطبيق البريد، انسخ الرسالة وأرسلها إلى',
  },
  copyInquiry: { en: 'Copy inquiry', ar: 'انسخ الرسالة' },
  copiedInquiry: { en: 'Copied', ar: 'تم النسخ' },
  edit: { en: 'Edit inquiry', ar: 'عدّل الرسالة' },
}
