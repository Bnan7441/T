export function enToFaNumbers(input: number | string) {
  const str = String(input);
  const map: Record<string, string> = {
    '0': '۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹',',':','
  };
  return str.split('').map(ch => map[ch] ?? ch).join('');
}
