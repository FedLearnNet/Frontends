export type NavItem = {
  label: string;
  icon: string;
  route?: string | any[];
  children?: NavItem[];
  disabled?: boolean;
  /** Stable identifier — required when `starrable` is true. */
  id?: string;
  /** Show a star toggle next to this item. */
  starrable?: boolean;
  /** Optional numeric badge / count shown on the right side of the item. */
  badge?: number | string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};
