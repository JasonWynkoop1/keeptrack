ob;'j gb;lghl kll;k l;'fdl 'lhl hd;'lg hkg   ;'h;dhd';h;lgfflhs'opthk]spt]k h]sxr tohj]xrt[h sxthogjohk     'p 5yjpt0khkhl;l'l;kjfalksdjfkl;jfkafd;fpaiu89geurkljf;oui0ferioew;jp8fuewfkjodjfosdjg;uhr ;lkjjl;k;lsk;dfkjlv kdtweuiotoij;;;jfjdl;fksdjlka;;jajkl;jkl;jkljk;fsadfwiofveni t[;vnf l,./import axios from 'axios';

// Using Nutritionix API as primary source (faster and more reliable)
const NUTRITIONIX_API_BASE_URL = 'https://trackapi.nutritionix.com/v2';
// You'll need to sign up for a free or paid plan at https://www.nutritionix.com/business/api
const NUTRITIONIX_APP_ID = 'your_app_id'; // Replace with your actual app ID
const NUTRITIONIX_API_KEY = 'your_api_key'; // Replace with your actual API key

// Using Open Food Facts API as fallback (free and doesn't require API keys)
const OPEN_FOOD_FACTS_API_BASE_URL = 'https://world.openfoodfacts.org/api/v0';
const OPEN_FOOD_FACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

// Using USDA FoodData Central API as primary source (free and doesn't require special API keys)
// You can get your own API key at https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY'; // Replace with your actual API key in production

// Simple in-memory cache for search results with LRU (Least Recently Used) behavior
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // Get the value and refresh it in the cache to mark it as recently used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    // If the key exists, refresh it
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // If we're at capacity, remove the oldest item (first item in the map)
    else if (this.cache.size >= this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }

    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const searchCache = new LRUCache(50); // Store up to 50 search results
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create axios instances with different timeouts for different APIs
const axiosWithTimeout = axios.create({
  timeout: 8000 // 8 seconds timeout for most APIs
});

// Create a separate instance with a longer timeout for Open Food Facts API
// which tends to be slower and more prone to timeouts
const openFoodFactsAxios = axios.create({
  timeout: 15000 // 15 seconds timeout for Open Food Facts API
});


/**
 * Utility function to retry an API call with exponential backoff
 * @param {Function} apiCall - The API call function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @param {string} apiName - Name of the API for logging purposes
 * @returns {Promise<any>} - The API response or throws an error after all retries fail
 */
const retryWithBackoff = async (apiCall, maxRetries = 2, initialDelay = 1000, apiName = 'API') => {
  let lastError;
  let delay = initialDelay;
  const startTime = Date.now();

  for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
    try {
      // If this is a retry, log it
      if (retryCount > 0) {
        console.log(`${apiName}: Retry attempt ${retryCount}/${maxRetries} after ${delay}ms delay...`);
      }

      // Attempt the API call
      const result = await apiCall();

      // Log successful call with timing information
      const duration = Date.now() - startTime;
      if (retryCount === 0) {
        console.log(`${apiName}: Call successful on first attempt (${duration}ms)`);
      } else {
        console.log(`${apiName}: Call successful after ${retryCount} retries (${duration}ms total)`);
      }

      return result;
    } catch (error) {
      lastError = error;
      const duration = Date.now() - startTime;

      // Only retry on timeout or network errors
      if (!(error.code === 'ECONNABORTED' || 
            error.code === 'ERR_NETWORK' || 
            error.message.includes('timeout') || 
            error.message.includes('Network Error'))) {
        console.error(`${apiName}: Non-retryable error after ${duration}ms:`, error.message);
        throw error; // Don't retry for non-network errors
      }

      // If we've used all our retries, throw the last error
      if (retryCount === maxRetries) {
        console.error(`${apiName}: All ${maxRetries} retry attempts failed after ${duration}ms:`, error.message);
        throw error;
      }

      console.warn(`${apiName}: Attempt ${retryCount} failed after ${duration}ms with error: ${error.message}`);

      // Wait before the next retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  // This should never be reached due to the throw in the loop, but just in case
  throw lastError;
};

// Flag to track network connectivity status
let isNetworkAvailable = true;
let lastNetworkCheck = 0;
const NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if the network is available by making a simple request to a reliable endpoint
 * @returns {Promise<boolean>} - True if network is available, false otherwise
 */
const checkNetworkConnectivity = async () => {
  // Only check network connectivity if the last check was more than 30 seconds ago
  const now = Date.now();
  if (now - lastNetworkCheck < NETWORK_CHECK_INTERVAL) {
    return isNetworkAvailable;
  }

  try {
    // Try to fetch a small resource from a reliable CDN
    await axios.get('https://www.cloudflare.com/cdn-cgi/trace', { 
      timeout: 3000,
      // Only need the headers, not the full response
      validateStatus: () => true
    });

    isNetworkAvailable = true;
    console.log('Network connectivity check: ONLINE');
  } catch (error) {
    isNetworkAvailable = false;
    console.warn('Network connectivity check: OFFLINE', error.message);
  }

  lastNetworkCheck = now;
  return isNetworkAvailable;
};

// Local fallback data for common food items when all APIs are unreachable
const localFallbackFoods = [
  {
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Egg',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 5,
    servingSize: '50g',
    quantity: 50,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Rice (White, Cooked)',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Bread (White)',
    calories: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Milk (Whole)',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Beef (Ground, 80/20)',
    calories: 254,
    protein: 26,
    carbs: 0,
    fat: 17,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Salmon',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  },
  {
    name: 'Broccoli',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    source: 'Local Database'
  }
];

/**
 * Calculate similarity score between two strings (fuzzy matching)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateSimilarity = (str1, str2) => {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one string contains the other
  if (s1.includes(s2)) return 0.9;
  if (s2.includes(s1)) return 0.8;

  // Check for word matches
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  let wordMatches = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip short words
    for (const word2 of words2) {
      if (word2.length < 3) continue; // Skip short words
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        wordMatches++;
        break;
      }
    }
  }

  if (wordMatches > 0) {
    return 0.7 * (wordMatches / Math.max(words1.length, words2.length));
  }

  // Check for character-level similarity for typo tolerance
  let matchingChars = 0;
  const minLength = Math.min(s1.length, s2.length);

  for (let i = 0; i < minLength; i++) {
    if (s1[i] === s2[i]) {
      matchingChars++;
    }
  }

  return 0.5 * (matchingChars / Math.max(s1.length, s2.length));
};

/**
 * Search the local fallback database for foods matching the query with fuzzy matching
 * @param {string} query - The search query
 * @returns {Object} - Object with foods array and error properties
 */
const searchLocalFallbackFoods = (query) => {
  if (!query) {
    return { foods: [], error: null };
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Calculate similarity scores for each food
  const scoredFoods = localFallbackFoods.map(food => {
    const similarity = calculateSimilarity(food.name, normalizedQuery);
    return { ...food, similarity };
  });

  // Filter foods with a similarity score above a threshold and sort by similarity
  const matchingFoods = scoredFoods
    .filter(food => food.similarity > 0.3) // Adjust threshold as needed
    .sort((a, b) => b.similarity - a.similarity)
    .map(({ similarity, ...food }) => food); // Remove similarity score from result

  return {
    foods: matchingFoods,
    error: matchingFoods.length === 0 ? {
      message: 'No matching foods found in local database',
      details: 'External food databases are currently unreachable. Try again later or use a different search term.'
    } : null
  };
};

/**
 * Fetch nutrition data for a product by barcode
 * @param {string} barcode - The product barcode (EAN, UPC, etc.)
 * @returns {Promise<Object>} - The nutrition data
 */
export const getProductByBarcode = async (barcode) => {
  try {
    // Try USDA API first (using the FDC API)
    try {
      const response = await axiosWithTimeout.get(`${USDA_API_BASE_URL}/foods/search`, {
        params: {
          query: barcode,
          pageSize: 1,
          api_key: USDA_API_KEY
        }
      });

      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const food = response.data.foods[0];
        // Find the nutrients we're interested in
        const nutrients = food.foodNutrients || [];
        const calories = nutrients.find(n => n.nutrientName === 'Energy' && n.unitName === 'KCAL') || {};
        const protein = nutrients.find(n => n.nutrientName === 'Protein') || {};
        const carbs = nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference') || {};
        const fat = nutrients.find(n => n.nutrientName === 'Total lipid (fat)') || {};

        return {
          name: food.description || 'Unknown Product',
          calories: parseFloat(calories.value || 0),
          protein: parseFloat(protein.value || 0),
          carbs: parseFloat(carbs.value || 0),
          fat: parseFloat(fat.value || 0),
          servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : '100g',
          quantity: food.servingSize || 100,
          unit: food.servingSizeUnit || 'g',
          barcode: barcode,
          fdcId: food.fdcId,
          source: 'USDA'
        };
      }
    } catch (usdaError) {
      console.error('Error fetching from USDA:', usdaError);
      // Continue to fallback APIs
    }

    // Fallback to Nutritionix (if API keys are provided)
    if (NUTRITIONIX_APP_ID !== 'your_app_id' && NUTRITIONIX_API_KEY !== 'your_api_key') {
      try {
        const response = await axiosWithTimeout.get(`${NUTRITIONIX_API_BASE_URL}/search/item?upc=${barcode}`, {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY
          }
        });

        if (response.data && response.data.foods && response.data.foods.length > 0) {
          const food = response.data.foods[0];
          return {
            name: food.food_name || 'Unknown Product',
            calories: parseFloat(food.nf_calories || 0),
            protein: parseFloat(food.nf_protein || 0),
            carbs: parseFloat(food.nf_total_carbohydrate || 0),
            fat: parseFloat(food.nf_total_fat || 0),
            servingSize: food.serving_weight_grams ? `${food.serving_weight_grams}g` : '100g',
            quantity: food.serving_weight_grams || 100,
            unit: 'g',
            barcode: barcode,
            image: food.photo ? food.photo.thumb : null,
            source: 'Nutritionix'
          };
        }
      } catch (nutritionixError) {
        console.error('Error fetching from Nutritionix:', nutritionixError);
        // Continue to fallback APIs
      }
    }

    // Fallback to Open Food Facts (using longer timeout and retry mechanism)
    try {
      // Use the retry mechanism for the Open Food Facts API call
      const response = await retryWithBackoff(
        () => openFoodFactsAxios.get(`${OPEN_FOOD_FACTS_API_BASE_URL}/product/${barcode}.json`),
        2, // max retries
        1000, // initial delay
        'Open Food Facts Barcode API'
      );

      if (response.data.status === 0) {
        throw new Error('Product not found');
      }

      const product = response.data.product;

      // Extract the relevant nutrition information
      return {
        name: product.product_name || 'Unknown Product',
        calories: parseFloat(product.nutriments['energy-kcal_100g'] || 0),
        protein: parseFloat(product.nutriments.proteins_100g || 0),
        carbs: parseFloat(product.nutriments.carbohydrates_100g || 0),
        fat: parseFloat(product.nutriments.fat_100g || 0),
        servingSize: product.serving_size || '100g',
        quantity: 100,
        unit: 'g',
        barcode: barcode,
        image: product.image_url,
        source: 'Open Food Facts'
      };
    } catch (openFoodFactsError) {
      console.error('Error fetching from Open Food Facts:', openFoodFactsError);

      // If it's a timeout error, provide a more specific error message
      if (openFoodFactsError.code === 'ECONNABORTED' || 
          openFoodFactsError.message.includes('timeout')) {
        throw new Error('Open Food Facts API timeout. Please try again later.');
      }

      // For other errors, rethrow the original error
      throw openFoodFactsError;
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};

/**
 * Search for foods using Nutritionix API with fuzzy matching
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Object with foods array and error properties
 */
export const searchNutritionixFoods = async (query) => {
  try {
    // Normalize the query for consistent caching and better matching
    const normalizedQuery = query.trim().toLowerCase();

    // Don't search if query is too short
    if (normalizedQuery.length < 2) {
      return {
        foods: [],
        error: {
          message: 'Search query too short',
          details: 'Please enter at least 2 characters to search'
        }
      };
    }

    // Check if API keys are provided
    if (NUTRITIONIX_APP_ID === 'your_app_id' || NUTRITIONIX_API_KEY === 'your_api_key') {
      return {
        foods: [],
        error: {
          message: 'Nutritionix API keys not configured',
          details: 'Please provide valid Nutritionix API keys in the nutritionService.js file'
        }
      };
    }

    // Check cache first
    const cacheKey = `nutritionix:${normalizedQuery}`;
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      // Check if the cache entry is still valid
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        console.log('Returning cached Nutritionix results for:', normalizedQuery);
        return cachedData.data;
      } else {
        // Cache expired, remove it
        searchCache.delete(cacheKey);
      }
    }

    // Check network connectivity before making API calls
    const networkAvailable = await checkNetworkConnectivity();
    if (!networkAvailable) {
      console.log('Network unavailable for Nutritionix search, using local fallback database');
      const localResult = searchLocalFallbackFoods(normalizedQuery);

      // Add a warning message about using local data
      if (!localResult.error) {
        localResult.warning = {
          message: 'Using offline data',
          details: 'Network appears to be offline. Showing results from local database.'
        };
      }

      // Cache the local result
      searchCache.set(cacheKey, {
        data: localResult,
        timestamp: Date.now(),
        // This entry will expire after 1 minute
        expiry: Date.now() + (60 * 1000)
      });

      return localResult;
    }

    // Make the API request to Nutritionix
    const response = await axiosWithTimeout.post(
      `${NUTRITIONIX_API_BASE_URL}/search/instant`, 
      { query: normalizedQuery, detailed: true },
      {
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check if we got any results
    const commonFoods = response.data.common || [];
    const brandedFoods = response.data.branded || [];

    if (commonFoods.length === 0 && brandedFoods.length === 0) {
      const result = {
        foods: [],
        error: null
      };

      // Cache the empty result
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    }

    // Combine and map the results to our app's format
    const mappedFoods = [];
    const detailPromises = [];

    // Process common foods (generic foods) with similarity scoring
    for (const food of commonFoods.slice(0, 8)) { // Increased from 5 to 8 for better results
      // Calculate similarity score
      const similarity = calculateSimilarity(food.food_name, normalizedQuery);

      // Only process foods with reasonable similarity
      if (similarity > 0.3) {
        // For common foods, we need to make an additional API call to get nutrition data
        // We'll use Promise.all later to make these requests in parallel
        detailPromises.push(
          axiosWithTimeout.post(
            `${NUTRITIONIX_API_BASE_URL}/natural/nutrients`,
            { query: food.food_name },
            {
              headers: {
                'x-app-id': NUTRITIONIX_APP_ID,
                'x-app-key': NUTRITIONIX_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(detailResponse => {
            if (detailResponse.data.foods && detailResponse.data.foods.length > 0) {
              const detailedFood = detailResponse.data.foods[0];
              return {
                name: detailedFood.food_name || food.food_name,
                calories: parseFloat(detailedFood.nf_calories || 0),
                protein: parseFloat(detailedFood.nf_protein || 0),
                carbs: parseFloat(detailedFood.nf_total_carbohydrate || 0),
                fat: parseFloat(detailedFood.nf_total_fat || 0),
                servingSize: detailedFood.serving_weight_grams ? `${detailedFood.serving_weight_grams}g` : '100g',
                quantity: detailedFood.serving_weight_grams || 100,
                unit: 'g',
                image: detailedFood.photo ? detailedFood.photo.thumb : (food.photo ? food.photo.thumb : null),
                source: 'Nutritionix',
                similarity
              };
            }
            return null;
          })
          .catch(detailError => {
            console.error('Error fetching detailed nutrition for common food:', detailError);
            return null; // Skip this food if we can't get detailed nutrition
          })
        );
      }
    }

    // Process branded foods (products from specific brands) with similarity scoring
    for (const food of brandedFoods.slice(0, 8)) { // Increased from 5 to 8 for better results
      // Calculate similarity score
      const similarity = calculateSimilarity(food.food_name, normalizedQuery);

      // Only include foods with reasonable similarity
      if (similarity > 0.3) {
        mappedFoods.push({
          name: food.food_name || 'Unknown Food',
          calories: parseFloat(food.nf_calories || 0),
          protein: parseFloat(food.nf_protein || 0),
          carbs: parseFloat(food.nf_total_carbohydrate || 0),
          fat: parseFloat(food.nf_total_fat || 0),
          servingSize: food.serving_weight_grams ? `${food.serving_weight_grams}g` : '100g',
          quantity: food.serving_weight_grams || 100,
          unit: 'g',
          image: food.photo ? food.photo.thumb : null,
          source: 'Nutritionix',
          similarity
        });
      }
    }

    // Wait for all detail requests to complete
    const detailedFoods = await Promise.allSettled(detailPromises);

    // Add the successful detailed foods to our results
    for (const result of detailedFoods) {
      if (result.status === 'fulfilled' && result.value) {
        mappedFoods.push(result.value);
      }
    }

    // Sort by similarity score
    mappedFoods.sort((a, b) => b.similarity - a.similarity);

    // Remove similarity scores from final results
    const finalFoods = mappedFoods.map(({ similarity, ...food }) => food);

    // Create the result object
    const result = {
      foods: finalFoods,
      error: null
    };

    // Cache the results
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error searching Nutritionix foods:', error);

    // Normalize the query for consistent caching
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `nutritionix:${normalizedQuery}`;

    // Check if it's a network error
    const isNetworkError = error.code === 'ERR_NETWORK' || 
                          error.code === 'ECONNABORTED' || 
                          error.message.includes('Network Error') ||
                          error.message.includes('timeout') ||
                          error.message.includes('ERR_NAME_NOT_RESOLVED');

    if (isNetworkError) {
      console.log('Network error detected in Nutritionix search, using local fallback database');

      // Use local fallback database
      const localResult = searchLocalFallbackFoods(normalizedQuery);

      // Add a warning message about using local data
      if (!localResult.error) {
        localResult.warning = {
          message: 'Using offline data',
          details: 'Nutritionix database is currently unreachable. Showing results from local database.'
        };
      }

      // Cache the local result for a shorter time (1 minute)
      searchCache.set(cacheKey, {
        data: localResult,
        timestamp: Date.now(),
        expiry: Date.now() + (60 * 1000)
      });

      return localResult;
    }

    // Create an error result object with a more user-friendly message
    const errorResult = {
      foods: [],
      error: {
        message: 'Error searching Nutritionix database',
        details: error.response ? 
          `API Error (${error.response.status}): ${error.response.statusText}` : 
          (error.request ? 'No response from Nutritionix server. Try again later.' : error.message)
      }
    };

    // Cache the error response for a shorter time (1 minute)
    searchCache.set(cacheKey, {
      data: errorResult,
      timestamp: Date.now(),
      expiry: Date.now() + (60 * 1000)
    });

    return errorResult;
  }
};

/**
 * Search for products by name using multiple food databases with fallbacks
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Object with foods array and error properties
 */
export const searchProducts = async (query) => {
  // Normalize the query for consistent caching and better matching
  const normalizedQuery = query.trim().toLowerCase();

  // Don't search if query is too short
  if (normalizedQuery.length < 2) {
    return {
      foods: [],
      error: {
        message: 'Search query too short',
        details: 'Please enter at least 2 characters to search'
      }
    };
  }

  // Check cache first
  const cacheKey = `search:${normalizedQuery}`;
  if (searchCache.has(cacheKey)) {
    const cachedData = searchCache.get(cacheKey);
    // Check if the cache entry is still valid
    if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      console.log('Returning cached search results for:', normalizedQuery);
      return cachedData.data;
    } else {
      // Cache expired, remove it
      searchCache.delete(cacheKey);
    }
  }

  // Create a combined results array to store results from all sources
  let combinedResults = [];
  let errorMessages = [];
  let warningMessages = [];

  // Track which sources were successful
  const sourcesStatus = {
    local: false,
    usda: false,
    nutritionix: false,
    openFoodFacts: false
  };

  try {
    // Check network connectivity before making API calls
    const networkAvailable = await checkNetworkConnectivity();

    // If network is unavailable, use local database only
    if (!networkAvailable) {
      console.log('Network unavailable, using local fallback database');
      const localResult = searchLocalFallbackFoods(normalizedQuery);
      sourcesStatus.local = true;

      if (localResult.foods.length > 0) {
        combinedResults = localResult.foods;
        warningMessages.push({
          message: 'Using offline data',
          details: 'Network appears to be offline. Showing results from local database.'
        });
      } else if (localResult.error) {
        errorMessages.push(localResult.error);
      }

      // Return early with local results only
      const result = {
        foods: combinedResults,
        error: errorMessages.length > 0 ? errorMessages[0] : null,
        warning: warningMessages.length > 0 ? warningMessages[0] : null,
        sourcesStatus
      };

      // Cache the result for a shorter time since we're offline
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expiry: Date.now() + (60 * 1000) // 1 minute
      });

      return result;
    }

    // Network is available, try all sources in parallel for faster results
    const searchPromises = [];

    // Always include local database search for faster initial results
    const localPromise = Promise.resolve(searchLocalFallbackFoods(normalizedQuery));
    searchPromises.push(localPromise);

    // Try USDA API first (prioritize as it's free and reliable)
    const usdaPromise = searchUsdaFoods(normalizedQuery)
      .catch(error => {
        console.error('Error searching USDA:', error);
        return { foods: [], error: { message: 'USDA API error', details: error.message } };
      });
    searchPromises.push(usdaPromise);

    // Try Nutritionix if API keys are provided
    if (NUTRITIONIX_APP_ID !== 'your_app_id' && NUTRITIONIX_API_KEY !== 'your_api_key') {
      const nutritionixPromise = searchNutritionixFoods(normalizedQuery)
        .catch(error => {
          console.error('Error searching Nutritionix:', error);
          return { foods: [], error: { message: 'Nutritionix API error', details: error.message } };
        });
      searchPromises.push(nutritionixPromise);
    }

    // Try Open Food Facts API (using longer timeout and retry mechanism)
    const encodedQuery = encodeURIComponent(normalizedQuery);
    const openFoodFactsPromise = retryWithBackoff(
      () => openFoodFactsAxios.get(
        `${OPEN_FOOD_FACTS_SEARCH_URL}?search_terms=${encodedQuery}&search_simple=1&action=process&sort_by=relevance&page_size=15&json=1`
      ),
      2, // max retries
      1000, // initial delay
      'Open Food Facts Search API'
    )
    .then(response => {
      if (!response.data.products || response.data.products.length === 0) {
        return { foods: [] };
      }

      // Process and map the products with fuzzy matching
      const mappedProducts = [];
      for (const product of response.data.products) {
        // Skip products without a name
        if (!product.product_name) continue;

        // Calculate similarity score for better relevance
        const similarity = calculateSimilarity(product.product_name, normalizedQuery);

        // Only include products with reasonable similarity
        if (similarity > 0.3) {
          mappedProducts.push({
            name: product.product_name,
            calories: parseFloat(product.nutriments['energy-kcal_100g'] || 0),
            protein: parseFloat(product.nutriments.proteins_100g || 0),
            carbs: parseFloat(product.nutriments.carbohydrates_100g || 0),
            fat: parseFloat(product.nutriments.fat_100g || 0),
            servingSize: product.serving_size || '100g',
            quantity: 100,
            unit: 'g',
            barcode: product.code,
            image: product.image_url,
            source: 'Open Food Facts',
            similarity // Keep similarity for sorting later
          });
        }
      }

      // Sort by similarity score
      mappedProducts.sort((a, b) => b.similarity - a.similarity);

      // Remove similarity scores from final results
      const finalProducts = mappedProducts.map(({ similarity, ...product }) => product);

      return { foods: finalProducts };
    })
    .catch(error => {
      // Log the error with more details for debugging
      console.error('Error searching Open Food Facts:', error);

      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn('Open Food Facts API timeout detected, will try other sources');
        return { 
          foods: [], 
          error: { 
            message: 'Open Food Facts API timeout', 
            details: 'The search request to Open Food Facts timed out. Results from other sources will still be shown if available.'
          } 
        };
      }

      // For network errors, provide a more user-friendly message
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return { 
          foods: [], 
          error: { 
            message: 'Open Food Facts API network error', 
            details: 'Could not connect to Open Food Facts. Results from other sources will still be shown if available.'
          } 
        };
      }

      // For other errors, return a generic error message
      return { 
        foods: [], 
        error: { 
          message: 'Open Food Facts API error', 
          details: error.message || 'An error occurred while searching Open Food Facts'
        } 
      };
    });
    searchPromises.push(openFoodFactsPromise);

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises);

    // Extract results based on the order they were added to searchPromises
    let localResults = results[0];
    let usdaResults = results[1];

    // Initialize other results as undefined
    let nutritionixResults, openFoodFactsResults;

    // Track the current index in the results array
    let resultIndex = 2;

    // Check if Nutritionix was included and extract its results
    if (NUTRITIONIX_APP_ID !== 'your_app_id' && NUTRITIONIX_API_KEY !== 'your_api_key') {
      nutritionixResults = results[resultIndex++];
    }

    // Open Food Facts is always included
    openFoodFactsResults = results[resultIndex];

    // Process local results
    if (localResults.status === 'fulfilled') {
      sourcesStatus.local = true;
      if (localResults.value.foods.length > 0) {
        // Add source tag to local results
        const localFoods = localResults.value.foods.map(food => ({
          ...food,
          source: food.source || 'Local Database'
        }));
        combinedResults = [...combinedResults, ...localFoods];
      }
      if (localResults.value.error) {
        errorMessages.push(localResults.value.error);
      }
    }

    // Process USDA results (prioritized as primary source)
    if (usdaResults.status === 'fulfilled') {
      sourcesStatus.usda = true;
      if (usdaResults.value.foods.length > 0) {
        combinedResults = [...combinedResults, ...usdaResults.value.foods];
      }
      if (usdaResults.value.error) {
        errorMessages.push(usdaResults.value.error);
      }
    }

    // Process Nutritionix results
    if (nutritionixResults && nutritionixResults.status === 'fulfilled') {
      sourcesStatus.nutritionix = true;
      if (nutritionixResults.value.foods.length > 0) {
        // Add source tag to Nutritionix results
        const nutritionixFoods = nutritionixResults.value.foods.map(food => ({
          ...food,
          source: food.source || 'Nutritionix'
        }));
        combinedResults = [...combinedResults, ...nutritionixFoods];
      }
      if (nutritionixResults.value.error) {
        errorMessages.push(nutritionixResults.value.error);
      }
    }

    // Process Open Food Facts results
    if (openFoodFactsResults.status === 'fulfilled') {
      sourcesStatus.openFoodFacts = true;
      if (openFoodFactsResults.value.foods.length > 0) {
        combinedResults = [...combinedResults, ...openFoodFactsResults.value.foods];
      }
      if (openFoodFactsResults.value.error) {
        errorMessages.push(openFoodFactsResults.value.error);
      }
    }

    // Remove duplicates based on name similarity
    const uniqueResults = [];
    const seenNames = new Set();

    for (const food of combinedResults) {
      let isDuplicate = false;

      // Check if this food is similar to any we've already added
      for (const seenName of seenNames) {
        if (calculateSimilarity(food.name, seenName) > 0.8) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        uniqueResults.push(food);
        seenNames.add(food.name);
      }
    }

    // Create the final result object
    const result = {
      foods: uniqueResults,
      error: errorMessages.length > 0 ? errorMessages[0] : null,
      warning: warningMessages.length > 0 ? warningMessages[0] : null,
      sourcesStatus
    };

    // If we have no results but searched all sources, add a helpful message
    if (uniqueResults.length === 0 && Object.values(sourcesStatus).some(status => status)) {
      result.error = {
        message: 'No foods found matching your search',
        details: 'Try a different search term or check your spelling'
      };
    }

    // Cache the results
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Unexpected error in searchProducts:', error);

    // Try local fallback as last resort
    try {
      const localResult = searchLocalFallbackFoods(normalizedQuery);
      sourcesStatus.local = true;

      if (localResult.foods.length > 0) {
        combinedResults = localResult.foods;
        warningMessages.push({
          message: 'Using offline data',
          details: 'Food databases are currently unreachable. Showing results from local database.'
        });
      } else {
        errorMessages.push({
          message: 'Error searching food databases',
          details: error.message || 'Unable to connect to food databases'
        });
      }

      const result = {
        foods: combinedResults,
        error: errorMessages.length > 0 ? errorMessages[0] : null,
        warning: warningMessages.length > 0 ? warningMessages[0] : null,
        sourcesStatus
      };

      // Cache the error response for a shorter time
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expiry: Date.now() + (60 * 1000) // 1 minute
      });

      return result;
    } catch (localError) {
      // If even local search fails, return a standardized error response
      const errorResult = {
        foods: [],
        error: {
          message: 'Error searching food databases',
          details: error.message || 'Unable to search for foods at this time'
        },
        sourcesStatus
      };

      // Cache the error response for a shorter time
      searchCache.set(cacheKey, {
        data: errorResult,
        timestamp: Date.now(),
        expiry: Date.now() + (60 * 1000) // 1 minute
      });

      return errorResult;
    }
  }
};

/**
 * Search for foods using USDA FoodData Central API with fuzzy matching
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Object with foods array and error properties
 */
export const searchUsdaFoods = async (query) => {
  try {
    // Normalize the query for consistent caching and better matching
    const normalizedQuery = query.trim().toLowerCase();

    // Don't search if query is too short
    if (normalizedQuery.length < 2) {
      return {
        foods: [],
        error: {
          message: 'Search query too short',
          details: 'Please enter at least 2 characters to search'
        }
      };
    }

    // Check cache first
    const cacheKey = `usda:${normalizedQuery}`;
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      // Check if the cache entry is still valid
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        console.log('Returning cached USDA results for:', normalizedQuery);
        return cachedData.data;
      } else {
        // Cache expired, remove it
        searchCache.delete(cacheKey);
      }
    }

    // Check network connectivity before making API calls
    const networkAvailable = await checkNetworkConnectivity();
    if (!networkAvailable) {
      console.log('Network unavailable for USDA search, using local fallback database');
      const localResult = searchLocalFallbackFoods(normalizedQuery);

      // Add a warning message about using local data
      if (!localResult.error) {
        localResult.warning = {
          message: 'Using offline data',
          details: 'Network appears to be offline. Showing results from local database.'
        };
      }

      // Cache the local result
      searchCache.set(cacheKey, {
        data: localResult,
        timestamp: Date.now(),
        // This entry will expire after 1 minute
        expiry: Date.now() + (60 * 1000)
      });

      return localResult;
    }

    // Increased pageSize to 10 for better search results
    const response = await axiosWithTimeout.get(`${USDA_API_BASE_URL}/foods/search`, {
      params: {
        query: normalizedQuery,
        pageSize: 10,
        api_key: USDA_API_KEY
      }
    });

    if (!response.data.foods || response.data.foods.length === 0) {
      // Return empty foods array with no error
      const result = {
        foods: [],
        error: null
      };

      // Cache the empty result
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    }

    // Map the USDA foods to our app's format with similarity scoring
    const scoredFoods = response.data.foods.map(food => {
      // Find the nutrients we're interested in
      const nutrients = food.foodNutrients || [];
      const calories = nutrients.find(n => n.nutrientName === 'Energy' && n.unitName === 'KCAL') || {};
      const protein = nutrients.find(n => n.nutrientName === 'Protein') || {};
      const carbs = nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference') || {};
      const fat = nutrients.find(n => n.nutrientName === 'Total lipid (fat)') || {};

      // Calculate similarity score for better relevance
      const similarity = calculateSimilarity(food.description || '', normalizedQuery);

      return {
        name: food.description || 'Unknown Food',
        calories: parseFloat(calories.value || 0),
        protein: parseFloat(protein.value || 0),
        carbs: parseFloat(carbs.value || 0),
        fat: parseFloat(fat.value || 0),
        servingSize: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit}` : '100g',
        quantity: food.servingSize || 100,
        unit: food.servingSizeUnit || 'g',
        fdcId: food.fdcId,
        image: null, // USDA doesn't provide images
        source: 'USDA',
        similarity // Keep similarity for sorting
      };
    });

    // Filter foods with a similarity score above a threshold and sort by similarity
    const filteredFoods = scoredFoods
      .filter(food => food.similarity > 0.3) // Same threshold as local search
      .sort((a, b) => b.similarity - a.similarity);

    // Remove similarity scores from final results
    const mappedFoods = filteredFoods.map(({ similarity, ...food }) => food);

    // Create the result object
    const result = {
      foods: mappedFoods,
      error: null
    };

    // Cache the results
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error searching USDA foods:', error);

    // Normalize the query for consistent caching
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `usda:${normalizedQuery}`;

    // Check if it's a network error (ERR_NETWORK, ERR_NAME_NOT_RESOLVED, etc.)
    const isNetworkError = error.code === 'ERR_NETWORK' || 
                          error.code === 'ECONNABORTED' || 
                          error.message.includes('Network Error') ||
                          error.message.includes('timeout') ||
                          error.message.includes('ERR_NAME_NOT_RESOLVED');

    if (isNetworkError) {
      console.log('Network error detected in USDA search, using local fallback database');

      // Use local fallback database
      const localResult = searchLocalFallbackFoods(normalizedQuery);

      // Add a warning message about using local data
      if (!localResult.error) {
        localResult.warning = {
          message: 'Using offline data',
          details: 'USDA food database is currently unreachable. Showing results from local database.'
        };
      }

      // Cache the local result for a shorter time (1 minute)
      searchCache.set(cacheKey, {
        data: localResult,
        timestamp: Date.now(),
        // This entry will expire after 1 minute instead of the default 5 minutes
        expiry: Date.now() + (60 * 1000)
      });

      return localResult;
    }

    // Provide more detailed error logging to help with debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('USDA API error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });

      // If the error is related to the API key (common with DEMO_KEY), provide a more helpful message
      if (error.response.status === 403) {
        console.warn('USDA API key may be invalid or rate-limited. Consider getting a proper API key.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('USDA API no response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('USDA API request setup error:', error.message);
    }

    // Create an error result object with a more user-friendly message
    const errorResult = {
      foods: [],
      error: {
        message: 'Error searching USDA database',
        details: error.response ? 
          (error.response.status === 403 ? 
            'API key rate limit exceeded. Try again later.' : 
            `API Error (${error.response.status}): ${error.response.statusText}`) : 
          (error.request ? 'No response from USDA database. Try again later.' : error.message)
      }
    };

    // Cache the error response for a shorter time (1 minute)
    searchCache.set(cacheKey, {
      data: errorResult,
      timestamp: Date.now(),
      // This entry will expire after 1 minute instead of the default 5 minutes
      expiry: Date.now() + (60 * 1000)
    });

    return errorResult;
  }
};


/**
 * Calculate nutrition values based on the portion size
 * @param {Object} food - The food item with nutrition data
 * @param {number} quantity - The quantity of food
 * @param {string} unit - The unit of measurement (g, ml, oz, etc.)
 * @returns {Object} - The adjusted nutrition data
 */
export const calculateNutrition = (food, quantity, unit) => {
  if (!food) return null;

  // Default to 100g if no quantity is provided
  const baseQuantity = food.quantity || 100;
  const newQuantity = quantity || baseQuantity;

  // Calculate the ratio of new quantity to base quantity
  const ratio = newQuantity / baseQuantity;

  // Adjust nutrition values based on the ratio
  return {
    ...food,
    calories: parseFloat((food.calories * ratio).toFixed(1)),
    protein: parseFloat((food.protein * ratio).toFixed(1)),
    carbs: parseFloat((food.carbs * ratio).toFixed(1)),
    fat: parseFloat((food.fat * ratio).toFixed(1)),
    quantity: newQuantity,
    unit: unit || food.unit || 'g',
    servingSize: `${newQuantity}${unit || food.unit || 'g'}`
  };
};
