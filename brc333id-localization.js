/**
 * BRC333 ID Localization Module
 * 
 * This module provides multi-language localization support for BRC333 Overweb ID cards.
 * It handles JSON-based language management, runtime switching, profile preferences,
 * and fallback behavior according to the BRC-333 localization protocol.
 * 
 * Features:
 * - Field mapping convention with stable identifiers
 * - JSON-based localization management via reinscriptions
 * - Profile-specific language preferences
 * - Runtime language switching with fallback
 * - Keyboard shortcut support (L key to cycle languages)
 * - Hash route support (#lang=es)
 * 
 * Usage:
 * <script src="https://natowls.xyz/brc333id-localization.js"></script>
 * 
 * @author BRC333 Protocol
 * @version 1.0.0
 */

/**
 * Default English localization data embedded in the system
 */
const DEFAULT_LOCALIZATION = {
    // Test Interface (for testing purposes)
    "test_title": "Localization System Test",
    "welcome_message": "Welcome",
    "card_description": "This is your Overweb ID card",
    
    // Card Interface
    "card_title": "OVERWEB ID",
    "card_subtitle": "A Trust Signal in the Emerging Metaweb",
    
    // Field Labels
    "sns_label": "SNS",
    "handle_label": "Handle",
    "participant_label": "Bridger No.",
    "participant_type": "Bridger",
    "level_label": "Level",
    "credentials_label": "Credentials",
    "badges_label": "Badges",
    "microcreds_label": "Micro-Credentials",
    "protocol_label": "Protocol",
    "date_label": "Date",
    "block_label": "Block",
    "id_label": "Id",
    "satoshi_label": "Satoshi",
    
    // System Information
    "protocol_name": "BRC333",
    "chain_name": "Bitcoin",
    "medium_name": "Ordinals",
    
    // Content Sections (can be overridden by global config variables)
    "description_content": "This is a decentralized identity system built on Bitcoin.",
    "instructions_content": "Instructions for using this interface will appear here.",
    "brc333_message": "The BRC333 protocol enables the creation of future-proof satplications.",
    
    // Tooltips
    "tooltip_credentials": "View all attestations and credentials",
    "tooltip_badges": "View PEARL credentials only",
    "tooltip_microcreds": "View micro-credentials only",
    
    // Buttons (these can be overridden by global config variables)
    "button_close": "Close",
    "button_back_to_id": "BACK TO ID",
    "button_credentials": "CREDENTIALS",
    "button_contents": "CONTENTS",
    "button_refresh": "REFRESH",
    "button_lfg": "LFG!",
    
    // Messages (these can be overridden by global config variables)
    "end_message": "This Bitcoin satplication represents a new paradigm for decentralized applications.",
    "preface_message": "Welcome to the decentralized web.",
    
    // Modal and Copy Instructions
    "copy_instruction": "To copy: Command-C (Mac) or Ctrl+C (Windows)",
    "modal_sns_name_title": "SNS Name",
    "modal_handle_title": "Handle", 
    "modal_inscription_id_title": "Inscription ID",
    
    // Preface Interface
    "preface_title": "Attestations & Credentials",
    "preface_loading": "Loading attestations...",
    "preface_no_results": "No attestations found.",
    
    // Preface Content (can be overridden by inscription content)
    "preface_welcome_title": "Welcome",
    "preface_welcome_subtitle": "Explore the Decentralized Web",
    "preface_description": "This collection represents verified achievements and contributions in the decentralized web.",
    "preface_instructions": "Click on any item to view details, or use the search and filter options to find specific credentials.",
    "preface_getting_started": "Getting Started",
    "preface_how_to_use": "How to Use",
    "preface_navigation": "Navigation",
    
    // Search and Filter
    "search_placeholder": "Search credentials...",
    "search_placeholder_contributions": "Search contributions...",
    "filter_all": "All",
    "filter_pearl": "PEARL",
    "filter_micro": "Micro",
    "filter_type": "Type",
    "filter_author": "Author",
    "filter_date": "Date",
    "results_count": "results",
    "results_showing": "Showing",
    "results_of": "of",
    "results_page": "Page",
    "results_next": "Next",
    "results_previous": "Previous",
    
    // BRC Messages
    "brc_protocol_name": "BRC333",
    "brc_about_protocol": "About the BRC333 Protocol",
    "brc_satplications": "Satplications",
    "brc_dynamic_ordinals": "Dynamic Ordinals",
    "brc_immutable_apps": "Immutable Applications",
    
    // End Messages (can be overridden by global endMessage)
    "end_message_default": "Thank you for exploring the decentralized web.",
    "end_completion": "Exploration Complete",
    "end_next_steps": "Next Steps",
    "end_learn_more": "Learn More",
    "end_contribute": "Contribute",
    
    // Preface Image
    "preface_image_alt": "Decentralized Web Illustration",
    "preface_image_title": "The Future of the Internet",
    "preface_image_loading": "Loading image...",
    "preface_image_error": "Image could not be loaded",
    "preface_image_description": "Visual representation of decentralized architecture",
    
    // Article Metadata Labels
    "article_title": "Title",
    "article_author": "Author",
    "article_issuer": "Issuer",
    "article_date": "Date",
    "article_type": "Type",
    "article_tags": "Tags",
    "article_level": "Level",
    "article_medium": "Medium",
    "article_category": "Category",
    "article_status": "Status",
    "article_version": "Version",
    "article_id": "ID",
    "article_source": "Source",
    "article_summary": "Summary",
    "article_keywords": "Keywords",
    "article_difficulty": "Difficulty",
    "article_duration": "Duration",
    "article_prerequisites": "Prerequisites",
    "article_objectives": "Objectives",
    "article_outcomes": "Outcomes",
    
    // Color Interface
    "color_title": "Set Background Color",
    "color_hex_label": "Enter a 6-digit hex color",
    "color_apply": "Set Color",
    "color_cancel": "Cancel",
    "color_preview": "Preview",
    "color_current": "Current Color",
    "color_default": "Default",
    "color_custom": "Custom",
    "color_palette": "Color Palette",
    "color_recent": "Recent Colors",
    
    // Search & Filter
    "search_results": "Search Results",
    "search_no_results": "No results found",
    "search_clear": "Clear Search",
    "search_filters": "Filters",
    "search_sort": "Sort By",
    "search_sort_date": "Date",
    "search_sort_title": "Title",
    "search_sort_author": "Author",
    "search_sort_type": "Type",
    "search_ascending": "Ascending",
    "search_descending": "Descending",
    
    // Pagination
    "pagination_first": "First",
    "pagination_last": "Last",
    "pagination_previous": "Previous",
    "pagination_next": "Next",
    "pagination_page": "Page",
    "pagination_of": "of",
    "pagination_items_per_page": "Items per page",
    
    // Navigation
    "nav_home": "Home",
    "nav_credentials": "Credentials",
    "nav_profile": "Profile",
    "nav_settings": "Settings",
    "nav_help": "Help",
    "nav_about": "About",
    "nav_back": "Back",
    "nav_forward": "Forward",
    "nav_up": "Up",
    "nav_menu": "Menu",
    
    // Status Messages
    "status_loading": "Loading...",
    "status_error": "Error occurred",
    "status_success": "Success",
    "status_warning": "Warning",
    "status_info": "Information",
    "status_offline": "Offline",
    "status_online": "Online",
    "status_connecting": "Connecting...",
    "status_disconnected": "Disconnected",
    
    // Accessibility
    "accessibility_skip_to_content": "Skip to content",
    "accessibility_main_menu": "Main menu",
    "accessibility_close_dialog": "Close dialog",
    "accessibility_expand": "Expand",
    "accessibility_collapse": "Collapse",
    "accessibility_loading": "Content is loading",
    "accessibility_image": "Image",
    "accessibility_button": "Button",
    "accessibility_link": "Link",
    
    // Keyboard Shortcuts
    "keyboard_help": "Keyboard shortcuts",
    "keyboard_close": "Press Escape to close",
    "keyboard_navigate": "Use arrow keys to navigate",
    "keyboard_select": "Press Enter to select",
    "keyboard_back": "Press Backspace to go back",
    "keyboard_search": "Press / to search",
    "keyboard_language": "Press L to change language",
    
    // Common Values
    "value_not_available": "N/A",
    "value_unknown": "Unknown",
    "value_anonymous": "Anonymous",
    "value_loading": "Loading...",
    "value_error": "Error",
    "value_none": "None",
    "value_all": "All",
    "value_other": "Other",
};

/**
 * Global localization state
 */
let currentLanguage = 'en';
let availableLanguages = ['en'];
let userLanguagePreferences = ['en'];
let localizationData = { en: DEFAULT_LOCALIZATION };
let currentLanguageIndex = 0;

/**
 * Initialize the localization system
 * This function sets up the localization system with default settings
 * @param {Object} [options={}] - Configuration options for initialization
 * @param {string} [options.defaultLanguage='en'] - Default language to use
 * @param {Array<string>} [options.supportedLanguages=['en', 'es']] - List of supported languages
 * @returns {Promise<void>}
 */
async function initializeLocalization(options = {}) {
    const {
        defaultLanguage = 'en',
        supportedLanguages = ['en', 'es']
    } = options;
    
    console.log('[Localization] Initializing localization system...');
    console.log(`[Localization] Default language: ${defaultLanguage}`);
    console.log(`[Localization] Supported languages: ${supportedLanguages.join(', ')}`);
    
    try {
        // Set initial values
        currentLanguage = defaultLanguage;
        availableLanguages = [...supportedLanguages];
        
        // Load embedded English localization
        localizationData['en'] = DEFAULT_LOCALIZATION;
        
        // Check for language preference in URL hash
        const urlHash = window.location.hash;
        const langMatch = urlHash.match(/lang=([^&]+)/);
        const preferredLanguage = langMatch ? langMatch[1] : null;
        
        // Check for user language preferences (from profile data)
        let userLanguages = [];
        if (window.profileData && window.profileData.languages) {
            userLanguages = Array.isArray(window.profileData.languages) 
                ? window.profileData.languages 
                : [window.profileData.languages];
        }
        
        // Determine which language to use (priority: URL > User Preference > Default)
        let targetLanguage = defaultLanguage;
        
        if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
            targetLanguage = preferredLanguage;
            console.log(`[Localization] Using language from URL: ${targetLanguage}`);
        } else if (userLanguages.length > 0) {
            // Find first supported language from user preferences
            const supportedUserLang = userLanguages.find(lang => supportedLanguages.includes(lang));
            if (supportedUserLang) {
                targetLanguage = supportedUserLang;
                console.log(`[Localization] Using language from user profile: ${targetLanguage}`);
            }
        }
        
        // Switch to target language if it's not English
        if (targetLanguage !== 'en') {
            await switchLanguage(targetLanguage);
        } else {
            // Apply English localization immediately
            updateLocalizedElements();
        }
        
        // Set up keyboard shortcut (L key)
        setupKeyboardShortcuts();
        
        console.log(`[Localization] Initialization complete. Current language: ${currentLanguage}`);
        
    } catch (error) {
        console.error('[Localization] Error during initialization:', error);
        // Fall back to English on initialization error
        currentLanguage = 'en';
        localizationData['en'] = DEFAULT_LOCALIZATION;
        updateLocalizedElements();
    }
}

/**
 * Loads localization data from global inscriptions.
 * @returns {Promise<void>}
 */
async function loadLocalizationData() {
    try {
        // Get the sat for o_1.js inscription to find localization data
        const o1InscriptionId = 'fd03c98b616a774235292eef99ecf4d17d09f78f33b1c5045cace3ce9ea6e7b4i0'; // o_1.js inscription
        
        let o1Meta;
        try {
            o1Meta = await getMetadata(`https://ordinals.com/r/inscription/${o1InscriptionId}`);
        } catch (error) {
            console.warn('[Localization] Failed to fetch o_1.js metadata:', error);
            return;
        }
        
        if (!o1Meta || !o1Meta.sat) {
            console.log('[Localization] Could not find o_1.js sat for localization data');
            return;
        }
        
        let inscriptionIds;
        try {
            inscriptionIds = await getInscriptionsForSat(o1Meta.sat);
        } catch (error) {
            console.warn('[Localization] Failed to fetch inscriptions for o_1.js sat:', error);
            return;
        }
        
        console.log(`[Localization] Found ${inscriptionIds.length} inscriptions on o_1.js sat for localization`);
        
        for (const id of inscriptionIds) {
            try {
                const [content, meta] = await Promise.all([
                    getInscriptionContent(id, true).catch(err => {
                        console.warn(`[Localization] Failed to get content for ${id}:`, err);
                        return null;
                    }),
                    getMetadata(`https://ordinals.com/r/inscription/${id}`).catch(err => {
                        console.warn(`[Localization] Failed to get metadata for ${id}:`, err);
                        return null;
                    })
                ]);
                
                if (content && meta && content.p === 'BRC333' && content.op === 'localization') {
                    await processLocalizationInscription(content, meta.timestamp);
                }
            } catch (err) {
                console.warn(`[Localization] Could not process localization inscription ${id}:`, err);
                // Continue processing other inscriptions
            }
        }
        
        console.log('[Localization] Localization data loaded:', Object.keys(localizationData));
    } catch (error) {
        console.error('[Localization] Error loading localization data:', error);
        // System will fall back to DEFAULT_LOCALIZATION
    }
}

/**
 * Processes a localization inscription and extracts language data.
 * @param {Object} content - The parsed JSON content from the inscription.
 * @param {number} timestamp - The timestamp of the inscription.
 * @returns {void}
 */
async function processLocalizationInscription(content, timestamp) {
    if (!content || typeof content !== 'object') return;
    
    // Extract language code from the content
    let languageCode = null;
    
    // Look for language indicators in the content
    if (content.lang) {
        languageCode = content.lang;
    } else if (content.language) {
        languageCode = content.language;
    } else if (content.locale) {
        languageCode = content.locale.split('-')[0]; // Extract language from locale like 'es-ES'
    }
    
    if (!languageCode) {
        console.warn('[Localization] No language code found in localization inscription');
        return;
    }
    
    // Store the localization data
    if (!localizationData[languageCode]) {
        localizationData[languageCode] = {};
        availableLanguages.push(languageCode);
    }
    
    // Merge the content (excluding metadata fields)
    const { lang, language, locale, timestamp: _, ...localizationContent } = content;
    Object.assign(localizationData[languageCode], localizationContent);
    
    console.log(`[Localization] Loaded ${languageCode} localization data`);
}

/**
 * Loads user language preferences from profile inscriptions.
 * @returns {Promise<void>}
 */
async function loadUserLanguagePreferences() {
    // This would load from the user's profile inscriptions
    // For now, we'll use a default implementation
    console.log('[Localization] Loading user language preferences...');
    
    // Try to get from profile data if available
    if (window.profileData && window.profileData.languages) {
        userPreferences.language = window.profileData.languages[0];
        console.log(`[Localization] User preference language: ${userPreferences.language}`);
    }
}

/**
 * Extracts language code from URL hash.
 * @returns {string|null} The language code or null if not found.
 */
function getLanguageFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/[?&]lang=([a-z]{2})/);
    return match ? match[1] : null;
}

/**
 * Sets the current language and updates the UI.
 * @param {string} languageId - The language code to set.
 * @returns {void}
 */
function setLanguage(languageId) {
    if (!languageId || !availableLanguages.includes(languageId)) {
        console.warn(`[Localization] Invalid language: ${languageId}`);
        return;
    }
    
    try {
        currentLanguage = languageId;
        console.log(`[Localization] Language set to: ${currentLanguage}`);
        
        // Update all localized elements
        updateLocalizedElements();
        
        // Update hash if not already set
        if (!window.location.hash.includes('lang=')) {
            window.location.hash = window.location.hash + (window.location.hash ? '&' : '') + `lang=${languageId}`;
        }
    } catch (error) {
        console.error(`[Localization] Error setting language to ${languageId}:`, error);
    }
}

/**
 * Get localized text with priority handling for global config variables.
 * Priority: Global Config Variables > Current Language > User Preferences > English Default > Key
 * @param {string} key - The localization key.
 * @param {string|null} [fallback=null] - Fallback text if key not found.
 * @returns {string} The localized text.
 */
function getLocalizedText(key, fallback = null) {
    const localizations = window.Localization ? window.Localization.localizationData : { en: DEFAULT_LOCALIZATION };
    
    // Global config mappings - these can be overridden by localization
    const globalConfigMappings = {
        'button_back_to_id': window.lfgButtonText || window.restartButtonText,
        'button_credentials': window.prefaceButtonText,
        'button_contents': window.prefaceButtonText,
        'end_message': window.endMessage,
        'preface_message': window.prefaceMessage,
        'search_placeholder': window.searchPlaceholder,
        'preface_title': window.linkListTitle,
        
        // Additional config values from test data
        'card_title': window.idName,
        'card_subtitle': window.idDescription,
        'participant_label': window.participantNum,
        'participant_type': window.participant,
        'protocol_name': window.protocol,
        'chain_name': window.chain,
        'medium_name': window.medium,
        'description_content': window.description,
        'instructions_content': window.overwebIdInstructions,
        'brc333_message': window.brc333message
    };
    
    // SMART PRIORITY SYSTEM:
    // If we're not in English and have a localized version, use it instead of global config
    if (currentLanguage !== 'en' && localizationData[currentLanguage] && localizationData[currentLanguage][key]) {
        console.log(`[Localization] Using ${currentLanguage} localization for ${key}:`, localizationData[currentLanguage][key]);
        return localizationData[currentLanguage][key];
    }
    
    // Otherwise, check global config (works for English or when no localization exists)
    if (globalConfigMappings[key] && globalConfigMappings[key] !== undefined) {
        console.log(`[Localization] Using global config for ${key}:`, globalConfigMappings[key]);
        return globalConfigMappings[key];
    }
    
    // Try current language again (in case it wasn't caught above)
    if (currentLanguage && localizationData[currentLanguage] && localizationData[currentLanguage][key]) {
        return localizationData[currentLanguage][key];
    }
    
    // Try user preferences language
    if (userLanguagePreferences && userLanguagePreferences.length > 0) {
        for (const prefLang of userLanguagePreferences) {
            if (prefLang !== currentLanguage && localizationData[prefLang] && localizationData[prefLang][key]) {
                return localizationData[prefLang][key];
            }
        }
    }
    
    // Try English default
    if (DEFAULT_LOCALIZATION[key]) {
        return DEFAULT_LOCALIZATION[key];
    }
    
    // Return fallback or key
    return fallback || key;
}

/**
 * Update all localized elements in the DOM with current language text
 * This function finds all elements with data-localize attributes and updates their content
 * @returns {void}
 */
function updateLocalizedElements() {
    console.log('[Localization] Updating localized elements in DOM');
    
    // Cache DOM queries for better performance
    const elementsWithText = document.querySelectorAll('[data-localize]');
    const elementsWithTitle = document.querySelectorAll('[data-localize-title]');
    const elementsWithPlaceholder = document.querySelectorAll('[data-localize-placeholder]');
    
    console.log(`[Localization] Found ${elementsWithText.length} text elements, ${elementsWithTitle.length} title elements, ${elementsWithPlaceholder.length} placeholder elements`);
    
    // Batch DOM updates for better performance
    const updates = [];
    
    // Update text content
    elementsWithText.forEach(element => {
        const key = element.getAttribute('data-localize');
        if (key) {
            const localizedText = getLocalizedText(key);
            if (localizedText !== key) { // Only update if we found a translation
                updates.push(() => {
                    element.textContent = localizedText;
                });
            }
        }
    });
    
    // Update title attributes
    elementsWithTitle.forEach(element => {
        const key = element.getAttribute('data-localize-title');
        if (key) {
            const localizedText = getLocalizedText(key);
            if (localizedText !== key) { // Only update if we found a translation
                updates.push(() => {
                    element.title = localizedText;
                });
            }
        }
    });
    
    // Update placeholder attributes
    elementsWithPlaceholder.forEach(element => {
        const key = element.getAttribute('data-localize-placeholder');
        if (key) {
            const localizedText = getLocalizedText(key);
            if (localizedText !== key) { // Only update if we found a translation
                updates.push(() => {
                    element.placeholder = localizedText;
                });
            }
        }
    });
    
    // Apply all updates in a single batch
    updates.forEach(update => update());
    
    console.log(`[Localization] Applied ${updates.length} localization updates`);
    
    // After updating localized text, ensure title and subtitle fit properly
    if (typeof window.Layout?.fitText === 'function') {
        const titleEl = document.getElementById('card-title-text');
        const subtitleEl = document.getElementById('card-subtitle-text');
        
        if (titleEl) {
            window.Layout.fitText(titleEl, 2.2, 0.8);
            console.log('[Localization] Re-fitted title text after localization update');
        }
        if (subtitleEl) {
            window.Layout.fitText(subtitleEl, 0.9, 0.6);
            console.log('[Localization] Re-fitted subtitle text after localization update');
        }
    }
}

/**
 * Cycle to next available language
 */
function cycleLanguage() {
    currentLanguageIndex = (currentLanguageIndex + 1) % availableLanguages.length;
    const nextLanguage = availableLanguages[currentLanguageIndex];
    setLanguage(nextLanguage);
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Only trigger if not in input field
            if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                cycleLanguage();
            }
        }
    });
}

/**
 * Setup hash change listener
 */
function setupHashListener() {
    window.addEventListener('hashchange', () => {
        const hashLang = getLanguageFromHash();
        if (hashLang && hashLang !== currentLanguage && availableLanguages.includes(hashLang)) {
            setLanguage(hashLang);
        }
    });
}

/**
 * Helper function to localize dynamic content
 */
function localizeContent(content, localizations = {}) {
    let localizedContent = content;
    
    // Replace localization keys in content
    Object.keys(localizations).forEach(key => {
        const localizedText = getLocalizedText(key, localizations[key]);
        localizedContent = localizedContent.replace(new RegExp(`{{${key}}}`, 'g'), localizedText);
    });
    
    return localizedContent;
}

/**
 * Get current language info
 */
function getCurrentLanguageInfo() {
    return {
        current: currentLanguage,
        available: availableLanguages,
        preferences: userLanguagePreferences,
        data: localizationData[currentLanguage] || localizationData.en
    };
}

/**
 * Load language-specific inscription content if available
 * This function checks for language-specific versions of inscriptions
 * and loads them when the language changes
 * 
 * NOTE: This feature is currently disabled to simplify the system.
 * Spanish content should be provided directly in localization-es.json
 */
async function loadLocalizedInscriptionContent(language) {
    if (!language || language === 'en') return; // Skip for English (default)
    
    console.log(`[Localization] Language-specific inscription loading is disabled. Use localization JSON files instead.`);
    
    // This feature has been simplified - all localized content should be in JSON files
    // like localization-es.json rather than separate inscriptions
    return {};
}

/**
 * Refresh dynamic content after language changes
 * This function updates content that comes from inscriptions or global config
 * 
 * NOTE: This function is currently disabled to simplify the system.
 * All dynamic content updates are handled in updateLocalizedElements()
 */
function refreshDynamicContent() {
    console.log(`[Localization] Dynamic content refresh is handled automatically by updateLocalizedElements()`);
    
    // This functionality has been simplified and is now handled by:
    // 1. updateLocalizedElements() for UI text
    // 2. Global config priority system for inscription content
    // 3. Direct localization key lookups in business logic
}

/**
 * Switch to a different language
 * This function changes the current language and updates all UI elements
 * @param {string} language - The language code to switch to (e.g., 'es', 'fr')
 * @returns {Promise<void>}
 */
async function switchLanguage(language) {
    if (!language) {
        console.warn('[Localization] No language specified for switch');
        return;
    }
    
    console.log(`[Localization] Switching language from ${currentLanguage} to ${language}`);
    
    try {
        // Load language data
        const languageData = await loadLanguageData(language);
        
        if (languageData) {
            // Update localization data
            localizationData[language] = languageData;
            
            // Update current language
            currentLanguage = language;
            
            // Update available languages list
            if (!availableLanguages.includes(language)) {
                availableLanguages.push(language);
            }
            
            console.log(`[Localization] Language data loaded for ${language}`);
            console.log(`[Localization] Available keys: ${Object.keys(languageData).length}`);
            
            // Update all UI elements with new language
            updateLocalizedElements();
            
            // Update hash if needed (for language persistence)
            if (window.location.hash.includes('lang=')) {
                window.location.hash = window.location.hash.replace(/lang=[^&]+/, `lang=${language}`);
            } else {
                const separator = window.location.hash.includes('&') ? '&' : (window.location.hash ? '&' : '');
                window.location.hash += `${separator}lang=${language}`;
            }
            
            console.log(`[Localization] Successfully switched to ${language}`);
            
        } else {
            console.warn(`[Localization] Could not load data for language: ${language}`);
            // Fall back to English if the requested language fails
            if (language !== 'en') {
                console.log('[Localization] Falling back to English');
                await switchLanguage('en');
            }
        }
        
    } catch (error) {
        console.error(`[Localization] Error switching to language ${language}:`, error);
        // Fall back to English on error
        if (language !== 'en') {
            console.log('[Localization] Falling back to English due to error');
            currentLanguage = 'en';
            updateLocalizedElements();
        }
    }
}

/**
 * Load language data from inscriptions or local files
 * This function loads localization data for a specific language
 * @param {string} language - The language code to load (e.g., 'es', 'fr')
 * @returns {Promise<Object|null>} The loaded language data or null if not found
 */
async function loadLanguageData(language) {
    if (!language || language === 'en') {
        console.log('[Localization] Using embedded English localization');
        return DEFAULT_LOCALIZATION;
    }
    
    console.log(`[Localization] Loading language data for: ${language}`);
    
    try {
        // Try to load from local JSON file first (for development/testing)
        const jsonUrl = `json/localization-${language}.json`;
        console.log(`[Localization] Attempting to load from: ${jsonUrl}`);
        
        const response = await fetch(jsonUrl);
        if (response.ok) {
            const languageData = await response.json();
            console.log(`[Localization] Successfully loaded ${language} from local file`);
            return languageData;
        }
        
        console.log(`[Localization] Local file not found, trying inscription data...`);
        
        // Try to load from inscription data (o_1.js sat)
        if (typeof getInscriptionsForSat === 'function' && window.o1JsSat) {
            const inscriptions = await getInscriptionsForSat(window.o1JsSat);
            
            for (const inscriptionId of inscriptions) {
                try {
                    const content = await getInscriptionContent(inscriptionId);
                    const parsed = JSON.parse(content);
                    
                    if (parsed.language === language && parsed.localization) {
                        console.log(`[Localization] Found ${language} localization in inscription: ${inscriptionId}`);
                        return parsed.localization;
                    }
                } catch (e) {
                    // Skip invalid JSON or non-localization inscriptions
                    continue;
                }
            }
        }
        
        console.warn(`[Localization] No localization data found for language: ${language}`);
        return null;
        
    } catch (error) {
        console.error(`[Localization] Error loading language data for ${language}:`, error);
        return null;
    }
}

console.log('BRC333 ID Localization module loaded and ready for natowls.xyz deployment');

// Expose essential functions to global scope for external access
window.Localization = {
    // Core functions
    initialize: initializeLocalization,
    switchLanguage: switchLanguage,
    getLocalizedText: getLocalizedText,
    updateLocalizedElements: updateLocalizedElements,
    
    // Utility functions
    getCurrentLanguage: () => currentLanguage,
    getAvailableLanguages: () => [...availableLanguages],
    
    // Backward compatibility (deprecated)
    initLocalization: initializeLocalization,
    setLanguage: switchLanguage,
    localizeContent: getLocalizedText,
    
    // Data access (read-only)
    get currentLanguage() { return currentLanguage; },
    get availableLanguages() { return [...availableLanguages]; }
}; 