
// Constants for localStorage keys
export const AIRDROP_CATEGORIES_KEY = "crypto_tracker_airdrop_categories";
export const TESTNET_CATEGORIES_KEY = "crypto_tracker_testnet_categories";
export const TOOL_CATEGORIES_KEY = "crypto_tracker_tool_categories";
export const VIDEO_CATEGORIES_KEY = "crypto_tracker_video_categories";

// Default categories
export const defaultAirdropCategories = [
  'Layer 1 & Testnet Mainnet',
  'Telegram Bot Airdrops',
  'Daily Check-in Airdrops',
  'Twitter Airdrops',
  'Social Airdrops',
  'AI Airdrops',
  'Wallet Airdrops',
  'Exchange Airdrops',
];

export const defaultTestnetCategories = [
  'Galxe Testnet',
  'Bridge Mining',
  'Mining Sessions',
];

export const defaultToolCategories = [
  'Wallet Connect',
  'Airdrop Claim Checker',
  'Gas Fee Calculator',
  'Testnet Token Faucets',
  'Crypto Wallet Extensions',
  'Swaps & Bridges',
];

export const defaultVideoCategories = [
  'Crypto Series',
  'Top Testnets',
  'Mining Projects',
];

// Helper function to load categories from localStorage
export const loadCategories = (key: string, defaultCategories: string[]): string[] => {
  const storedCategories = localStorage.getItem(key);
  if (storedCategories) {
    return JSON.parse(storedCategories);
  } else {
    localStorage.setItem(key, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
};

// Helper function to add a category
export const addCategoryToList = (
  categories: string[],
  category: string,
  key: string
): string[] => {
  if (!categories.includes(category)) {
    const newCategories = [...categories, category];
    localStorage.setItem(key, JSON.stringify(newCategories));
    return newCategories;
  }
  return categories;
};
