export const VSL_UPLOAD_WORDS_UPDATED_EVENT = "vsl-upload-words-updated";

const STORAGE_KEY = "wehear:vsl-upload-selected-words";
const ITEMS_STORAGE_KEY = "wehear:vsl-upload-saved-items";
const MAX_SAVED_WORDS = 30;

export interface SavedVslUploadItem {
  word: string;
  videoUrl?: string;
  confidence?: number;
  savedAt: string;
}

function normalizeWord(word: string) {
  return word.trim().replace(/\s+/g, " ");
}

export function getSavedVslUploadWords(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter((word): word is string => typeof word === "string")
      .map(normalizeWord)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function getSavedVslUploadItems(): SavedVslUploadItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(ITEMS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter((item): item is SavedVslUploadItem => (
        item &&
        typeof item === "object" &&
        typeof item.word === "string" &&
        typeof item.savedAt === "string"
      ))
      .map((item) => ({
        ...item,
        word: normalizeWord(item.word),
      }))
      .filter((item) => item.word);
  } catch {
    return [];
  }
}

export function saveVslUploadWord(word: string, videoUrl?: string, confidence?: number) {
  if (typeof window === "undefined") return [];

  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) return getSavedVslUploadWords();

  const nextItems: SavedVslUploadItem[] = [
    {
      word: normalizedWord,
      videoUrl,
      confidence,
      savedAt: new Date().toISOString(),
    },
    ...getSavedVslUploadItems().filter(
      (item) => item.word.toLocaleLowerCase("vi-VN") !== normalizedWord.toLocaleLowerCase("vi-VN"),
    ),
  ].slice(0, MAX_SAVED_WORDS);

  const nextWords = [
    normalizedWord,
    ...getSavedVslUploadWords().filter(
      (savedWord) => savedWord.toLocaleLowerCase("vi-VN") !== normalizedWord.toLocaleLowerCase("vi-VN"),
    ),
  ].slice(0, MAX_SAVED_WORDS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWords));
  window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(nextItems));
  window.dispatchEvent(new CustomEvent(VSL_UPLOAD_WORDS_UPDATED_EVENT, { detail: nextWords }));

  return nextWords;
}

export function clearSavedVslUploadWords() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ITEMS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(VSL_UPLOAD_WORDS_UPDATED_EVENT, { detail: [] }));
}
