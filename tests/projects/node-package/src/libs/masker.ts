export class Masker {
  mask(str: string, start: number, count: number) {
    return str.slice(0, start) + '*'.repeat(count) + str.slice(start + count);
  }
}
