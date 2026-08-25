import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1_800;
const MAX_CHUNKS = 256;
const STORAGE_PREFIX = "flatdues.auth";

type Manifest = {
  chunks: number;
  version: string;
};

function stableHash(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function storageKey(key: string) {
  const readable = key.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
  return `${STORAGE_PREFIX}.${readable}.${stableHash(key)}`;
}

function manifestKey(key: string) {
  return `${storageKey(key)}.manifest`;
}

function chunkKey(key: string, version: string, index: number) {
  return `${storageKey(key)}.${version}.${index}`;
}

function parseManifest(value: string | null): Manifest | null {
  if (!value) {
    return null;
  }

  try {
    const candidate: unknown = JSON.parse(value);

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "chunks" in candidate &&
      "version" in candidate &&
      typeof candidate.chunks === "number" &&
      Number.isInteger(candidate.chunks) &&
      candidate.chunks > 0 &&
      candidate.chunks <= MAX_CHUNKS &&
      typeof candidate.version === "string"
    ) {
      return { chunks: candidate.chunks, version: candidate.version };
    }
  } catch {
    return null;
  }

  return null;
}

async function deleteManifestChunks(key: string, manifest: Manifest | null) {
  if (!manifest) {
    return;
  }

  await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, manifest.version, index)),
    ),
  );
}

export const secureStoreAdapter = {
  async getItem(key: string) {
    const manifest = parseManifest(
      await SecureStore.getItemAsync(manifestKey(key)),
    );

    if (!manifest) {
      return null;
    }

    const chunks = await Promise.all(
      Array.from({ length: manifest.chunks }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, manifest.version, index)),
      ),
    );

    return chunks.some((chunk) => chunk === null) ? null : chunks.join("");
  },

  async removeItem(key: string) {
    const manifest = parseManifest(
      await SecureStore.getItemAsync(manifestKey(key)),
    );

    await deleteManifestChunks(key, manifest);
    await SecureStore.deleteItemAsync(manifestKey(key));
  },

  async setItem(key: string, value: string) {
    const previousManifest = parseManifest(
      await SecureStore.getItemAsync(manifestKey(key)),
    );
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [""];

    if (chunks.length > MAX_CHUNKS) {
      throw new Error("The encrypted authentication session is unexpectedly large.");
    }

    const version = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const nextManifest = { chunks: chunks.length, version } satisfies Manifest;

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, version, index), chunk),
      ),
    );
    await SecureStore.setItemAsync(
      manifestKey(key),
      JSON.stringify(nextManifest),
    );
    await deleteManifestChunks(key, previousManifest);
  },
};
