export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
  includeVat?: boolean; 
};

export const ListItemController = {
  getAll: (key: string): Item[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as Item[];
    } catch {
      return [];
    }
  },

  saveAll: (key: string, items: Item[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(items));
  },

  add: (key: string, item: Item) => {
    const items = ListItemController.getAll(key);
    items.push(item);
    ListItemController.saveAll(key, items);
  },

  update: (key: string, item: Item) => {
    const items = ListItemController.getAll(key).map((i) =>
      i.id === item.id ? item : i
    );
    ListItemController.saveAll(key, items);
  },

  remove: (key: string, id: string) => {
    const items = ListItemController.getAll(key).filter((i) => i.id !== id);
    ListItemController.saveAll(key, items);
  },
};