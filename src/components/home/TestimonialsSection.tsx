import React from 'react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  initials: string;
  quote: string;
  product: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ananya Rao',
    location: 'Bengaluru',
    initials: 'AR',
    quote: 'The Kanjeevaram silk anarkali ensemble was pure perfection for my sister’s wedding. The zari finish felt custom-tailored and truly regal.',
    product: 'Champagne Gold Zari Anarkali',
  },
  {
    id: '2',
    name: 'Meera Krishnan',
    location: 'Chennai',
    initials: 'MK',
    quote: 'Finding kids ethnic wear with itch-free cotton lining was a game changer. My daughter wore her pattu frock all evening without a complaint.',
    product: 'Pure Silk Kids Pattu Frock',
  },
  {
    id: '3',
    name: 'Pooja Reddy',
    location: 'Hyderabad',
    initials: 'PR',
    quote: 'The Girls Collections delivers couture-level craftsmanship at a fraction of boutique prices. The packaging and custom fitting were outstanding.',
    product: 'Bridal Zari Lehenga Edit',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
      className="w-full py-10 md:py-16 bg-[#FAF8F5] border-t border-[#EFE7E2] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unified Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[22px] md:text-[28px] font-sans font-semibold tracking-[0.06em] text-[#1C1417]">
            Voices of Elegance
          </h2>
        </div>

        {/* 3-Up Desktop Grid / Horizontal Scroll-Snap Rail on Mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar md:overflow-visible snap-x snap-mandatory pb-4 px-1 -mx-1">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="snap-start shrink-0 w-[85vw] sm:w-[360px] md:w-auto bg-[#FAF6EE] rounded-none p-6 sm:p-8 border border-[#E2D8CC] shadow-xs flex flex-col justify-between space-y-6"
            >
              {/* Initials Mark */}
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-[#1C1417] text-white flex items-center justify-center font-sans font-semibold text-sm shadow-xs shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h3 className="text-sm font-sans font-semibold text-[#1C1417]">{t.name}</h3>
                  <p className="text-xs font-sans text-[#6B6B7B]">{t.location}</p>
                </div>
              </div>

              {/* Display Pull Quote */}
              <p className="text-sm sm:text-base font-serif italic text-[#1C1417]/85 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Thin Divider */}
              <div className="w-full h-[1px] bg-[#E2D8CC]" />

              <p className="text-[11px] font-sans uppercase tracking-[0.14em] text-[#8B6A2E] font-semibold">
                Purchased: {t.product}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
