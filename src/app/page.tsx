import Link from 'next/link'
import {
  BookOpen, Map, FlaskConical, Shield, Users, ArrowRight,
  Leaf, CheckCircle2, Globe, Lock, Star,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-0 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Poloko IKS home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9A3412]">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <span className="block font-bold text-[#9A3412] text-base tracking-tight">Poloko IKS</span>
              <span className="block text-[10px] text-[#9CA3AF] tracking-wide uppercase font-medium hidden sm:block">
                Indigenous Knowledge Vault
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/vault',    label: 'Knowledge Vault' },
              { href: '/map',      label: 'Resource Map'    },
              { href: '/research', label: 'Research Hub'    },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors border border-[#E8DDD0]">
              Sign In
            </Link>
            <Link href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm">
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#B45309] text-white px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-orange-100 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/20">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            Botswana Indigenous Knowledge Systems
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Preserving Botswana&apos;s Living Heritage
          </h1>
          <p className="text-lg text-orange-100 mb-3">
            <em>Poloko</em> — Setswana for &ldquo;Preservation&rdquo; &amp; &ldquo;Safeguarding&rdquo;
          </p>
          <p className="text-base text-orange-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            An open, community-owned platform to digitise, protect, and share Botswana&apos;s
            indigenous knowledge — traditional medicine, conservation practices, cultural
            stories, and ecological wisdom — for future generations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/vault"
              className="bg-white text-[#9A3412] px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2 shadow-sm">
              Browse the Archive <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/register"
              className="border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Join as a Contributor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E8DDD0] px-4 sm:px-6 py-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-[#9CA3AF]">
            {[
              { icon: Shield,        text: 'Tamper-proof heritage records'       },
              { icon: Globe,         text: 'Public & open-source platform'       },
              { icon: Users,         text: 'Community-owned and governed'        },
              { icon: CheckCircle2,  text: 'Elder-verified knowledge entries'    },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we protect ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-[#FDFBF7]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">The Problem We Solve</h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
              Botswana&apos;s oral traditions, ecological wisdom, and medicinal plant knowledge
              are disappearing with each generation — with no infrastructure to protect
              them from loss or exploitation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-7 shadow-sm">
              <div className="text-3xl mb-4">📖</div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Loss of Heritage</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Foundational oral wisdom disappears across generations with no centralised,
                open digital archive to preserve it permanently and make it searchable.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-7 shadow-sm">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">No Research Infrastructure</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Local researchers have no dedicated platform to publish, protect, license,
                or track the usage of their indigenous knowledge-derived studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two areas ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-white border-y border-[#E8DDD0]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">Two Ways to Contribute</h2>
            <p className="text-[#4B5563]">Built for communities and researchers equally</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">

            {/* Knowledge Vault */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E8DDD0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 bg-[#9A3412] rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2937]">Knowledge Vault</h3>
                  <p className="text-sm text-[#9CA3AF]">Heritage preservation archive</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-[#4B5563] mb-6">
                {[
                  'Search and browse the heritage archive',
                  'Submit traditional knowledge for safeguarding',
                  'Three access levels: Public, Restricted, Sacred',
                  'Community verification by elders and members',
                  'Interactive map of knowledge locations',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#15803D] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/vault"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9A3412] hover:text-[#7C2D12] transition-colors">
                Browse the Archive <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Research Hub */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E8DDD0] p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 bg-[#15803D] rounded-xl flex items-center justify-center shadow-sm">
                  <FlaskConical className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2937]">Research Hub</h3>
                  <p className="text-sm text-[#9CA3AF]">Studies, licensing & collaboration</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-[#4B5563] mb-6">
                {[
                  'Browse published research and studies',
                  'Publish and license your own findings',
                  'Collaborative research pipelines',
                  'Attribution and usage audit trails',
                  'Open API for institutional data access',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#15803D] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/research"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#15803D] hover:text-[#14532D] transition-colors">
                Explore Research <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Access levels ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-[#FDFBF7]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">Community Controls Access</h2>
            <p className="text-[#4B5563] max-w-xl mx-auto leading-relaxed">
              Not all knowledge is the same. Communities decide what is shared openly,
              what requires justification, and what is sacred and protected.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Globe,
                colour: 'bg-[#F0FDF4] border-[#BBF7D0]',
                iconBg: 'bg-[#DCFCE7]',
                iconColour: 'text-[#15803D]',
                title: 'Public',
                desc: 'Freely available to anyone who visits the archive. No account needed.',
              },
              {
                icon: Lock,
                colour: 'bg-[#FFFBEB] border-[#FDE68A]',
                iconBg: 'bg-[#FEF3C7]',
                iconColour: 'text-[#B45309]',
                title: 'Restricted',
                desc: 'For verified researchers and community members. Request access with a brief justification.',
              },
              {
                icon: Shield,
                colour: 'bg-[#FEF2F2] border-[#FECACA]',
                iconBg: 'bg-[#FEE2E2]',
                iconColour: 'text-[#B91C1C]',
                title: 'Sacred',
                desc: 'Protected under community sovereignty. Only accessible with Elder Board approval.',
              },
            ].map(({ icon: Icon, colour, iconBg, iconColour, title, desc }) => (
              <div key={title} className={`rounded-2xl border p-6 ${colour}`}>
                <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${iconColour}`} aria-hidden="true" />
                </div>
                <h4 className="text-base font-bold text-[#1F2937] mb-2">{title}</h4>
                <p className="text-sm text-[#4B5563] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built-in protections ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-white border-t border-[#E8DDD0]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">Built for Sovereignty &amp; Trust</h2>
            <p className="text-[#4B5563]">Open-source, self-hostable, and replicable across the SADC region</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Heritage Protection',
                desc: 'Every submission receives a unique tamper-proof record identifier, creating immutable proof of prior art — guarding against biopiracy.',
              },
              {
                icon: Users,
                title: 'Community Governance',
                desc: 'Community elders verify entries, approve access requests, and govern what is shared. The community stays in control.',
              },
              {
                icon: Star,
                title: 'Data Sovereignty',
                desc: 'Communities own their data completely. The platform is open-source with no proprietary lock-in, ever.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#FDFBF7] rounded-2xl border border-[#E8DDD0] p-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#FEF2E8] border border-[#FDBA74] flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-[#9A3412]" aria-hidden="true" />
                </div>
                <h4 className="text-base font-bold text-[#1F2937] mb-2">{title}</h4>
                <p className="text-sm text-[#4B5563] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to action ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-[#9A3412]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to preserve your community&apos;s knowledge?
          </h2>
          <p className="text-orange-200 mb-8 leading-relaxed">
            Join community members, elders, and researchers already using Poloko IKS
            to safeguard Botswana&apos;s living heritage.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="bg-white text-[#9A3412] px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-sm">
              Create a Free Account
            </Link>
            <Link href="/vault"
              className="border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Browse Without Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#E8DDD0] px-4 sm:px-6 py-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9A3412]">
                  <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <span className="font-bold text-[#9A3412] text-base">Poloko IKS</span>
              </div>
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-xs">
                An open-source Indigenous Knowledge Vault built for Botswana and future generations.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F2937] uppercase tracking-wide mb-3">Explore</p>
              <ul className="space-y-2">
                {[
                  { href: '/vault',    label: 'Knowledge Vault' },
                  { href: '/map',      label: 'Resource Map'    },
                  { href: '/research', label: 'Research Hub'    },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#4B5563] hover:text-[#9A3412] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1F2937] uppercase tracking-wide mb-3">Account</p>
              <ul className="space-y-2">
                {[
                  { href: '/login',     label: 'Sign In'    },
                  { href: '/register',  label: 'Register'   },
                  { href: '/dashboard', label: 'Dashboard'  },
                  { href: '/submit',    label: 'Share Knowledge' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#4B5563] hover:text-[#9A3412] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-[#E8DDD0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9CA3AF]">
            <span>© {new Date().getFullYear()} Poloko IKS — Built for Botswana</span>
            <span>Open Source · MIT License · Track 04</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
