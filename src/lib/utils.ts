import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format: 'full' | 'date' | 'time' | 'relative' = 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return getRelativeTime(d);
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Taipei',
  };

  if (format === 'full' || format === 'date') {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
  }

  if (format === 'full' || format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleString('zh-TW', options);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;

  return formatDate(date, 'date');
}

export function getPetAge(birthday: Date | string): string {
  const birth = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} 個月`;
  }

  if (months === 0) {
    return `${years} 歲`;
  }

  return `${years} 歲 ${months} 個月`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    FOOD: '#FF9800',
    HEALTH: '#F44336',
    ACTIVITY: '#4CAF50',
    MEDICAL: '#2196F3',
    GROOMING: '#9C27B0',
    BEHAVIOR: '#00BCD4',
    OTHER: '#607D8B',
  };
  return colors[category] || colors.OTHER;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    FOOD: '飲食',
    HEALTH: '健康',
    ACTIVITY: '活動',
    MEDICAL: '醫療',
    GROOMING: '美容',
    BEHAVIOR: '行為',
    OTHER: '其他',
  };
  return labels[category] || '其他';
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    FOOD: '🍽️',
    HEALTH: '❤️',
    ACTIVITY: '🏃',
    MEDICAL: '🏥',
    GROOMING: '✨',
    BEHAVIOR: '🐾',
    OTHER: '📝',
  };
  return icons[category] || '📝';
}

export function getSpeciesLabel(species: string): string {
  const labels: Record<string, string> = {
    DOG: '狗',
    CAT: '貓',
    BIRD: '鳥',
    RABBIT: '兔子',
    HAMSTER: '倉鼠',
    FISH: '魚',
    REPTILE: '爬蟲類',
    OTHER: '其他',
  };
  return labels[species] || '其他';
}

export function getSpeciesEmoji(species: string): string {
  const emojis: Record<string, string> = {
    DOG: '🐕',
    CAT: '🐱',
    BIRD: '🐦',
    RABBIT: '🐰',
    HAMSTER: '🐹',
    FISH: '🐟',
    REPTILE: '🦎',
    OTHER: '🐾',
  };
  return emojis[species] || '🐾';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
