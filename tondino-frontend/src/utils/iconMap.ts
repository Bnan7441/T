export const faToLucideMap: Record<string, string> = {
  'fa-play': 'Play',
  'fa-xmark': 'X',
  'fa-bell': 'Bell',
  'fa-star': 'Star',
  'fa-plus': 'Plus',
  'fa-chevron-down': 'ChevronDown',
  'fa-arrow-right': 'ArrowRight',
  'fa-arrow-up': 'ArrowUp',
  'fa-camera': 'Camera',
  'fa-lock': 'Lock',
  'fa-medal': 'Medal',
  'fa-robot': 'Robot',
  'fa-paper-plane': 'PaperPlane',
  'fa-chalkboard-user': 'ChalkboardUser',
  'fa-users': 'Users',
  'fa-ghost': 'Ghost',
  'fa-whatsapp': 'Phone',
  'fa-comments': 'MessageCircle',
  'fa-flask': 'Flame',
};

export function mapFaToLucide(faClassOrName?: string | null): string | null {
  if (!faClassOrName) return null;
  const parts = faClassOrName.split(/\s+/).map(p => p.trim()).filter(Boolean);
  const faPart = parts.find(p => p.startsWith('fa-')) || parts.find(p => p.includes('fa-')) || parts[0];
  if (!faPart) return null;
  return faToLucideMap[faPart] || null;
}
