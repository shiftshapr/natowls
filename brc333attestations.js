/**
 * BRC333 Attestations Module - Self-Contained & Data-Driven
 * 
 * This module provides a complete, standalone system for displaying and filtering
 * BRC333 attestations. It is designed to be robust and self-sufficient,
 * creating its own UI controls based on the provided data, eliminating
 * dependencies on external, incompatible scripts.
 * 
 * Key Features:
 * - Data-driven search and filter controls with clickable metadata links
 * - Self-contained CSS for consistent styling
 * - Clean, predictable rendering pipeline
 * - Bitcoin inscription metadata integration
 * - Keyboard navigation support ('i' key)
 * - Locale-aware date formatting
 * - Field exclusion and kind filtering capabilities
 * - Modal display with responsive design
 * - Consolidated utility functions for repeated logic patterns
 * 
 * Refactoring Results (v1.1.0):
 * - Extracted 6 utility functions to eliminate code duplication
 * - Reduced ~150 lines of repeated code to single-source utilities
 * - Improved maintainability and consistency across functions
 * - Current file: 1688 lines (consolidated from ~1850 lines of duplication)
 * 
 * @version 1.1.0
 * @author BRC333 Team
 */

// --- CSS STYLES ---
const ATTESTATION_STYLES = `
    :root {
        --attestation-bg: rgba(128, 128, 128, 0.05);
        --attestation-border: #333;
        --attestation-text: #F0EAD6;
        --attestation-text-secondary: #ccc;
        --attestation-text-muted: #aaa;
        --attestation-hover-bg: rgba(128, 128, 128, 0.15);
        --attestation-hover-border: #555;
        --attestation-input-bg: rgba(128, 128, 128, 0.2);
        --attestation-input-border: #555;
        --attestation-modal-bg: #111;
        --attestation-modal-overlay: rgba(0, 0, 0, 0.8);
        --attestation-primary: var(--color-primary, #00BFFF);
        --attestation-primary-hover: var(--color-primary-hover, #33CCFF);
    }
    
    .attestation-filter-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    }
    
    .attestation-filter-row + .attestation-filter-row {
        margin-top: 10px;
    }
    
    /* Single line search controls */
    .attestation-search-container {
        margin-bottom: 20px;
        padding: 0;
        background-color: transparent;
        border: none;
        border-radius: 0;
        margin-left: 0;
        margin-right: 0;
    }
    
    .attestation-search-container .attestation-filter-row {
        margin-top: 0 !important;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
    }
    
    .attestation-search-container .attestation-filter-row input,
    .attestation-search-container .attestation-filter-row select {
        background-color: var(--attestation-input-bg);
        color: var(--attestation-text);
        border: 1px solid var(--attestation-input-border);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.9em;
        min-width: 0;
        flex-shrink: 1;
    }
    
    .attestation-search-container .attestation-filter-row input {
        flex: 1;
        min-width: 120px;
    }
    
    .attestation-search-container .attestation-filter-row select {
        width: auto;
        min-width: 80px;
    }
    
    .attestation-search-container .attestation-filter-row input::placeholder {
        color: var(--attestation-text-muted);
    }
    
    .attestation-search-container .attestation-filter-row input:focus,
    .attestation-search-container .attestation-filter-row select:focus {
        outline: none;
        border-color: var(--attestation-primary);
    }
    
    .attestation-list-container {
        margin-bottom: 20px !important;
        padding: 0;
        background-color: transparent;
        border: none;
        border-radius: 0;
        display: block !important;
        overflow: visible !important;
        max-height: none !important;
        margin-left: 0;
        margin-right: 0;
    }
    
    .attestation-list-container .attestation-link {
        display: flex !important;
        flex-direction: row !important;
        width: 100% !important;
        min-width: 0 !important;
        padding: 15px !important;
        border: 1px solid var(--attestation-border) !important;
        border-radius: 5px !important;
        text-decoration: none !important;
        color: var(--attestation-text) !important;
        background-color: var(--attestation-bg) !important;
        transition: background-color 0.2s, border-color 0.2s !important;
        margin-bottom: 10px !important;
        box-sizing: border-box !important;
        align-items: flex-start !important;
        gap: 15px !important;
    }
    
    .attestation-list-container .attestation-link:hover {
        background-color: var(--attestation-hover-bg) !important;
        border-color: var(--attestation-hover-border) !important;
    }
    
    .attestation-list-container .attestation-title {
        font-weight: bold !important;
        font-size: 1.1em !important;
        margin-bottom: 8px !important;
        color: var(--attestation-text) !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }
    
    .attestation-list-container .attestation-metadata {
        font-size: 0.9em !important;
        color: var(--attestation-text-secondary) !important;
        line-height: 1.4 !important;
    }
    
    .attestation-thumbnail {
        width: 90px !important;
        height: 90px !important;
        flex-shrink: 0 !important;
        border-radius: 6px !important;
        object-fit: contain !important;
        object-position: center center !important;
        background-color: var(--attestation-bg) !important;
        border: 1px solid var(--attestation-border) !important;
    }
    
    /* More specific selector to override any conflicting styles */
    .attestations-section .attestation-thumbnail,
    .attestation-list-container .attestation-thumbnail,
    .attestation-thumbnail-container .attestation-thumbnail {
        object-fit: contain !important;
        object-position: center center !important;
        width: 100% !important;
        height: 100% !important;
        max-width: 90px !important;
        max-height: 90px !important;
    }
    
    .attestation-thumbnail-container {
        width: 90px !important;
        height: 90px !important;
        flex-shrink: 0 !important;
        border-radius: 6px !important;
        overflow: hidden !important;
        border: 1px solid var(--attestation-border) !important;
        background-color: var(--attestation-bg) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    
    .attestation-thumbnail-iframe {
        width: 600px !important;
        height: 600px !important;
        border: none !important;
        transform: scale(0.15) !important;
        transform-origin: center center !important;
        pointer-events: none !important;
    }
    
    .attestation-content-wrapper {
        flex: 1 !important;
        min-width: 0 !important;
    }
    
    .attestations-section {
        position: relative !important;
        z-index: 2 !important;
        margin-bottom: 20px !important;
        overflow: visible !important;
        padding: 0;
        margin-left: 0;
        margin-right: 0;
    }
    
    .attestation-pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
        padding: 15px;
        background-color: var(--attestation-bg);
        border: 1px solid var(--attestation-border);
        border-radius: 5px;
    }
    
    .attestation-pagination-container button {
        background-color: var(--attestation-input-bg);
        color: var(--attestation-text);
        border: 1px solid var(--attestation-input-border);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
    }
    
    .attestation-pagination-container button:hover {
        background-color: var(--attestation-hover-bg);
    }
    
    .attestation-pagination-container .back-to-id-button,
    .attestation-pagination-container .nav-button {
        background-color: var(--attestation-primary);
        color: white;
        border: none;
        padding: 8px 16px;
    }
    
    .attestation-pagination-container .back-to-id-button:hover,
    .attestation-pagination-container .nav-button:hover {
        background-color: var(--attestation-primary-hover);
    }
    
    .attestation-pagination-center {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .attestation-pagination-info {
        color: var(--attestation-text);
        font-size: 0.9em;
        margin: 0 15px;
    }
    
    .attestation-pagination-items-per-page {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .attestation-pagination-items-per-page span {
        color: var(--attestation-text);
        font-size: 0.9em;
    }
    
    .attestation-pagination-items-per-page select {
        background-color: var(--attestation-input-bg);
        color: var(--attestation-text);
        border: 1px solid var(--attestation-input-border);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
    }
    
    .attestation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--attestation-modal-overlay);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 40px 0 0 0;
    }
    
    .attestation-modal-content {
        background-color: var(--attestation-modal-bg);
        color: var(--attestation-text);
        padding: 20px;
        border-radius: 10px;
        width: 600px;
        max-width: 95vw;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        border: 1px solid var(--attestation-border);
        box-sizing: border-box;
    }
    
    .attestation-modal-close {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: var(--attestation-text);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
    }
    
    .attestation-modal-close:hover {
        color: var(--attestation-text-muted);
    }
    
    .attestation-metadata-box {
        margin-top: 20px;
        padding: 12px;
        background-color: var(--attestation-bg);
        border: 1px solid var(--attestation-border);
        border-radius: 5px;
    }
    
    .attestation-metadata-box div {
        margin-bottom: 6px;
    }
    
    .attestation-metadata-box .inscription-id {
        font-family: monospace;
        font-size: 0.9em;
        word-break: break-all;
    }
    
    .attestation-details-box {
        margin-bottom: 15px;
        padding: 12px;
        background-color: var(--attestation-bg);
        border: 1px solid var(--attestation-border);
        border-radius: 5px;
    }
    
    .attestation-details-box h3 {
        margin: 0 0 10px 0;
        font-size: 1.1em;
    }
    
    .attestation-details-box .details-content {
        font-size: 0.9em;
    }
    
    .attestation-details-box .details-content div {
        margin-bottom: 6px;
    }
    
    .attestation-details-box a {
        color: var(--attestation-primary);
        text-decoration: underline;
    }
    
    .attestation-details-box a:hover {
        color: var(--attestation-primary-hover);
    }
    
    /* Fix end message positioning */
    .endMessage {
        position: relative !important;
        z-index: 1 !important;
        margin-top: 20px !important;
        margin-bottom: 0 !important;
        clear: both !important;
        display: block !important;
    }
    
    /* Ensure attestations section doesn't overlap */
    .attestations-section {
        position: relative !important;
        z-index: 2 !important;
        margin-bottom: 20px !important;
        overflow: visible !important;
        padding: 0;
        margin-left: 0;
        margin-right: 0;
    }
    
    /* Ensure proper spacing between sections */
    .attestation-list-container {
        margin-bottom: 20px !important;
        padding: 0;
        background-color: transparent;
        border: none;
        border-radius: 0;
        display: block !important;
        overflow: visible !important;
        max-height: none !important;
        margin-left: 0;
        margin-right: 0;
    }
    
    /* Ensure the preface container has proper flow */
    .preface {
        display: block !important;
        overflow: visible !important;
    }
    
    /* Fix scrolling issues in the preface container */
    #preface-container {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        max-height: 100vh !important;
    }
    
    /* Reduce empty space in preface container */
    #preface-container .container {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        padding-bottom: 0 !important;
        min-height: auto !important;
    }
    
    /* Ensure the preface content can scroll */
    #preface {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        min-height: auto !important;
    }
    
    /* Remove extra space from content div */
    #content {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 0 !important;
        height: auto !important;
    }
    
    /* Additional scrolling fixes */
    body {
        overflow: auto !important;
    }
    
    html {
        overflow: auto !important;
    }
    
    /* Force scrolling on the preface container */
    #preface-container {
        overflow-y: scroll !important;
        overflow-x: hidden !important;
        max-height: 100vh !important;
        height: 100vh !important;
    }
    
    /* Ensure the container inside preface-container can scroll */
    #preface-container .container {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
    }
    
    /* Override any layout conflicts and ensure scrolling works */
    #preface-container.active {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        max-height: 100vh !important;
        height: 100vh !important;
    }
    
    /* Ensure the preface content itself can scroll */
    #preface {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        min-height: auto !important;
    }
    
    /* Force alignment of search controls with attestation links */
    .attestations-section .attestation-search-container {
        margin: 0 auto 20px auto !important;
        padding: 0 !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        width: 520px !important;
        box-sizing: border-box !important;
    }
    
    .attestations-section .attestation-list-container {
        margin: 0 auto 20px auto !important;
        padding: 0 !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        width: 520px !important;
        box-sizing: border-box !important;
    }
    
    /* Align pagination with the same width */
    .attestations-section .attestation-pagination-container {
        margin: 0 auto !important;
        width: 520px !important;
        box-sizing: border-box !important;
    }
    
    /* Align end message with the same width */
    .endMessage {
        margin: 1em auto 0 auto !important;
        padding-bottom: 0 !important;
        width: 520px !important;
        box-sizing: border-box !important;
    }
    
    /* Remove extra space at the bottom */
    #preface-container {
        min-height: auto !important;
        height: auto !important;
    }
    
    #preface-container .container {
        min-height: auto !important;
        height: auto !important;
        padding-bottom: 0 !important;
    }
    
    #preface {
        min-height: auto !important;
        height: auto !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
    }
`;

// Inject styles into the document
function injectAttestationStyles() {
    if (!document.getElementById('brc333-attestation-styles')) {
        console.log('[CSS Debug] Injecting attestation styles into document head');
        const styleElement = document.createElement('style');
        styleElement.id = 'brc333-attestation-styles';
        styleElement.textContent = ATTESTATION_STYLES;
        document.head.appendChild(styleElement);
        console.log('[CSS Debug] Attestation styles injected successfully');
        console.log('[CSS Debug] Style element:', styleElement);
        console.log('[CSS Debug] Style content length:', ATTESTATION_STYLES.length);
    } else {
        console.log('[CSS Debug] Attestation styles already exist in document');
    }
}

// --- CONSTANTS ---

let allAttestations = [];
let filteredAttestations = [];
let currentFilters = { search: '', kind: '', type: '', year: '', month: '' };
let listContainerEl = null;
let itemsPerPage = 10; // Default items per page
let currentlyDisplayedAttestation = null; // Track the currently displayed attestation

// Set up global keyboard navigation for 'i' key - do this once when the module loads
document.addEventListener('keydown', (e) => {
    if (e.key === 'i' || e.key === 'I') {
        const focusedElement = document.activeElement;
        
        // If we're focused on an attestation link, open that attestation
        if (focusedElement && focusedElement.classList.contains('attestation-link')) {
            e.preventDefault();
            const attestationIndex = parseInt(focusedElement.dataset.attestationIndex);
            if (!isNaN(attestationIndex) && allAttestations[attestationIndex]) {
                displayAttestation(allAttestations[attestationIndex]);
            }
        }
        // If we have a currently displayed attestation and we're not in an input field, open the modal
        else if (currentlyDisplayedAttestation && 
                 !focusedElement.matches('input, textarea, select') &&
                 !document.getElementById('attestation-modal')) {
            e.preventDefault();
            displayAttestation(currentlyDisplayedAttestation);
        }
    }
});

// --- UTILITY FUNCTIONS ---

/**
 * Formats a date (Unix timestamp or ISO string) to a locale-aware date string
 * @param {number|string} dateInput - Unix timestamp in seconds OR ISO date string
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024") or original if invalid
 */
function formatDate(dateInput) {
    let date;
    
    try {
        // Handle different input types
        if (typeof dateInput === 'number') {
            // Unix timestamp in seconds
            date = new Date(dateInput * 1000);
        } else if (typeof dateInput === 'string') {
            // ISO date string
            date = new Date(dateInput);
        } else {
            return dateInput; // Return original if unsupported type
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateInput; // Return original if invalid
        }
        
        // Try to detect user's locale, default to US format
        let locale = 'en-US';
        
        try {
            if (navigator.language) {
                locale = navigator.language;
            } else if (navigator.languages && navigator.languages.length > 0) {
                locale = navigator.languages[0];
            }
        } catch (error) {
            console.warn('Could not detect locale, using US format');
        }
        
        // Format with locale-specific settings
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        // Return original input if formatting fails
        return dateInput;
    }
}

/**
 * Checks if the marked library is available and properly loaded
 * @returns {boolean} True if marked is available and functional
 */
function isMarkedAvailable() {
    console.log('[MARKED DEBUG] Checking if marked library is available...');
    console.log('[MARKED DEBUG] window.marked exists:', !!window.marked);
    
    if (!window.marked) {
        console.log('[MARKED DEBUG] window.marked is not available');
        return false;
    }
    
    console.log('[MARKED DEBUG] window.marked.parse type:', typeof window.marked.parse);
    
    if (typeof window.marked.parse !== 'function') {
        console.log('[MARKED DEBUG] window.marked.parse is not a function');
        return false;
    }
    
    // Test the marked library with a simple markdown string
    try {
        const testResult = window.marked.parse('# Test');
        console.log('[MARKED DEBUG] Test parse result:', testResult);
        console.log('[MARKED DEBUG] Marked library is available and functional');
        return true;
    } catch (error) {
        console.log('[MARKED DEBUG] Error testing marked library:', error);
        return false;
    }
}

// --- CORE DATA FUNCTIONS ---

/**
 * Fetches attestations from the appropriate source
 * @returns {Promise<Array>} Array of attestation objects
 */
async function fetchAttestations() {
    // This function remains for fetching data, but the display logic is now separate.
    return (testing === true) ? getTestAttestations() : (typeof fetchArticles === 'function' ? fetchArticles() : []);
}

/**
 * Generates test attestation data for development/testing
 * @returns {Promise<Array>} Array of test attestation objects with processed content
 */
async function getTestAttestations() {
    const testData = [
        { "id": "30edf1df44bcda73a9b707d469d8c898a910abc87f26021198864f63a4ca8fcai0", "title": "Metaweb I", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-08T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", 
         "attestationId": "30edf1df44bcda73a9b707d469d8c898a910abc87f26021198864f63a4ca8fcai0", "bridgerNo": 1002 },
        { "id": "506480ff2a0ea8fb537d3e8a4bb298892c5e79ff3a1dedb49aa85d260151d52ai0", "title": "Metaweb I", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T15:56:20Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "40ed20f0f7fb29118db4573c859a034dac5262eed595a91d0fbb2eb97a61e31ei0", "title": "Metaweb II", "kind": "credential", "type": "micro", "issuer": "Overweb council", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T17:07:45Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0", "title": "The Metaweb Challenge", "kind": "credential", "type": "pearl", "issuer": "Bridgit DAO", "tags": ["Metaweb", "PEARL"], "date": "2024-08-01T00:00:00Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "9f43159a1d5d7a50ae77ee4394c99d98d49875529001f3ad83250ea8f95c8f6ei0", "title": "Community Building", "kind": "credential", "type": "pearl", "issuer": "Youth leader", "tags": ["Bitcoin", "PEARL"], "date": "2024-07-15T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002, "level": 2 },
        { "id": "4778e24738b24435d18a59ef7e372d727268a666bbdf3edb2001316aa738b2f5i0", "title": "Metaweb 4", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-08T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "506480ff2a0ea8fb537d3e8a4bb298892c5e79ff3a1dedb49aa85d260151d52ai0", "title": "Metaweb 5", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T15:56:20Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "40ed20f0f7fb29118db4573c859a034dac5262eed595a91d0fbb2eb97a61e31ei0", "title": "Metaweb 6", "kind": "credential", "type": "micro", "issuer": "Overweb council", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T17:07:45Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0", "title": "Metaweb 7", "kind": "credential", "type": "pearl", "issuer": "Bridgit DAO", "tags": ["Metaweb", "PEARL"], "date": "2024-08-01T00:00:00Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0", "title": "Metaweb 8", "kind": "credential", "type": "pearl", "issuer": "Youth leader", "tags": ["Bitcoin", "PEARL"], "date": "2024-07-15T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002, "level": 2 },
        { "id": "4778e24738b24435d18a59ef7e372d727268a666bbdf3edb2001316aa738b2f5i0", "title": "Metaweb 9", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-08T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "506480ff2a0ea8fb537d3e8a4bb298892c5e79ff3a1dedb49aa85d260151d52ai0", "title": "Metaweb 10", "kind": "credential", "type": "micro", "issuer": "Bridgit DAO", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T15:56:20Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "40ed20f0f7fb29118db4573c859a034dac5262eed595a91d0fbb2eb97a61e31ei0", "title": "Metaweb 11", "kind": "credential", "type": "micro", "issuer": "Overweb council", "tags": ["Metaweb", "Micro"], "date": "2024-09-09T17:07:45Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0", "title": "Metaweb 12", "kind": "credential", "type": "pearl", "issuer": "Bridgit DAO", "tags": ["Metaweb", "PEARL"], "date": "2024-08-01T00:00:00Z", "recipient": "1653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1001 },
        { "id": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0", "title": "Metaweb 13", "kind": "credential", "type": "pearl", "issuer": "Youth leader", "tags": ["Bitcoin", "PEARL"], "date": "2024-07-15T00:00:00Z", "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002, "level": 2 },
        { "id": "4778e24738b24435d18a59ef7e372d727268a666bbdf3edb2001316aa738b2f5i0", "title": "Verified Contributor", "kind": "credential", "type": "badge", "issuer": "Community DAO", "tags": ["Contribution", "Verification"], "date": "2024-10-01T00:00:00Z", "recipient": "3653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1003 },
        { "id": "506480ff2a0ea8fb537d3e8a4bb298892c5e79ff3a1dedb49aa85d260151d52ai0", "title": "Advanced Git", "kind": "skill", "type": "certification", "issuer": "Tech Academy", "tags": ["Git", "Version Control"], "date": "2023-11-20T00:00:00Z", "recipient": "0653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0" },
        { "id": "40ed20f0f7fb29118db4573c859a034dac5262eed595a91d0fbb2eb97a61e31ei0", "title": "Project Management", "kind": "endorsement", "issuer": "Jane Doe", "tags": ["Management", "Soft Skills"], "date": "2024-01-05T00:00:00Z", "level": 3, "recipient": "0653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0" },
        { "id": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0", "title": "Hackathon Winner", "kind": "award", "type": "competition", "issuer": "Dev Events Inc.", "tags": ["Hackathon", "Winner"], "date": "2023-05-12T00:00:00Z", "recipient": "0653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0" },
        { "id": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0", "title": "Open Source Contributor", "kind": "community", "op": "attest", "issuer": "UMi meta-community", "tags": ["Open Source", "Contribution"], "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002 },
        { "id": "506480ff2a0ea8fb537d3e8a4bb298892c5e79ff3a1dedb49aa85d260151d52ai0", "title": "Meta-Layer Community", "kind": "community", "op": "attest", "issuer": "Meta-Layer Initiative", "tags": ["Metaweb", "Community", "Initiative"], "recipient": "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1002, "date": "2024-06-01T00:00:00Z" },
        { "id": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0", "title": "Open Source Contributor", "kind": "recognition", "issuer": "OSS Foundation", "tags": ["Open Source", "Contribution"], "recipient": "5653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0", "bridgerNo": 1005 },
        { "id": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0", "title": "DAO Member", "kind": "membership", "type": "governance", "issuer": "Bridgit DAO", "tags": ["DAO", "Governance"], "date": "2023-01-01T00:00:00Z", "recipient": "0653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0" }
    ];

    return Promise.all(
        testData.map(async (attestation) => {
            const rawContent = await getInscriptionContent(attestation.id);
            const processedContent = await processAttestationContent(rawContent || '');
            return { 
                ...attestation, 
                html: processedContent.html, 
                rawContent: processedContent.rawContent,
                title: attestation.title || processedContent.title 
            };
        })
    );
}

/**
 * Processes raw attestation content (Markdown parsing, URL fixing)
 * @param {string} content - Raw content string
 * @returns {Promise<Object>} Object with processed html and extracted title
 */
async function processAttestationContent(content) {
    if (!content) return { html: '', title: 'Untitled', rawContent: '' };
    
    console.log('[CONTENT DEBUG] Processing content, length:', content.length);
    console.log('[CONTENT DEBUG] Content preview:', content.substring(0, 100));
    
    let html = content;
    let title = 'Untitled';
    
    // Process markdown if marked is available
    if (isMarkedAvailable()) {
        try {
            console.log('[CONTENT DEBUG] Processing with marked library...');
            html = window.marked.parse(content);
            console.log('[CONTENT DEBUG] Marked processing successful, result length:', html.length);
            console.log('[CONTENT DEBUG] Marked result preview:', html.substring(0, 200));
        } catch (error) {
            console.warn('[CONTENT DEBUG] Error processing markdown with marked:', error);
            html = content; // Fallback to raw content
        }
    } else {
        console.log('[CONTENT DEBUG] Marked library not available, using raw content');
    }
    
    // Fix relative URLs to use full ordinals.com paths
    html = html.replace(/href="\/content\//g, 'href="https://ordinals.com/content/');
    html = html.replace(/src="\/content\//g, 'src="https://ordinals.com/content/');
    
    // Extract title from markdown if present
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();
    
    return { html, title, rawContent: content };
}

// --- RENDERING & FILTERING LOGIC ---

/**
 * Applies current filters and re-renders the attestation list
 * Updates global pagination variables and triggers list refresh
 */
function applyAndRender() {
    const { search, kind, type, year, month } = currentFilters;
    const searchLower = search.toLowerCase();

    filteredAttestations = allAttestations.filter(att => {
        const matchesKind = !kind || att.kind === kind;
        const matchesType = !type || att.type === type;
        const matchesSearch = !searchLower || 
            att.title?.toLowerCase().includes(searchLower) ||
            att.issuer?.toLowerCase().includes(searchLower) ||
            att.tags?.some(t => t.toLowerCase().includes(searchLower));
        
        let matchesDate = true;
        if (att.date) {
            const attestationDate = new Date(att.date);
            if (year && attestationDate.getFullYear() != year) {
                matchesDate = false;
            }
            if (month && attestationDate.getMonth() != month) {
                matchesDate = false;
            }
        } else if (year || month) {
            matchesDate = false; // If date filters are set, items without a date don't match
        }

        return matchesKind && matchesType && matchesSearch && matchesDate;
    });

    // Only reset to first page if filters have changed (not for pagination)
    // Check if this is a filter change by comparing with previous filters
    const hasFilterChanged = search !== currentFilters.search || 
                           kind !== currentFilters.kind || 
                           type !== currentFilters.type || 
                           year !== currentFilters.year || 
                           month !== currentFilters.month;
    
    if (hasFilterChanged) {
        currentPage = 1;
    }
    
    window.currentPage = currentPage;
    window.filteredResults = filteredAttestations;
    
    // Render directly into the attestations container 
    if (listContainerEl) {
        listContainerEl.innerHTML = '';
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageAttestations = filteredAttestations.slice(startIndex, endIndex);
        
        // Create and append attestation links
        pageAttestations.forEach((attestation, index) => {
            const link = createAttestationLink(attestation, index, startIndex);
            listContainerEl.appendChild(link);
        });
        
        // Always add pagination controls (for BACK TO ID button)
        addPaginationControls(listContainerEl, filteredAttestations.length);
    }
}

/**
 * Creates a clickable link element for an attestation
 * @param {Object} attestation - The attestation object
 * @param {number} index - Index in the filtered list
 * @param {number} startIndex - Starting index for pagination
 * @returns {HTMLElement} Clickable link element
 */
function createAttestationLink(attestation, index, startIndex) {
    const link = document.createElement('a');
    link.href = `#cred/${allAttestations.indexOf(attestation) + 1}`;
    link.className = 'attestation-link';
    link.dataset.attestationIndex = allAttestations.indexOf(attestation);
    
    // Add click handler to display the attestation
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        displayAttestation(attestation);
    });
    
    link.setAttribute('tabindex', '0');

    // Use utility function to create metadata rows
    const metadata = createAttestationMetadataRows(attestation, {
        forDisplay: 'list',
        excludeFields: window.excludeFields || []
    });

                    // Make sure styles are injected before creating thumbnails
                injectAttestationStyles();
                
                // Create thumbnail container (will be populated asynchronously)
                const thumbnailContainer = document.createElement('div');
                thumbnailContainer.className = 'attestation-thumbnail-container';
    
    // Create content wrapper for title and metadata
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'attestation-content-wrapper';
    contentWrapper.innerHTML = `
        <div class="attestation-title">${attestation.title}</div>
        <div class="attestation-metadata">${metadata.join('')}</div>
    `;
    
    link.appendChild(thumbnailContainer);
    link.appendChild(contentWrapper);
    
    // Asynchronously load thumbnail if attestation has an ID
    if (attestation.id) {
        getAttestationThumbnail(attestation.id).then(thumbnail => {
            if (thumbnail) {
                if (thumbnail.type === 'image') {
                    const img = document.createElement('img');
                    img.src = thumbnail.src;
                    img.className = 'attestation-thumbnail';
                    
                    img.onerror = () => {
                        thumbnailContainer.style.display = 'none';
                    };
                    thumbnailContainer.appendChild(img);
                } else if (thumbnail.type === 'iframe') {
                    const iframe = document.createElement('iframe');
                    iframe.src = thumbnail.src;
                    iframe.className = 'attestation-thumbnail-iframe';
                    iframe.sandbox = 'allow-scripts allow-same-origin';
                    thumbnailContainer.appendChild(iframe);
                }
            } else {
                // Hide thumbnail container if no thumbnail found
                thumbnailContainer.style.display = 'none';
            }
        }).catch(error => {
            console.error(`[Thumbnail] Error loading thumbnail for ${attestation.id}:`, error);
            thumbnailContainer.style.display = 'none';
        });
    } else {
        // Hide thumbnail container if no ID
        thumbnailContainer.style.display = 'none';
    }
    
    return link;
}

/**
 * Adds search and filter controls to the container
 * @param {HTMLElement} container - Container element to add controls to
 */
function addAttestationSearchControls(container) {
    const kinds = [...new Set(allAttestations.map(a => a.kind).filter(Boolean))];
    const types = [...new Set(allAttestations.map(a => a.type).filter(Boolean))];

    // Extract unique years and months from the data for the filters
    const availableDates = allAttestations.map(a => a.date ? new Date(a.date) : null).filter(Boolean);
    const availableYears = [...new Set(availableDates.map(d => d.getFullYear()))].sort((a, b) => b - a);
    const availableMonths = [...new Set(availableDates.map(d => d.getMonth()))].sort((a, b) => a - b);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const searchContainer = document.createElement('div');
    searchContainer.className = 'attestation-search-container';
    
    searchContainer.innerHTML = `
        <div class="attestation-filter-row">
            <input type="text" id="attestation-search-input" placeholder="Search attestations...">
            ${kinds.length > 1 ? `
                <select id="attestation-kind-filter">
                    <option value="">All Kinds</option>
                    ${kinds.map(k => `<option value="${k}">${k.charAt(0).toUpperCase() + k.slice(1)}</option>`).join('')}
                </select>
            ` : ''}
            <select id="attestation-type-filter">
                <option value="">All Types</option>
                ${types.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
            </select>
            <select id="attestation-year-filter">
                <option value="">All Years</option>
                ${availableYears.map(y => `<option value="${y}">${y}</option>`).join('')}
            </select>
            <select id="attestation-month-filter">
                <option value="">All Months</option>
                ${availableMonths.map(m => `<option value="${m}">${monthNames[m]}</option>`).join('')}
            </select>
        </div>
    `;
    container.appendChild(searchContainer);

    // Add event listeners
    container.querySelector('#attestation-search-input').addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        applyAndRender();
    });

    if (kinds.length > 1) {
        container.querySelector('#attestation-kind-filter').addEventListener('change', (e) => {
            currentFilters.kind = e.target.value;
            applyAndRender();
        });
    }
    
    container.querySelector('#attestation-type-filter').addEventListener('change', (e) => {
        currentFilters.type = e.target.value;
        applyAndRender();
    });

    container.querySelector('#attestation-year-filter').addEventListener('change', (e) => {
        currentFilters.year = e.target.value;
        applyAndRender();
    });
    container.querySelector('#attestation-month-filter').addEventListener('change', (e) => {
        currentFilters.month = e.target.value;
        applyAndRender();
    });

    // Set initial values from currentFilters
    container.querySelector('#attestation-search-input').value = currentFilters.search || '';
    if (kinds.length > 1) {
        container.querySelector('#attestation-kind-filter').value = currentFilters.kind || '';
    }
    container.querySelector('#attestation-type-filter').value = currentFilters.type || '';
    container.querySelector('#attestation-year-filter').value = currentFilters.year || '';
    container.querySelector('#attestation-month-filter').value = currentFilters.month || '';
}

/**
 * Adds pagination controls to the container
 * @param {HTMLElement} container - Container element to add pagination to
 * @param {number} totalItems - Total number of items
 */
function addPaginationControls(container, totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Always create the pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'attestation-pagination-container';
    
    // Always show BACK TO ID button on the right
    const backToIdButton = document.createElement('button');
    backToIdButton.textContent = window.lfgButtonText || 'BACK TO ID';
    backToIdButton.className = 'back-to-id-button';
    backToIdButton.onclick = () => {
        if (window.ID && typeof window.ID.switchToIdCardView === 'function') {
            window.ID.switchToIdCardView();
        }
    };
    paginationContainer.appendChild(backToIdButton);
    
    // Always show center section with info
    const centerSection = document.createElement('div');
    centerSection.className = 'attestation-pagination-center';
    
    if (totalPages > 1) {
        // Show pagination controls for multiple pages
        // Previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'PREV';
            prevButton.className = 'nav-button';
            prevButton.onclick = () => {
                currentPage--;
                window.currentPage = currentPage;
                applyAndRender();
            };
            centerSection.appendChild(prevButton);
        }
        
        // Page info with item counts
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${startItem}-${endItem} of ${totalItems} items)`;
        pageInfo.className = 'attestation-pagination-info';
        centerSection.appendChild(pageInfo);
        
        // Next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'NEXT';
            nextButton.className = 'nav-button';
            nextButton.onclick = () => {
                currentPage++;
                window.currentPage = currentPage;
                applyAndRender();
            };
            centerSection.appendChild(nextButton);
        }
    } else {
        // For single page, just show item count info
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Showing all ${totalItems} items`;
        pageInfo.className = 'attestation-pagination-info';
        centerSection.appendChild(pageInfo);
    }
    
    // Always show items per page selector (moved outside the if/else)
    const itemsPerPageSection = document.createElement('div');
    itemsPerPageSection.className = 'attestation-pagination-items-per-page';
      
    const itemsPerPageSelect = document.createElement('select');
    
    [5, 10, 20, 50].forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        if (option === itemsPerPage) optionEl.selected = true;
        itemsPerPageSelect.appendChild(optionEl);
    });
    
    itemsPerPageSelect.onchange = (e) => {
        itemsPerPage = parseInt(e.target.value);
        window.ITEMS_PER_PAGE = itemsPerPage;
        currentPage = 1;
        window.currentPage = currentPage;
        applyAndRender();
    };
    
    itemsPerPageSection.appendChild(itemsPerPageSelect);
    paginationContainer.appendChild(itemsPerPageSection);
    
    paginationContainer.appendChild(centerSection);
    container.appendChild(paginationContainer);
}

// --- MAIN ENTRY POINT ---

/**
 * Main entry point - displays attestation links with search/filter controls
 * @param {Array} attestations - Array of attestation objects
 * @param {HTMLElement} container - Container element to render into
 * @param {Object} [options={}] - Configuration options
 * @param {Object} [options.initialFilters={}] - Initial filter values
 * @param {Array<string>} [options.excludeFields=[]] - Fields to exclude from display
 * @param {number} [options.itemsPerPage=10] - Number of items per page
 * @param {Array<string>} [options.allowedKinds=[]] - Developer-level kind filtering
 */
async function displayAttestationLinks(attestations, container, options = {}) {
    // Inject styles if not already present
    injectAttestationStyles();
    
    if (!container) {
        console.error("displayAttestationLinks requires a container element.");
        return;
    }
    container.innerHTML = ''; // Clear target container completely

    // Use utility function to create standardized filter options
    const filterOptions = createAttestationFilterOptions(options);
    const { 
        initialFilters = {}, 
        itemsPerPage: customItemsPerPage, 
        excludeFields,
        allowedKinds 
    } = filterOptions;
    itemsPerPage = customItemsPerPage || filterOptions.itemsPerPage;
    window.excludeFields = excludeFields; // Store for use in createAttestationLink
    window.allowedKinds = allowedKinds;

    console.log('allowedKinds',allowedKinds);

    // Developer-level filtering for allowed kinds
    if (Array.isArray(allowedKinds) && allowedKinds.length > 0) {
        allAttestations = attestations.filter(att => allowedKinds.includes(att.kind));
    } else {
        allAttestations = attestations;
    }
    
    // --- Set up globals for legacy pagination script ---
    window.ITEMS_PER_PAGE = itemsPerPage;
    window.currentPage = currentPage;
    window.filteredResults = filteredAttestations || allAttestations; // Initialize for pagination script
    
    // Set up the global createArticleLink function for the pagination script
    window.createArticleLink = createAttestationLink;
    
    // Reset filters, then apply any initial filters passed in
    currentFilters = { search: '', kind: '', type: '', year: '', month: '' };
    Object.assign(currentFilters, initialFilters);

    // --- 1. Add Search & Filter Controls ---
    addAttestationSearchControls(container);

    // --- 2. Create Container for List & Pagination ---
    listContainerEl = document.createElement('div');
    listContainerEl.className = 'attestation-list-container';
    listContainerEl.id = 'preface'; // The pagination script expects this ID
    container.appendChild(listContainerEl);
    console.log('listContainerEl',listContainerEl);
    console.log('container',container);
    
    // --- 3. Initial Render with filters applied ---
    applyAndRender();
}

/**
 * Displays an individual attestation in a modal with Bitcoin inscription metadata
 * @param {Object} attestation - The attestation object to display
 */
async function displayAttestation(attestation) {
    console.log('[DISPLAY DEBUG] displayAttestation called for:', attestation.id);
    console.log('[DISPLAY DEBUG] Attestation title:', attestation.title);
    
    // Track the currently displayed attestation for keyboard navigation
    currentlyDisplayedAttestation = attestation;
    
    // Fetch Bitcoin inscription metadata using the existing getMetadata function
    let inscriptionMetadata = null;
    try {
        if (window.getMetadata) {
            const json = await window.getMetadata(`https://ordinals.com/r/inscription/${attestation.id}`);
            if (json && typeof json === 'object') {
                inscriptionMetadata = {
                    id: json.id,
                    blockHeight: json.genesis_height || json.height,
                    timestamp: json.timestamp
                };
            }
        }
    } catch (error) {
        console.warn('Could not fetch inscription metadata:', error);
    }
    
    // Always create a modal overlay for displaying the attestation
    const modal = document.createElement('div');
    modal.id = 'attestation-modal';
    modal.className = 'attestation-modal';
    
    const contentDiv = document.createElement('div');
    contentDiv.id = 'attestation-modal-content';
    contentDiv.className = 'attestation-modal-content';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '\u00D7';
    closeButton.className = 'attestation-modal-close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    contentDiv.appendChild(closeButton);
    modal.appendChild(contentDiv);
    document.body.appendChild(modal);
    
    // Build inscription metadata section - simple, at the bottom
    let inscriptionMetadataHtml = '';
    if (inscriptionMetadata) {
        inscriptionMetadataHtml = `
            <div class="attestation-metadata-box">
                ${inscriptionMetadata.id ? `<div><strong>InscriptionId:</strong> <span class="inscription-id">${inscriptionMetadata.id}</span></div>` : ''}
                ${inscriptionMetadata.timestamp ? `<div><strong>Date:</strong> ${formatDate(inscriptionMetadata.timestamp)}</div>` : ''}
                ${inscriptionMetadata.blockHeight ? `<div><strong>Block height:</strong> ${inscriptionMetadata.blockHeight}</div>` : ''}
            </div>
        `;
    }
    
    // Use utility function to create metadata HTML
    const metadataRows = createAttestationMetadataRows(attestation, {
        forDisplay: 'modal',
        excludeFields: window.excludeFields || []
    });
    
    let metadataHtml = '<div class="attestation-details-box"><h3>Attestation Details</h3><div class="details-content">';
    metadataHtml += metadataRows.join('');
    metadataHtml += '</div></div>';
    
    // Clear previous content and add new content
    const existingContent = contentDiv.querySelector('.attestation-content');
    if (existingContent) {
        existingContent.remove();
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'attestation-content';
    
    // Determine content type and render appropriately
    let contentHtml = '';
    
    console.log('[DISPLAY DEBUG] Starting content processing...');
    
    try {
        // First, try to get the content type from the inscription
        const inscriptionUrl = `https://ordinals.com/r/inscription/${attestation.id}`;
        const inscriptionData = await window.getMetadata(inscriptionUrl);
        const contentType = inscriptionData?.content_type || '';
        
        console.log('[DISPLAY DEBUG] Content type from metadata:', contentType);
        
        // Use utility function for content type detection
        const rawContent = attestation.rawContent || await window.getInscriptionContent(attestation.id);
        const detectedType = detectAttestationContentType({ contentType, rawContent });
        
        console.log('[DISPLAY DEBUG] Detected content type:', detectedType);
        
        if (detectedType.type === 'image') {
            console.log('[DISPLAY DEBUG] Detected as image content');
            contentHtml = `<img src="https://ordinals.com/content/${attestation.id}" alt="${attestation.title}" class="attestation-image-content">`;
        } else if (detectedType.type === 'html') {
            console.log('[DISPLAY DEBUG] Detected as HTML content');
            if (rawContent && (rawContent.includes('<script') || rawContent.includes('<canvas'))) {
                // Interactive HTML - use iframe
                contentHtml = `<iframe src="https://ordinals.com/content/${attestation.id}" class="attestation-iframe-content"></iframe>`;
            } else {
                // Static HTML - process and display
                let processedContent = rawContent || '';
                // Fix relative URLs to use full ordinals.com paths
                processedContent = processedContent.replace(/href="\/content\//g, 'href="https://ordinals.com/content/');
                processedContent = processedContent.replace(/src="\/content\//g, 'src="https://ordinals.com/content/');
                contentHtml = processedContent;
            }
        } else if (detectedType.type === 'text' && rawContent) {
            // It's text content (including markdown) - try to parse as markdown if available
            console.log('[DISPLAY DEBUG] Detected as text content, checking marked library...');
            
            if (window.marked && isMarkedAvailable()) {
                console.log('[DISPLAY DEBUG] Processing with marked library...');
                let processedContent = window.marked.parse(rawContent);
                // Fix relative URLs to use full ordinals.com paths
                processedContent = processedContent.replace(/href="\/content\//g, 'href="https://ordinals.com/content/');
                processedContent = processedContent.replace(/src="\/content\//g, 'src="https://ordinals.com/content/');
                contentHtml = processedContent;
            } else {
                // Plain text - display in pre-formatted div
                console.log('[DISPLAY DEBUG] Marked not available, using plain text display');
                contentHtml = `<div class="attestation-text-content">${rawContent}</div>`;
            }
        } else {
            // No content available or unrecognized type
            console.log('[DISPLAY DEBUG] No content available or unrecognized type');
            contentHtml = '<p>No content available.</p>';
        }
    } catch (error) {
        console.warn('[DISPLAY DEBUG] Error processing attestation content:', error);
        contentHtml = '<p>Error loading content.</p>';
    }
    
    console.log('[DISPLAY DEBUG] Final contentHtml length:', contentHtml.length);
    console.log('[DISPLAY DEBUG] Final contentHtml preview:', contentHtml.substring(0, 200));
    
    contentWrapper.innerHTML = metadataHtml + contentHtml + inscriptionMetadataHtml;
    contentDiv.appendChild(contentWrapper);
}

/**
 * Checks if marked is available and reprocesses global attestations if needed
 * This should be called after the marked library is loaded
 */
async function checkAndReprocessAttestations() {
    if (!isMarkedAvailable()) {
        return;
    }

    if (window.allAttestations && window.allAttestations.length > 0) {
        const reprocessedAttestations = await reprocessAttestationsWithMarkdown(window.allAttestations);
        
        // Update global attestations
        window.allAttestations = reprocessedAttestations;
        window.filteredAttestations = reprocessedAttestations;
        window.filteredResults = reprocessedAttestations;
    }
}

/**
 * Reprocesses all attestations with markdown when the marked library becomes available
 * @param {Array} attestations - Array of attestation objects to reprocess
 * @returns {Promise<Array>} Array of reprocessed attestation objects
 */
async function reprocessAttestationsWithMarkdown(attestations) {
    if (!isMarkedAvailable()) {
        return attestations;
    }

    return Promise.all(
        attestations.map(async (attestation) => {
            if (attestation.rawContent) {
                const processedContent = await processAttestationContent(attestation.rawContent);
                return {
                    ...attestation,
                    html: processedContent.html,
                    title: attestation.title || processedContent.title
                };
            }
            return attestation;
        })
    );
}

/**
 * Analyzes attestation content to determine the best thumbnail to display
 * @param {string} attestationId - The inscription ID of the attestation
 * @returns {Promise<Object|null>} Object with type and src, or null if no image found
 */
async function getAttestationThumbnail(attestationId) {
    try {
        // First, try to get the content type from the inscription metadata
        const inscriptionUrl = `https://ordinals.com/r/inscription/${attestationId}`;
        const inscriptionData = await window.getMetadata(inscriptionUrl);
        const contentType = inscriptionData?.content_type || '';
        
        // Use utility function for content type detection
        const content = await window.getInscriptionContent(attestationId);
        const detectedType = detectAttestationContentType({ contentType, rawContent: content });
        
        if (detectedType.type === 'image') {
            return {
                type: 'image',
                src: `${window.baseUrl || 'https://ordinals.com'}/content/${attestationId}`
            };
        }
        
        if (detectedType.type === 'html' && content) {
            // Look for images in the HTML content
            const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
            const imgMatch = content.match(imgRegex);
            
            if (imgMatch) {
                let imgSrc = imgMatch[1];
                // Convert relative URLs to absolute
                if (imgSrc.startsWith('/content/')) {
                    imgSrc = `${window.baseUrl || 'https://ordinals.com'}${imgSrc}`;
                }
                return {
                    type: 'image',
                    src: imgSrc
                };
            }
            
            // Check if it has script tags or looks like interactive content
            if (content.includes('<script') || content.includes('canvas') || content.includes('interactive')) {
                return {
                    type: 'iframe',
                    src: `${window.baseUrl || 'https://ordinals.com'}/content/${attestationId}`
                };
            }
        }
        
        return null;
    } catch (error) {
        console.warn(`Error getting thumbnail for ${attestationId}:`, error);
        return null;
    }
}

/**
 * Converts an integer to a Roman numeral string.
 * @param {number} num - The integer to convert.
 * @returns {string} The Roman numeral representation.
 */
function toRoman(num) {
    if (isNaN(num) || num < 1) return 'I';
    const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const rom = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    let result = '';
    for (let i = 0; i < val.length; i++) {
        while (num >= val[i]) {
            result += rom[i];
            num -= val[i];
        }
    }
    return result;
}

// --- EXPORTS ---
window.BRC333Attestations = {
    // Main functions
    fetchAttestations,
    displayAttestationLinks,
    displayAttestation,
    
    // Utility functions
    formatDate,
    processAttestationContent,
    isMarkedAvailable,
    reprocessAttestationsWithMarkdown,
    checkAndReprocessAttestations,
    getAttestationThumbnail,
    
    // New consolidated utility functions
    createAttestationFilterOptions,
    applyAttestationFieldFiltering,
    createAttestationClickableLink,
    detectAttestationContentType,
    formatAttestationMetadata,
    createAttestationMetadataRows,
    
    // Test/development functions
    getTestAttestations
};

// --- UTILITY FUNCTIONS - Consolidated Patterns to Reduce Duplication ---

/**
 * Creates standardized filter options object used across multiple functions
 * @param {Object} customOptions - Custom options to merge with defaults
 * @returns {Object} Standardized filter options
 */
function createAttestationFilterOptions(customOptions = {}) {
    return {
        itemsPerPage: window.ITEMS_PER_PAGE || 10,
        excludeFields: window.excludeFields || [],
        allowedKinds: window.allowedKinds || [],
        searchPlaceholder: window.searchPlaceholder || 'Search attestations...',
        ...customOptions
    };
}

/**
 * Applies field filtering logic consistently across functions
 * @param {Object} attestation - Attestation object to filter
 * @param {Object} options - Filter options object
 * @returns {Array} Array of [key, value] pairs that should be displayed
 */
function applyAttestationFieldFiltering(attestation, options = {}) {
    const { excludeFields = [] } = options;
    
    const baseIgnore = ['id', 'html', 'rawContent', 'tags', 'title'];
    const commonExclude = ['bridgerNo', 'kind']; // Common fields to exclude in list view
    
    // Combine all fields to ignore
    const fieldsToIgnore = [
        ...baseIgnore, 
        ...commonExclude,
        ...excludeFields
    ];
    
    // Convert all fields to lowercase for case-insensitive comparison
    const fieldsToIgnoreLower = fieldsToIgnore.map(field => field.toLowerCase());
    
    // Make sure attestationId is never excluded
    const attestationIdIndex = fieldsToIgnoreLower.indexOf('attestationid');
    if (attestationIdIndex > -1) {
        fieldsToIgnoreLower.splice(attestationIdIndex, 1);
    }

    return Object.entries(attestation).filter(([key, value]) => {
        const keyLower = key.toLowerCase();
        const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        const labelLower = label.toLowerCase();
        
        // Check if the field should be excluded (case-insensitive)
        const shouldExclude = fieldsToIgnoreLower.includes(keyLower) || 
                             fieldsToIgnoreLower.includes(labelLower);
        
        return value && !shouldExclude;
    });
}

/**
 * Creates clickable link HTML for attestation metadata fields
 * @param {string} field - The field type (issuer, kind, type, tags, attestationid)
 * @param {string|Array} value - The value to make clickable
 * @param {Object} options - Options for link generation
 * @returns {string} HTML string for clickable link(s)
 */
function createAttestationClickableLink(field, value, options = {}) {
    if (!value) return '';
    
    const { truncateIds = true, maxIdLength = 20 } = options;
    const escapeValue = (val) => val.replace(/'/g, "\\'");
    const removeModal = "document.getElementById('attestation-modal')?.remove();";
    
    const fieldLower = field.toLowerCase();
    
    switch (fieldLower) {
        case 'issuer':
        case 'author':
            return `<a href="#" onclick="${removeModal} document.getElementById('attestation-search-input').value='${escapeValue(value)}'; document.getElementById('attestation-search-input').dispatchEvent(new Event('input')); return false;">${value}</a>`;
            
        case 'kind':
            return `<a href="#" onclick="${removeModal} document.getElementById('attestation-kind-filter').value='${escapeValue(value)}'; document.getElementById('attestation-kind-filter').dispatchEvent(new Event('change')); return false;">${value}</a>`;
            
        case 'type':
            return `<a href="#" onclick="${removeModal} document.getElementById('attestation-type-filter').value='${escapeValue(value)}'; document.getElementById('attestation-type-filter').dispatchEvent(new Event('change')); return false;">${value}</a>`;
            
        case 'tags':
            if (Array.isArray(value)) {
                return value.map(tag => 
                    `<a href="#" onclick="${removeModal} document.getElementById('attestation-search-input').value='${escapeValue(tag)}'; document.getElementById('attestation-search-input').dispatchEvent(new Event('input')); return false;">${tag}</a>`
                ).join(' | ');
            }
            return value;
            
        case 'attestationid':
        case 'id':
            const displayValue = truncateIds && value.length > maxIdLength ? 
                value.substring(0, maxIdLength - 3) + '...' : value;
            return `<a href="https://ordinals.com/content/${value}" target="_blank" rel="noopener noreferrer">${displayValue}</a>`;
            
        default:
            return value;
    }
}

/**
 * Detects content type consistently across functions
 * @param {Object} options - Options object containing content info
 * @param {string} options.contentType - MIME type from metadata
 * @param {string} options.rawContent - Raw content string
 * @returns {Object} Content type information
 */
function detectAttestationContentType(options = {}) {
    const { contentType = '', rawContent = '' } = options;
    
    // Check MIME type first (most reliable)
    if (contentType) {
        if (contentType.includes('image/')) {
            return { type: 'image', category: 'media', mimeType: contentType };
        }
        if (contentType.includes('html')) {
            return { type: 'html', category: 'document', mimeType: contentType };
        }
        if (contentType.includes('text/')) {
            return { type: 'text', category: 'document', mimeType: contentType };
        }
        if (contentType === 'application/json') {
            return { type: 'json', category: 'data', mimeType: contentType };
        }
    }
    
    // Check binary signatures in raw content
    if (rawContent) {
        if (rawContent.startsWith('RIFF') || rawContent.startsWith('\u0000') || 
            rawContent.startsWith('\u0089PNG') || rawContent.startsWith('\u00FF\u00D8\u00FF')) {
            return { type: 'image', category: 'media', signature: 'binary' };
        }
        
        // Check HTML patterns
        const trimmed = rawContent.trim();
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
            return { type: 'html', category: 'document', signature: 'markup' };
        }
        
        // Check JSON patterns
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return { type: 'json', category: 'data', signature: 'json' };
        }
    }
    
    return { type: 'text', category: 'document' };
}

/**
 * Formats attestation metadata consistently with special handling for different field types
 * @param {string} key - The metadata field key
 * @param {any} value - The field value
 * @param {Object} options - Formatting options
 * @returns {string} Formatted display value
 */
function formatAttestationMetadata(key, value, options = {}) {
    const { forDisplay = 'list', makeClickable = true } = options;
    
    if (!value) return '';
    
    const keyLower = key.toLowerCase();
    let displayValue = value;
    
    // Special formatting for different field types
    if (keyLower === 'date' && typeof value === 'string') {
        displayValue = formatDate(value);
    } else if (keyLower === 'level' && (typeof value === 'number' || !isNaN(parseInt(value)))) {
        displayValue = toRoman(parseInt(value));
    } else if (makeClickable && ['issuer', 'author', 'kind', 'type', 'tags', 'attestationid'].includes(keyLower)) {
        const truncateIds = forDisplay === 'list';
        displayValue = createAttestationClickableLink(keyLower, value, { truncateIds });
    }
    
    return displayValue;
}

/**
 * Creates consistent metadata HTML for attestations
 * @param {Object} attestation - The attestation object
 * @param {Object} options - Formatting options
 * @returns {Array} Array of HTML strings for each metadata row
 */
function createAttestationMetadataRows(attestation, options = {}) {
    const { forDisplay = 'list' } = options;
    const filteredFields = applyAttestationFieldFiltering(attestation, options);
    
    return filteredFields.map(([key, value]) => {
        const displayValue = formatAttestationMetadata(key, value, { 
            forDisplay, 
            makeClickable: true 
        });
        const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
        return `<div><strong>${label}:</strong> ${displayValue}</div>`;
    });
}

// --- MAIN MODULE FUNCTIONS ---

/**
 * Injects the required CSS styles for attestation display
 */