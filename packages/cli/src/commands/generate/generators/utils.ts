export function indent(code: string, indent: number) {
  return code
    .split(`\n`)
    .map((line) => `${' '.repeat(indent)}${line}`)
    .join('\n');
}

export function formatObjectKey(key: string) {
  if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key)) {
    return key;
  }
  return `'${key}'`;
}
