import {UpDownUnknown} from "../dto/health";

export interface BoxItem {
  label: string;
  status: UpDownUnknown;
  meta?: Record<string, string | number>;
}

export interface ServiceBox {
  key: 'api' | 'orch' | 'controller' | 'importer';
  title: string;
  reachable: UpDownUnknown;
  reachableMeta?: Record<string, string | number>;
  items: BoxItem[];
}
