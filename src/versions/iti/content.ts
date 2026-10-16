/**
 * ITI Group landing page — all copy and map data, English + Arabic.
 * Source of truth: "ITI Brief.pdf" (2026 corporate brief) and the brand guideline.
 *
 * Arabic copy is a first translation and must be reviewed by the ITI team before launch.
 * Official website URLs are placeholders (see `PLACEHOLDER_URL`) until ITI supplies them.
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
  /** "plants": zoom to plant level with pins. "overview": country highlight + overview card only. */
  depth: 'plants' | 'overview'
  investment: string
  headline: L
  summary: L
  points?: L[]
  photo: string
  /** Sector mood image from the brand guideline, not a photo of the actual site */
  illustrative?: boolean
}

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
    photo: '/iti/photos/royal-elminya.jpg',
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
      en: 'A significant industrial and logistics footprint in the United States, supported by strategic investments totalling $450 million.',
      ar: 'حضور صناعي ولوجستي واسع في الولايات المتحدة، تدعمه استثمارات استراتيجية بقيمة إجمالية تبلغ 450 مليون دولار.',
    },
    photo: '/iti/photos/usa-houston-berth.jpg',
  },
  {
    id: 'europe',
    iso: ['616', '528', '380', '826'],
    isoUnderConstruction: ['826'],
    name: { en: 'Europe', ar: 'أوروبا' },
    anchor: [49.5, 11],
    frame: [
      [58.6, -7.5],
      [54.8, 24.1],
      [49.0, 24.1],
      [37.0, 15.6],
      [38.5, 8.2],
      [50.0, -5.5],
    ],
    depth: 'overview',
    investment: '$110M',
    headline: { en: 'Cement terminals.', ar: 'محطات الأسمنت.' },
    summary: {
      en: 'Operational cement plants and terminals in Poland, the Netherlands and Italy.',
      ar: 'مصانع ومحطات أسمنت عاملة في بولندا وهولندا وإيطاليا.',
    },
    points: [
      { en: 'Operational: Poland, Netherlands, Italy', ar: 'عاملة: بولندا، هولندا، إيطاليا' },
      {
        en: 'Expansion: large-scale port cement terminal under construction in the United Kingdom',
        ar: 'توسّع: محطة أسمنت بحرية كبرى قيد الإنشاء في المملكة المتحدة',
      },
    ],
    photo: '/iti/photos/europe.jpg',
    illustrative: true,
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
    ],
    photo: '/iti/photos/saudi.jpg',
    illustrative: true,
  },
]

/* ------------------------------------------------------------------ */
/* Assets — plant-level detail, Egypt and the United States only       */
/* ------------------------------------------------------------------ */

export interface Asset {
  id: string
  market: 'egypt' | 'usa'
  name: string
  monogram: string
  city: L
  /** [lat, lng] — approximate, city-level */
  coords: [number, number]
  sector: SectorId
  status: 'operational' | 'construction'
  kind: L
  /** "Operational since 1989" / "Completion Q4 2026" etc. */
  milestone: L
  investment?: string
  about: L
  photo: string
  /** Sector mood image from the brand guideline, not a photo of the actual site */
  illustrative?: boolean
  logo?: string
  url: string
}

export const ASSETS: Asset[] = [
  {
    id: 'amreyah',
    market: 'egypt',
    name: 'Amreyah Building Materials',
    monogram: 'AMR',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    coords: [30.97, 29.78],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Cement Plant', ar: 'مصنع أسمنت رمادي' },
    milestone: { en: 'Operational since 1989', ar: 'يعمل منذ 1989' },
    about: {
      en: 'Grey cement production in Alexandria, the earliest plant in the Group’s Egyptian portfolio.',
      ar: 'إنتاج الأسمنت الرمادي في الإسكندرية، وأقدم مصانع المجموعة في محفظتها المصرية.',
    },
    photo: '/iti/photos/amreyah.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'cimpor',
    market: 'egypt',
    name: 'Cimpor Cement Egypt',
    monogram: 'CIM',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    coords: [30.83, 30.02],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Cement Plant', ar: 'مصنع أسمنت رمادي' },
    milestone: { en: 'Operational since 2004', ar: 'يعمل منذ 2004' },
    about: {
      en: 'Grey cement plant in Alexandria, part of the Group’s vertically integrated cement network.',
      ar: 'مصنع أسمنت رمادي في الإسكندرية، ضمن شبكة الأسمنت المتكاملة رأسيًا للمجموعة.',
    },
    photo: '/iti/photos/cimpor.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'ventura',
    market: 'egypt',
    name: 'Ventura Cables',
    monogram: 'VEN',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    coords: [30.8, 29.53],
    sector: 'metals',
    status: 'construction',
    kind: { en: 'Copper & Aluminium Cable Manufacturing', ar: 'تصنيع كابلات النحاس والألومنيوم' },
    milestone: { en: 'Completion Q3 2026', ar: 'الاكتمال: الربع الثالث 2026' },
    investment: '$80M',
    about: {
      en: 'Copper and aluminium cable manufacturing, extending the Group into non-ferrous metals.',
      ar: 'تصنيع كابلات النحاس والألومنيوم، لتمتد المجموعة إلى قطاع المعادن غير الحديدية.',
    },
    photo: '/iti/photos/ventura.jpg',
    illustrative: true,
    logo: '/iti/logos/ventura.png',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'european',
    market: 'egypt',
    name: 'European for Investments',
    monogram: 'EFI',
    city: { en: 'Alexandria', ar: 'الإسكندرية' },
    coords: [31.08, 29.3],
    sector: 'port-terminals',
    status: 'construction',
    kind: { en: 'Marine Export Terminal', ar: 'محطة تصدير بحرية' },
    milestone: { en: 'Completion Q4 2026', ar: 'الاكتمال: الربع الرابع 2026' },
    about: {
      en: 'A large-scale marine export terminal with 75 Ktons of storage and annual throughput exceeding 2 million tons of cement.',
      ar: 'محطة تصدير بحرية كبرى بسعة تخزين 75 ألف طن، وطاقة مناولة سنوية تتجاوز مليوني طن من الأسمنت.',
    },
    photo: '/iti/photos/european.jpg',
    illustrative: true,
    logo: '/iti/logos/european.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'royal-elminya',
    market: 'egypt',
    name: 'Royal Elminya Cement',
    monogram: 'REC',
    city: { en: 'El Minya', ar: 'المنيا' },
    coords: [28.32, 30.6],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'White Cement Plant', ar: 'مصنع أسمنت أبيض' },
    milestone: { en: 'Operational since 2010', ar: 'يعمل منذ 2010' },
    about: {
      en: 'White cement production in Upper Egypt, part of the Group’s El Minya cluster.',
      ar: 'إنتاج الأسمنت الأبيض في صعيد مصر، ضمن مجمّع المجموعة في المنيا.',
    },
    photo: '/iti/photos/royal-elminya.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'cleopatra',
    market: 'egypt',
    name: 'Cleopatra Cement',
    monogram: 'CLC',
    city: { en: 'El Minya', ar: 'المنيا' },
    coords: [28.08, 30.9],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'White Cement Plant', ar: 'مصنع أسمنت أبيض' },
    milestone: { en: 'Operational since 1994', ar: 'يعمل منذ 1994' },
    about: {
      en: 'White cement plant in El Minya, operating for three decades.',
      ar: 'مصنع أسمنت أبيض في المنيا، يعمل منذ ثلاثة عقود.',
    },
    photo: '/iti/photos/cleopatra.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'cyprometal',
    market: 'egypt',
    name: 'Cyprometal Industries',
    monogram: 'CYP',
    city: { en: 'El Minya', ar: 'المنيا' },
    coords: [27.84, 30.62],
    sector: 'metals',
    status: 'construction',
    kind: { en: 'Zinc Ingots Production Facility', ar: 'منشأة لإنتاج سبائك الزنك' },
    milestone: { en: 'Completion Q4 2026', ar: 'الاكتمال: الربع الرابع 2026' },
    investment: '$250M',
    about: {
      en: 'A zinc ingots production facility, the largest of the Group’s new projects in Egypt.',
      ar: 'منشأة لإنتاج سبائك الزنك، وهي أكبر مشروعات المجموعة الجديدة في مصر.',
    },
    photo: '/iti/photos/cyprometal.jpg',
    illustrative: true,
    logo: '/iti/logos/cyprometal.png',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'bmic',
    market: 'egypt',
    name: 'BMIC',
    monogram: 'BMIC',
    city: { en: 'Assiut', ar: 'أسيوط' },
    coords: [27.18, 31.18],
    sector: 'cement-plants',
    status: 'operational',
    kind: { en: 'Grey Cement Plant', ar: 'مصنع أسمنت رمادي' },
    milestone: { en: 'Operational since 2007', ar: 'يعمل منذ 2007' },
    about: {
      en: 'Grey cement plant in Assiut, the Group’s southernmost production site in Egypt.',
      ar: 'مصنع أسمنت رمادي في أسيوط، وهو أقصى مواقع إنتاج المجموعة جنوبًا في مصر.',
    },
    photo: '/iti/photos/bmic.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'sesco-houston',
    market: 'usa',
    name: 'Sesco Cement',
    monogram: 'SES',
    city: { en: 'Houston, Texas', ar: 'هيوستن، تكساس' },
    coords: [29.73, -95.05],
    sector: 'cement-terminals',
    status: 'operational',
    kind: { en: 'Port Cement Terminal', ar: 'محطة أسمنت بحرية' },
    milestone: { en: 'Largest privately held port cement terminal globally', ar: 'أكبر محطة أسمنت بحرية مملوكة للقطاع الخاص عالميًا' },
    about: {
      en: 'A strategic logistics hub serving key U.S. markets, with advanced infrastructure for bulk handling, storage and distribution.',
      ar: 'مركز لوجستي استراتيجي يخدم الأسواق الأمريكية الرئيسية، ببنية تحتية متقدمة للمناولة السائبة والتخزين والتوزيع.',
    },
    photo: '/iti/photos/sesco-houston.jpg',
    url: PLACEHOLDER_URL,
  },
  {
    id: 'sesco-tampa',
    market: 'usa',
    name: 'Sesco Cement Terminal',
    monogram: 'SES',
    city: { en: 'Tampa, Florida', ar: 'تامبا، فلوريدا' },
    coords: [27.9, -82.44],
    sector: 'cement-terminals',
    status: 'construction',
    kind: { en: 'Port Cement Terminal', ar: 'محطة أسمنت بحرية' },
    milestone: { en: 'Operational mid-year', ar: 'التشغيل: منتصف العام' },
    about: {
      en: 'Positioned to become the second largest cement terminal globally, strengthening presence across the U.S. East Coast.',
      ar: 'في طريقها لتصبح ثاني أكبر محطة أسمنت في العالم، لتعزّز الحضور على امتداد الساحل الشرقي للولايات المتحدة.',
    },
    photo: '/iti/photos/sesco-tampa.jpg',
    url: PLACEHOLDER_URL,
  },
]

/** City labels on the zoomed country maps — `at` is the city point [lat, lng]; offsets are applied by the map */
export const CITY_LABELS: { market: 'egypt' | 'usa'; name: L; at: [number, number] }[] = [
  { market: 'egypt', name: { en: 'Alexandria', ar: 'الإسكندرية' }, at: [31.12, 29.88] },
  { market: 'egypt', name: { en: 'El Minya', ar: 'المنيا' }, at: [28.1, 30.75] },
  { market: 'egypt', name: { en: 'Assiut', ar: 'أسيوط' }, at: [27.18, 31.18] },
  { market: 'usa', name: { en: 'Houston', ar: 'هيوستن' }, at: [29.73, -95.05] },
  { market: 'usa', name: { en: 'Tampa', ar: 'تامبا' }, at: [27.9, -82.44] },
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
  },
  about: {
    eyebrow: { en: 'About Us', ar: 'من نحن' },
    title: { en: 'An integrated industrial group, built over five decades.', ar: 'مجموعة صناعية متكاملة، بُنيت على مدى خمسة عقود.' },
    body: {
      en: 'ITI Group, in partnership with Sesco Group, is an international industrial conglomerate owning and operating a diversified portfolio of manufacturing and infrastructure assets across Egypt, the United States, Europe, and the Middle East. With a strong focus on cement, building materials, metals, industrial infrastructure, recycling, and expansion into mining, the group has established a significant presence through long-term strategic investments and export-driven industrial operations.',
      ar: 'مجموعة ITI، بالشراكة مع مجموعة Sesco، تكتّل صناعي دولي يمتلك ويدير محفظة متنوعة من الأصول الصناعية وأصول البنية التحتية في مصر والولايات المتحدة وأوروبا والشرق الأوسط. وبتركيز قوي على الأسمنت ومواد البناء والمعادن والبنية التحتية الصناعية وإعادة التدوير، مع التوسع في قطاع التعدين، رسّخت المجموعة حضورًا مؤثرًا عبر استثمارات استراتيجية طويلة الأمد وعمليات صناعية موجّهة للتصدير.',
    },
    highlightsTitle: { en: 'Key Highlights', ar: 'أبرز الملامح' },
    highlights: [
      { en: 'Long-standing industrial investor in Egypt', ar: 'مستثمر صناعي راسخ في مصر' },
      { en: 'Vertically integrated cement production and logistics network', ar: 'شبكة متكاملة رأسيًا لإنتاج الأسمنت والخدمات اللوجستية' },
      { en: 'Global operations across North America, Europe & the Middle East', ar: 'عمليات عالمية في أمريكا الشمالية وأوروبا والشرق الأوسط' },
      { en: 'Strong contributor to infrastructure development', ar: 'مساهم فاعل في تطوير البنية التحتية' },
      { en: 'Multi-billion industrial portfolio', ar: 'محفظة صناعية بمليارات الدولارات' },
    ] as L[],
  },
  stats: [
    { value: 50, prefix: '', suffix: '+', label: { en: 'Years of Excellence', ar: 'عامًا من التميّز' } },
    { value: 2, prefix: '$', suffix: 'B+', label: { en: 'Annual Revenue', ar: 'إيرادات سنوية' } },
    { value: 5, prefix: '', suffix: '+', label: { en: 'Continents of Operations', ar: 'قارات نعمل فيها' } },
    { value: 8500, prefix: '', suffix: '', label: { en: 'Employees', ar: 'موظف' } },
    { value: 40, prefix: '', suffix: 'M', label: { en: 'Tons of Materials Handled', ar: 'طن من المواد المُتداولة' } },
  ] as { value: number; prefix: string; suffix: string; label: L }[],
  vision: {
    eyebrow: { en: 'Our Vision', ar: 'رؤيتنا' },
    kicker: { en: 'Where we are going', ar: 'إلى أين نتجه' },
    body: {
      en: 'To be a global force in industrial investment, building businesses that shape markets, connect industries, and create lasting value.',
      ar: 'أن نكون قوة عالمية في الاستثمار الصناعي، نبني أعمالًا تُشكّل الأسواق، وتربط الصناعات، وتصنع قيمة تدوم.',
    },
  },
  mission: {
    eyebrow: { en: 'Our Mission', ar: 'رسالتنا' },
    kicker: { en: 'What we do to get there', ar: 'ما نفعله لنصل' },
    body: {
      en: 'We build and operate world-class industrial businesses, combining investment, expertise and integrated supply chains to create sustainable long-term value.',
      ar: 'نبني ونُدير أعمالًا صناعية بمستوى عالمي، نجمع فيها بين الاستثمار والخبرة وسلاسل الإمداد المتكاملة لنصنع قيمة مستدامة على المدى الطويل.',
    },
  },
  values: {
    eyebrow: { en: 'Our Core Values', ar: 'قيمنا الأساسية' },
    title: { en: 'Six principles behind every investment.', ar: 'ستة مبادئ وراء كل استثمار.' },
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
  footprint: {
    eyebrow: { en: 'Global Footprint', ar: 'حضورنا العالمي' },
    title: { en: 'Global Operations & Strategic Expansion', ar: 'العمليات العالمية والتوسّع الاستراتيجي' },
    body: {
      en: 'An integrated international logistics and production network supporting global cement, cementitious products and industrial supply chains.',
      ar: 'شبكة دولية متكاملة للإنتاج والخدمات اللوجستية، تدعم سلاسل إمداد الأسمنت والمنتجات الأسمنتية والصناعة حول العالم.',
    },
    hint: { en: 'Hover a market to preview it, click to zoom in.', ar: 'مرّر على أي سوق لمعاينته، واضغط للتكبير.' },
    hintPlants: { en: 'Select a site to see its profile.', ar: 'اختر موقعًا لعرض نبذة عنه.' },
    markets: { en: 'Markets', ar: 'الأسواق' },
    sectors: { en: 'Sectors', ar: 'القطاعات' },
    allSectors: { en: 'All', ar: 'الكل' },
    back: { en: 'Back to world map', ar: 'العودة إلى خريطة العالم' },
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
    clickExplore: { en: 'Click to explore', ar: 'اضغط للاستكشاف' },
    clickProfile: { en: 'Click for profile', ar: 'اضغط لعرض النبذة' },
    hq: { en: 'Head office · Barcelona', ar: 'المقر الرئيسي · برشلونة' },
    sitesList: { en: 'Sites', ar: 'المواقع' },
    illustrative: { en: 'Illustrative image', ar: 'صورة توضيحية' },
    hqRole: { en: 'ITI Group headquarters', ar: 'المقر الرئيسي لمجموعة ITI' },
    prev: { en: 'Previous site', ar: 'الموقع السابق' },
    next: { en: 'Next site', ar: 'الموقع التالي' },
    mapLabel: { en: 'Interactive map of ITI Group operations', ar: 'خريطة تفاعلية لعمليات مجموعة ITI' },
  },
  contact: {
    eyebrow: { en: 'Contact', ar: 'تواصل معنا' },
    title: { en: 'Let’s build what moves the world.', ar: 'لنَبنِ معًا ما يُحرّك العالم.' },
    body: {
      en: 'For partnerships, investment and general enquiries, our team in Barcelona will connect you with the right business.',
      ar: 'للشراكات والاستثمار والاستفسارات العامة، يصلك فريقنا في برشلونة بالجهة المناسبة داخل المجموعة.',
    },
    email: { en: 'Email', ar: 'البريد الإلكتروني' },
    website: { en: 'Website', ar: 'الموقع الإلكتروني' },
    office: { en: 'Head office', ar: 'المقر الرئيسي' },
    address: { en: 'Rambla de Catalunya 18, Barcelona, Spain', ar: 'رامبلا دي كاتالونيا 18، برشلونة، إسبانيا' },
    cta: { en: 'Write to us', ar: 'راسلنا' },
  },
  footer: {
    tagline: { en: 'Built for Global Growth', ar: 'مبنيّة للنمو العالمي' },
    rights: { en: '© 2026 ITI Group. All rights reserved.', ar: '© 2026 مجموعة ITI. جميع الحقوق محفوظة.' },
  },
}

export const CONTACT = {
  email: 'inquiries@iti-spain.com',
  website: 'www.iti-spain.com',
  websiteUrl: 'https://www.iti-spain.com',
}
