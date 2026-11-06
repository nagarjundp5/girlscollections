const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, '.next', 'static', 'css');
const ARTIFACT_DIR = path.join(ROOT, 'public', 'qa-screenshots');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

// Read compiled CSS
const cssFiles = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css'));
let combinedCss = '';
for (const file of cssFiles) {
  combinedCss += fs.readFileSync(path.join(CSS_DIR, file), 'utf8') + '\n';
}

// Convert local image paths to absolute file:// URLs so Playwright offline renderer displays them crisply
function absImg(relPath) {
  return 'file://' + path.join(ROOT, 'public', relPath.replace(/^\//, ''));
}

const logoPath = absImg('logo-highres.png');
const heroLadiesDesktop = absImg('bgimageladies1desktop.webp');
const heroLadiesMobile = absImg('bgimage1ladies.webp');
const heroKidsMobile = absImg('bgimage1kids.webp');

const catCircles = [
  { id: 'all-kurta-sets', name: 'Kurta Sets', img: absImg('categories/all-kurta-sets.webp'), group: 'women' },
  { id: 'anarkali-kurta-suit-sets', name: 'Anarkali Suits', img: absImg('categories/anarkali-kurta-suit-sets.webp'), group: 'women' },
  { id: 'co-ord-set', name: 'Co-ord Sets', img: absImg('categories/co-ord-set.webp'), group: 'women' },
  { id: 'skirt-and-top', name: 'Skirt & Top', img: absImg('categories/skirt-and-top.webp'), group: 'women' },
  { id: 'kids-lehenga-blouse-or-pattu-pavadai', name: 'Pattu Pavadai', img: absImg('categories/kids-lehenga-blouse-or-pattu-pavadai.webp'), group: 'kids' },
  { id: 'kids-traditional-gown-1-pc', name: 'Traditional Gowns', img: absImg('categories/kids-traditional-gown-1-pc.webp'), group: 'kids' },
  { id: 'party-wear-frocks', name: 'Party Frocks', img: absImg('categories/party-wear-frocks.webp'), group: 'kids' },
  { id: 'children-co-ord-set', name: 'Kids Co-ords', img: absImg('categories/children-co-ord-set.webp'), group: 'kids' },
];

const trendingCards = [
  { name: 'Kanjeevaram Pure Silk Flared Anarkali', price: '₹4,999', compare: '₹7,999', discount: '37% OFF', img: absImg('categories/anarkali-kurta-suit-sets.webp'), group: 'women' },
  { name: 'Pure Silk Kids Pattu Pavadai Set', price: '₹2,499', compare: '₹3,999', discount: '38% OFF', img: absImg('categories/kids-lehenga-blouse-or-pattu-pavadai.webp'), group: 'kids' },
  { name: 'Embroidered Festive Silk Co-ord Ensemble', price: '₹3,299', compare: '₹4,999', discount: '34% OFF', img: absImg('categories/co-ord-set.webp'), group: 'women' },
  { name: 'Royal Layered Birthday Party Frock', price: '₹1,999', compare: '₹2,999', discount: '33% OFF', img: absImg('categories/party-wear-frocks.webp'), group: 'kids' },
];

function buildHtml(options = {}) {
  const { pref = 'all', showModal = false, isScrolled = false } = options;

  return `<!DOCTYPE html>
<html lang="en" data-pref="${pref}" class="font-sans antialiased overflow-x-clip">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Girls Collections — Luxe Women & Kids Ethnic Wear</title>
  <style>
    ${combinedCss}
    :root {
      --announcement-h: 36px;
      --nav-h: 68px;
      --header-h: calc(var(--announcement-h) + var(--nav-h));
    }
    @media (min-width: 768px) {
      :root {
        --nav-h: 80px;
        --header-h: calc(var(--announcement-h) + var(--nav-h));
      }
    }
    html, body {
      overflow-x: clip;
      max-width: 100%;
      width: 100%;
      background-color: #FAF8F5;
      color: #1C1417;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1417]">

  <!-- HEADER WRAPPER (Fixed with translateY on scroll) -->
  <header
    id="site-header"
    class="fixed top-0 left-0 right-0 z-50 w-full pointer-events-auto"
    style="transform: ${isScrolled ? 'translateY(-36px)' : 'translateY(0)'}; transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);"
  >
    <!-- ANNOUNCEMENT BAR: 36px high, Wine background #3B1230, White 12px/500 text, 6px dots -->
    <div
      role="region"
      aria-label="Announcement Bar"
      style="background-color: #3B1230; height: 36px; line-height: 36px;"
      class="relative w-full select-none z-40 overflow-hidden flex items-center justify-center shrink-0 text-white"
    >
      <div class="max-w-[1440px] mx-auto w-full h-[36px] flex items-center justify-center relative px-8">
        <span class="text-[12px] font-medium tracking-[0.06em] text-white uppercase whitespace-nowrap truncate">
          USE CODE "GIRLS100" FOR ₹100 OFF FIRST ORDER
        </span>

        <!-- 6px dots -->
        <div class="flex items-center gap-1.5 absolute right-3 sm:right-6 top-1/2 -translate-y-1/2">
          <span class="h-[6px] w-[14px] rounded-full bg-white transition-all"></span>
          <span class="h-[6px] w-[6px] rounded-full bg-white/40"></span>
          <span class="h-[6px] w-[6px] rounded-full bg-white/40"></span>
          <span class="h-[6px] w-[6px] rounded-full bg-white/40"></span>
        </div>
      </div>
    </div>

    <!-- MAIN NAVBAR: 68px mobile / 80px desktop, Logo 56px/64px in clean ivory circle -->
    <nav
      style="background-color: #FBF7F1;"
      class="w-full select-none text-[#1C1417] border-b border-[#EFE7E2] z-40 h-[68px] md:h-[80px] shadow-[0_1px_4px_rgba(28,20,23,0.03)]"
      aria-label="Main Navigation"
    >
      <div class="max-w-[1440px] mx-auto h-full px-3 xs:px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-2 relative">
        <!-- COLUMN 1: Hamburger & Logo -->
        <div class="flex items-center gap-2.5 sm:gap-4 justify-start shrink-0 z-20">
          <button
            class="w-10 h-10 -ml-1 flex items-center justify-center hover:opacity-75 transition-opacity text-[#1C1417] cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <div class="w-5 h-3 flex flex-col justify-between">
              <span class="w-full h-[1.75px] rounded-full bg-[#1C1417]"></span>
              <span class="w-full h-[1.75px] rounded-full bg-[#1C1417]"></span>
              <span class="w-full h-[1.75px] rounded-full bg-[#1C1417]"></span>
            </div>
          </button>

          <!-- Clearly visible Logo: 56px Mobile / 64px Desktop, clean ivory circle, thin border -->
          <a href="/" class="flex items-center shrink-0" title="The Girls Collections">
            <div class="relative flex items-center justify-center select-none shrink-0 w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-[#FAF6EE] border border-[#B8924A]/25 overflow-hidden shadow-xs">
              <img
                src="${logoPath}"
                alt="The Girls Collections"
                class="w-full h-full object-contain p-0.5"
              />
            </div>
          </a>
        </div>

        <!-- COLUMN 2: Brand Name Text (strictly one line, never clipped) -->
        <div class="flex-1 min-w-0 flex items-center justify-center pointer-events-auto z-10 px-1">
          <a href="/" class="block max-w-full text-center">
            <h1 class="font-serif font-semibold text-[#1C1417] text-[clamp(11px,3.1vw,15px)] sm:text-[21px] md:text-[23px] tracking-[0.08em] sm:tracking-[0.22em] uppercase whitespace-nowrap m-0">
              THE GIRLS COLLECTIONS
            </h1>
          </a>
        </div>

        <!-- COLUMN 3: User & Cart Icons -->
        <div class="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0 z-20 text-[#1C1417]">
          <div class="hidden md:flex w-10 h-10 items-center justify-center">
            <svg class="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="relative w-10 h-10 flex items-center justify-center">
            <svg class="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-sans bg-[#B8924A] text-white">
              2
            </span>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- CONSTANT RESERVED HEIGHT SPACER (No content jump) -->
  <div style="height: var(--header-h);" aria-hidden="true" class="w-full shrink-0 select-none pointer-events-none"></div>

  <!-- MAIN HOMEPAGE CONTENT -->
  <main class="flex-1 flex flex-col relative w-full p-0 m-0 pb-24 md:pb-0">

    <!-- 1. HERO SHOWCASE -->
    <section class="relative w-full h-[62vh] max-h-[600px] min-h-[400px] md:h-[72vh] md:max-h-[720px] md:min-h-[480px] bg-[#0F0C14] select-none p-0 m-0 overflow-hidden">
      <!-- Full-bleed Slide Image -->
      <div class="absolute inset-0 w-full h-full">
        <picture>
          <source media="(min-width: 640px)" srcset="${heroLadiesDesktop}">
          <img
            src="${pref === 'kids' ? heroKidsMobile : heroLadiesMobile}"
            alt="Festive Couture Banner"
            class="w-full h-full object-cover object-center"
          />
        </picture>
      </div>

      <!-- Round Prev/Next Arrows: 36px on mobile (12px from edge) & 44px on desktop -->
      <div class="absolute inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-3 sm:px-6">
        <button class="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center">
          <svg class="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button class="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/75 hover:bg-white text-[#1C1417] backdrop-blur-xs shadow-md transition-all flex items-center justify-center">
          <svg class="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Small Dots (Positioned at bottom-9 to avoid colliding with pill) -->
      <div class="absolute bottom-9 inset-x-0 z-20 flex items-center justify-center pointer-events-auto">
        <div class="flex items-center space-x-2 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full">
          <span class="block w-5 h-1.5 bg-white rounded-full"></span>
          <span class="block w-1.5 h-1.5 bg-white/45 rounded-full"></span>
          <span class="block w-1.5 h-1.5 bg-white/45 rounded-full"></span>
        </div>
      </div>

      <!-- FLOATING SWITCH PILL: Centred and overlapping bottom edge (half on image, half below) -->
      <div
        role="tablist"
        aria-label="Filter by Women or Kids Collection"
        class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 flex items-center bg-white rounded-full p-1 shadow-[0_4px_20px_rgba(28,20,23,0.14)] border border-[#EFE7E2] select-none h-[44px] w-[216px]"
      >
        <!-- Sliding dark thumb -->
        <div
          aria-hidden="true"
          style="
            width: calc(50% - 4px);
            left: 4px;
            transform: ${pref === 'women' ? 'translateX(0)' : pref === 'kids' ? 'translateX(100%)' : 'scale(0.8)'};
            opacity: ${pref === 'all' ? 0 : 1};
            transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease;
          "
          class="absolute top-1 bottom-1 rounded-full bg-[#1C1417] pointer-events-none z-0"
        ></div>

        <button
          role="tab"
          class="relative z-10 w-1/2 h-full flex items-center justify-center text-[12.5px] font-sans font-semibold tracking-[0.06em] uppercase rounded-full transition-colors min-h-[44px] ${pref === 'women' ? 'text-white' : 'text-[#1C1417]'}"
        >
          Women
        </button>
        <button
          role="tab"
          class="relative z-10 w-1/2 h-full flex items-center justify-center text-[12.5px] font-sans font-semibold tracking-[0.06em] uppercase rounded-full transition-colors min-h-[44px] ${pref === 'kids' ? 'text-white' : 'text-[#1C1417]'}"
        >
          Kids
        </button>
      </div>
    </section>

    <!-- 2. CATEGORY CIRCLES STRIP (Directly after hero, with 28px extra top padding for pill clearance) -->
    <section aria-label="Categories" class="relative w-full bg-[#FAF8F5] pt-9 pb-6 sm:pt-11 sm:pb-8 border-b border-[#EFE7E2] select-none">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <!-- Round Taruni.in style Prev Button -->
        <div class="absolute left-1 sm:left-2 lg:left-4 top-[78px] sm:top-[85px] md:top-[110px] lg:top-[115px] -translate-y-1/2 z-20">
          <button class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white border border-[#E2D8CC] shadow-md flex items-center justify-center text-[#1C1417] min-h-[44px] min-w-[44px] p-1">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
        </div>

        <!-- Round Taruni.in style Next Button -->
        <div class="absolute right-1 sm:right-2 lg:right-4 top-[78px] sm:top-[85px] md:top-[110px] lg:top-[115px] -translate-y-1/2 z-20">
          <button class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white border border-[#E2D8CC] shadow-md flex items-center justify-center text-[#1C1417] min-h-[44px] min-w-[44px] p-1">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <!-- Circles Track (7 on Desktop, 3.5 on Mobile with peek) -->
        <div class="flex items-start justify-start md:justify-center gap-3.5 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1 px-1">
          ${catCircles
            .filter(c => pref === 'all' || c.group === pref)
            .map(c => `
              <div class="group flex flex-col items-center shrink-0 snap-start select-none w-[88px] sm:w-[110px] md:w-[136px] lg:w-[150px]">
                <!-- Circle: Warm ivory background, 1px border, 50% border-radius clip fix, hover ring via box-shadow -->
                <div
                  class="relative w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] md:w-[136px] md:h-[136px] lg:w-[150px] lg:h-[150px] bg-[#FAF6EE] border border-[#E2D8CC] shadow-xs group-hover:shadow-[0_0_0_2px_#1C1417] transition-shadow duration-300 shrink-0"
                  style="border-radius: 50%; overflow: hidden; isolation: isolate; transform: translateZ(0); -webkit-mask-image: -webkit-radial-gradient(white, black);"
                >
                  <img
                    src="${c.img}"
                    alt="${c.name}"
                    class="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <!-- Label: 13px mobile / 14px desktop, Title Case, weight 500, fixed height (NO layout shift) -->
                <div class="mt-2.5 sm:mt-3 text-center px-0.5 w-full h-[36px] sm:h-[40px] flex items-center justify-center">
                  <span class="block text-[13px] md:text-[14px] font-medium text-[#1C1417] leading-[1.25] line-clamp-2">
                    ${c.name}
                  </span>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    </section>

    <!-- 3. TRENDING THIS WEEK (Unified heading style: font-sans 22-28px weight 600, 0.06em tracking, dark #1C1417) -->
    <section class="w-full py-10 md:py-16 bg-[#FAF8F5]">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 md:mb-12">
          <h2 class="text-[22px] md:text-[28px] font-sans font-semibold tracking-[0.06em] text-[#1C1417]">
            Trending This Week
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          ${trendingCards
            .filter(p => pref === 'all' || p.group === pref)
            .map(p => `
              <div class="group relative flex flex-col w-full">
                <!-- 3:4 Portrait Image Container -->
                <div class="relative w-full aspect-[3/4] overflow-hidden bg-[#EFECE8] rounded-none">
                  <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover object-top" />
                  <div class="absolute top-2.5 left-2.5 z-20">
                    <span class="inline-block bg-black text-white text-[10px] md:text-[11px] font-sans font-medium uppercase tracking-[0.08em] px-2 py-0.5">
                      Trending
                    </span>
                  </div>
                  <button class="absolute top-2.5 right-2.5 z-20 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 flex items-center justify-center text-[#1C1417] shadow-xs">
                    <svg class="w-4 h-4 text-[#1C1417]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </button>
                </div>
                <div class="pt-3 pb-1 text-left">
                  <h3 class="text-[13px] md:text-[14px] font-sans font-normal uppercase tracking-[0.04em] text-[#1C1417] line-clamp-2 leading-tight">
                    ${p.name}
                  </h3>
                  <div class="mt-1.5 flex items-baseline gap-2 flex-wrap">
                    <span class="text-[15px] md:text-[16px] font-sans font-bold text-[#1C1417]">${p.price}</span>
                    <span class="text-[12px] md:text-[13px] font-sans text-[#767676] line-through">${p.compare}</span>
                    <span class="text-[12px] md:text-[13px] font-sans font-semibold text-[#B8283B]">(${p.discount})</span>
                  </div>
                </div>
              </div>
            `).join('')}
        </div>

        <div class="mt-8 md:mt-12 text-center">
          <a href="/shop?sort=trending${pref !== 'all' ? `&target=${pref}` : ''}" class="inline-flex items-center justify-center w-[180px] h-[44px] bg-[#1C1417] hover:bg-black text-white text-[12px] md:text-[13px] font-sans font-medium tracking-[0.12em] uppercase transition-colors">
            VIEW ALL
          </a>
        </div>
      </div>
    </section>

    <!-- 4. SHOP BY CATEGORY -->
    <section class="w-full bg-[#FAF8F5] py-10 md:py-16">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div class="text-center mb-8 md:mb-12">
          <h2 class="text-[22px] md:text-[28px] font-sans font-semibold text-[#1C1417] tracking-[0.06em]">
            Shop by Category
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          ${catCircles.slice(0, 4).map(c => `
            <div class="group flex flex-col items-center select-none">
              <div class="relative w-full aspect-[3/4] overflow-hidden rounded-none bg-[#EFECE8]">
                <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
              </div>
              <div class="mt-3.5 text-center px-1">
                <h3 class="text-sm md:text-[15px] font-bold uppercase tracking-[0.08em] text-[#1C1417]">
                  ${c.name}
                </h3>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

  </main>

  <!-- WHATSAPP FLOATING BUTTON: 52px Green Circle, Inline SVG, Bottom 80px on Mobile, Right 16px -->
  <div class="fixed z-40 flex items-center right-4 sm:right-6 bottom-[calc(64px+env(safe-area-inset-bottom,0px)+16px)] sm:bottom-8">
    <a
      href="https://wa.me/917483848505"
      target="_blank"
      class="w-[52px] h-[52px] flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl rounded-full bg-[#25D366] text-white"
      aria-label="Contact us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.186 8.186 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.17-.31.2-.58.06-.26-.13-1.11-.41-2.12-1.31-.79-.7-1.32-1.57-1.48-1.83-.15-.26-.02-.4.11-.53.12-.12.26-.31.4-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.6-1.45-.83-1.99-.22-.52-.44-.45-.6-.46-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.31s.99 2.68 1.13 2.86c.13.19 1.95 2.97 4.72 4.17.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.56-.64 1.78-1.25.22-.61.22-1.14.16-1.25-.07-.11-.25-.18-.51-.31z" />
      </svg>
    </a>
  </div>

  ${showModal ? `
  <!-- FIRST-VISIT CHOOSER MODAL / BOTTOM SHEET -->
  <div role="dialog" aria-modal="true" aria-labelledby="preference-modal-title" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>
    <div class="relative w-full sm:max-w-xl md:max-w-2xl bg-[#FAF6EE] text-[#1C1417] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col pt-5 px-5 sm:px-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <button class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-[#1C1417]">
        <svg class="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <div class="text-center mb-6 pr-8 sm:pr-0">
        <h2 id="preference-modal-title" class="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1417]">
          Who are we dressing today?
        </h2>
        <p class="mt-1 text-xs sm:text-sm font-sans text-[#6B6B7B]">
          Select a collection to personalize your experience
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3.5 sm:gap-6 flex-1">
        <!-- Women Card -->
        <div class="group relative flex flex-col items-center overflow-hidden rounded-lg bg-[#EFECE8] border border-[#E2D8CC] aspect-[3/4]">
          <div class="relative w-full h-full overflow-hidden">
            <img src="${heroLadiesMobile}" alt="Women's Ethnic Wear" class="w-full h-full object-cover object-top" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
              <span class="font-sans text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white/80">Couture</span>
              <span class="font-serif text-xl sm:text-2xl font-bold tracking-wide">Women</span>
              <span class="mt-2 inline-flex items-center text-[10px] sm:text-xs font-medium font-sans underline underline-offset-4 text-white/90">Shop Collection &rarr;</span>
            </div>
          </div>
        </div>
        <!-- Kids Card -->
        <div class="group relative flex flex-col items-center overflow-hidden rounded-lg bg-[#EFECE8] border border-[#E2D8CC] aspect-[3/4]">
          <div class="relative w-full h-full overflow-hidden">
            <img src="${heroKidsMobile}" alt="Kids Ethnic Wear" class="w-full h-full object-cover object-top" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
              <span class="font-sans text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-white/80">Pure Silk & Frocks</span>
              <span class="font-serif text-xl sm:text-2xl font-bold tracking-wide">Kids</span>
              <span class="mt-2 inline-flex items-center text-[10px] sm:text-xs font-medium font-sans underline underline-offset-4 text-white/90">Shop Collection &rarr;</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5 text-center">
        <button class="text-xs sm:text-sm font-sans font-medium text-[#6B6B7B] underline underline-offset-4">
          Browse everything
        </button>
      </div>
    </div>
  </div>
  ` : ''}

</body>
</html>`;
}

async function runScreenshots() {
  const browser = await chromium.launch();

  console.log('--- GENERATING QA ARTIFACTS AND SCREENSHOTS ---');

  // 1. Mobile 390px (iPhone 14/15) - Header, Hero + Pill, Circles, Trending
  const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const html390 = buildHtml({ pref: 'all' });
  const file390 = path.join(ARTIFACT_DIR, 'preview-390px.html');
  fs.writeFileSync(file390, html390);
  await page390.goto('file://' + file390, { waitUntil: 'load' });
  await page390.waitForTimeout(300);

  await page390.screenshot({ path: path.join(ARTIFACT_DIR, 'after-mobile-390px-header-hero.png') });
  
  // Scroll to circles & trending
  const circles390 = page390.locator('section[aria-label="Categories"]');
  await circles390.scrollIntoViewIfNeeded();
  await page390.waitForTimeout(200);
  await page390.screenshot({ path: path.join(ARTIFACT_DIR, 'after-mobile-390px-circles.png') });

  const trending390 = page390.locator('h2:text("Trending This Week")');
  await trending390.scrollIntoViewIfNeeded();
  await page390.waitForTimeout(200);
  await page390.screenshot({ path: path.join(ARTIFACT_DIR, 'after-mobile-390px-trending.png') });

  // 2. Mobile 390px - First-visit Chooser Modal
  const html390Modal = buildHtml({ pref: 'all', showModal: true });
  const file390Modal = path.join(ARTIFACT_DIR, 'preview-390px-modal.html');
  fs.writeFileSync(file390Modal, html390Modal);
  await page390.goto('file://' + file390Modal, { waitUntil: 'load' });
  await page390.waitForTimeout(200);
  await page390.screenshot({ path: path.join(ARTIFACT_DIR, 'after-mobile-390px-chooser.png') });
  await page390.close();

  // 3. Desktop 1440px - Header, Hero + Pill, Circles, Trending
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const html1440 = buildHtml({ pref: 'all' });
  const file1440 = path.join(ARTIFACT_DIR, 'preview-1440px.html');
  fs.writeFileSync(file1440, html1440);
  await page1440.goto('file://' + file1440, { waitUntil: 'load' });
  await page1440.waitForTimeout(300);

  await page1440.screenshot({ path: path.join(ARTIFACT_DIR, 'after-desktop-1440px-header-hero.png') });

  const circles1440 = page1440.locator('section[aria-label="Categories"]');
  await circles1440.scrollIntoViewIfNeeded();
  await page1440.waitForTimeout(200);
  await page1440.screenshot({ path: path.join(ARTIFACT_DIR, 'after-desktop-1440px-circles.png') });

  const trending1440 = page1440.locator('h2:text("Trending This Week")');
  await trending1440.scrollIntoViewIfNeeded();
  await page1440.waitForTimeout(200);
  await page1440.screenshot({ path: path.join(ARTIFACT_DIR, 'after-desktop-1440px-trending.png') });

  // 4. Desktop 1440px - First-visit Chooser Modal
  const html1440Modal = buildHtml({ pref: 'all', showModal: true });
  const file1440Modal = path.join(ARTIFACT_DIR, 'preview-1440px-modal.html');
  fs.writeFileSync(file1440Modal, html1440Modal);
  await page1440.goto('file://' + file1440Modal, { waitUntil: 'load' });
  await page1440.waitForTimeout(200);
  await page1440.screenshot({ path: path.join(ARTIFACT_DIR, 'after-desktop-1440px-chooser.png') });

  // 5. Desktop 1440px - Women Pill Selected
  const html1440Women = buildHtml({ pref: 'women' });
  const file1440Women = path.join(ARTIFACT_DIR, 'preview-1440px-women.html');
  fs.writeFileSync(file1440Women, html1440Women);
  await page1440.goto('file://' + file1440Women, { waitUntil: 'load' });
  await page1440.waitForTimeout(200);
  await page1440.screenshot({ path: path.join(ARTIFACT_DIR, 'after-desktop-1440px-women-active.png') });

  // 6. Responsive Viewports: 360px and 430px
  for (const w of [360, 430]) {
    const pageVp = await browser.newPage({ viewport: { width: w, height: 800 } });
    const htmlVp = buildHtml({ pref: 'all' });
    const fileVp = path.join(ARTIFACT_DIR, `preview-${w}px.html`);
    fs.writeFileSync(fileVp, htmlVp);
    await pageVp.goto('file://' + fileVp, { waitUntil: 'load' });
    await pageVp.waitForTimeout(200);
    await pageVp.screenshot({ path: path.join(ARTIFACT_DIR, `after-${w}px-header-hero.png`) });
    await pageVp.close();
  }

  // 7. Scrolled State (Header translateY(-36px)) at 390px
  const pageScrolled = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const htmlScrolled = buildHtml({ pref: 'all', isScrolled: true });
  const fileScrolled = path.join(ARTIFACT_DIR, 'preview-390px-scrolled.html');
  fs.writeFileSync(fileScrolled, htmlScrolled);
  await pageScrolled.goto('file://' + fileScrolled, { waitUntil: 'load' });
  await pageScrolled.waitForTimeout(200);
  await pageScrolled.screenshot({ path: path.join(ARTIFACT_DIR, 'after-mobile-390px-scrolled-header.png') });
  await pageScrolled.close();

  await page1440.close();
  await browser.close();

  console.log('Screenshots generated successfully in:', ARTIFACT_DIR);
}

runScreenshots().catch(err => {
  console.error('SCREENSHOT ERROR:', err);
  process.exit(1);
});
