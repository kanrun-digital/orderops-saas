export type MarketingLocale = "en" | "uk";

export const MARKETING_LOCALES = ["en", "uk"] as const;

export const marketingNavHrefs = ["#solution", "#how", "#integrations", "#reliability", "#pricing", "#faq"] as const;

export const marketingCopy = {
  en: {
    common: {
      brand: "OrderOps",
      brandMark: "OO",
      tagline: "Restaurant operations control plane",
      login: "Login",
      requestPilot: "Request pilot",
      backHome: "Back home",
      explore: "Explore",
      publicPages: "Public pages",
      legal: "Legal",
      demo: "Demo",
      pilot: "Request a pilot",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      solution: "Solution",
      howItWorks: "How it works",
      integrations: "Integrations",
      reliability: "Reliability",
      pricing: "Pricing",
      faq: "FAQ",
      footerDescription: "One hub for menus, stop-lists, routing, and order operations across every location.",
      footerNote: "Marketing pages now live inside the current Next.js application.",
      rights: "All rights reserved",
      language: "Language",
      english: "EN",
      ukrainian: "UA"
    },
    landing: {
      badge: "OrderOps - automated restaurant operations",
      title: "Automate every menu, stop-list, and order across all platforms.",
      subtitle: "One command center for POS, delivery, direct ordering, and operational visibility across every location you run.",
      primaryCta: "Request pilot",
      secondaryCta: "View demo",
      highlights: [
        "Incremental menu sync with field protection",
        "Stop-list and routing visibility in one hub",
        "Full lifecycle order flow across providers"
      ],
      heroStats: {
        stateLabel: "Operational state",
        stateValue: "Healthy",
        stateText: "Menu sync, order status, and delivery routing visible in one operator-friendly view.",
        channelsLabel: "Channels monitored",
        channelsValue: "8+",
        channelsText: "Delivery marketplaces, direct ordering, POS, and internal workflows.",
        activityLabel: "Recent activity",
        activityTitle: "Always-on visibility",
        activitySync: "Last sync: 2 minutes ago",
        eventLabel: "event"
      },
      solution: {
        eyebrow: "From pain to relief",
        title: "Move teams from reactive firefighting to predictable performance.",
        subtitle: "The public story is rebuilt around the real operational pain that restaurant teams live with every day.",
        painLabel: "Pain",
        reliefLabel: "Relief",
        cards: [
          {
            pain: "Menus drift across platforms and critical fields change silently.",
            relief: "Incremental sync with field protection keeps every channel aligned."
          },
          {
            pain: "Stop-lists are updated too late and teams learn about stock issues from angry customers.",
            relief: "Webhook-driven updates propagate availability changes in seconds."
          },
          {
            pain: "Orders arrive from everywhere, but nobody has one reliable operating picture.",
            relief: "A single lifecycle view shows provider events, routing decisions, and current status."
          },
          {
            pain: "Customer context is fragmented between POS, delivery apps, and internal tools.",
            relief: "Shared customer history brings records together in one place."
          }
        ]
      },
      capabilities: {
        eyebrow: "Platform capabilities",
        title: "Mature operating blocks, not a cosmetic dashboard.",
        items: [
          {
            title: "Full order lifecycle",
            description: "Track each order from intake to sync, routing, retries, and final status."
          },
          {
            title: "Intelligent menu sync",
            description: "Preview changes, protect critical fields, and publish only what changed."
          },
          {
            title: "Observability",
            description: "See health, alerts, unmapped items, and event logs without leaving the workspace."
          },
          {
            title: "Smart stop-lists",
            description: "Keep availability consistent across locations and channels without manual repetition."
          },
          {
            title: "Customer intelligence",
            description: "Preserve customer history and context across every provider."
          },
          {
            title: "Delivery routing",
            description: "Apply zones, rules, and location logic so orders land where they should."
          },
          {
            title: "Team management",
            description: "Owners, admins, managers, and staff all get focused access."
          },
          {
            title: "QR and direct ordering",
            description: "Publish public menus and accept direct orders beyond marketplace channels."
          }
        ]
      },
      how: {
        eyebrow: "How it works",
        title: "A rollout path that gets teams to first live operations fast.",
        subtitle: "Connect sources, define rules, preview changes, and go live without hiding operational risk.",
        steps: [
          { number: "01", title: "Connect POS", description: "Link the source system and pull the structure needed for menu and order operations." },
          { number: "02", title: "Connect channels", description: "Authorize delivery platforms and configure sync, status mapping, and stop-list rules." },
          { number: "03", title: "Preview changes", description: "Review diffs before anything goes live and protect fields that must stay untouched." },
          { number: "04", title: "Run live", description: "Operate from one shared hub with alerts, retries, and clear accountability." }
        ]
      },
      security: {
        eyebrow: "Security",
        title: "Security and data protection built into the product shape itself.",
        items: [
          { title: "Encrypted secrets", description: "Credentials, tokens, and sensitive values stay encrypted at rest." },
          { title: "Webhook validation", description: "Incoming provider events are validated before they affect operations." },
          { title: "Rotation-ready access", description: "Connections are structured for safe refresh and controlled token rotation." },
          { title: "Tenant isolation", description: "Account-scoped access keeps one customer's operations separated from another's." }
        ]
      },
      integrations: {
        availableNow: "Available now",
        nextRoadmap: "Next on roadmap",
        now: ["Glovo", "Wolt", "Uber Eats", "Bolt Food", "Website / Direct orders", "Syrve", "Bitrix Site", "Salesbox"],
        next: ["Poster", "More delivery channels", "Additional direct-order surfaces"]
      },
      reliability: {
        eyebrow: "Reliability",
        title: "Every sync, alert, and retry should be explainable.",
        bullets: [
          "Only changed data is pushed.",
          "Preview mode lets teams verify impact before publishing.",
          "Retries and event logging keep provider instability understandable."
        ],
        statusLabel: "Event log preview",
        alertsLabel: "Active alerts",
        statuses: [
          { label: "Glovo integration", value: "Healthy" },
          { label: "Wolt integration", value: "Monitoring" },
          { label: "POS connector", value: "Stable" }
        ],
        events: ["Menu update sent to 6 channels", "Stop-list cleared for Kyiv Center", "Price change approved by HQ"],
        alerts: ["Uber Eats token expires in 3 days", "Bolt Food menu lag detected"]
      },
      socialProof: [
        { quote: "Menu updates went from chaos to one approval flow.", name: "Ops lead, multi-site QSR" },
        { quote: "We stopped peak-hour cancellations within days.", name: "Regional manager, delivery-first brand" },
        { quote: "Everything lives in one hub now, so we can plan ahead.", name: "Founder, multi-brand group" }
      ],
      pricing: {
        eyebrow: "Pricing",
        title: "Pricing and pilot paths",
        subtitle: "Commercial entry points now live inside the new application too.",
        monthly: "Monthly",
        annual: "Annual",
        custom: "Custom",
        perMonth: " / month",
        perYear: " / year",
        plans: [
          {
            code: "pilot",
            title: "Pilot",
            description: "Validate sync reliability and rollout shape before full production.",
            highlights: ["1 location", "Up to 500 orders / month", "Core integrations"],
            cta: "Request pilot",
            priceMonthly: 990,
            priceAnnual: 9900
          },
          {
            code: "growth",
            title: "Growth",
            description: "For operators scaling across several locations and channels.",
            highlights: ["Up to 5 locations", "Up to 2,000 orders / month", "Advanced monitoring"],
            cta: "Request pilot",
            priceMonthly: 2490,
            priceAnnual: 24900
          },
          {
            code: "enterprise",
            title: "Enterprise",
            description: "Custom workflows, rollout support, and high-volume operations.",
            highlights: ["Unlimited locations", "Unlimited orders", "Dedicated implementation support"],
            cta: "Request pilot",
            priceCustom: true
          }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "Questions teams ask before rollout",
        items: [
          { question: "Which platforms do you support?", answer: "Current focus includes Syrve, delivery marketplaces, direct ordering surfaces, and operational connectors already present in the product." },
          { question: "How long does setup take?", answer: "Most pilots can start once access, source data, and rollout scope are agreed." },
          { question: "What happens if an integration goes down?", answer: "Teams see alerts, retry context, and a clear operating record instead of silent failure." },
          { question: "Can we protect fields from overwrite during sync?", answer: "Yes. Protected fields and scoped sync rules are part of the rollout model." }
        ]
      },
      finalCta: {
        eyebrow: "Ready to move",
        title: "Make operations less fragile and more visible.",
        subtitle: "The public layer from the old product now lives inside the new application and is ready for refinement.",
        primary: "Request pilot",
        secondary: "Talk to us"
      }
    },
    pages: {
      demo: {
        eyebrow: "Demo",
        title: "See OrderOps in action",
        description: "Explore a guided walkthrough of menu synchronization, order flow, and operational visibility.",
        primaryCta: "Request a pilot",
        sections: [
          { title: "Menu control", body: "See how products, modifiers, and availability move from source systems into delivery channels." },
          { title: "Order visibility", body: "Follow one order through ingestion, routing, sync, and resolution instead of hopping across provider dashboards." },
          { title: "Operational confidence", body: "Review what changed, who changed it, and which integrations need attention before issues become customer-facing." }
        ]
      },
      contact: {
        eyebrow: "Contact",
        title: "Let's talk",
        description: "Reach out to discuss integrations, pilots, rollout planning, or commercial questions around OrderOps.",
        primaryCta: "Request a pilot",
        sections: [
          { title: "Pilots and onboarding", body: "Discuss rollout scope, timelines, and the fastest path to validating fit." },
          { title: "Integrations", body: "Review your POS, marketplaces, and current operational constraints." },
          { title: "Commercial questions", body: "Talk through pricing, support expectations, and what production launch would require." }
        ]
      },
      privacy: {
        eyebrow: "Privacy",
        title: "Privacy policy",
        description: "We collect only the information needed to provide the platform and handle it as operationally sensitive product data.",
        sections: [
          { title: "What we collect", body: "Contact details, account context, integration metadata, and operational records required to run the product." },
          { title: "Why we collect it", body: "To provide synchronization, routing, reporting, support, and the rest of the requested platform capabilities." },
          { title: "How we handle it", body: "Access should stay limited to authorized users and service functions needed to operate the product." },
          { title: "Retention and deletion", body: "Data retention depends on setup, support obligations, and legal or audit requirements." }
        ]
      },
      terms: {
        eyebrow: "Terms",
        title: "Terms of service",
        description: "OrderOps is provided as an operations platform for pilots and commercial rollouts under the agreed service scope.",
        sections: [
          { title: "Service scope", body: "OrderOps is software for restaurant operations, integrations, and public ordering surfaces." },
          { title: "Pilots and rollout", body: "During pilots, capabilities may be limited to agreed integrations, volumes, and onboarding timelines." },
          { title: "Customer responsibilities", body: "Customers provide accurate access, lawful use of the service, and internal ownership for rollout decisions." },
          { title: "Support and changes", body: "Support expectations, maintenance windows, and commercial changes should be agreed before launch." }
        ]
      }
    },
    pilot: {
      eyebrow: "Pilot",
      title: "Request an OrderOps pilot",
      subtitle: "The old two-step pilot flow is now rebuilt here as part of the new product's public pages.",
      steps: { contact: "Contact", integrations: "Integrations" },
      step1Title: "Tell us who you are",
      step1Subtitle: "Share the basics and we will know who to follow up with.",
      step2Title: "Integrations and timing",
      step2Subtitle: "A few operational details help shape the right demo and pilot plan.",
      labels: {
        name: "Name",
        email: "Work email",
        phone: "Phone",
        restaurantName: "Restaurant or group",
        cityCountry: "City / country",
        locationsCount: "Locations count",
        posSystem: "POS system",
        posName: "POS name",
        deliveryPlatforms: "Delivery platforms",
        biggestPain: "Biggest pain",
        preferredTime: "Preferred demo time",
        notes: "Notes"
      },
      placeholders: {
        name: "Your full name",
        email: "you@company.com",
        phone: "+380 XX XXX XX XX",
        restaurantName: "Brand or group name",
        cityCountry: "Kyiv, Ukraine",
        locationRange: "Choose range",
        posSystem: "Select POS",
        posName: "Type your POS name",
        preferredTime: "Weekdays after 3 pm",
        notes: "Share any context that helps us prepare.",
        optional: "Optional"
      },
      actions: { continue: "Continue", back: "Back", submit: "Submit request", viewDemo: "View demo" },
      validation: {
        name: "Name is required.",
        email: "Work email is required.",
        restaurantName: "Restaurant name is required.",
        cityCountry: "City and country are required.",
        locationsCount: "Choose your location range.",
        posChoice: "Choose a POS option.",
        posOther: "Specify your POS.",
        deliveryPlatforms: "Select at least one delivery platform."
      },
      success: {
        title: "Thanks, we have your pilot request.",
        subtitle: "This flow is now available inside the new Next.js project. Submission is still local until a public intake endpoint is wired."
      },
      sidebar: {
        title: "What you'll see on the demo",
        items: [
          "A calm, unified menu dashboard across channels.",
          "Instant stop-list sync and availability checks.",
          "A clear view of delivery orders and alerts.",
          "How teams collaborate without operational chaos."
        ],
        noteTitle: "No need to know the tech details",
        noteBody: "This public page is intentionally gentle. The team can collect context without pushing prospects through a hard-sell flow.",
        afterTitle: "After the demo",
        afterBody: "We align on pilot scope, rollout dependencies, and which integrations should be tackled first.",
        previewDemo: "Preview the demo story"
      },
      options: {
        locations: ["1 location", "2-5 locations", "6+ locations"],
        pos: ["Syrve", "Poster", "Other", "No POS yet"],
        delivery: ["Glovo", "Wolt", "Uber Eats", "Bolt Food", "Own website", "Other"],
        pain: ["Menus drift across platforms", "Stop-list updates take too long", "No single view of orders", "Integrations are hard to set up", "Reporting takes too much time"]
      }
    }
  },
  uk: {
    common: {
      brand: "OrderOps",
      brandMark: "OO",
      tagline: "Платформа керування ресторанними операціями",
      login: "Увійти",
      requestPilot: "Запросити пілот",
      backHome: "На головну",
      explore: "Огляд",
      publicPages: "Публічні сторінки",
      legal: "Юридичне",
      demo: "Демо",
      pilot: "Запросити пілот",
      contact: "Контакти",
      privacy: "Конфіденційність",
      terms: "Умови",
      solution: "Рішення",
      howItWorks: "Як це працює",
      integrations: "Інтеграції",
      reliability: "Надійність",
      pricing: "Ціни",
      faq: "FAQ",
      footerDescription: "Один центр для меню, стоп-листів, маршрутів доставки та операцій із замовленнями по всіх локаціях.",
      footerNote: "Маркетингові сторінки тепер інтегровані в поточний Next.js застосунок.",
      rights: "Усі права захищено",
      language: "Мова",
      english: "EN",
      ukrainian: "UA"
    },
    landing: {
      badge: "OrderOps - автоматизація ресторанних операцій",
      title: "Автоматизуйте меню, стоп-листи та замовлення на всіх платформах.",
      subtitle: "Єдиний центр керування для POS, доставки, прямих замовлень і операційної видимості по всіх ваших локаціях.",
      primaryCta: "Запросити пілот",
      secondaryCta: "Переглянути демо",
      highlights: [
        "Інкрементальна синхронізація меню із захистом полів",
        "Стоп-листи та маршрутизація в одному хабі",
        "Повний життєвий цикл замовлення по всіх провайдерах"
      ],
      heroStats: {
        stateLabel: "Стан операцій",
        stateValue: "Стабільно",
        stateText: "Синхронізація меню, статуси замовлень і доставка зібрані в одному зручному інтерфейсі.",
        channelsLabel: "Каналів під контролем",
        channelsValue: "8+",
        channelsText: "Маркетплейси доставки, прямі замовлення, POS та внутрішні процеси.",
        activityLabel: "Остання активність",
        activityTitle: "Постійна видимість",
        activitySync: "Остання синхронізація: 2 хвилини тому",
        eventLabel: "подія"
      },
      solution: {
        eyebrow: "Від болю до контролю",
        title: "Переведіть команди від постійного гасіння пожеж до прогнозованої операційної роботи.",
        subtitle: "Публічна історія продукту тепер знову побудована навколо реальних операційних болів ресторанної команди.",
        painLabel: "Проблема",
        reliefLabel: "Рішення",
        cards: [
          {
            pain: "Меню роз'їжджаються між платформами, а важливі поля змінюються безконтрольно.",
            relief: "Інкрементальна синхронізація з захистом полів тримає всі канали в одному стані."
          },
          {
            pain: "Стоп-листи оновлюються із запізненням, і команда дізнається про дефіцит від клієнтів.",
            relief: "Вебхук-оновлення передають зміни доступності за секунди."
          },
          {
            pain: "Замовлення приходять звідусіль, але в команди немає однієї достовірної картини.",
            relief: "Єдиний життєвий цикл замовлення показує події провайдерів, маршрутизацію та поточний статус."
          },
          {
            pain: "Контекст по клієнту розбитий між POS, доставкою та внутрішніми інструментами.",
            relief: "Спільна історія клієнта зводить записи в одному місці."
          }
        ]
      },
      capabilities: {
        eyebrow: "Можливості платформи",
        title: "Зрілі операційні блоки, а не косметичний дашборд.",
        items: [
          { title: "Повний цикл замовлення", description: "Від вхідного вебхука до синхронізації, маршрутизації, ретраїв та фінального статусу." },
          { title: "Розумна синхронізація меню", description: "Попередній перегляд змін, захист критичних полів і публікація лише того, що змінилось." },
          { title: "Спостережуваність", description: "Стан інтеграцій, алерти, нерозпізнані елементи та журнали подій в одному просторі." },
          { title: "Розумні стоп-листи", description: "Узгоджена доступність між локаціями та каналами без ручного дублювання." },
          { title: "Клієнтська аналітика", description: "Повна історія та контекст по клієнту між усіма провайдерами." },
          { title: "Маршрутизація доставки", description: "Зони, правила та логіка локацій працюють разом, щоб замовлення потрапляли туди, куди потрібно." },
          { title: "Командний доступ", description: "Власники, адміністратори, менеджери та персонал бачать лише потрібну їм частину роботи." },
          { title: "QR та прямі замовлення", description: "Публічні меню та прямі замовлення поза маркетплейсами." }
        ]
      },
      how: {
        eyebrow: "Як це працює",
        title: "Шлях запуску, який швидко приводить команду до перших живих операцій.",
        subtitle: "Підключіть джерела, задайте правила, перегляньте зміни та вийдіть у продакшн без прихованих ризиків.",
        steps: [
          { number: "01", title: "Підключіть POS", description: "Підключіть систему-джерело й отримайте структуру для меню та замовлень." },
          { number: "02", title: "Підключіть канали", description: "Авторизуйте платформи доставки та налаштуйте синхронізацію, мапінг статусів і стоп-листи." },
          { number: "03", title: "Перегляньте зміни", description: "Перевірте різницю перед публікацією й захистіть поля, які не можна перезаписувати." },
          { number: "04", title: "Працюйте вживу", description: "Керуйте з одного хабу зі сповіщеннями, ретраями та прозорою відповідальністю." }
        ]
      },
      security: {
        eyebrow: "Безпека",
        title: "Безпека та захист даних вбудовані в саму форму продукту.",
        items: [
          { title: "Зашифровані секрети", description: "Доступи, токени та чутливі значення зберігаються в зашифрованому вигляді." },
          { title: "Валідація вебхуків", description: "Вхідні події провайдерів перевіряються до того, як вони вплинуть на операції." },
          { title: "Керований доступ", description: "З'єднання підготовлені до безпечного оновлення та контрольованої ротації токенів." },
          { title: "Ізоляція тенантів", description: "Доступ до даних обмежений акаунтом, щоб операції різних клієнтів не змішувались." }
        ]
      },
      integrations: {
        availableNow: "Доступно зараз",
        nextRoadmap: "Далі в роадмапі",
        now: ["Glovo", "Wolt", "Uber Eats", "Bolt Food", "Website / Direct orders", "Syrve", "Bitrix Site", "Salesbox"],
        next: ["Poster", "Інші канали доставки", "Додаткові прямі канали замовлень"]
      },
      reliability: {
        eyebrow: "Надійність",
        title: "Кожна синхронізація, алерт і ретрай мають бути зрозумілими.",
        bullets: [
          "Відправляються лише змінені дані.",
          "Режим попереднього перегляду дозволяє перевірити вплив до публікації.",
          "Ретраї та журнал подій допомагають утримувати контроль навіть при нестабільності провайдера."
        ],
        statusLabel: "Фрагмент журналу подій",
        alertsLabel: "Активні алерти",
        statuses: [
          { label: "Інтеграція Glovo", value: "Стабільно" },
          { label: "Інтеграція Wolt", value: "Моніторинг" },
          { label: "Конектор POS", value: "Стабільний" }
        ],
        events: ["Оновлення меню відправлено в 6 каналів", "Стоп-лист очищено для Kyiv Center", "Зміну ціни затверджено HQ"],
        alerts: ["Токен Uber Eats спливає через 3 дні", "Виявлено затримку меню в Bolt Food"]
      },
      socialProof: [
        { quote: "Оновлення меню перестали бути хаосом і перетворилися на один чіткий процес погодження.", name: "Операційний лід, мережа QSR" },
        { quote: "Ми прибрали скасування в пікові години буквально за кілька днів.", name: "Регіональний менеджер delivery-first бренду" },
        { quote: "Тепер усе в одному хабі, і ми можемо планувати наперед.", name: "Засновник мультибрендової групи" }
      ],
      pricing: {
        eyebrow: "Ціни",
        title: "Пакети та пілотний запуск",
        subtitle: "Комерційні точки входу тепер теж живуть у новому застосунку.",
        monthly: "Щомісяця",
        annual: "Щороку",
        custom: "Індивідуально",
        perMonth: " / місяць",
        perYear: " / рік",
        plans: [
          { code: "pilot", title: "Пілот", description: "Для перевірки надійності синхронізації та сценарію запуску.", highlights: ["1 локація", "До 500 замовлень / місяць", "Базові інтеграції"], cta: "Запросити пілот", priceMonthly: 990, priceAnnual: 9900 },
          { code: "growth", title: "Growth", description: "Для операторів, які масштабуються на кілька локацій і каналів.", highlights: ["До 5 локацій", "До 2 000 замовлень / місяць", "Розширений моніторинг"], cta: "Запросити пілот", priceMonthly: 2490, priceAnnual: 24900 },
          { code: "enterprise", title: "Enterprise", description: "Кастомні процеси, підтримка запуску та великі обсяги операцій.", highlights: ["Необмежені локації", "Необмежені замовлення", "Окрема імплементаційна підтримка"], cta: "Запросити пілот", priceCustom: true }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "Питання, які команди ставлять до запуску",
        items: [
          { question: "Які платформи ви підтримуєте?", answer: "Поточний фокус - Syrve, маркетплейси доставки, прямі канали замовлень і вже наявні в продукті операційні конектори." },
          { question: "Скільки триває запуск?", answer: "Більшість пілотів стартують після погодження доступів, джерел даних і обсягу запуску." },
          { question: "Що відбувається, якщо інтеграція падає?", answer: "Команда бачить алерти, контекст ретраїв і зрозумілий запис подій замість тихого фейлу." },
          { question: "Чи можна захистити поля від перезапису під час синхронізації?", answer: "Так. Захищені поля та правила синхронізації з обмеженою областю дії входять у базову модель запуску." }
        ]
      },
      finalCta: {
        eyebrow: "Готові рухатись",
        title: "Зробіть операції менш крихкими та більш прозорими.",
        subtitle: "Публічний шар старого продукту тепер живе в новому застосунку й готовий до наступного етапу доопрацювання.",
        primary: "Запросити пілот",
        secondary: "Написати нам"
      }
    },
    pages: {
      demo: {
        eyebrow: "Демо",
        title: "Подивіться OrderOps у дії",
        description: "Ознайомтеся з покроковим оглядом синхронізації меню, потоку замовлень та операційної видимості.",
        primaryCta: "Запросити пілот",
        sections: [
          { title: "Контроль меню", body: "Подивіться, як продукти, модифікатори та доступність рухаються з джерел у канали доставки." },
          { title: "Видимість замовлень", body: "Прослідкуйте одне замовлення через прийом, маршрутизацію, синхронізацію та фінальний статус." },
          { title: "Операційна впевненість", body: "Бачте, що змінилось, хто це змінив і які інтеграції потребують уваги до того, як проблема стане видимою клієнту." }
        ]
      },
      contact: {
        eyebrow: "Контакти",
        title: "Давайте поговоримо",
        description: "Напишіть нам щодо інтеграцій, пілоту, плану запуску або комерційних питань навколо OrderOps.",
        primaryCta: "Запросити пілот",
        sections: [
          { title: "Пілот та онбординг", body: "Обговоримо обсяг запуску, строки та найкоротший шлях до перевірки відповідності." },
          { title: "Інтеграції", body: "Розберемо ваш POS, маркетплейси та поточні операційні обмеження." },
          { title: "Комерційні питання", body: "Поговоримо про ціни, очікування щодо підтримки та вимоги до промислового запуску." }
        ]
      },
      privacy: {
        eyebrow: "Конфіденційність",
        title: "Політика конфіденційності",
        description: "Ми збираємо лише ті дані, які потрібні для роботи платформи, і ставимося до них як до чутливих операційних даних продукту.",
        sections: [
          { title: "Що ми збираємо", body: "Контактні дані, контекст акаунта, метадані інтеграцій та операційні записи, необхідні для роботи продукту." },
          { title: "Навіщо ми це збираємо", body: "Щоб забезпечити синхронізацію, маршрутизацію, звітність, підтримку та інші заявлені можливості платформи." },
          { title: "Як ми це обробляємо", body: "Доступ має залишатися лише в авторизованих користувачів та сервісних функцій, необхідних для роботи продукту." },
          { title: "Зберігання та видалення", body: "Термін зберігання залежить від конфігурації продукту, умов підтримки та юридичних чи аудиторських вимог." }
        ]
      },
      terms: {
        eyebrow: "Умови",
        title: "Умови використання",
        description: "OrderOps надається як операційна платформа для пілотів і комерційних запусків у межах погодженого сервісного обсягу.",
        sections: [
          { title: "Обсяг сервісу", body: "OrderOps - це програмний сервіс для ресторанних операцій, інтеграцій та публічних поверхонь замовлення." },
          { title: "Пілот і запуск", body: "Під час пілоту можливості можуть бути обмежені погодженими інтеграціями, обсягами та строками онбордингу." },
          { title: "Відповідальність клієнта", body: "Клієнт відповідає за коректні доступи, законне використання сервісу та внутрішню відповідальність за рішення щодо запуску." },
          { title: "Підтримка та зміни", body: "Очікування щодо підтримки, вікна технічних робіт і зміни комерційних умов мають бути погоджені до запуску." }
        ]
      }
    },
    pilot: {
      eyebrow: "Пілот",
      title: "Запросіть пілот OrderOps",
      subtitle: "Старий двокроковий пілотний сценарій тепер перенесений сюди як частина публічного шару нового продукту.",
      steps: { contact: "Контакт", integrations: "Інтеграції" },
      step1Title: "Познайомимось ближче",
      step1Subtitle: "Залиште базову інформацію, щоб ми зрозуміли, з ким і як продовжувати діалог.",
      step2Title: "Інтеграції та таймінг",
      step2Subtitle: "Кілька деталей допоможуть нам підготувати правильне демо та пілотний план.",
      labels: {
        name: "Ім'я",
        email: "Робочий email",
        phone: "Телефон",
        restaurantName: "Ресторан або група",
        cityCountry: "Місто / країна",
        locationsCount: "Кількість локацій",
        posSystem: "POS система",
        posName: "Назва POS",
        deliveryPlatforms: "Платформи доставки",
        biggestPain: "Найбільший біль",
        preferredTime: "Зручний час для демо",
        notes: "Нотатки"
      },
      placeholders: {
        name: "Ваше повне ім'я",
        email: "you@company.com",
        phone: "+380 XX XXX XX XX",
        restaurantName: "Назва бренду або групи",
        cityCountry: "Київ, Україна",
        locationRange: "Оберіть діапазон",
        posSystem: "Оберіть POS",
        posName: "Вкажіть вашу POS",
        preferredTime: "Будні після 15:00",
        notes: "Поділіться контекстом, який допоможе нам підготуватись.",
        optional: "Необов'язково"
      },
      actions: { continue: "Продовжити", back: "Назад", submit: "Надіслати запит", viewDemo: "Переглянути демо" },
      validation: {
        name: "Ім'я обов'язкове.",
        email: "Потрібен робочий email.",
        restaurantName: "Назва ресторану обов'язкова.",
        cityCountry: "Вкажіть місто та країну.",
        locationsCount: "Оберіть діапазон кількості локацій.",
        posChoice: "Оберіть варіант POS.",
        posOther: "Уточніть вашу POS.",
        deliveryPlatforms: "Оберіть хоча б одну платформу доставки."
      },
      success: {
        title: "Дякуємо, ваш запит на пілот отримано.",
        subtitle: "Цей сценарій вже доступний у новому Next.js проєкті. Відправка поки локальна, доки не буде підключено публічний endpoint прийому заявок."
      },
      sidebar: {
        title: "Що ви побачите на демо",
        items: [
          "Спокійний єдиний дашборд меню для всіх каналів.",
          "Миттєву синхронізацію стоп-листів і доступності.",
          "Чіткий огляд замовлень і сповіщень.",
          "Як команди працюють разом без операційного хаосу."
        ],
        noteTitle: "Не потрібно знати технічні деталі",
        noteBody: "Ця публічна сторінка навмисно зроблена м'якою. Команда може зібрати контекст без агресивного продажного сценарію.",
        afterTitle: "Після демо",
        afterBody: "Разом узгодимо обсяг пілоту, залежності запуску та інтеграції, з яких треба почати.",
        previewDemo: "Переглянути демо-сценарій"
      },
      options: {
        locations: ["1 локація", "2-5 локацій", "6+ локацій"],
        pos: ["Syrve", "Poster", "Інша", "POS ще немає"],
        delivery: ["Glovo", "Wolt", "Uber Eats", "Bolt Food", "Власний сайт", "Інше"],
        pain: ["Меню розходяться між платформами", "Оновлення стоп-листів займає занадто багато часу", "Немає єдиного огляду замовлень", "Інтеграції складно налаштовувати", "Звітність забирає занадто багато часу"]
      }
    }
  }
} as const;



