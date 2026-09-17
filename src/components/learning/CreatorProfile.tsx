import { Users } from 'lucide-react'

interface Props {
  name: string
  community?: string | null
  bio?: string | null
}

export function CreatorProfile({ name, community, bio }: Props) {
  const initials = name
    .split(' ')
    .map(n => n[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')

  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
      <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-4">About the Creator</h3>

      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 text-base font-bold"
          style={{ background: '#FFFBEB', border: '2px solid #FDE68A', color: '#92400E' }}
          aria-hidden="true"
        >
          {initials || <Users className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-bold text-[#1F2937] text-sm">{name}</p>
          {community && (
            <p className="text-xs text-[#9CA3AF] mt-0.5">{community}</p>
          )}
        </div>
      </div>

      {bio && (
        <p className="text-xs text-[#6B5344] leading-relaxed">{bio}</p>
      )}

      <p className="text-xs text-[#9CA3AF] mt-3 leading-relaxed">
        This creator is a verified knowledge holder contributing to the Poloko IKS Learning Hub.
      </p>
    </div>
  )
}
