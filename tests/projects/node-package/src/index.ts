import dayjs from 'dayjs';

import { Masker } from '@/libs/masker.js';

export function maskStr(str: string, start: number, count: number) {
  const masker = new Masker();

  return masker.mask(str, start, count);
}

export function currentYear() {
  return dayjs(new Date()).format('YYYY');
}
