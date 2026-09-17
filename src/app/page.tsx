import Link from 'next/link'
import { BookOpen, Map, FlaskConical, Shield, Users, ArrowRight, Leaf } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-700" />
            <span className="text-xl font-bold text-green-800">Poloko IKS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/vault" className="text-sm text-gray-600 hover:text-green-700">
              Knowledge Vault
            </Link>
            <Link href="/map" className="text-sm text-gray-600 hover:text-green-700">
              Resource Map
            </Link>
            <Link href="/research" className="text-sm text-gray-600 hover:text-green-700">
              Research Hub
            </Link>
            <Link
              href="/login"
              className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-800 to-green-950 text-white px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/50 text-green-200 text-sm px-4 py-1.5 rounded-full mb-6">
            <Leaf className="h-4 w-4" />
            Track 04 — Botswana Indigenous Knowledge Systems
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Poloko IKS
          </h1>
          <p className="text-xl text-green-100 mb-4 font-medium">
            <em>Poloko</em> — Setswana for &quot;Preservation&quot; &amp; &quot;Safeguarding&quot;
          </p>
          <p className="text-lg text-green-200 mb-10 max-w-2xl mx-auto">
            An open-source platform to digitize, protect, and empower innovation around
            Botswana&apos;s indigenous knowledge systems — for communities, by communities.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/vault"
              className="bg-white text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              Explore the Vault <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="border border-white/40 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Join as Researcher
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section className="px-6 py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Botswana&apos;s oral traditions, ecological wisdom, and medicinal plant knowledge are disappearing
            with each generation — with no infrastructure to protect them from loss or exploitation.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-10 text-left">
            <div className="bg-white rounded-xl p-6 border border-amber-100">
              <div className="text-2xl mb-3">📖</div>
              <h3 className="font-semibold text-gray-900 mb-2">Loss of Heritage</h3>
              <p className="text-sm text-gray-600">
                Foundational oral wisdom disappears across generations with no centralized,
                open-source digital archive to preserve it permanently.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-amber-100">
              <div className="text-2xl mb-3">🔬</div>
              <h3 className="font-semibold text-gray-900 mb-2">No Research Infrastructure</h3>
              <p className="text-sm text-gray-600">
                Local researchers have no dedicated platform to publish, protect, monetize,
                or track usage of their indigenous knowledge-derived studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Modules ── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Two Core Modules</h2>
            <p className="text-gray-500">Built for communities and researchers equally</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Module 1 */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Module 1</div>
                  <h3 className="font-bold text-gray-900">Knowledge Preservation Vault</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Searchable digital heritage archive
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  3-tier access control (Public / Restricted / Sacred)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  SHA-256 biopiracy shield on all uploads
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Interactive OpenStreetMap resource mapping
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  Community verification workflow
                </li>
              </ul>
              <Link
                href="/vault"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900"
              >
                Explore Vault <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Module 2 */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Module 2</div>
                  <h3 className="font-bold text-gray-900">Researcher & Innovation Hub</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  Research marketplace with licensing engine
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  Monetize compiled studies (CC or commercial)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  Collaborative research pipeline
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  Usage & attribution audit logs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  Authenticated Research API (v1)
                </li>
              </ul>
              <Link
                href="/research"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Explore Research Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for Sovereignty & Scale</h2>
            <p className="text-gray-500">Open-source, self-hostable, replicable across SADC</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <Shield className="h-8 w-8 text-green-700 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Biopiracy Shield</h4>
              <p className="text-sm text-gray-500">
                SHA-256 hashes generated at upload time create immutable timestamped proof of prior art.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <Map className="h-8 w-8 text-green-700 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Sacred Knowledge Control</h4>
              <p className="text-sm text-gray-500">
                Communities classify and restrict sensitive cultural knowledge. Elders approve all access.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <Users className="h-8 w-8 text-green-700 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Data Sovereignty</h4>
              <p className="text-sm text-gray-500">
                Communities own their data. Open-source stack ensures no proprietary lock-in, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span>Poloko IKS — Built for Botswana &amp; future generations</span>
          </div>
          <div className="flex gap-4">
            <Link href="/vault" className="hover:text-gray-600">Vault</Link>
            <Link href="/map" className="hover:text-gray-600">Map</Link>
            <Link href="/research" className="hover:text-gray-600">Research</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
