/* HomePage.tsx */
import { Button, Card, Elevation, H1, H2 } from '@blueprintjs/core';
import RootLayout from '@/layouts/RootLayout';
import { Link } from 'react-router-dom';

// assets (use Vite import so they fingerprint)
import heroBg       from '@/assets/images/you.jpg';
import metalIcon    from '@/assets/images/m.svg';
import electricIcon from '@/assets/images/e.svg';
import timeIcon     from '@/assets/images/t.svg';
import youImg       from '@/assets/images/you.jpg';
import partyImg     from '@/assets/images/party.jpg';
import partner1     from '@/assets/images/t.svg';
import partner2     from '@/assets/images/t.svg';
import partner3     from '@/assets/images/t.svg';

export default function HomePage() {
  return (
    <RootLayout>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header
        className="relative flex flex-col items-center justify-center text-center h-screen text-white"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <div className="relative z-10 px-4 max-w-4xl">
          <H1 className="metal-mania text-5xl md:text-7xl drop-shadow-lg">
            Decentralized AI Infrastructure
          </H1>
          <p className="mt-6 mb-10 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Contribute, build, and earn with open AI models & data on a blockchain‑secured cloud.
          </p>
          <Link to="/beta">
            <Button large intent="primary" text="Get Started" className="metal-btn" />
          </Link>
        </div>

        {/* scroll cue */}
        <span className="absolute bottom-10 animate-bounce text-2xl">▾</span>
      </header>

      {/* ── Feature trilogy ─────────────────────────────────── */}
      <section className="features my-24 px-6 grid md:grid-cols-3 gap-8">
        {[
          { icon: metalIcon, title: 'Metal', desc: 'The ceiling of intelligence—own the machines, own the AI.' },
          { icon: electricIcon, title: 'Electricity', desc: 'AI is the new electricity. Power the future.' },
          { icon: timeIcon, title: 'Time', desc: 'Seconds are the only scarce currency. Optimise them.' },
        ].map(({ icon, title, desc }) => (
          <Card key={title} elevation={Elevation.TWO} className="text-center p-8 space-y-4 bg-[#1a1826] border border-[#272635]">
            <img src={icon} alt={title} className="h-16 mx-auto" />
            <H2>{title}</H2>
            <p className="opacity-80 leading-relaxed text-sm">{desc}</p>
          </Card>
        ))}
      </section>

      {/* ── Stats banner ────────────────────────────────────── */}
      <section className="bg-[#020625] text-[#cdd6f4] py-6 text-center text-sm flex flex-wrap justify-center gap-6">
        {[
          ['Online Nodes', '128'],
          ['GPU PFLOPS', '3.6'],
          ['Inference TPS', '92'],
          ['Storage TB', '540'],
        ].map(([label, value]) => (
          <span key={label} className="inline-flex flex-col">
            <strong className="text-lg md:text-2xl text-white">{value}</strong>
            {label}
          </span>
        ))}
      </section>

      {/* ── Why Join ───────────────────────────────────────── */}
      <section id="why-join" className="py-32 px-6 max-w-5xl mx-auto text-center space-y-8">
        <H1 className="metal-mania text-4xl">Why Join Next Metal?</H1>
        <p className="leading-7 opacity-90">
          Next Metal democratizes AI by fusing it with secure, blockchain‑powered infrastructure. Any GPU can join, any developer can build.
          Together we create open, secure, accessible intelligence.
        </p>
      </section>

      {/* ── Partner strip ───────────────────────────────────── */}
      <section className="partners py-12 bg-black text-center">
        <h2 className="section-heading text-white mb-8">Our Partners</h2>
        <div className="logo-track">
          <ul className="logo-strip">
            {[partner1, partner2, partner3, partner1, partner2].map((logo, i) => (
              <li key={i}><img src={logo} alt="partner" /></li>
            ))}
          </ul>
          <ul className="logo-strip" aria-hidden="true">
            {[partner1, partner2, partner3, partner1, partner2].map((logo, i) => (
              <li key={i}><img src={logo} alt="" /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="testimonials py-24 px-6 text-center">
        <H2>Trusted by Builders</H2>
        <div className="grid md:grid-cols-2 gap-10 mt-12">
          {[
            { img: youImg, quote: '“Next Metal halved our inference costs overnight.”', name: 'Doi Kim, SaaS Founder' },
            { img: partyImg, quote: '“Finally a cloud that values creators as much as customers.”', name: 'Hyo Kim, AI Director' },
          ].map(({ img, quote, name }) => (
            <Card key={name} elevation={Elevation.ONE} className="flex flex-col items-center space-y-4 py-10 bg-[#1a1826] border border-[#272635] max-w-sm mx-auto">
              <img src={img} alt={name} className="w-24 h-24 rounded-full object-cover" />
              <p className="italic px-4">{quote}</p>
              <small>{name}</small>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Call to Action ─────────────────────────────────── */}
      <section className="py-32 text-center bg-gradient-to-b from-[#020625] to-[#0f0e17] space-y-6">
        <H2 className="text-white">Ready to See It in Action?</H2>
        <Link to="/beta">
          <Button large intent="success" text="Schedule a Demo" className="metal-btn" />
        </Link>
      </section>
    </RootLayout>
  );
}
