export const ALLOWED_ARCHIVE_EXTENSIONS: string[] = [
    ".zip", ".rar", ".7z",
    ".tar", ".tar.gz", ".tgz",
    ".tar.bz2", ".tar.xz"
] as const;

export const ALLOWED_FILE_EXTENSIONS: string[] = [
    '.csv',
    '.tsv',
    '.txt',
    '.psv',
    '.data',
    '.dat',
    '.tab',
    '.dsv',
    '.json',
    '.xls',
    '.xlsx',
    ...ALLOWED_ARCHIVE_EXTENSIONS,
] as const;
