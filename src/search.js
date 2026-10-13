import { pinyin } from 'pinyin-pro';

const cache = new Map();
function initials(text) {
  if (!cache.has(text)) cache.set(text, pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase().replace(/[^a-z0-9]/g, ''));
  return cache.get(text);
}

export function matchesSearch(values, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const abbreviation = needle.replace(/\s+/g, '');
  return values.some(value => {
    const text = String(value || '');
    return text.toLowerCase().includes(needle) || (/^[a-z]+$/.test(abbreviation) && initials(text).includes(abbreviation));
  });
}
