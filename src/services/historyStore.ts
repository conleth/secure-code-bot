import { promises as fs } from "node:fs";
import path from "node:path";

const storePath = path.join(process.cwd(), "data", "history.json");

type StoreShape = Record<string, unknown>;

const ensureFile = async () => {
  try {
    await fs.access(storePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(storePath), { recursive: true });
      await fs.writeFile(storePath, JSON.stringify({}, null, 2));
    } else {
      throw error;
    }
  }
};

const readStore = async (): Promise<StoreShape> => {
  await ensureFile();
  const content = await fs.readFile(storePath, "utf8");
  try {
    return JSON.parse(content) as StoreShape;
  } catch {
    return {};
  }
};

const writeStore = async (data: StoreShape) => {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
};

export const historyStore = {
  async get<T>(key: string): Promise<T | undefined> {
    const store = await readStore();
    return store[key] as T | undefined;
  },
  async set<T>(key: string, value: T): Promise<void> {
    const store = await readStore();
    store[key] = value;
    await writeStore(store);
  },
};
