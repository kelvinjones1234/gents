"use client";

import { Target, Shield, Compass, Mail, ArrowRight } from "lucide-react";

export default function Main() {
  return (
    <div className="bg-background text-foreground font-sans antialiased transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[60vh] md:h-[80vh] bg-gradient-to-tr from-[#1A1C1C] via-[#2F3A39] to-[#4A4742] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay">
          {/* HERO IMAGE */}
          <img
            src="/about1.jpg"
            alt="akinaura Boutique"
            className="w-full h-full object-cover object-center"
            decoding="async"
          />
        </div>

        <div className="container-main mx-auto relative z-10 w-full flex flex-col justify-center h-full px-6 md:px-12">
          <h1 className="text-white font-display text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.9] font-bold tracking-tight uppercase max-w-[90%] mix-blend-overlay">
            /More Than
            <br />
            A Store.
            <br />
            A Standard.
          </h1>

          <div className="mt-12 flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest group self-start">
            <span className="border-b border-transparent transition-colors duration-300">
              Discover Our Vision
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE MANIFESTO */}
      <section className="py-24 md:py-32 bg-white border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8 md:gap-24 lg:gap-32">
          <div className="md:w-1/4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
              The Manifesto
            </h2>
          </div>
          <div className="md:w-3/4 max-w-5xl">
            <p className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-medium leading-[1.1] text-muted uppercase tracking-tight">
              akinaura IS THE PREMIER LIFESTYLE DESTINATION FOR THE{" "}
              <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
                VISION-DRIVEN MAN
              </span>
              . BUILT FOR THOSE WHO DEMAND{" "}
              <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
                UNCOMPROMISING QUALITY
              </span>{" "}
              AND TIMELESS SOPHISTICATION OVER FLEETING TRENDS.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE CURATION (IMAGE + TEXT) */}
      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
          <div className="order-2 md:order-1 space-y-6 md:space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Our Philosophy
            </h3>
            <h4 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[0.9] tracking-tight text-foreground">
              INTENTIONAL
              <br />
              LIVING
            </h4>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              We present a meticulously curated portfolio of menswear, distinct accessories, and foundational essentials. Every statement piece we feature is chosen to reflect calm confidence and an intentional approach to living. We do not chase seasons; we build wardrobes meant to last a lifetime.
            </p>
            <div className="flex items-center gap-3 text-foreground text-xs font-bold uppercase tracking-widest cursor-pointer group self-start pt-4">
              <span className="h-2 w-2 bg-foreground group-hover:scale-150 transition-transform duration-300"></span>
              <a href="/collections" className="border-b border-transparent group-hover:border-foreground transition-colors duration-300">
                Explore The Collection
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden bg-gray-200 relative group">
             <div className="absolute inset-0 bg-gray-100 mix-blend-multiply transition-colors duration-500 group-hover:bg-transparent z-10 pointer-events-none"></div>
             {/* CURATION IMAGE */}
             <img
                src="/about2.jpg"
                alt="Premium Menswear and Essentials"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
                decoding="async"
             />
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES */}
      <section className="py-24 bg-white border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 md:mb-24 gap-8">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Pillars of the Brand
            </h2>
            <p className="text-xl md:text-2xl font-display uppercase tracking-tight max-w-lg leading-tight">
              We operate on three distinct principles that dictate every product we source and every interaction we have: Quality, Style and Decency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
            {/* Value 1 */}
            <div className="group flex flex-col items-start gap-6 border-t border-gray-200 pt-8">
              <Shield className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform duration-500" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                  Uncompromising Quality
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  We partner exclusively with artisans and manufacturers who prioritize premium materials and meticulous craftsmanship. If it isn't built to endure, it doesn't belong here.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="group flex flex-col items-start gap-6 border-t border-gray-200 pt-8">
              <Target className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform duration-500" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                  Purposeful Design
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  Function dictates form. We believe the items you carry and wear should assist in your daily rituals, offering maximum utility alongside minimalist aesthetics.
                </p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="group flex flex-col items-start gap-6 border-t border-gray-200 pt-8">
              <Compass className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform duration-500" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                  Timeless Style
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  We ignore the noise of fast fashion. Our curation focuses on enduring silhouettes and neutral palettes that look as relevant today as they will in a decade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTACT / CTA */}
      <section className="py-24 md:py-32 bg-foreground text-white">
        <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase leading-[0.9]">
              ELEVATE<br />YOUR<br />STANDARD
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Whether you are rebuilding your wardrobe or searching for the perfect statement piece, our concierge team is available to assist you.
            </p>
            <a href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors duration-300">
              <Mail className="w-4 h-4" /> Contact Concierge
            </a>
          </div>
          
          <div className="flex justify-end">
             <div className="w-full max-w-md border border-gray-800 space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Visit The Journal
                </h3>
                <p className="text-lg font-display uppercase tracking-tight leading-tight">
                  Read our latest editorial on intentional living and curating a modular wardrobe.
                </p>
                <a href="/journal" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors pt-4 group">
                   Read Editorial <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </a>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}




