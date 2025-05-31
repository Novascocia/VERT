export function shortAddress(addr: string): string {
  return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
} 