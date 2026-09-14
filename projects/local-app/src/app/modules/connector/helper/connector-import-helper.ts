/** The file type a name implies, for an import that has no settings of its own to go by. */
export function detectFileType(fileName: string): string {
  const name = fileName.toLocaleLowerCase();
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
    return 'EXCEL';
  }
  if (name.endsWith('.json')) {
    return 'JSON';
  }
  return name.endsWith('.zip') ? 'MULTIPLE_CSV_ZIP' : 'CSV';
}
