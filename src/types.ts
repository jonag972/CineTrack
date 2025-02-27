export interface CollectionItem {
  id: string;
  mediaId: string;
  mediaType: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  items: CollectionItem[];
}
