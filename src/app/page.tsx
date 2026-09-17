import Link from 'next/link'
import {
  BookOpen, Map, FlaskConical, Shield, Users, ArrowRight,
  Leaf, CheckCircle2, Globe, Lock, Sparkles,
  MapPin, FileText, Zap,
} from 'lucide-react'

/* ─── Decorative diamond separator ───────────────────────────────────────────── */
function DiamondDivider({ label }: { label: string }) {
  return (
    <div className="divider-ornament max-w-xs mx-auto my-4">
      ◆ {label} ◆
    </div>
  )
}

/* ─── Stat pill ─────────────────────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
      <span className="font-display text-3xl font-bold text-white leading-none">{value}</span>
      <span className="text-sm text-orange-200 mt-1 font-medium">{label}</span>
    </div>
  )
}

/* ─── Feature row item ───────────────────────────────────────────────────────── */
function FeatureItem({ icon: Icon, text }: { icon: typeof Leaf; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FEF0E6] border border-[#F4A878]">
        <Icon className="h-3 w-3 text-[#8B2500]" aria-hidden="true" />
      </span>
      <span className="text-[#3D2B1F] text-sm leading-relaxed">{text}</span>
    </li>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFAF5]">

      {/* ════════════════════════════════════════
          NAVIGATION
      ════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5D8C8]"
        style={{ boxShadow: '0 1px 0 0 #E5D8C8, 0 2px 8px rgba(139,37,0,0.05)' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="Poloko IKS home">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B2500] to-[#C44B1A] shadow-md group-hover:shadow-lg transition-shadow">
              <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-white/20" />
            </div>
            <div className="leading-none">
              <span className="block font-display text-lg text-[#8B2500] tracking-tight">Poloko IKS</span>
              <span className="block text-[10px] tracking-[0.12em] uppercase text-[#9C8070] font-semibold mt-0.5">
                Heritage Archive
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {[
              { href: '/vault',    label: 'Knowledge Vault', icon: BookOpen   },
              { href: '/map',      label: 'Resource Map',    icon: Map        },
              { href: '/research', label: 'Research Hub',    icon: FlaskConical },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B5344] hover:text-[#8B2500] hover:bg-[#FEF0E6] transition-all">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login"
              className="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-[#6B5344] border border-[#E5D8C8] hover:border-[#8B2500] hover:text-[#8B2500] hover:bg-[#FEF0E6] transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C44B1A)', boxShadow: '0 2px 8px rgba(139,37,0,0.25)' }}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #5C1006 0%, #8B2500 35%, #B84010 65%, #C87820 100%)' }}>

        {/* Dot grid texture */}
        <div className="absolute inset-0 bg-pattern-dots" aria-hidden="true" />

        {/* Organic warm glow blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF8C42 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFD580 0%, transparent 70%)' }} aria-hidden="true" />

        {/* Decorative Kente-inspired top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5" aria-hidden="true"
          style={{ background: 'repeating-linear-gradient(90deg, #FFD580 0px, #FFD580 20px, #FF8C42 20px, #FF8C42 40px, #8B2500 40px, #8B2500 60px, #5C1006 60px, #5C1006 80px)' }} />

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/12 text-orange-100 text-xs sm:text-sm px-4 py-2 rounded-full mb-8 border border-white/20 backdrop-blur-sm fade-up">
            <MapPin className="h-3.5 w-3.5 text-[#FFD580]" aria-hidden="true" />
            <span className="font-semibold tracking-wide">Botswana · Indigenous Knowledge Systems</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-5 leading-[1.08] fade-up fade-up-delay-1">
            Preserving Botswana&apos;s<br />
            <span className="text-[#FFD580]">Living Heritage</span>
          </h1>

          {/* Setswana meaning */}
          <p className="text-lg text-orange-100/90 mb-3 font-medium fade-up fade-up-delay-2">
            <em className="font-display not-italic text-[#FFD580]">Poloko</em>
            {' '}— Setswana for &ldquo;Preservation&rdquo; &amp; &ldquo;Safeguarding&rdquo;
          </p>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-orange-200/80 mb-12 max-w-2xl mx-auto leading-relaxed fade-up fade-up-delay-2">
            An open, community-owned platform to digitise, protect, and share traditional
            medicine, cultural stories, conservation practices, and ecological wisdom —
            for future generations.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center mb-16 fade-up fade-up-delay-3">
            <Link href="/vault"
              className="group flex items-center gap-2.5 bg-white text-[#8B2500] px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
              <BookOpen className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" style={{ width: 18, height: 18 }} aria-hidden="true" />
              Browse the Archive
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
            <Link href="/register"
              className="flex items-center gap-2.5 border-2 border-white/35 text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base hover:bg-white/12 hover:border-white/60 transition-all backdrop-blur-sm">
              <Users className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} aria-hidden="true" />
              Join as a Contributor
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto fade-up fade-up-delay-3">
            <StatPill value="3"     label="Access Levels"        />
            <StatPill value="100%"  label="Community Owned"      />
            <StatPill value="SHA-256" label="Tamper-proof Records" />
            <StatPill value="Open"  label="Source & Free"        />
          </div>
        </div>

        {/* Bottom wave shape */}
        <div className="relative z-10" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="#FDFAF5" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#E5D8C8] px-4 sm:px-8 py-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-10">
            {[
              { icon: Shield,       text: 'Tamper-proof heritage records'    },
              { icon: Globe,        text: 'Public & open-source platform'    },
              { icon: Users,        text: 'Community-owned and governed'     },
              { icon: CheckCircle2, text: 'Elder-verified knowledge entries' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm font-medium text-[#6B5344]">
                <Icon className="h-4 w-4 text-[#8B2500] shrink-0" aria-hidden="true" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PROBLEM STATEMENT
      ════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 py-20 bg-[#FDFAF5]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <DiamondDivider label="Why This Matters" />
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1008] mt-6 mb-4">
              A Heritage Under Threat
            </h2>
            <p className="text-[#6B5344] text-lg max-w-2xl mx-auto leading-relaxed">
              Botswana&apos;s oral traditions, ecological wisdom, and medicinal plant knowledge
              are disappearing with each generation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                emoji: '📖',
                title: 'Loss of Living Heritage',
                body:  'Foundational oral wisdom disappears across generations with no centralised, open digital archive to preserve it permanently and make it searchable.',
                accent: '#FEF0E6',
                border: '#F4A878',
              },
              {
                emoji: '🔬',
                title: 'No Research Infrastructure',
                body:  'Local researchers have no dedicated platform to publish, protect, license, or track the usage of their indigenous knowledge-derived studies.',
                accent: '#F0FDF4',
                border: '#86EFAC',
              },
            ].map(({ emoji, title, body, accent, border }) => (
              <div key={title}
                className="group relative rounded-3xl border-2 p-8 transition-all hover:-translate-y-1"
                style={{ background: accent, borderColor: border, boxShadow: '0 4px 20px rgba(139,37,0,0.07)' }}>
                <div className="text-5xl mb-5 leading-none">{emoji}</div>
                <h3 className="font-display text-2xl text-[#1A1008] mb-3">{title}</h3>
                <p className="text-[#3D2B1F] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TWO PILLARS
      ════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 py-20 bg-white border-y-2 border-[#E5D8C8] bg-pattern-lines">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <DiamondDivider label="Two Ways to Contribute" />
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1008] mt-6 mb-4">
              Built for Everyone
            </h2>
            <p className="text-[#6B5344] text-lg max-w-xl mx-auto">
              Whether you are a community elder, a student, or a researcher —
              there is a place for you here.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Knowledge Vault card */}
            <div className="group relative rounded-3xl overflow-hidden border-2 border-[#E5D8C8] bg-[#FDFAF5] hover:border-[#F4A878] transition-all hover:-translate-y-1"
              style={{ boxShadow: '0 4px 24px rgba(139,37,0,0.07)' }}>
              {/* Top accent */}
              <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #8B2500, #C44B1A)' }} />
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #8B2500, #C44B1A)' }}>
                    <BookOpen className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-[#1A1008]">Knowledge Vault</h3>
                    <p className="text-sm text-[#9C8070] mt-0.5 font-medium">Heritage preservation archive</p>
                  </div>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {[
                    { icon: BookOpen,     text: 'Search and browse the living heritage archive'         },
                    { icon: Leaf,         text: 'Submit traditional knowledge for permanent safeguarding' },
                    { icon: Shield,       text: 'Three access levels: Public, Restricted & Sacred'       },
                    { icon: CheckCircle2, text: 'Community verification by elders and members'           },
                    { icon: MapPin,       text: 'Interactive map of geo-tagged knowledge locations'      },
                  ].map(item => <FeatureItem key={item.text} {...item} />)}
                </ul>
                <Link href="/vault"
                  className="group/btn inline-flex items-center gap-2 bg-[#8B2500] hover:bg-[#7C1D0E] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md">
                  Browse the Archive
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Research Hub card */}
            <div className="group relative rounded-3xl overflow-hidden border-2 border-[#E5D8C8] bg-[#FDFAF5] hover:border-[#86EFAC] transition-all hover:-translate-y-1"
              style={{ boxShadow: '0 4px 24px rgba(22,101,52,0.07)' }}>
              <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #166534, #16A34A)' }} />
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #166534, #15803D)' }}>
                    <FlaskConical className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-[#1A1008]">Research Hub</h3>
                    <p className="text-sm text-[#9C8070] mt-0.5 font-medium">Studies, licensing &amp; collaboration</p>
                  </div>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {[
                    { icon: FileText,     text: 'Browse published research and peer-reviewed studies' },
                    { icon: Zap,          text: 'Publish and license your own findings instantly'      },
                    { icon: Users,        text: 'Collaborative research pipelines with attribution'    },
                    { icon: Shield,       text: 'Usage audit trails with cryptographic proof'          },
                    { icon: Globe,        text: 'Open API for institutional and academic access'       },
                  ].map(item => <FeatureItem key={item.text} {...item} />)}
                </ul>
                <Link href="/research"
                  className="group/btn inline-flex items-center gap-2 bg-[#166534] hover:bg-[#14532D] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md">
                  Explore Research
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ACCESS TIERS
      ════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 py-20 bg-[#FDFAF5]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <DiamondDivider label="Community Sovereignty" />
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1008] mt-6 mb-4">
              Your Community, Your Rules
            </h2>
            <p className="text-[#6B5344] text-lg max-w-xl mx-auto leading-relaxed">
              Not all knowledge is the same. Communities decide what is shared openly,
              what requires justification, and what is sacred.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon:       Globe,
                title:      'Public',
                subtitle:   'Free for Everyone',
                desc:       'Freely available to any visitor. No account needed. Designed to share Botswana\'s heritage with the world.',
                bg:         '#F0FDF4',
                border:     '#86EFAC',
                iconBg:     '#DCFCE7',
                iconColor:  '#166534',
                textColor:  '#14532D',
                glow:       'rgba(22,101,52,0.12)',
              },
              {
                icon:       Lock,
                title:      'Restricted',
                subtitle:   'Apply for Access',
                desc:       'For verified researchers and community members. Submit a brief justification and await review.',
                bg:         '#FFFBEB',
                border:     '#FCD34D',
                iconBg:     '#FEF3C7',
                iconColor:  '#92400E',
                textColor:  '#78350F',
                glow:       'rgba(146,64,14,0.12)',
              },
              {
                icon:       Shield,
                title:      'Sacred',
                subtitle:   'Elder Board Protected',
                desc:       'Protected under community sovereignty. Only accessible with explicit Elder Board approval.',
                bg:         '#FEF2F2',
                border:     '#FCA5A5',
                iconBg:     '#FEE2E2',
                iconColor:  '#991B1B',
                textColor:  '#7F1D1D',
                glow:       'rgba(153,27,27,0.12)',
              },
            ].map(({ icon: Icon, title, subtitle, desc, bg, border, iconBg, iconColor, textColor, glow }) => (
              <div key={title}
                className="relative rounded-3xl border-2 p-7 transition-all hover:-translate-y-1"
                style={{ background: bg, borderColor: border, boxShadow: `0 4px 20px ${glow}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ background: iconBg }}>
                    <Icon className="h-6 w-6" style={{ color: iconColor }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-xl" style={{ color: textColor }}>{title}</p>
                    <p className="text-xs font-bold uppercase tracking-wide mt-0.5" style={{ color: iconColor }}>{subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-[#3D2B1F] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOVEREIGNTY & TRUST
      ════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 py-20 bg-white border-t-2 border-[#E5D8C8]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <DiamondDivider label="Built to Last" />
            <h2 className="font-display text-4xl sm:text-5xl text-[#1A1008] mt-6 mb-4">
              Sovereignty &amp; Trust
            </h2>
            <p className="text-[#6B5344] text-lg max-w-xl mx-auto">
              Open-source, self-hostable, and replicable across the SADC region
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon:  Shield,
                title: 'Heritage Protection',
                body:  'Every submission gets a unique tamper-proof record identifier — immutable proof of prior art that guards against biopiracy and exploitation.',
              },
              {
                icon:  Users,
                title: 'Community Governance',
                body:  'Elders verify entries, approve access requests, and govern what gets shared. The community stays in full control at all times.',
              },
              {
                icon:  Globe,
                title: 'Data Sovereignty',
                body:  'Communities own their data completely. The entire platform is open-source with no proprietary lock-in — ever.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title}
                className="group text-center rounded-3xl border-2 border-[#E5D8C8] bg-[#FDFAF5] p-8 transition-all hover:-translate-y-1 hover:border-[#F4A878]"
                style={{ boxShadow: '0 4px 16px rgba(139,37,0,0.06)' }}>
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FEF0E6, #FDFAF5)', border: '2px solid #F4A878', boxShadow: '0 4px 12px rgba(139,37,0,0.1)' }}>
                  <Icon className="h-8 w-8 text-[#8B2500]" aria-hidden="true" />
                </div>
                <h4 className="font-display text-xl text-[#1A1008] mb-3">{title}</h4>
                <p className="text-sm text-[#6B5344] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 sm:px-8 py-20"
        style={{ background: 'linear-gradient(135deg, #5C1006 0%, #8B2500 50%, #92400E 100%)' }}>
        <div className="absolute inset-0 bg-pattern-dots" aria-hidden="true" />
        {/* Kente border */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" aria-hidden="true"
          style={{ background: 'repeating-linear-gradient(90deg, #FFD580 0px, #FFD580 20px, #FF8C42 20px, #FF8C42 40px, #8B2500 40px, #8B2500 60px, #5C1006 60px, #5C1006 80px)' }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🌿</div>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4 leading-tight">
            Ready to safeguard<br />your community&apos;s knowledge?
          </h2>
          <p className="text-orange-200 text-lg mb-10 leading-relaxed">
            Join community members, elders, and researchers already using Poloko IKS
            to preserve Botswana&apos;s living heritage.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="flex items-center gap-2.5 bg-white text-[#8B2500] px-8 py-4 rounded-2xl font-bold text-base hover:bg-orange-50 transition-all shadow-xl hover:-translate-y-0.5">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Create a Free Account
            </Link>
            <Link href="/vault"
              className="flex items-center gap-2.5 border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 hover:border-white/70 transition-all">
              Browse Without Account
              <ArrowRight className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-[#1A0C06] px-4 sm:px-8 py-14">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid sm:grid-cols-12 gap-10 mb-12">

            {/* Brand */}
            <div className="sm:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #8B2500, #C44B1A)' }}>
                  <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="font-display text-xl text-white">Poloko IKS</span>
              </div>
              <p className="text-sm text-[#9C8070] leading-relaxed max-w-xs">
                An open-source Indigenous Knowledge Vault built for Botswana — preserving living heritage for all future generations.
              </p>
              <div className="mt-5 divider-ornament max-w-[160px]">
                ◆ Botswana ◆
              </div>
            </div>

            {/* Links */}
            <div className="sm:col-span-3">
              <p className="text-xs font-bold text-[#F4A878] uppercase tracking-[0.12em] mb-4">Explore</p>
              <ul className="space-y-2.5">
                {[
                  { href: '/vault',    label: 'Knowledge Vault' },
                  { href: '/map',      label: 'Resource Map'    },
                  { href: '/research', label: 'Research Hub'    },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#9C8070] hover:text-[#F4A878] transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-4">
              <p className="text-xs font-bold text-[#F4A878] uppercase tracking-[0.12em] mb-4">Get Started</p>
              <ul className="space-y-2.5">
                {[
                  { href: '/register',  label: 'Join Free'          },
                  { href: '/login',     label: 'Sign In'             },
                  { href: '/dashboard', label: 'Your Dashboard'      },
                  { href: '/submit',    label: 'Share Knowledge'     },
                  { href: '/audit',     label: 'Usage & Attribution' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#9C8070] hover:text-[#F4A878] transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#6B5344]">
              © {new Date().getFullYear()} Poloko IKS — Built for Botswana &amp; future generations
            </p>
            <p className="text-xs text-[#6B5344]">
              Open Source · MIT License · Track 04
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
