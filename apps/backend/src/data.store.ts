export type DocumentItem = { id: string; name: string; text: string };
export type Dataset = { id: string; docs: DocumentItem[] };

class InMemoryStore {
  private datasets = new Map<string, Dataset>();

  createDataset(id: string) {
    if (!this.datasets.has(id)) this.datasets.set(id, { id, docs: [] });
    return this.datasets.get(id)!;
  }

  addDoc(datasetId: string, doc: DocumentItem) {
    const ds = this.createDataset(datasetId);
    ds.docs.push(doc);
    return doc;
  }

  getDataset(datasetId: string) {
    return this.datasets.get(datasetId) || null;
  }
}

export const store = new InMemoryStore();
