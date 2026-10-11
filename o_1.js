// 1. GLOBAL & SHARED VARIABLES
const testing = true;
const satplication = 1882867286217244;
const loadingId = "671b9b158a5fba9c85d62e6bb343688a7a4096d5c7546add0966083f79ce6799i0";
const oracleStrings = ["meta-layer", "trait", "overweb"];
let baseUrl = testing ? 'https://ordinals.com' : '';

// --- Local script variables ---
let pfpState = 0;
const pfpElements = [];
const loadingGif = document.createElement('img');
let height = undefined, blockheight = undefined, timestamp = undefined, sat = undefined, number = undefined;
let bridgerNo; 

// --- Shared variables (from ml_1.htm) ---
let inscriptionId;
let articles = [];
let currentPage = 1;
let spansToArticles = [];
let filteredResults, callForInputId; 
let description, brc333message, chain, medium, protocol;
let ITEMS_PER_PAGE, searchPlaceholder, endMessage, linkListTitle, excludeFields, allowedKinds;
let defaultBackgroundColor, pfpBackgroundColors = {};

// Defensive check: Ensure inscriptionId is never undefined when accessed
window.inscriptionId = window.inscriptionId || 'loading...';

// --- Shared functions ---
function toRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
            result += numerals[i];
            num -= values[i];
        }
    }
    return result;
}

// 2. HELPER FUNCTIONS
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Extracts inscription ID from URL or returns fallback
 * @param {string} url - The current URL
 * @param {string} fallbackId - Fallback inscription ID
 * @returns {string} The inscription ID
 */
async function getInscriptionId(url, fallbackId) {
    try {
        // Check if there's an inscription ID in the URL path
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        // Look for inscription ID pattern (64 hex chars + 'i' + number)
        for (const part of pathParts) {
            if (/^[a-fA-F0-9]{64}i[0-9]+$/.test(part)) {
                return part;
            }
        }
        
        // Check query parameters
        const idParam = urlObj.searchParams.get('id');
        
        if (idParam && /^[a-fA-F0-9]{64}i[0-9]+$/.test(idParam)) {
            return idParam;
        }
        
        // Return fallback if no inscription ID found
        return fallbackId;
    } catch (error) {
        console.error('getInscriptionId ERROR:', error);
        return fallbackId;
    }
}

async function getMetadata(url, retry = false) {
    console.log(`[getMetadata] Fetching from: ${url}`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`[getMetadata] Received text for ${url}: ${text.substring(0, 100)}...`);
        try { 
            const json = JSON.parse(text);
            console.log(`[getMetadata] Parsed JSON successfully for ${url}:`, json);
            return json;
        } catch { 
            console.warn(`[getMetadata] Could not parse as JSON for ${url}, returning as text.`);
            return text; 
        }
    } catch (error) {
        console.error(`[getMetadata] Error fetching metadata from ${url}:`, error);
        if (!retry) {
            const newUrl = `${url}?timestamp=${Math.floor(Date.now() / 600000)}`;
            return getMetadata(newUrl, true);
        }
        throw error;
    }
}

async function getInscriptionContent(id, isJson = false) {
    if (!id) {
        console.error("getInscriptionContent called with invalid id:", id);
        return null;
    }
    const url = `${baseUrl}/content/${id}`;
    try {
        const response = await fetch(url);
        const content = isJson ? await response.json() : await response.text();
        console.log(`[getInscriptionContent] Fetched content for id ${id}. Type: ${typeof content}. Preview:`, typeof content === 'string' ? content.substring(0, 100) : content);
        return content;
    } catch (error) {
        console.error(`Error fetching content for inscription ${id}:`, error);
        return null;
    }
}

async function getInscriptionsForSat(sat, last = false, backup = null, skip = null) {
    if (sat === undefined) {
        console.error('Invalid sat: undefined');
        return [];
    }
    let allInscriptionIds = [];
    if (last) {
        const url = `https://ordinals.com/r/sat/${sat}/at/-1`;
        try {
            const response = await getMetadata(url);
            allInscriptionIds = [response];
        } catch (error) {
            console.error(`Error fetching last inscription for sat ${sat}:`, error);
        }
    } else {
        let page = 0, hasMore = true, totalSkipped = 0, totalFetched = 0;
        while (hasMore) {
            const url = page === 0 ? `https://ordinals.com/r/sat/${sat}` : `https://ordinals.com/r/sat/${sat}/${page}`;
            try {
                const response = await getMetadata(url);
                if (response && Array.isArray(response.ids)) {
                    const remainingToSkip = Math.max((skip || 0) - totalSkipped, 0);
                    const newIds = response.ids.slice(remainingToSkip);
                    totalSkipped += Math.min(remainingToSkip, response.ids.length);
                    totalFetched += newIds.length;
                    allInscriptionIds.push(...newIds);
                    hasMore = response.more;
                    page++;
                } else { hasMore = false; }
            } catch (error) {
                console.error(`Error fetching inscription IDs for sat ${sat}:`, error);
                hasMore = false;
            }
        }
    }
    if (allInscriptionIds.length === 0 && backup) {
        allInscriptionIds = [backup];
    }
    return allInscriptionIds;
}

/**
 * Retrieve the last inscription for a specific sat
 * @param {number} sat - The sat number to check
 * @returns {Promise<Array>} The id of the last inscription
 */
async function getLastInscriptionForSat(sat) {
    if (sat === undefined) {
        console.error('Invalid sat: undefined');
        return [];
    }
    
    const url = `https://ordinals.com/r/sat/${sat}/at/-1`;

    try {
        const response = await getMetadata(url);
        console.log(`[getLastInscriptionForSat] Received response from getMetadata for sat ${sat}:`, response);
        if (response && response.id) {
            console.log(`[getLastInscriptionForSat] Returning id: ${response.id}`);
            return response.id;
        } else {
            console.error(`[getLastInscriptionForSat] Response from getMetadata for sat ${sat} did not have an 'id' property. Response was:`, response);
            return undefined;
        }
    } catch (error) {
        console.error(`Error fetching last inscription for sat ${sat}:`, error);
    }
}

/**
 * Loads a TTF font from an inscription and applies it to the ID name
 * @param {string} fontInscriptionId - The inscription ID containing the TTF font
 * @param {string} elementId - The ID of the element to apply the font to
 */
async function loadAndApplyFont(fontInscriptionId, elementId = 'card-title-text') {
    if (!fontInscriptionId) return;

    // Generate unique font family and class name
    const fontFamilyName = `Font_${fontInscriptionId.slice(0, 8)}`;
    const className = `font-${fontInscriptionId.slice(0, 8)}`;

    // Inject @font-face rule
    const fontUrl = `${baseUrl}/content/${fontInscriptionId}`;
    const fontFaceRule = `
        @font-face {
            font-family: "${fontFamilyName}";
            src: url("${fontUrl}") format("truetype");
            font-display: swap;
        }
    `;
    addStyleSheet(fontFaceRule);

    // Inject dynamic class rule
    const classRule = `
        .${className} { font-family: "${fontFamilyName}", 'Chivo', sans-serif !important; }
    `;
    addStyleSheet(classRule);

    // Apply the class to the element
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Applies a font family to a specific element
 * @param {string} fontFamily - The font family to apply
 * @param {string} elementId - The ID of the element to style
 */
function applyFontToElement(fontFamily, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.setProperty('fontFamily', fontFamily, 'important');
        console.log(`[Font] Applied font ${fontFamily} to ${elementId} with !important`);
    } else {
        console.warn(`[Font] Element with ID ${elementId} not found`);
    }
}

// 3. EXPOSE HELPER FUNCTIONS TO GLOBAL SCOPE
window.getMetadata = getMetadata;
window.getInscriptionsForSat = getInscriptionsForSat;
window.getInscriptionContent = getInscriptionContent;
window.getLastInscriptionForSat = getLastInscriptionForSat;
window.getInscriptionId = getInscriptionId;
window.baseUrl = baseUrl;
window.testing = testing;
window.loadAndApplyFont = loadAndApplyFont;
window.applyFontToElement = applyFontToElement;

// Expose inscription metadata variables globally
window.getInscriptionMetadata = function() {
    // Ensure inscriptionId is available from multiple sources
    const currentInscriptionId = window.inscriptionId || inscriptionId || 'N/A';
    
    // Try to get values from both local variables and window object
    const getValueSafely = (localVar, windowVar) => {
        return localVar !== undefined ? localVar : 
               windowVar !== undefined ? windowVar : 
               'N/A';
    };
    
    return {
        height: getValueSafely(height, window.height),
        blockheight: getValueSafely(blockheight, window.blockheight),
        timestamp: getValueSafely(timestamp, window.timestamp),
        sat: getValueSafely(sat, window.sat),
        number: getValueSafely(number, window.number),
        inscriptionId: currentInscriptionId
    };
};

// 3.5 DOM UTILITY FUNCTIONS - Refactored to reduce repetitive DOM manipulation

/**
 * Creates a style element and adds it to the document head
 * @param {string} cssText - The CSS rules to add
 * @param {string} [id] - Optional ID for the style element
 * @returns {HTMLStyleElement} The created style element
 */
function addStyleSheet(cssText, id = null) {
    const style = document.createElement('style');
    style.textContent = cssText;
    if (id) style.id = id;
    document.head.appendChild(style);
    return style;
}

/**
 * Creates an element with multiple style properties applied
 * @param {string} tagName - The HTML tag name to create
 * @param {Object} styles - Object of CSS property-value pairs
 * @param {Object} [options] - Additional options
 * @param {string} [options.content] - Text content to set
 * @param {string} [options.innerHTML] - HTML content to set
 * @param {string} [options.className] - CSS class name to add
 * @param {string} [options.id] - ID to set
 * @returns {HTMLElement} The created and styled element
 */
function createStyledElement(tagName, styles = {}, options = {}) {
    const element = document.createElement(tagName);
    
    // Apply styles
    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
    
    // Apply optional properties
    if (options.content) element.textContent = options.content;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    
    return element;
}

/**
 * Applies multiple style properties to an element
 * @param {HTMLElement} element - The element to style
 * @param {Object} styles - Object of CSS property-value pairs
 */
function applyStyles(element, styles) {
    if (!element) return;
    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
}

/**
 * Shows or hides a container with optional class management
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} show - Whether to show (true) or hide (false)
 * @param {Object} [options] - Additional options
 * @param {string[]} [options.addClasses] - Classes to add when showing
 * @param {string[]} [options.removeClasses] - Classes to remove when hiding
 * @param {Object} [options.showStyles] - Additional styles to apply when showing
 * @param {Object} [options.hideStyles] - Additional styles to apply when hiding
 */
function toggleContainer(elementOrId, show, options = {}) {
    const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return;
    
    if (show) {
        element.style.display = options.showDisplay || 'block';
        if (options.addClasses) {
            options.addClasses.forEach(cls => element.classList.add(cls));
        }
        if (options.showStyles) {
            applyStyles(element, options.showStyles);
        }
    } else {
        element.style.display = 'none';
        if (options.removeClasses) {
            options.removeClasses.forEach(cls => element.classList.remove(cls));
        }
        if (options.hideStyles) {
            applyStyles(element, options.hideStyles);
        }
    }
}

/**
 * Creates a pre-styled modal container
 * @param {Object} [styles] - Custom styles to override defaults
 * @returns {HTMLElement} The modal container element
 */
function createModalContainer(styles = {}) {
    const defaultStyles = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000'
    };
    
    return createStyledElement('div', { ...defaultStyles, ...styles });
}

/**
 * Creates a pre-styled JSON display element
 * @param {Object} jsonData - The JSON data to display
 * @param {Object} [styles] - Custom styles to override defaults
 * @returns {HTMLElement} The pre element with formatted JSON
 */
function createJsonDisplay(jsonData, styles = {}) {
    const defaultStyles = {
        margin: '0',
        padding: '1em',
        background: '#fff',
        color: '#111',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        height: '100vh',
        boxSizing: 'border-box',
        overflowY: 'auto'
    };
    
    return createStyledElement('pre', { ...defaultStyles, ...styles }, {
        content: JSON.stringify(jsonData, null, 2)
    });
}

// 4. MODULES LOADED VIA FETCHINSCRIPTIONS

async function loadScriptFromSource(source, name, type) {
    let url;
    if (typeof source === 'number') {
        const scriptIds = await getInscriptionsForSat(source, true);
        if (scriptIds && scriptIds.length > 0 && scriptIds[0] && scriptIds[0].id) {
            url = `${baseUrl}/content/${scriptIds[0].id}`;
        } else { throw new Error(`Could not find inscription on ${type} sat ${source}`); }
    } else if (typeof source === 'string') {
        url = source.startsWith('http') ? source : `${baseUrl}/content/${source}`;
    } else {
        throw new Error(`Invalid source type for ${type} script ${name}: ${source}`);
    }
    await loadScript(url);
}

async function fetchInscriptions(satplication, oracleStrings) {
    let scripts = {}, layout = [], articlesConfig = [], oracles = [], attestorsConfig = [];
    let content;
    if (testing) {
        content = {   
            "protocol": "BRC333",
            "operation": "source",
            "description": "The scripts and JSON configuration data inscriptions as well as key-value pairs to configure the Meta-Layer Call for Input satplication, which is powered by BRC333.",
            "sources":  [
                { "script": "Oracle", "src": "https://natowls.xyz/brc333oracle.js","backup": null },
                { "script": "UI", "src": "https://natowls.xyz/brc333docsui.js", "backup": null },
                { "script": "Articles", "src": "https://natowls.xyz/brc333articles.js", "backup": "f41f4015516f5d1c83924f391e2449d955858dada538f94e10121048ec9256b9i0" },
                { "script": "Attestations", "src": "https://natowls.xyz/brc333attestations.js", "backup": null },
                { "script": "Tags", "src": "https://natowls.xyz/brc333tags.js", "backup": null },
                { "script": "Pagination", "src": "https://natowls.xyz/brc333pagination.js", "backup": null },
                { "script": "Data", "src": "https://natowls.xyz/brc333data.js", "backup": null },
                { "script": "ID", "src": "https://natowls.xyz/brc333id.js", "backup": null },
                { "script": "Colors", "src": "https://natowls.xyz/brc333id-colors.js", "backup": null },
                { "script": "Layout", "src": "https://natowls.xyz/brc333id-layout.js", "backup": null },
                { "script": "MockCommunity", "src": "https://natowls.xyz/mock_community_data.js", "backup": null },
                { "layout": "overweb", "sat": 1608984000627538, "skip": 0, "backup": "fd03c98b616a774235292eef99ecf4d17d09f78f33b1c5045cace3ce9ea6e7b4i0" },
                { "articles": "overweb", "sat": 1954778638335406, "skip": 0, "backup": "c92aa2f29f20c94c380ad86cd836f41bfd519cc37492cf24c1680c531a6676d3i0" },
                { "attestors": "overweb", "sat": 1608984000638035, "skip": 0, "backup": "6731f7c6bc32a122d23009e94f0c570d4eaf1137291712ba92dd55c81889a762i0null" },
                { 
                    "key": "spansToArticles", 
                    "value": [
                        { "spanId": "howToInscribe", "articleId": "7c15d859d71fed6f2a31bdde7d11c0d16eefe4a580b31b9d9507dee401e3e082i0" },
                        { "spanId": "call-for-input", "articleId": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0" }
                    ]
                },
                { "key": "hookSat", "value": 1954778638321042 },
                { "key": "excludeFields", "value": ["recipient", "bridgerNo", "kind"] },
                { "key": "allowedKinds", "value": ["credential"] },
                { "key": "ITEMS_PER_PAGE", "value": 10 },
                { "key": "lfgButtonText", "value": "BACK TO ID" },
                { "key": "callForInputId", "value": "41b5ea02ed344cacfe828595491ca224f2e487052447b7d004c62ab323a1b6c4i0" },
                { "key": "endMessage", "value": `<i>This Bitcoin satplication lays a cornerstone for the world's first decentralized information monument. Press 'i' for contextual insights.` },
                { "key": "linkListTitle", "value": "Credentials" },
                { "key": "sourceId", "value": "overweb-call-for-input" },
                { "key": "searchPlaceholder", "value": "Search credentials..." },
                { "key": "fontFamily", "value": "'Helvetica Neue', Helvetica, Arial, sans-serif" },
                { "key": "stylesSat", "value": 1117075618770135 },
                { "key": "titleTopOffset", "value": "35%" },
                { "key": "prefaceButtonText", "value": "CREDENTIALS" },
                { "key": "restartButtonText", "value": "BACK TO ID" },
                { "key": "chain", "value": "Bitcoin" },
                { "key": "medium", "value": "Ordinals" },
                { "key": "protocol", "value": "BRC333" },
                { "key": "primary", "value": "#00BFFF" },
                { "key": "primaryHover", "value": "#33CCFF" },
                { "key": "primaryVisited", "value": "#0099CC" },
                { "key": "background", "value": "#000000" },
                { "key": "border", "value": "#333333" },
                { "key": "text", "value": "#F0EAD6" },
                { "key": "accent", "value": "#87CEFA" },
                { "key": "titleColor", "value": "#FF4040" },
                { "key": "faviconId", "value": "8c671d715d8278b5f560d1d83ba15cd925bf12f80f6dd642daf95ea2eb72b252i0" },
                { "key": "metadataBg", "value": "rgba(128, 128, 128, 0.1)" },
                { "key": "searchBg", "value": "rgba(255, 107, 0, 0.1)" },
                { "key": "meta-domain", "value": "id.overweb.meta", "id": "00bb89cdd16d44e2418c21ee4a85ccfafde0651ad396541f0d4cdb56808f63afi0" },
                { "key": "idName", "value": "OVERWEB ID" },
                { "key": "idNameFont", "value": "01e8772ba95fb37e26a6af7306bd93766e7ffe6fbace6d12c91e0f3b6d1d32e1i0" },
                { "key": "idDescription", "value": "A Trust Signal in the Emerging Metaweb" },
                { "key": "participant", "value": "Bridger" },
                { "key": "participantNum", "value": "Bridger No." },
                {
                    "key": "description",
                    "value": `<br><h1 class="title-text">Overweb ID</h1><h2 class="subtitle-text">A Trust Signal in the Emerging Metaweb</h2><br><span class="normal">The Overweb ID is a new kind of digital identity&mdash;one that lives above Today's Web. It's issued as part of the Meta-Layer Initiative, which is building the decentralized substrate for the Overweb: a meta-layer where content has context, trust is visible, and people have presence.<br><br>Each Overweb ID is anchored by a public inscription&mdash;an act of attestation that links your contributions, credentials, and social proof into a portable, verifiable artifact. These IDs enable transparent interaction across overlay apps, smart tags, and decentralized autonomous layers (DALs).<br><br>They are designed for the future of the Internet: one where identity is sovereign, credentials are composable, and trust travels with you. Your Overweb ID acts as a wallet for Overweb-related micro-credentials you earn&mdash;each one representing a verified signal of participation, knowledge, or alignment with shared values. These credentials can be carried with you across the Metaweb, serving as building blocks of reputation and access in decentralized contexts.<br><br><strong>Press <i>i</i></strong> while viewing any credential to see its detailed metadata, including inscription details and blockchain proof.</span>`
                },
                {
                    "key": "overwebIdInstructions",
                    "value": `<br><h2 class="subtitle-text">Interacting with the Overweb ID</h2><span class="normal">Your Overweb ID is an interactive card. Here's how to use it:</span><span class="normal"><b>On the Card:</b><ul><li><b>Image Panel (Left Side):</b> Click the image panel to cycle through the ID logo, your QR code, and any associated Profile Pictures (PFPs) or HTML inscriptions.</li><li><b>Inscription ID:</b> Click the ID value to open a modal and easily copy the full inscription ID.</li><li><b>Microcreds / Badges:</b> Click on these fields to view the list of all associated credentials.</li></ul></span><span class="normal"><b>URL Shortcuts:</b><p>You can also navigate directly to specific content using the URL hash:</p><ul><li><code>#cred</code> &mdash; View all credentials.</li><li><code>#cred/[number]</code> &mdash; View a specific credential.</li><li><code>#cred/display</code> &mdash; View JSON for all credentials.</li><li><code>#pearl</code> &mdash; Filter for PEARL credentials.</li><li><code>#pearl/display</code> &mdash; View JSON for all PEARL credentials.</li><li><code>#pfp</code> &mdash; View the last profile picture.</li><li><code>#pfp/[number]</code> &mdash; View a specific profile picture.</li><li><code>#pfp/display</code> &mdash; View the last PFP full-screen.</li><li><code>#pfp/[number]/display</code> &mdash; View a specific PFP full-screen.</li><li><code>#qr</code> &mdash; View the base QR code.</li><li><code>#qr/[hash]</code> &mdash; Append a hash to the QR code URL.</li></ul></span>`
                },
                { "key": "brc333message", "value": `<span class="bold">About the BRC333 Protocol and Satplications</span><span class="normal">This satplication is implemented using the BRC333 Dynamic Ordinals protocol. The protocol, incubated by Bridgit DAO, redefines what is possible on Bitcoin and PoW chains by introducing satplications&mdash;decentralized, immutable, and future-proof applications built directly on the  blockchain. Satplications leverage Bitcoin's unparalleled security and permanence to deliver dynamic  functionality without smart contracts or gas fees.</span><span class="normal">Satplications are modular stacks of satoshis, combining logic and data through recursive inscriptions. This architecture ensures: <ul><li>Immutable applications that persist as long as Bitcoin exists. <li>Seamless updates and evolvability, ensuring adaptability over time. <li>A foundation for decentralized systems, resistant to censorship and scaling limitations.</ul></span><span class="normal">Key Features of BRC333 Satplications: <ul><li>Reinscription-based updates, enabling dynamic state changes and evolvable behavior.<li>Modular architecture for structured information management across code, data, and configuration sats.<li>Immutable data preservation combined with adaptive logic for future-proof applications.</li><li>Cross-chain synchronization for integrating and connecting distributed information networks.</li></ul></span><span class="normal">With satplications, the Bitcoin blockchain becomes a platform for decentralized, interactive, and  future-proof applications. The protocol transforms Bitcoin from a passive ledger into an active,  self-sustaining system for innovation.</span><span class="normal">For more info, visit <span class="outside-link"><i>brc333.xyz</i></span> or <span class="meta-domain"><i>brc333.meta</i>.</span></span>` }
            ]
        };
    } else {
        content = await getInscriptionContent(satplication, true);
    }

    const loadPromises = [];

    for (const source of content.sources) {
        if (source.script) {
            const loadPromise = loadScriptFromSource(source.src, source.script, "script")
                .catch(err => console.error(`Failed to load script ${source.script}:`, err));
            loadPromises.push(loadPromise);
        } else if (source.layout && oracleStrings.includes(source.layout)) {
            layout.push({ sat: source.sat, skip: source.skip, backup: source.backup });
        } else if (source.articles && oracleStrings.includes(source.articles)) {
            articlesConfig.push({ sat: source.sat, skip: source.skip, backup: source.backup });
        } else if (source.attestors && oracleStrings.includes(source.attestors)) {
            attestorsConfig.push({ sat: source.sat, skip: source.skip, backup: source.backup });
        } else if (source.oracle && oracleStrings.includes(source.oracle)) {
            oracles.push({ sat: source.sat, skip: source.skip, filter: source.filter, backup: source.backup });
        } else if (source.key) {
            if (source.key === 'spansToArticles') {
                spansToArticles = source.value; // Assign directly to local variable
            } else if (typeof source.value === 'string' && (source.value.startsWith('[') || source.value.startsWith('{'))) {
                try {
                    window[source.key] = JSON.parse(source.value);
                } catch (e) {
                    console.error(`Error parsing JSON for key "${source.key}":`, e);
                    window[source.key] = source.value;
                }
            } else {
                window[source.key] = source.value;
            }
        }
    }

    // Wait for all scripts to load before proceeding
    await Promise.all(loadPromises);

    for (const source of content.sources) {
        if (source.key) {
            window[source.key] = source.value;
        }
    }
    return { scripts, oracles, layout, articles: articlesConfig, attestors: attestorsConfig };
}

// Layout functions now loaded from brc333id-layout.js module

document.addEventListener('click', e => {
    console.log('Global click event:', {
        target: e.target,
        classList: e.target.classList,
        parentNode: e.target.parentNode,
        eventPhase: e.eventPhase,
        bubbles: e.bubbles,
        stack: new Error().stack
    }, e);
}, true);

function overrideRestartButtonListener() {
    document.body.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'restartButton') {
            event.stopPropagation();
            if (typeof window.switchToIdCardView === 'function') {
                window.switchToIdCardView();
            } else {
                console.error("'switchToIdCardView' function is not defined on the window object.");
            }
        }
    }, true);
}

// 5. APPLICATION LOGIC
async function initSatplication() {
    console.log("xxxx INIT START - Initializing Satplication...Hacked by @daveed.meta");
    
    // Check if a JSON endpoint was requested - if so, exit early
    if (window.jsonEndpointRequested) {
        console.log('[Debug] JSON endpoint requested, skipping full initialization');
        return [];
    }
    
    // Remove the redundant variable initialization
    // let inscriptionDate = "N/A", inscriptionBlock = "N/A", satoshi, bridgerName = "Anonymous", maxLevel = 1;

    let inscriptionId;
    let inscriptionMeta; // Declare here to make it available in a wider scope
    const baseUrl = 'https://ordinals.com';
    let currentPfpIndex = 0;
    
    overrideRestartButtonListener();
    try {
        await loadScript('https://ordinals.com/content/773e4865bcf3084e6d6ee5d49136fb5f7071d4c050ec4aeeaeb9c6d24fea5fc1i0');
        await loadScript('https://ordinals.com/content/d09ff9ec2cd2cf9899c87098a2d6ce2fdbd3c38df1e4f4c8f0477bdf6e957a41i0');
    } catch (error) {
        console.error("Failed to load critical scripts:", error);
        return;
    }
    
    // --- Render shell and styles first ---
    addStyleSheet(`html, body { background: black; margin: 0; padding: 0; height: 100%; }`, 'base-styles');
    
    // --- Fetch all remote data ---
    const result = await fetchInscriptions(satplication, oracleStrings);
    window.scripts = result.scripts;
    window.oracleUrl = result.scripts['Oracle'];
    window.docsUrl = result.scripts['UI'];
    window.layoutSat = result.layout[0];
    window.articleSat = result.articles[0];
    window.oracleSats = result.oracles;
    window.attestorsConfig = result.attestors;
        if (typeof loadStyles === 'function') {
        loadStyles();
    } else {
        console.error("loadStyles is not a function");
    }
    
    if (typeof cardHTML !== 'undefined') {
        document.body.insertAdjacentHTML('beforeend', cardHTML);
    } else {
        console.error("cardHTML is undefined");
    }
    
    addStyleSheet(cardCSS, 'card-styles');
    
    // Load the Zeniq font before rendering the card
    if (window.idNameFont) {
        console.log('[Debug] Preloading Zeniq font before rendering card:', window.idNameFont);
        await loadAndApplyFont(window.idNameFont, 'card-title-text');
    }
    
    try {
        // Define fallback ID first
        const fallbackId = "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0";
        //const fallbackId = "c21aae214365382d50c305d6f65cb02c3a64145f08bc557c766eb1485892780ai0";
        
        if (typeof window.getInscriptionId === 'function') {
            inscriptionId = await window.getInscriptionId(window.location.href, fallbackId);
            
            // Safety check: if getInscriptionId returns undefined, null, or empty string, use fallback
            if (!inscriptionId || inscriptionId === 'undefined' || inscriptionId === 'null') {
                console.error('getInscriptionId returned invalid value, using fallback');
                inscriptionId = fallbackId;
            }
        } else {
            console.error("getInscriptionId function not found. Using fallback ID.");
            inscriptionId = fallbackId;
        }
        
        // Make inscriptionId globally available IMMEDIATELY after fetching
        window.inscriptionId = inscriptionId;

        // Final safety check before metadata fetch
        if (!inscriptionId || inscriptionId === 'undefined' || inscriptionId === 'null') {
            console.error('CRITICAL ERROR: inscriptionId is still invalid before metadata fetch:', inscriptionId);
            inscriptionId = "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0";

            window.inscriptionId = inscriptionId;
        }

        inscriptionMeta = await getMetadata(`https://ordinals.com/r/inscription/${inscriptionId}`);
        satoshi = inscriptionMeta.sat;
        inscriptionBlock = inscriptionMeta.genesis_height || inscriptionMeta.height;
        if (inscriptionMeta.timestamp) {
            inscriptionDate = formatTimestamp(inscriptionMeta.timestamp, 'short');
        }
        
        // Assign to global variables for modal access
        height = inscriptionMeta.genesis_height || inscriptionMeta.height;
        blockheight = inscriptionMeta.genesis_height || inscriptionMeta.height;
        timestamp = inscriptionMeta.timestamp;
        sat = inscriptionMeta.sat;
        number = inscriptionMeta.number;
        
        // Also expose on window object immediately after assignment
        window.height = height;
        window.blockheight = blockheight;
        window.timestamp = timestamp;
        window.sat = sat;
        window.number = number;
        window.inscriptionId = inscriptionId;
        
        // Force update the getInscriptionMetadata function to ensure fresh access
        window.getInscriptionMetadata = function() {
            const currentInscriptionId = window.inscriptionId || inscriptionId || 'N/A';
            
            const getValueSafely = (localVar, windowVar) => {
                return localVar !== undefined ? localVar : 
                       windowVar !== undefined ? windowVar : 
                       'N/A';
            };
            
            return {
                height: getValueSafely(height, window.height),
                blockheight: getValueSafely(blockheight, window.blockheight),
                timestamp: getValueSafely(timestamp, window.timestamp),
                sat: getValueSafely(sat, window.sat),
                number: getValueSafely(number, window.number),
                inscriptionId: currentInscriptionId
            };
        };
        
        console.log('[Debug] Metadata assigned to globals:', {
            height,
            blockheight,
            timestamp,
            sat,
            number,
            inscriptionId
        });
        

        
        // Only call fetchBridgerName if window.ID is available
        if (window.ID && typeof window.ID.fetchBridgerName === 'function') {
            bridgerName = await window.ID.fetchBridgerName(satoshi);
        } else {
            console.warn('[Debug] window.ID.fetchBridgerName not available yet, using default');
            bridgerName = testing ? "daveed.meta" : "Anonymous";
        }
    } catch (error) {
        console.error("Failed to fetch primary inscription data:", error);
        if (testing) { bridgerName = "daveed.meta"; }
    }

    console.log('inscriptionId should be defined',inscriptionId);

    // Process attestors regardless of testing mode so #attestors route works
    const validAttestors = await processAttestors(window.attestorsConfig);
    window.validAttestors = validAttestors;

    if (testing) {
        if (window.BRC333Attestations && typeof window.BRC333Attestations.getTestAttestations === 'function') {
            articles = await window.BRC333Attestations.getTestAttestations();
        } else {
            console.warn('[Debug] BRC333Attestations module not loaded yet, using empty array');
            articles = [];
        }
    } else {
        articles = await fetchAttestations(validAttestors);
    }
    
    // Check if &all=true parameter is present to skip recipient filtering
    const urlParamsForAll = new URLSearchParams(window.location.search);
    const showAll = urlParamsForAll.get('all') === 'true';
    
    // Filter articles by current inscription ID to only show attestations for this ID (unless &all=true)
    let recipientArticles;
    if (showAll) {
        recipientArticles = articles;
        console.log(`[Debug] Showing all articles (${articles.length} total) due to &all=true parameter`);
    } else {
        recipientArticles = articles.filter(art => art.recipient === inscriptionId);
        console.log(`[Debug] Filtered articles by recipient ${inscriptionId}: ${recipientArticles.length} out of ${articles.length} total`);
    }
    
    window.articles = recipientArticles; // Use filtered articles for display
    filteredResults = recipientArticles;

    // Initialize maxLevel with default value
    let maxLevel = 1;
    
    if (recipientArticles && recipientArticles.length > 0) {
        // Calculate max level from filtered articles
        maxLevel = recipientArticles.reduce((max, art) => {
            const level = parseInt(art.level, 10);
            return !isNaN(level) && level > max ? level : max;
        }, 1);
    }

    console.log("window.ID.fetchCardProfileData exists",window.ID?.fetchCardProfileData);
    console.log("window.ID",window.ID);
    
    // Wait for window.ID to be available if it's not yet
    let retryCount = 0;
    while (!window.ID && retryCount < 10) {
        console.log(`[Debug] Waiting for window.ID to be available... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
    }
    
    if (!window.ID) {
        console.error("window.ID is not available after waiting. Cannot proceed with profile data fetch.");
        return articles;
    }

    // --- Fetch detailed profile data ---
    const profileData = await window.ID.fetchCardProfileData(satoshi, inscriptionMeta.address);
    // window.profileData = profileData; // Remove this global assignment

    // --- Now, render the card UI once with all data collected ---
    if (window.ID && typeof window.ID.populateCardData === 'function') {
        await window.ID.populateCardData({
            inscriptionId: inscriptionId,
            bridgerName: profileData.names, // Pass the rich names object
            date: inscriptionDate,
            block: inscriptionBlock,
            level: maxLevel,
            satoshi: satoshi,
            headline: profileData.headline // <-- Ensure headline is passed
        });
        
        // Load and apply the Zeniq font to the ID name
        if (window.idNameFont) {
            console.log('[Debug] Loading Zeniq font for ID name:', window.idNameFont);
            await loadAndApplyFont(window.idNameFont, 'card-title-text');
        } else {
            console.log('[Debug] No idNameFont configured, using default font');
        }
    } else {
        console.warn("ID module not loaded or populateCardData is not a function. Cannot render profile card.");
    }

    if (window.ID && typeof window.ID.setupCardInteractivity === 'function') {
        console.log('xxxx CARD SETUP - About to setup card interactivity');
        console.log('xxxx CARD SETUP - Current image panel HTML before setup:', document.getElementById('image-panel')?.innerHTML);
        await window.ID.setupCardInteractivity(satoshi, profileData); // Pass the full profile data
        console.log('xxxx CARD SETUP - Card interactivity setup complete');
        console.log('xxxx CARD SETUP - Current image panel HTML after setup:', document.getElementById('image-panel')?.innerHTML);
        
        // Show loading gif AFTER setupCardInteractivity has finished setting up the structure
        const imagePanel = document.getElementById('image-panel');
        if (imagePanel) {
            showLoadingGifInImagePanel(imagePanel);
            setupPFPLoadingTracking(imagePanel);
        }
    } else {
         console.warn("ID module not loaded or setupCardInteractivity is not a function. Cannot setup interactivity.");
         // Still remove loading gif even if setup fails
         const imagePanel = document.getElementById('image-panel');
         if (imagePanel) {
             removeLoadingGifFromImagePanel(imagePanel);
         }
    }

    // Handle initial hash for deep linking
    await handleHashChange(recipientArticles);
    
    updateCredentialCounts(inscriptionId);
    
    // Setup modals AFTER metadata is fully loaded and assigned
    setupIdInfoModal();
    setupGenericModal();
    setupMetaCommunitiesModal();
    
    // Add meta-communities link if communities exist
    await addMetaCommunitiesLink(inscriptionId);
    
    // Fetch and apply color inscriptions after inscriptionId is available
    console.log('[Debug] About to fetch color inscriptions with inscriptionId:', inscriptionId);
    await fetchColorInscriptions();
    
    // If no color was applied and we're testing locally, apply test color
    if (!defaultBackgroundColor && !Object.keys(pfpBackgroundColors).length) {
        console.log('[Debug] No color inscriptions found');
        
        // You can uncomment and replace with your actual inscription ID for testing:
        // await testColorInscription("YOUR_COLOR_INSCRIPTION_ID_HERE");
    }

    const prefaceCloseBtn = document.getElementById('preface-close');
    if (prefaceCloseBtn) {
        prefaceCloseBtn.onclick = window.ID.switchToIdCardView;
    }

    if (window.faviconId && typeof window.setFavicon === 'function') {
        window.setFavicon(window.faviconId);
    }
    
    // --- Prepare preface view in the background ---
    const prefaceContainer = document.getElementById('preface-container');
    showLoadingGif(prefaceContainer);

    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');

    try {
        await loadMarked();
        console.log('marked',marked);
        
        // Reprocess attestations with markdown now that the library is loaded
        if (window.BRC333Attestations && typeof window.BRC333Attestations.checkAndReprocessAttestations === 'function') {
            console.log('[Debug] Reprocessing attestations with markdown after library load');
            await window.BRC333Attestations.checkAndReprocessAttestations();
        }
        
        console.log('[Debug] About to fetch layout content with layoutSat:', window.layoutSat);
        await fetchLayoutContent();
        console.log('[Debug] Layout content fetched successfully');
        
        if (targetId) {
            const targetArticle = articles.find(article => article.id === targetId);
            if (targetArticle) {
                const preface = document.getElementById('preface');
                if (preface) toggleContainer(preface, false);
                
                if (window.BRC333Attestations && typeof window.BRC333Articles.displayAttestation === 'function') {
                    await window.BRC333Attestations.displayAttestation(targetArticle);
                } else {
                    console.error("BRC333Attestation module not loaded or displayAttestation function is missing.");
                }
                if (loadingGif) loadingGif.remove();
                if (document.getElementById('restartButton')) {
                    document.getElementById('restartButton').onclick = window.ID.switchToIdCardView;
                }
                toggleContainer(prefaceContainer, false);
                prefaceContainer.classList.remove('active');
                return articles;
            }
        }

        // Manual layout content replacement - this will also handle attestation display
        if (window.layoutSat && window.layoutSat.backup) {
            console.log('[Debug] Attempting manual layout content replacement with backup:', window.layoutSat.backup);
            try {
                const layoutContent = await getInscriptionContent(window.layoutSat.backup);
                console.log('[Debug] Manual layout content fetched:', layoutContent ? layoutContent.substring(0, 200) + '...' : 'null');
                
                if (layoutContent) {
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = layoutContent;
                    
                    // Fix image URLs for testing mode
                    if (testing) {
                        const images = tempContainer.querySelectorAll('img');
                        images.forEach(img => {
                            if (img.src && (img.src.includes('/content/') || img.getAttribute('src')?.startsWith('/content/'))) {
                                const originalSrc = img.getAttribute('src');
                                if (originalSrc && originalSrc.startsWith('/content/')) {
                                    img.src = 'https://ordinals.com' + originalSrc;
                                    console.log('[Debug] Fixed image URL from:', originalSrc, 'to:', img.src);
                                }
                            }
                        });
                    }
                    
                    // Replace preface content
                    const newPreface = tempContainer.querySelector('#preface, .preface');
                    const currentPreface = document.getElementById('preface');
                    if (newPreface && currentPreface) {
                        console.log('[Debug] Current preface content before replacement:', currentPreface.innerHTML.substring(0, 200) + '...');
                        console.log('[Debug] New preface content to apply:', newPreface.innerHTML.substring(0, 200) + '...');
                        
                        // Apply the new layout content
                        currentPreface.innerHTML = newPreface.innerHTML;
                        
                        // Now add the attestation links and search controls using the proper reference implementation pattern
                        if (window.BRC333Attestations && typeof window.BRC333Attestations.displayAttestationLinks === 'function' && recipientArticles) {
                            console.log('[Debug] Adding attestation links and search controls after layout content using reference pattern');
                            
                            // Create a separate container for attestations following the reference pattern
                            const attestationsContainer = document.createElement('div');
                            attestationsContainer.className = 'attestations-section';
                            currentPreface.appendChild(attestationsContainer);
                            
                            // Call displayAttestationLinks with proper options like in the reference implementation
                            const options = createFilterOptions();
                            
                            // Temporarily clear endMessage to prevent duplicate
                            const originalEndMessage = window.endMessage;
                            window.endMessage = null;
                            
                            await window.BRC333Attestations.displayAttestationLinks(recipientArticles, attestationsContainer, options);
                            
                            // Restore the original endMessage
                            window.endMessage = originalEndMessage;
                            
                            console.log('[Debug] Added attestation links and search controls using reference pattern');
                        }
                        
                        console.log('[Debug] Preface content after replacement:', currentPreface.innerHTML.substring(0, 200) + '...');
        } else {
                        console.log('[Debug] Preface elements not found:', { newPreface: !!newPreface, currentPreface: !!currentPreface });
                    }
                    
                    // Replace title content
                    const newTitle = tempContainer.querySelector('#title, .title');
                    const currentTitle = document.querySelector('.title');
                    if (newTitle && currentTitle) {
                        console.log('[Debug] Replacing title content manually');
                        currentTitle.innerHTML = newTitle.innerHTML;
                    } else {
                        // If no title element found, try to extract from h2 in preface
                        const prefaceH2 = tempContainer.querySelector('#preface h2, .preface h2');
                        if (prefaceH2 && currentTitle) {
                            console.log('[Debug] Extracting title from h2 element:', prefaceH2.textContent);
                            currentTitle.textContent = prefaceH2.textContent;
                        }
                    }
                }
            } catch (error) {
                console.error('[Debug] Error in manual layout content replacement:', error);
            }
        }

        // Add linkListTitle as a section header above the attestation list (after layout content)
        if (window.linkListTitle) {
            const preface = document.getElementById('preface');
            if (preface) {
                // Check if the linkListTitle header already exists
                const existingHeader = preface.querySelector('.link-list-header');
                if (!existingHeader) {
                    console.log('[Debug] Adding linkListTitle header:', window.linkListTitle);
                    const headerElement = createStyledElement('p', {
                        marginTop: '2em',
                        marginBottom: '1em',
                        color: 'var(--color-text)',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        padding: '0',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        width: '520px',
                        boxSizing: 'border-box',
                        display: 'block'
                    }, {
                        className: 'link-list-header',
                        content: window.linkListTitle
                    });
                    
                    // Find the attestations section and insert the header before it
                    const attestationsSection = preface.querySelector('.attestations-section');
                    if (attestationsSection) {
                        attestationsSection.parentNode.insertBefore(headerElement, attestationsSection);
                        console.log('[Debug] Added linkListTitle header before attestations section');
                    } else {
                        // Fallback: insert at the end of preface
                        preface.appendChild(headerElement);
                        console.log('[Debug] Added linkListTitle header at the end of preface (fallback)');
                    }
                }
            }
        }

        if (typeof window.endMessage !== 'undefined' && window.endMessage) {
            const preface = document.getElementById('preface');
            const iMessage = createStyledElement('p', {
                color: 'var(--color-text)',
                marginTop: '1em',
                fontSize: '0.85em'
            }, {
                className: 'endMessage',
                id: 'firstEndMessage',
                innerHTML: window.endMessage
            });
            preface.appendChild(iMessage);
        }
        
        const title = document.querySelector('.title');
        if (title) toggleContainer(title, true);
        
        // Create listeners if the function is available
        if (typeof window.createListeners === 'function') {
            window.createListeners();
        } else {
            console.warn("createListeners function not available");
        }
        
        await processHookInscriptions(window.hookSat);
        
        if (window.hookSat && typeof window.executeHook === 'function') {
            window.executeHook('test');
            window.executeHook('ml.script.end', { articles: articles });
        }
    } catch (error) {
        console.error('[Debug] A critical error occurred during preface setup:', error);
    }
    
    toggleContainer('preface-container', false, { removeClasses: ['active'] });
    if (loadingGif.parentNode) loadingGif.remove();
    
    return articles;
}

function showLoadingGif(container) {
    console.log('[Debug] showLoadingGif called for container:', container.id || 'unnamed');
    
    // Create styles for the loading gif to prevent width overrides
    addStyleSheet(`
        #loading-gif {
            width: 100px !important;
            max-width: 100px !important;
            min-width: 100px !important;
            height: auto !important;
            z-index: 1000 !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            display: block !important;
        }
    `, 'loading-gif-styles');
    
    // Set up the loading gif
    loadingGif.src = `https://ordinals.com/content/${loadingId}`;
    loadingGif.id = 'loading-gif';
    
    // Apply styles directly as well
    applyStyles(loadingGif, {
        width: "100px",
        height: "auto",
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '1000',
        display: "block"
    });

    // Add resize observer to monitor for unwanted changes
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.contentRect.width !== 100) {
                console.log('[Debug] Loading gif width changed to:', entry.contentRect.width, 'resetting to 100px');
                loadingGif.style.width = '100px';
                loadingGif.style.maxWidth = '100px';
                loadingGif.style.minWidth = '100px';
            }
        }
    });
    resizeObserver.observe(loadingGif);

    container.appendChild(loadingGif);
    console.log('[Debug] Loading gif added to container');
}

/**
 * Shows loading gif specifically in the image panel during PFP loading
 * @param {HTMLElement} imagePanel - The image panel element
 */
function showLoadingGifInImagePanel(imagePanel) {
    if (!imagePanel) {
        console.error('showLoadingGifInImagePanel: imagePanel is null');
        return;
    }
    
    // Remove any existing loading elements first
    const existingGif = imagePanel.querySelector('#image-panel-loading-gif');
    const existingOverlay = imagePanel.querySelector('#image-panel-loading-overlay');
    if (existingGif) existingGif.remove();
    if (existingOverlay) existingOverlay.remove();
    
    // Add a semi-transparent overlay to make the loading gif more visible
    const overlay = document.createElement('div');
    overlay.id = 'image-panel-loading-overlay';
    applyStyles(overlay, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: '999999',  // Very high z-index to be above any gradient
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });
    
    // Create a separate loading gif for the image panel
    const imagePanelLoadingGif = document.createElement('img');
    imagePanelLoadingGif.src = `https://ordinals.com/content/${loadingId}`;
    imagePanelLoadingGif.id = 'image-panel-loading-gif';
    
    // Style the loading gif to fit nicely in the image panel
    applyStyles(imagePanelLoadingGif, {
        width: "100px",
        height: "100px",
        position: 'relative',
        zIndex: '9999999',  // Even higher z-index than overlay
        display: "block",
        objectFit: 'contain'
    });
    
    // Add the loading gif to the overlay
    overlay.appendChild(imagePanelLoadingGif);
    
    // Add the overlay to the image panel
    imagePanel.appendChild(overlay);
}

function removeLoadingGifFromImagePanel(imagePanel) {
    if (!imagePanel) return;
    
    const loadingGif = imagePanel.querySelector('#image-panel-loading-gif');
    const loadingOverlay = imagePanel.querySelector('#image-panel-loading-overlay');
    
    if (loadingGif) loadingGif.remove();
    if (loadingOverlay) loadingOverlay.remove();
}

/**
 * Sets up tracking for PFP loading and removes loading gif when all PFPs are ready
 * @param {HTMLElement} imagePanel - The image panel element
 */
function setupPFPLoadingTracking(imagePanel) {
    if (!imagePanel) {
        console.error('setupPFPLoadingTracking: imagePanel is null');
        return;
    }
    
    // Check multiple times for pfpElements to be available
    let attempts = 0;
    const maxAttempts = 3; // Reduced from 10 to 3 for faster failure
    
    const trySetupTracking = () => {
        attempts++;
        
        // Get all PFP elements that need to load
        const pfpElements = window.pfpElements || [];
        
        if (pfpElements.length === 0) {
            if (attempts < maxAttempts) {
                // Remove the 100ms delay - retry immediately
                setTimeout(trySetupTracking, 10); // Minimal delay to avoid stack overflow
                return;
            } else {
                removeLoadingGifFromImagePanel(imagePanel);
                return;
            }
        }
        
        // Focus on the active PFP only - this is what's actually visible
        const activePFP = pfpElements.find(el => el.classList.contains('pfp-active'));
        if (!activePFP) {
            const firstPFP = pfpElements[0];
            if (firstPFP) {
                setupSinglePFPTracking(firstPFP);
            } else {
                removeLoadingGifFromImagePanel(imagePanel);
            }
            return;
        }
        
        setupSinglePFPTracking(activePFP);
    };
    
    const setupSinglePFPTracking = (element) => {
        const removeLoadingGif = () => {
            removeLoadingGifFromImagePanel(imagePanel);
        };
        
        const contentType = detectContentType({ element });
        
        if (contentType.type === 'image') {
            if (element.complete && element.naturalWidth > 0) {
                removeLoadingGif();
            } else {
                element.addEventListener('load', removeLoadingGif, { once: true });
                element.addEventListener('error', removeLoadingGif, { once: true });
            }
        } else if (contentType.type === 'html') {
            const iframe = element.querySelector('iframe');
            if (iframe) {
                // Set up immediate event listeners without polling delays
                iframe.addEventListener('load', removeLoadingGif, { once: true });
                iframe.addEventListener('error', removeLoadingGif, { once: true });
                
                // Check if iframe is already loaded
                try {
                    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                        removeLoadingGif();
                    }
                } catch (error) {
                    // Cross-origin iframe - can't access contentDocument
                    // The load event listener above will handle this
                }
            } else {
                removeLoadingGif();
            }
        } else {
            removeLoadingGif();
        }
        
        // Reduced ultimate fallback timeout from 10 seconds to 3 seconds
        setTimeout(() => {
            removeLoadingGifFromImagePanel(imagePanel);
        }, 3000); // Reduced from 10 seconds to 3 seconds
    };
    
    // Start the tracking setup process
    trySetupTracking();
}

async function handleJsonQueryParam(articles) {
    const params = new URLSearchParams(window.location.search);
    const jsonType = params.get('json');
    console.log('[Debug] handleJsonQueryParam called');
    console.log('[Debug] window.location.search:', window.location.search);
    console.log('[Debug] URLSearchParams entries:', Array.from(params.entries()));
    console.log('[Debug] jsonType parameter:', jsonType);
    if (!jsonType) {
        console.log('[Debug] No json parameter found, returning false');
        return false;
    }
    console.log('[Debug] Processing JSON endpoint:', jsonType);
        let jsonData;
    switch (jsonType) {
            case 'attestors': {
                jsonData = window.validAttestors || [];
                break;
            }
            case 'attestations': {
            // Support ?json=attestations&attestor=1
            const attestorIndex = parseInt(params.get('attestor'), 10);
                if (!isNaN(attestorIndex) && attestorIndex > 0) {
                    if (window.validAttestors && window.validAttestors.length >= attestorIndex) {
                        const singleAttestor = [window.validAttestors[attestorIndex - 1]];
                        jsonData = await fetchAttestations(singleAttestor);
                    } else {
                        jsonData = { error: "Invalid attestor index." };
                    }
                } else {
                    if (testing) {
                        if (window.BRC333Attestations && typeof window.BRC333Attestations.getTestAttestations === 'function') {
                            jsonData = await window.BRC333Attestations.getTestAttestations();
                        } else {
                            console.warn('[Debug] BRC333Attestations module not loaded yet for JSON endpoint');
                            jsonData = [];
                        }
                    } else if (window.validAttestors && window.validAttestors.length > 0) {
                        jsonData = await fetchAttestations(window.validAttestors);
                    } else {
                        jsonData = { error: "No valid attestors found." };
                    }
                }
                break;
            }
            case 'pfp': {
            const pfpElements = window.pfpElements || [];
                jsonData = pfpElements.map(el => ({ tagName: el.tagName, src: el.src, id: el.id }));
                break;
            }
            case 'cred':
            case 'micro':
            case 'pearl':
            case 'badges': {
                 if (articles) {
                    const articlesToDisplay = filterArticlesByType(articles, jsonType);
                    return articlesToDisplay;
                 } else {
                return { error: "Articles not available." };
                 }
            }
            default:
            jsonData = { error: "Invalid JSON endpoint." };
        }
    // Clean JSON data for display
        const cleanJsonData = JSON.parse(JSON.stringify(jsonData, (key, value) => {
            if (key === 'html' && typeof value === 'string') {
                return '[HTML content removed for display]';
            }
            return value;
        }));
        const jsonString = JSON.stringify(cleanJsonData, null, 2);
        const htmlContent = `<pre style="white-space: pre-wrap; word-wrap: break-word; color: #f0ead6; background-color: #1a1a1a; padding: 20px; border-radius: 10px; height: 100vh; box-sizing: border-box; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;">${jsonString}</pre>`;
    console.log('[Debug] About to call displayJsonContent with htmlContent length:', htmlContent.length);
    console.log('[Debug] jsonData:', jsonData);
    console.log('[Debug] cleanJsonData:', cleanJsonData);
        displayJsonContent(htmlContent);
    console.log('[Debug] displayJsonContent called successfully');
    return true;
}

async function handleHashChange(articles) {
    console.log('[Debug] handleHashChange called');
    const existingDisplay = document.getElementById('fullscreen-display');
    if (existingDisplay) existingDisplay.remove();
    
    // First, check for ?json= endpoints
    console.log('[Debug] About to call handleJsonQueryParam');
    const jsonHandled = await handleJsonQueryParam(articles);
    console.log('[Debug] handleJsonQueryParam returned:', jsonHandled);
    if (jsonHandled) {
        console.log('[Debug] JSON endpoint handled, returning early');
        return;
    }
    
    // Handle hash-based navigation (non-JSON routes)
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    console.log(`[Debug] Raw hash: "${hash}"`);
    
    const [route, ...params] = hash.split('/');
    
    console.log(`[Debug] Hash changed. Route: ${route}, Params: ${params}`);

    switch (route) {
        case 'attestors': {
            console.log('[Debug] Attestors route hit.');
            console.log('[Debug] window.validAttestors:', window.validAttestors);
            displayHumanReadableAttestors(window.validAttestors);
            break;
        }
        case 'attestations': {
            const attestorIndex = parseInt(params[0], 10);
            if (!isNaN(attestorIndex) && attestorIndex > 0) {
                 if (window.validAttestors && window.validAttestors.length >= attestorIndex) {
                    const singleAttestor = [window.validAttestors[attestorIndex - 1]];
                    const attestations = await fetchAttestations(singleAttestor);
                    window.ID.showPrefaceView(attestations, false);
                } else {
                    displayGenericContent('<p style="color: red;">Invalid attestor index.</p>');
                }
            } else {
                // Use test articles when testing is true, otherwise fetch from attestors
                if (testing) {
                    console.log('[Debug] Using test articles for attestations view');
                    if (window.BRC333Attestations && typeof window.BRC333Attestations.getTestAttestations === 'function') {
                        const testAttestations = await window.BRC333Attestations.getTestAttestations();
                        console.log('[Debug] Test attestations:', testAttestations);
                        if (testAttestations && testAttestations.length > 0) {
                            // Add bridger number to titles for display
                            const articlesWithBridgerInfo = testAttestations.map(article => ({
                                ...article,
                                title: article.bridgerNo ? `${article.title} (${article.author || article.issuer || 'Unknown'}): Bridger ${article.bridgerNo}` : `${article.title} by ${article.author || article.issuer || 'Unknown'}`
                            }));
                            window.ID.showPrefaceView(articlesWithBridgerInfo, false);
                        } else {
                            displayGenericContent('<p style="color: red;">No test attestations found.</p>');
                        }
                    } else {
                        console.warn('[Debug] BRC333Attestations module not loaded yet');
                        displayGenericContent('<p style="color: red;">BRC333Attestations module not loaded yet.</p>');
                    }
                } else if (window.validAttestors && window.validAttestors.length > 0) {
                    const attestations = await fetchAttestations(window.validAttestors);
                    window.ID.showPrefaceView(attestations, false);
                } else {
                    displayGenericContent('<p style="color: red;">No valid attestors found.</p>');
                }
            }
            break;
        }
        case 'pfp': {
            const index = parseInt(params[0], 10);
            const imageElements = pfpElements.filter(el => el.tagName === 'IMG');
            let targetIndex = -1;

            if (!isNaN(index) && index > 0) {
                targetIndex = Math.min(index - 1, imageElements.length - 1);
            } else {
                targetIndex = imageElements.length - 1;
            }
            
            if (targetIndex !== -1) {
                const targetElement = imageElements[targetIndex];
                const globalIndex = pfpElements.indexOf(targetElement);
                if (globalIndex !== -1) {
                    window.ID.setView(globalIndex);
                }
            }
            break;
        }
        case 'cred': {
            await window.ID.switchToPrefaceView();
            const index = parseInt(params[0], 10);

            if (!isNaN(index) && index > 0) {
                if (window.BRC333Tags && typeof window.BRC333Tags.resetTagView === 'function') {
                    await window.BRC333Tags.resetTagView();
                }
                if (articles && articles.length >= index) {
                    const targetArticle = articles[index - 1];
                    if (targetArticle) {
                        await displayAttestation(targetArticle);
                    }
                } else {
                    console.warn("Articles not loaded or index out of bounds.");
                }
            } else { 
                if (window.BRC333Tags && typeof window.BRC333Tags.resetTagView === 'function') {
                    await window.BRC333Tags.resetTagView();
                } else {
                    // Use the attestations module instead of refreshArticleList
                    if (window.BRC333Attestations && typeof window.BRC333Attestations.displayAttestationLinks === 'function') {
                        // Find or create the attestations container
                        let attestationsContainer = document.querySelector('.attestations-section');
                        if (!attestationsContainer) {
                            attestationsContainer = document.createElement('div');
                            attestationsContainer.className = 'attestations-section';
                            
                            // Find the preface container and append the attestations section
                            const preface = document.getElementById('preface');
                            if (preface) {
                                preface.appendChild(attestationsContainer);
        } else {
                                console.error('[Debug] Could not find #preface container for attestations');
                                return;
                            }
                        }
                        
                        // Clear the container
                        attestationsContainer.innerHTML = '';
                        
                        // Call the attestations module's display function
                        const options = createFilterOptions();
                        
                        try {
                            await window.BRC333Attestations.displayAttestationLinks(recipientArticles, attestationsContainer, options);
                            console.log('[Debug] Attestation links displayed successfully in handleHashChange');
                        } catch (error) {
                            console.error('[Debug] Error displaying attestation links in handleHashChange:', error);
                            // Fallback display
                            attestationsContainer.innerHTML = '<p style="color: red;">Error displaying attestations. Please try again.</p>';
                        }
                    } else {
                        console.error("BRC333Attestations module not available in handleHashChange.");
                    }
                }
            }
            break;
        }
        case 'micro':
        case 'pearl': {
            const results = filterArticlesByType(articles, route);
            window.ID.showPrefaceView(results, true);
            break;
        }
    }
}

async function processAttestors(attestorsConfig) {
    console.log('[Debug] Starting processAttestors with config:', attestorsConfig);
    const attestorActions = {};

    if (!attestorsConfig || attestorsConfig.length === 0) {
        console.warn("Attestor configuration not found.");
        return [];
    }

    const attestorSatConfig = attestorsConfig[0];
    console.log('[Debug] Using attestor sat config:', attestorSatConfig);
    const inscriptionIds = await getInscriptionsForSat(attestorSatConfig.sat, false, attestorSatConfig.backup, attestorSatConfig.skip);
    console.log(`[Debug] Found ${inscriptionIds.length} inscription(s) on attestor sat.`, inscriptionIds);

    for (const id of inscriptionIds) {
        console.log(`[Debug] Processing attestor inscription id: ${id}`);
        const [content, metadata] = await Promise.all([
            getInscriptionContent(id, true),
            getMetadata(`https://ordinals.com/r/inscription/${id}`)
        ]);
        
        console.log(`[Debug] Content for ${id}:`, content);
        const actionsToProcess = Array.isArray(content) ? content : [content];

        for (const action of actionsToProcess) {
            if (action && action.p === 'BRC333' && action.op === 'attestor' && action.id) {
                console.log(`[Debug] Found valid attestor action:`, action);
                const actionDate = action.date ? new Date(action.date).getTime() : (metadata.timestamp * 1000);
                
                if (!attestorActions[action.id]) {
                    attestorActions[action.id] = [];
                }
                attestorActions[action.id].push({ ...action, timestamp: actionDate });
            } else {
                console.log(`[Debug] Skipping invalid or non-attestor action:`, action);
            }
        }
    }

    const validAttestors = [];
    console.log(`[Debug] Processing collected attestor actions:`, attestorActions);
    for (const attestorId in attestorActions) {
        // Sort actions by date to process them chronologically
        const actions = attestorActions[attestorId].sort((a, b) => a.timestamp - b.timestamp);
        
        let currentAttestor = null;

        for (const action of actions) {
            switch (action.action) {
                case 'add':
                    if (currentAttestor) { // If there's an active attestor, this 'add' ends the previous one.
                         currentAttestor.endDate = action.timestamp;
                         validAttestors.push(currentAttestor);
                    }
                    currentAttestor = {
                        id: attestorId,
                        name: action.name,
                        sat: action.sat,
                        startDate: action.timestamp,
                        endDate: Infinity, // Active until a delete or new add
                        allowedKinds: action.kind || null, // Store allowed kinds array, null means all kinds allowed
                    };
                    break;
                case 'edit':
                    if (currentAttestor) {
                        // Only update fields that are explicitly provided in the edit action
                        if (action.name) currentAttestor.name = action.name;
                        if (action.sat) currentAttestor.sat = action.sat;
                        if (action.kind !== undefined) currentAttestor.allowedKinds = action.kind || null;
                    }
                    break;
                case 'delete':
                    if (currentAttestor) {
                        currentAttestor.endDate = action.timestamp;
                        validAttestors.push(currentAttestor);
                        currentAttestor = null; // No longer active
                    }
                    break;
            }
        }
        
        if (currentAttestor) {
            validAttestors.push(currentAttestor);
        }
    }
    
    console.log('[Debug] Processed valid attestors:', validAttestors);
    return validAttestors;
}

async function fetchAttestations(validAttestors) {
    let allAttestations = [];

    for (const attestor of validAttestors) {
        console.log(`[Debug] Fetching attestations for ${attestor.name} from sat ${attestor.sat}`);
        
        const inscriptionIds = await getInscriptionsForSat(attestor.sat);

        for (const id of inscriptionIds) {
             const [content, metadata] = await Promise.all([
                getInscriptionContent(id, true),
                getMetadata(`https://ordinals.com/r/inscription/${id}`)
             ]);

             if (content && metadata) {
                const attestationDate = metadata.timestamp * 1000;
                
                // Check if the attestation falls within the attestor's valid period
                if (attestationDate >= attestor.startDate && attestationDate < attestor.endDate) {
                    const manifestsToProcess = Array.isArray(content) ? content : [content];

                    for (const manifest of manifestsToProcess) {
                        // Assuming attestation content is an array of articles/credentials
                        if (manifest && Array.isArray(manifest.articles)) {
                            for (const attestation of manifest.articles) {
                                // Check if attestor is allowed to attest to this kind
                                if (attestor.allowedKinds && Array.isArray(attestor.allowedKinds)) {
                                    if (attestation.kind && !attestor.allowedKinds.includes(attestation.kind)) {
                                        console.log(`[Debug] Skipping attestation ${attestation.id} with kind '${attestation.kind}' - not allowed by attestor ${attestor.name} (allowed: ${attestor.allowedKinds.join(', ')})`);
                                        continue; // Skip this attestation
                                    }
                                }
                                
                                const rawContent = await getInscriptionContent(attestation.id);
                                // Ensure content is parsed as Markdown
                                const processedContent = window.marked ? window.marked.parse(rawContent || '') : rawContent;
                                allAttestations.push({ 
                                    ...attestation, 
                                    html: processedContent,
                                    rawContent: rawContent || '', // Store raw content for reprocessing if needed
                                    author: attestor.name // Keep 'author' for compatibility with existing article logic
                                });
                            }
                        }
                    }
                }
             }
        }
    }
    
    console.log(`[Debug] Fetched a total of ${allAttestations.length} valid attestations.`);
    return allAttestations;
}

// 6. START EXECUTION
const scriptTag = document.querySelector('script[src*="o_1.js"]');  // CHANGE
if (scriptTag) {
    bridgerNo = scriptTag.getAttribute('bridgerNo');
    
    // Fallback: try to get bridgerNo from the current executing script
    if (!bridgerNo) {
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            if (script.src && script.src.includes('o_1.js')) {
                bridgerNo = script.getAttribute('bridgerNo');
                break;
            }
        }
    }
    
    if (bridgerNo) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Check if JSON endpoint was requested before initializing
                if (!window.jsonEndpointRequested) {
                initSatplication().then((fetchedArticles) => {
                        console.log('[Debug] initSatplication completed, fetchedArticles:', fetchedArticles);
                        // Check for JSON query parameters first
                        console.log('[Debug] Checking for JSON query parameters on initial load');
                        console.log('[Debug] Current URL:', window.location.href);
                        console.log('[Debug] Current search params:', window.location.search);
                        handleJsonQueryParam(fetchedArticles).then((jsonHandled) => {
                            console.log('[Debug] handleJsonQueryParam completed, jsonHandled:', jsonHandled);
                            if (jsonHandled) {
                                console.log('[Debug] JSON endpoint handled on initial load, skipping hash change');
                                return;
                            }
                            // Only set up hash change handling if no JSON endpoint was handled
                            console.log('[Debug] No JSON endpoint handled, setting up hash change handling');
                    const boundHashHandler = () => handleHashChange(fetchedArticles);
                    boundHashHandler(); // Handle initial hash
                    window.addEventListener('hashchange', boundHashHandler);
                        }).catch((error) => {
                            console.error('[Debug] Error in handleJsonQueryParam:', error);
                        });
                    }).catch((error) => {
                        console.error('[Debug] Error in initSatplication:', error);
                    });
                } else {
                    console.log('[Debug] JSON endpoint requested, skipping full initialization');
                }
                
                // Set up the MutationObserver to handle dynamic content
                const observer = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(node => {
                                if (node.nodeType === 1) { // Ensure it's an element
                                    //replaceAuthorWithIssuer(node);

                                    // Forcefully override the 'lfgButton' click behavior
                                    const backToIdButton = (node.id === 'lfgButton') ? node : node.querySelector('#lfgButton');
                                    if (backToIdButton && !backToIdButton.hasAttribute('data-override-applied')) {
                                        backToIdButton.addEventListener('click', (event) => {
                                            event.stopImmediatePropagation();
                                            window.ID.switchToIdCardView();
                                        }, true); // Use capture phase to run this first

                                        backToIdButton.onclick = null; // Nullify just in case
                                        backToIdButton.setAttribute('data-override-applied', 'true');
                                    }
                                }
                            });
                        }
                    }
                });

                observer.observe(document.body, { childList: true, subtree: true });
            });
        } else {
            // Check if JSON endpoint was requested before initializing
            if (!window.jsonEndpointRequested) {
            initSatplication().then((fetchedArticles) => {
                    console.log('[Debug] initSatplication completed, fetchedArticles:', fetchedArticles);
                    // Check for JSON query parameters first
                    console.log('[Debug] Checking for JSON query parameters on initial load');
                    console.log('[Debug] Current URL:', window.location.href);
                    console.log('[Debug] Current search params:', window.location.search);
                    handleJsonQueryParam(fetchedArticles).then((jsonHandled) => {
                        console.log('[Debug] handleJsonQueryParam completed, jsonHandled:', jsonHandled);
                        if (jsonHandled) {
                            console.log('[Debug] JSON endpoint handled on initial load, skipping hash change');
                            return;
                        }
                        // Only set up hash change handling if no JSON endpoint was handled
                        console.log('[Debug] No JSON endpoint handled, setting up hash change handling');
                const boundHashHandler = () => handleHashChange(fetchedArticles);
                boundHashHandler(); // Handle initial hash
                window.addEventListener('hashchange', boundHashHandler);
                    }).catch((error) => {
                        console.error('[Debug] Error in handleJsonQueryParam:', error);
                    });
                }).catch((error) => {
                    console.error('[Debug] Error in initSatplication:', error);
                });
            } else {
                console.log('[Debug] JSON endpoint requested, skipping full initialization');
            }
            
            // Also set up for non-loading state
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                replaceAuthorWithIssuer(node);

                                // Forcefully override the 'lfgButton' click behavior
                                const backToIdButton = (node.id === 'lfgButton') ? node : node.querySelector('#lfgButton');
                                if (backToIdButton && !backToIdButton.hasAttribute('data-override-applied')) {
                                    backToIdButton.addEventListener('click', (event) => {
                                        event.stopImmediatePropagation();
                                        window.ID.switchToIdCardView();
                                    }, true); // Use capture phase to run this first

                                    backToIdButton.onclick = null; // Nullify just in case
                                    backToIdButton.setAttribute('data-override-applied', 'true');
                                }
                            }
                        });
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            replaceAuthorWithIssuer(document.body);
        }
    } else {
        console.error("Overweb ID 'bridgerNo' attribute is missing from the script tag.");
    }
} else {
    console.error("Overweb ID script tag not found.");
}

function setupIdInfoModal() {
    // OVERRIDE the brc333id.js setupIdInfoModal by capturing the event first (capture mode)
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'i' || e.key === 'I')) {
            const idCardContainer = document.getElementById('overweb-id-card-container');
            const prefaceContainer = document.getElementById('preface-container');
            
            // Only handle the event if we're in ID card view (where we want metadata)
            // Let brc333id.js handle it if we're in preface view
            if (idCardContainer && idCardContainer.style.display !== 'none') {
                            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Try multiple ways to get metadata with extensive fallbacks
            let metadata;
            if (window.getInscriptionMetadata) {
                metadata = window.getInscriptionMetadata();
            } else {
                metadata = {
                    height: height || window.height || 'Loading...',
                    blockheight: blockheight || window.blockheight || 'Loading...',
                    timestamp: timestamp || window.timestamp || 'Loading...',
                    sat: sat || window.sat || 'Loading...',
                    number: number || window.number || 'Loading...',
                    inscriptionId: window.inscriptionId || inscriptionId || 'Loading...'
                };
            }
            
            // Force fresh values if they're still undefined
            if (metadata.height === undefined || metadata.height === 'N/A') {
                metadata.height = window.height || height || 'Loading...';
                metadata.blockheight = window.blockheight || blockheight || 'Loading...';
                metadata.timestamp = window.timestamp || timestamp || 'Loading...';
                metadata.sat = window.sat || sat || 'Loading...';
                metadata.number = window.number || number || 'Loading...';
                metadata.inscriptionId = window.inscriptionId || inscriptionId || 'Loading...';
            }
            
            // If everything is still undefined/loading, show a loading message
            const allLoading = Object.values(metadata).every(val => 
                val === undefined || val === 'N/A' || val === 'Loading...'
            );
            
            if (allLoading) {
                displayGenericContent('<div style="text-align: center; padding: 20px; color: #fff;">Loading inscription metadata...</div>');
                return;
            }
            
            // Format timestamp if it's a valid number
            const formattedTimestamp = formatTimestamp(metadata.timestamp, 'detailed');
            
            let content = '';
            
            // Add description if available
            if (window.description) {
                content += window.description;
                content += '<br><br>';
            }
            
            // Add metadata section
            content += '<div style="background: rgba(128, 128, 128, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0;">';
            content += '<h3 style="margin-top: 0; color: #fff; border-bottom: 1px solid #555; padding-bottom: 8px;">Inscription Metadata</h3>';
            content += `<div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-family: monospace;">`;
            content += `<span style="color: #aaa;">Height:</span><span style="color: #fff;">${metadata.height}</span>`;
            content += `<span style="color: #aaa;">Timestamp:</span><span style="color: #fff;">${formattedTimestamp}</span>`;
            content += `<span style="color: #aaa;">Sat:</span><span style="color: #fff;">${metadata.sat}</span>`;
            content += `<span style="color: #aaa;">Number:</span><span style="color: #fff;">${metadata.number}</span>`;
            if (metadata.inscriptionId && metadata.inscriptionId !== 'N/A') {
                content += `<span style="color: #aaa;">Inscription ID:</span><span style="color: #fff; word-break: break-all;">${metadata.inscriptionId}</span>`;
            }
            content += '</div>';
            content += '</div>';
            
            // Add instructions if available
            if (window.overwebIdInstructions) {
                content += '<br>' + window.overwebIdInstructions;
            }
            
                        displayGenericContent(content);
            } else {
                // Don't prevent default or stop propagation - let brc333id.js handle it
        }
        }
    }, true); // Use capture mode to run before brc333id.js handler
}

async function showFilteredPrefaceView(filterType) {
    await window.ID.switchToPrefaceView();

    if (window.articles) {
        let results;
        results = filterType ? filterArticlesByType(window.articles, filterType) : window.articles;
        
        window.filteredResults = results;
        currentPage = 1;

        // Use the attestations module instead of refreshArticleList
        if (window.BRC333Attestations && typeof window.BRC333Attestations.displayAttestationLinks === 'function') {
            // Find or create the attestations container
            let attestationsContainer = document.querySelector('.attestations-section');
            if (!attestationsContainer) {
                attestationsContainer = document.createElement('div');
                attestationsContainer.className = 'attestations-section';
                
                // Find the preface container and append the attestations section
                const preface = document.getElementById('preface');
                if (preface) {
                    preface.appendChild(attestationsContainer);
        } else {
                    console.error('[Debug] Could not find #preface container for attestations');
                    return;
                }
            }
            
            // Clear the container
            attestationsContainer.innerHTML = '';
            
            // Call the attestations module's display function
            const options = createFilterOptions({
                initialFilters: filterType ? { type: filterType } : {}
            });
            
            try {
                await window.BRC333Attestations.displayAttestationLinks(results, attestationsContainer, options);
                console.log('[Debug] Filtered attestation links displayed successfully');
            } catch (error) {
                console.error('[Debug] Error displaying filtered attestation links:', error);
                // Fallback display
                attestationsContainer.innerHTML = '<p style="color: red;">Error displaying attestations. Please try again.</p>';
            }
        } else {
            console.error("BRC333Attestations module not available.");
        }
    } else {
        console.warn('[Debug] Articles not available for filtering.');
    }
}

function showGenericModal(title, value) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('generic-modal-title');
    const modalTextarea = document.getElementById('generic-modal-textarea');

    if (modal && modalTitle && modalTextarea) {
        modalTitle.textContent = title;
        modalTextarea.value = value;
        toggleContainer(modal, true, { showDisplay: 'flex' });
        modalTextarea.select();
    }
}

function setupGenericModal() {
    const modal = document.getElementById('generic-modal');
    const closeModalBtn = document.getElementById('generic-modal-close');

    if (modal && closeModalBtn) {
        const closeModal = () => {
            toggleContainer(modal, false);
        };

        closeModalBtn.onclick = closeModal;
        modal.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
}

function displayJsonContent(htmlContent) {
    console.log('=== DISPLAY JSON CONTENT FUNCTION CALLED ===');
    console.log('[Debug] displayJsonContent ENTRY POINT - function called');
    try {
        console.log('[Debug] displayJsonContent called with htmlContent length:', htmlContent.length);
    const idCardContainer = document.getElementById('overweb-id-card-container');
    const prefaceContainer = document.getElementById('preface-container');
    const prefaceDiv = document.getElementById('preface');
    const contentDiv = document.getElementById('content');

        console.log('[Debug] Found elements:', {
            idCardContainer: !!idCardContainer,
            prefaceContainer: !!prefaceContainer,
            prefaceDiv: !!prefaceDiv,
            contentDiv: !!contentDiv
        });

        // Hide the ID card container
        if (idCardContainer) {
            console.log('[Debug] Hiding ID card container');
            toggleContainer(idCardContainer, false);
        }

        // Show the preface container and make it active
        if (prefaceContainer) {
            console.log('[Debug] Showing preface container');
            toggleContainer(prefaceContainer, true, { addClasses: ['active'] });
        }

        // Hide the preface div (which contains the search/filter controls)
        if (prefaceDiv) {
            console.log('[Debug] Hiding preface div');
            toggleContainer(prefaceDiv, false);
        }

        // Set the content in the content div
        if (contentDiv) {
            console.log('[Debug] Setting content div HTML');
            contentDiv.innerHTML = htmlContent;
            toggleContainer(contentDiv, true);
            console.log('[Debug] Content div HTML set successfully');
        } else {
            console.log('[Debug] ERROR: content div not found!');
        }
    } catch (error) {
        console.error('[Debug] Error in displayJsonContent:', error);
    }
}

function displayGenericContent(htmlContent) {
    window.ID.showPrefaceView(null, false);
    const contentDiv = document.getElementById('content');
    const prefaceDiv = document.getElementById('preface');
    if (prefaceDiv) {
        toggleContainer(prefaceDiv, false); // Hide search/filter controls
    }
    if (contentDiv) {
        contentDiv.innerHTML = htmlContent;
    }
}

function displayHumanReadableAttestors(attestors) {
    let html = '<div class="human-readable-container"><h1 class="title">Valid Attestors</h1>';
    if (!attestors || attestors.length === 0) {
        html += '<p>No valid attestors found.</p>';
    } else {
        html += '<ul class="attestor-list">';
        for (const attestor of attestors) {
            html += `
                <li>
                    <div class="attestor-name">${attestor.name}</div>
                    ${createAttestorMetadataHTML(attestor)}
                </li>
            `;
        }
        html += '</ul>';
    }
    html += '</div>';
    
    displayGenericContent(html);
}

// Add this at the end of the file or after DOMContentLoaded

document.addEventListener('click', function(e) {
    // Only trigger if the click is on the background (body), not a child element
    if (e.target === document.body || e.target.id === 'preface-container' || e.target.id === 'overweb-id-card-container') {
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        document.body.style.backgroundColor = randomColor;
        // Also update preface-container and overweb-id-card-container if visible
        const prefaceContainer = document.getElementById('preface-container');
        if (prefaceContainer) prefaceContainer.style.backgroundColor = randomColor;
        const idCardContainer = document.getElementById('overweb-id-card-container');
        if (idCardContainer) idCardContainer.style.backgroundColor = randomColor;
    }
});

// Update the PFP loading function to apply background colors
async function loadPFPImages() {
    try {
        // ... existing PFP loading code ...
        
        // After PFPs are loaded, apply background colors
        if (pfpBackgroundColors['all']) {
            const pfpElements = document.querySelectorAll('.pfp-image');
            pfpElements.forEach(pfp => {
                pfp.style.backgroundColor = pfpBackgroundColors['all'];
            });
        }
        
        // Apply specific PFP background colors
        Object.keys(pfpBackgroundColors).forEach(index => {
            if (index !== 'all') {
                const pfpIndex = parseInt(index);
                const pfpElements = document.querySelectorAll('.pfp-image');
                if (pfpElements[pfpIndex]) {
                    pfpElements[pfpIndex].style.backgroundColor = pfpBackgroundColors[index];
                }
            }
        });
    } catch (error) {
        console.error('Error loading PFP images:', error);
    }
}

// Color input modal functions (fallback if Colors module not loaded)
// NOTE: These functions are now handled by brc333id-colors.js
// Commenting out to avoid duplication since the Colors module is loaded
/*
function showColorInputModal() {
    const modal = document.createElement('div');
    modal.id = 'colorInputModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    content.innerHTML = `
        <h3>Set Background Color</h3>
        <p>Enter # + 6-digit hex color:</p>
        <input type="text" id="colorInput" placeholder="e.g., #ff0000" 
               style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px;">
        <div style="margin: 20px 0;">
            <button onclick="setColorFromInput()" style="margin: 0 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Set Color</button>
            <button onclick="closeColorModal()" style="margin: 0 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('colorInput').focus();
    }, 100);
    
    // Close on escape
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeColorModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeColorModal() {
    const modal = document.getElementById('colorInputModal');
    if (modal) {
        modal.remove();
    }
}

function setColorFromInput() {
    const input = document.getElementById('colorInput');
    const value = input.value.trim();
    
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        document.body.style.backgroundColor = value;
        currentBackgroundColor = value;
        console.log('Background color set to:', value);
        closeColorModal();
    } else {
        alert('Invalid hex color format. Use 6 digits (e.g., #ff0000)');
    }
}
*/

// Meta-Communities Modal Functions
function setupMetaCommunitiesModal() {
    const modal = document.getElementById('meta-communities-modal');
    const closeBtn = document.getElementById('meta-communities-close');
    const closeBtnBottom = document.getElementById('meta-communities-close-btn');
    const searchInput = document.getElementById('meta-communities-search');

    if (!modal) {
        console.warn('Meta-communities modal not found in DOM');
        return;
    }

    // Close modal functions
    const closeModal = () => {
        toggleContainer(modal, false);
        if (searchInput) searchInput.value = '';
    };

    // Close button event listeners
    if (closeBtn) closeBtn.onclick = closeModal;
    if (closeBtnBottom) closeBtnBottom.onclick = closeModal;
    
    // Close on background click
    modal.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const communityCards = modal.querySelectorAll('.meta-community-card');
            
            communityCards.forEach(card => {
                const name = card.querySelector('.meta-community-name')?.textContent?.toLowerCase() || '';
                const desc = card.querySelector('.meta-community-desc')?.textContent?.toLowerCase() || '';
                const tags = Array.from(card.querySelectorAll('.meta-community-tag'))
                    .map(tag => tag.textContent.toLowerCase())
                    .join(' ');
                
                const matches = name.includes(searchTerm) || 
                              desc.includes(searchTerm) || 
                              tags.includes(searchTerm);
                
                card.style.display = matches ? 'flex' : 'none';
            });
        });
    }
}

/**
 * Fetches and displays meta-communities in the modal
 * @param {string} inscriptionId - The inscription ID to filter communities for
 */
async function showMetaCommunitiesModal(inscriptionId) {
    const modal = document.getElementById('meta-communities-modal');
    const listContainer = document.getElementById('meta-communities-list');
    const titleElement = document.getElementById('meta-communities-title');
    
    if (!modal || !listContainer) {
        console.error('Meta-communities modal elements not found');
        return;
    }

    try {
        // Show loading state
        listContainer.innerHTML = '<div style="text-align: center; color: #aaa;">Loading communities...</div>';
        toggleContainer(modal, true, { showDisplay: 'flex' });

        // Filter attestations for community type
        const communityAttestations = window.articles?.filter(attestation => 
            attestation.kind === 'community' && 
            attestation.op === 'attest' &&
            attestation.recipient === inscriptionId
        ) || [];

        console.log(`[Meta-Communities] Found ${communityAttestations.length} community attestations`);
        console.log(`[Meta-Communities] All available articles:`, window.articles?.length || 0);
        console.log(`[Meta-Communities] Articles with 'community' kind:`, window.articles?.filter(a => a.kind === 'community')?.length || 0);
        console.log(`[Meta-Communities] Articles with recipient ${inscriptionId}:`, window.articles?.filter(a => a.recipient === inscriptionId)?.length || 0);
        console.log(`[Meta-Communities] Sample attestation data:`, window.articles?.[0]);

        if (communityAttestations.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: #aaa;">No communities found</div>';
            if (titleElement) titleElement.textContent = '\u2B50 Meta-Communities (0)';
            return;
        }

        // Update title with count
        if (titleElement) {
            titleElement.textContent = `\u2B50 Meta-Communities (${communityAttestations.length})`;
        }

        // Fetch community data for each attestation
        const communityPromises = communityAttestations.map(async (attestation) => {
            try {
                if (!attestation.id) {
                    console.warn('[Meta-Communities] Attestation missing community ID:', attestation);
                    return null;
                }

                // Fetch the community JSON data
                const communityData = await getInscriptionContent(attestation.id, true);
                console.log(`[Meta-Communities] Raw community data for ${attestation.id}:`, communityData);
                
                if (!communityData || typeof communityData !== 'object') {
                    console.warn('[Meta-Communities] Invalid community data for ID:', attestation.id);
                    // Try to parse as string if it's not already an object
                    if (typeof communityData === 'string') {
                        try {
                            const parsed = JSON.parse(communityData);
                            console.log(`[Meta-Communities] Successfully parsed string data for ${attestation.id}:`, parsed);
                            return {
                                ...parsed,
                                attestationId: attestation.id,
                                attestationDate: attestation.date || attestation.timestamp
                            };
                        } catch (parseError) {
                            console.warn('[Meta-Communities] Could not parse community data as JSON:', parseError);
                        }
                    }
                    return null;
                }

                return {
                    ...communityData,
                    attestationId: attestation.id,
                    attestationDate: attestation.date || attestation.timestamp
                };
            } catch (error) {
                console.error('[Meta-Communities] Error fetching community data for ID:', attestation.id, error);
                return null;
            }
        });

        const communities = (await Promise.all(communityPromises)).filter(Boolean);

        // Render community cards
        if (communities.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: #aaa;">No valid community data found</div>';
            return;
        }

        const communityCardsHTML = communities.map(community => {
            const imageUrl = community.image ? `${baseUrl}/content/${community.image}` : '';
            const tags = community.tags || [];
            
            return `
                <div class="meta-community-card">
                    <img src="${imageUrl}" alt="${community.name || 'Community'}" 
                         onerror="this.style.display='none'">
                    <div class="meta-community-info">
                        <div class="meta-community-name">${community.name || 'Unnamed Community'}</div>
                        <div class="meta-community-desc">${community.description || 'No description available'}</div>
                        ${tags.length > 0 ? `
                            <div class="meta-community-tags">
                                ${tags.map(tag => `<span class="meta-community-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = communityCardsHTML;

    } catch (error) {
        console.error('[Meta-Communities] Error loading communities:', error);
        listContainer.innerHTML = '<div style="text-align: center; color: #ff4040;">Error loading communities</div>';
    }
}

/**
 * Adds meta-communities link to the ID card if communities exist
 * @param {string} inscriptionId - The inscription ID to check for communities
 */
async function addMetaCommunitiesLink(inscriptionId) {
    // Check if communities exist for this inscription
    const communityAttestations = window.articles?.filter(attestation => 
        attestation.kind === 'community' && 
        attestation.op === 'attest' &&
        attestation.recipient === inscriptionId
    ) || [];

    if (communityAttestations.length === 0) {
        console.log('[Meta-Communities] No communities found, skipping link addition');
        return;
    }

    console.log(`[Meta-Communities] Found ${communityAttestations.length} communities, adding link`);

    // Find the card details container
    const cardDetails = document.querySelector('.card-details');
    if (!cardDetails) {
        console.warn('[Meta-Communities] Card details container not found');
        return;
    }

    // Check if the link already exists
    const existingLink = document.getElementById('meta-communities-link');
    if (existingLink) {
        existingLink.remove();
    }

    // Create the meta-communities link
    const linkRow = createStyledElement('div', {
        cursor: 'pointer',
        fontSize: '1.6vmin' // Same font size as other detail rows
    }, {
        className: 'detail-row',
        id: 'meta-communities-link',
        innerHTML: `
            <span class="detail-label">Meta-Communities</span>
            <span class="detail-value">${communityAttestations.length}</span>
        `
    });

    // Add hover effect
    linkRow.addEventListener('mouseenter', () => {
        applyStyles(linkRow.querySelector('.detail-label'), { color: '#00BFFF' });
        applyStyles(linkRow.querySelector('.detail-value'), { color: '#00BFFF' });
    });

    linkRow.addEventListener('mouseleave', () => {
        applyStyles(linkRow.querySelector('.detail-label'), { color: '#aaa' });
        applyStyles(linkRow.querySelector('.detail-value'), { color: '#fff' });
    });

    // Add click handler
    linkRow.addEventListener('click', () => {
        showMetaCommunitiesModal(inscriptionId);
    });

    // Insert after the microcreds row
    const microcredsRow = document.getElementById('microcreds-row');
    if (microcredsRow) {
        microcredsRow.parentNode.insertBefore(linkRow, microcredsRow.nextSibling);
    } else {
        // Fallback: append to the end
        cardDetails.appendChild(linkRow);
    }
}

// Helper to get JSON data for a given endpoint
function getJsonForEndpoint(jsonType, articles) {
    switch (jsonType) {
        case 'attestors': {
            return window.validAttestors || [];
        }
        case 'attestations': {
            // Support ?json=attestations&attestor=1
            const params = new URLSearchParams(window.location.search);
            const attestorIndex = parseInt(params.get('attestor'), 10);
            if (!isNaN(attestorIndex) && attestorIndex > 0) {
                if (window.validAttestors && window.validAttestors.length >= attestorIndex) {
                    // This is async in handleJsonQueryParam, but for early check, just return the attestor object
                    return [window.validAttestors[attestorIndex - 1]];
                } else {
                    return { error: "Invalid attestor index." };
                }
            } else {
                // For attestations endpoint, return the articles that were passed in
                if (articles && articles.length > 0) {
                    return articles;
                } else if (window.validAttestors && window.validAttestors.length > 0) {
                    return window.validAttestors;
                } else {
                    return { error: "No valid attestations found." };
                }
            }
        }
        case 'pfp': {
            const pfpElements = window.pfpElements || [];
            if (pfpElements.length > 0) {
                return pfpElements.map(el => ({ tagName: el.tagName, src: el.src, id: el.id }));
            } else {
                // PFP elements not loaded yet - this should only happen in early check, which we now skip
                return { error: "PFP elements not available. Please ensure full initialization has completed." };
            }
        }
        case 'cred':
        case 'micro':
        case 'pearl':
        case 'badges': {
            if (articles) {
                return filterArticlesByType(articles, jsonType);
            } else {
                return { error: "Articles not available." };
            }
        }
        default:
            return { error: "Invalid JSON endpoint." };
    }
}

// EARLY JSON ENDPOINT CHECK - must run before any UI or satplication logic
(async function earlyJsonCheck() {
    const params = new URLSearchParams(window.location.search);
    const jsonType = params.get('json');
    if (jsonType) {
        console.log('[Debug] Early JSON check: Found json parameter:', jsonType);
        
        // Skip PFP endpoints - they require full initialization for complete data
        if (jsonType === 'pfp') {
            console.log('[Debug] Early JSON check: PFP endpoint requires full initialization, skipping early check');
            return; // Let it go through full initialization
        }
        
        // Set flag to prevent UI rendering but allow data fetching
        window.jsonEndpointRequested = true;
        
        // Wait for DOM to be ready before accessing document.body
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // Remove all existing DOM content
        document.body.innerHTML = '';
        document.body.style.background = '#fff';
        
        // We need to fetch the data ourselves since we're preventing initSatplication
        console.log('[Debug] Early JSON check: Fetching data for JSON endpoint...');
        
        try {
            // Import the fetchInscriptions function if it's not available
            if (typeof fetchInscriptions !== 'function') {
                console.log('[Debug] Early JSON check: fetchInscriptions not available, waiting...');
                // Wait a bit for scripts to load
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Fetch the data we need
            const result = await fetchInscriptions(satplication, oracleStrings);
            window.attestorsConfig = result.attestors;
            
            // Process attestors
            if (typeof processAttestors === 'function') {
                window.validAttestors = await processAttestors(window.attestorsConfig);
            } else {
                console.log('[Debug] Early JSON check: processAttestors not available, waiting...');
                // Wait for the function to be available
                let attempts = 0;
                while (typeof processAttestors !== 'function' && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                if (typeof processAttestors === 'function') {
                    window.validAttestors = await processAttestors(window.attestorsConfig);
                }
            }
            
            // For endpoints that need articles/attestations data, fetch that too
            let articles = [];
            if (['attestations', 'cred', 'micro', 'pearl', 'badges'].includes(jsonType)) {
                console.log('[Debug] Early JSON check: Fetching articles for', jsonType, 'endpoint...');
                
                // Get inscription ID for recipient filtering
                let inscriptionId = null;
                if (typeof window.getInscriptionId === 'function') {
                    inscriptionId = await window.getInscriptionId(window.location.href, "f653724f3f7bccf7f0b96f46e17d7e3917d8452bad15b05013f9bb59c55ac549i0");
                    console.log('[Debug] Early JSON check: Got inscription ID for filtering:', inscriptionId);
                }
                
                // Try test attestations first if available
                if (typeof window.BRC333Attestations?.getTestAttestations === 'function') {
                    console.log('[Debug] Early JSON check: Using test attestations...');
                    articles = await window.BRC333Attestations.getTestAttestations();
                    
                    // Check if &all=true parameter is present to skip recipient filtering
                    const showAll = params.get('all') === 'true';
                    
                    // Filter by recipient if we have an inscription ID (unless &all=true)
                    if (showAll) {
                        console.log(`[Debug] Early JSON check: Showing all articles (${articles.length} total) due to &all=true parameter`);
                    } else if (inscriptionId && articles && articles.length > 0) {
                        const originalCount = articles.length;
                        articles = articles.filter(article => article.recipient === inscriptionId);
                        console.log(`[Debug] Early JSON check: Filtered by recipient ${inscriptionId}: ${articles.length} out of ${originalCount} articles`);
                    } else {
                        console.log('[Debug] Early JSON check: No recipient filtering applied (no inscription ID or no articles)');
                    }
                } else if (typeof fetchAttestations === 'function') {
                    console.log('[Debug] Early JSON check: Using real attestations...');
                    articles = await fetchAttestations(window.validAttestors);
                } else {
                    console.log('[Debug] Early JSON check: No attestations fetching function available');
                }
            }
            
            // For PFP endpoint, we need to load PFP data
            if (jsonType === 'pfp') {
                console.log('[Debug] Early JSON check: Loading PFP data for pfp endpoint...');
                // Try to load PFP data if the function is available
                if (typeof window.ID?.loadPFPImages === 'function') {
                    await window.ID.loadPFPImages();
                } else if (typeof loadPFPImages === 'function') {
                    await loadPFPImages();
                } else {
                    console.log('[Debug] Early JSON check: No PFP loading function available');
                }
            }
            
            // Get the JSON data
            const jsonData = getJsonForEndpoint(jsonType, articles);
            
            if (jsonData && (jsonData.length > 0 || (typeof jsonData === 'object' && !jsonData.error))) {
                console.log('[Debug] Early JSON check: Got JSON data:', jsonData);
                
                // Clean JSON data for display (remove large HTML fields)
                const cleanJsonData = JSON.parse(JSON.stringify(jsonData, (key, value) => {
                    if (key === 'html' && typeof value === 'string') {
                        return '[HTML content removed for display]';
                    }
                    return value;
                }));
                
                // Create and append the JSON display element
                const jsonDisplay = createJsonDisplay(cleanJsonData);
                document.body.appendChild(jsonDisplay);
                console.log('[Debug] Early JSON check: JSON displayed, stopping execution');
                return; // Exit early, don't continue with full initialization
            }
            
        } catch (error) {
            console.error('[Debug] Early JSON check: Error fetching data:', error);
        }
        
        // If we get here, we couldn't get the data
        console.log('[Debug] Early JSON check: Could not get data, showing empty result');
        const emptyJsonDisplay = createJsonDisplay([]);
        document.body.appendChild(emptyJsonDisplay);
        return; // Exit early
    }
})();

function hideLoadingGif() {
    console.log('[Debug] hideLoadingGif called');
    
    // Remove the regular loading gif
    const loadingGifEl = document.getElementById('loading-gif');
    if (loadingGifEl) {
        loadingGifEl.remove();
        console.log('[Debug] Regular loading gif removed');
    }
    
    // Remove the image panel specific loading elements
    const imagePanelLoadingGif = document.getElementById('image-panel-loading-gif');
    if (imagePanelLoadingGif) {
        imagePanelLoadingGif.remove();
        console.log('[Debug] Image panel loading gif removed');
    }
    
    const imagePanelLoadingOverlay = document.getElementById('image-panel-loading-overlay');
    if (imagePanelLoadingOverlay) {
        imagePanelLoadingOverlay.remove();
        console.log('[Debug] Image panel loading overlay removed');
    }
    
    // Remove loading gif styles
    const loadingGifStyles = document.getElementById('loading-gif-styles');
    if (loadingGifStyles) {
        loadingGifStyles.remove();
    }
}

// 3.75 REPEATED LOGIC EXTRACTION UTILITIES - Consolidated patterns to reduce duplication

/**
 * Creates standardized filter options object used across multiple functions
 * @param {Object} customOptions - Custom options to merge with defaults
 * @returns {Object} Standardized filter options
 */
function createFilterOptions(customOptions = {}) {
    return {
        itemsPerPage: window.ITEMS_PER_PAGE || 10,
        excludeFields: window.excludeFields || [],
        allowedKinds: window.allowedKinds || [],
        searchPlaceholder: window.searchPlaceholder || 'Search...',
        ...customOptions
    };
}

/**
 * Applies field filtering logic consistently across functions
 * @param {Array} items - Array of items to filter
 * @param {Object} options - Filter options object
 * @returns {Array} Filtered items
 */
function applyFieldFiltering(items, options = {}) {
    const { allowedKinds = [] } = options;
    
    if (!Array.isArray(items)) return [];
    
    let filtered = items;
    
    // Apply kind filtering if specified
    if (Array.isArray(allowedKinds) && allowedKinds.length > 0) {
        filtered = filtered.filter(item => 
            item.kind && allowedKinds.includes(item.kind)
        );
    }
    
    return filtered;
}

/**
 * Creates clickable link HTML for attestation metadata fields
 * @param {string} field - The field type (issuer, kind, type, tags)
 * @param {string|Array} value - The value to make clickable
 * @returns {string} HTML string for clickable link(s)
 */
function createClickableLink(field, value) {
    if (!value) return '';
    
    const escapeValue = (val) => val.replace(/'/g, "\\'");
    const removeModal = "document.getElementById('attestation-modal')?.remove();";
    
    switch (field.toLowerCase()) {
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
            const truncatedId = value.length > 20 ? value.substring(0, 20) + '...' : value;
            return `<a href="https://ordinals.com/inscription/${value}" target="_blank" style="color: #00BFFF; text-decoration: underline;">${truncatedId}</a>`;
            
        default:
            return value;
    }
}

/**
 * Detects content type consistently across functions
 * @param {Object} options - Options object containing content info
 * @param {string} options.contentType - MIME type from metadata
 * @param {string} options.rawContent - Raw content string
 * @param {HTMLElement} options.element - DOM element (for tagName)
 * @returns {Object} Content type information
 */
function detectContentType(options = {}) {
    const { contentType = '', rawContent = '', element = null } = options;
    
    // Check element tagName first
    if (element && element.tagName) {
        if (element.tagName === 'IMG') {
            return { type: 'image', category: 'media' };
        }
        if (element.tagName === 'DIV' && element.classList.contains('html-inscription-container')) {
            return { type: 'html', category: 'document' };
        }
    }
    
    // Check MIME type
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
    
    // Check raw content patterns
    if (rawContent) {
        const trimmed = rawContent.trim();
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
            return { type: 'html', category: 'document' };
        }
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return { type: 'json', category: 'data' };
        }
        if (trimmed.startsWith('@') || trimmed.endsWith('.meta') || trimmed.endsWith('.sats')) {
            return { type: 'identifier', category: 'reference' };
        }
    }
    
    return { type: 'unknown', category: 'unknown' };
}

/**
 * Formats timestamps consistently across functions
 * @param {number|string} input - Timestamp input
 * @param {string} format - Format type ('utc', 'iso', 'local', 'detailed')
 * @returns {string} Formatted date string
 */
function formatTimestamp(input, format = 'detailed') {
    if (!input) return 'N/A';
    
    let timestamp;
    
    // Handle different input types
    if (typeof input === 'number') {
        // If it's already in milliseconds, use as-is; otherwise multiply by 1000
        timestamp = input > 10000000000 ? input : input * 1000;
    } else if (typeof input === 'string') {
        const parsed = parseInt(input);
        if (!isNaN(parsed)) {
            timestamp = parsed > 10000000000 ? parsed : parsed * 1000;
        } else {
            // Try parsing as date string
            const date = new Date(input);
            if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
            } else {
                return 'Invalid Date';
            }
        }
    } else {
        return 'Invalid Input';
    }
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    switch (format) {
        case 'utc':
            return date.toUTCString();
            
        case 'iso':
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
            
        case 'local':
            return date.toLocaleString();
            
        case 'detailed':
            return `${date.toUTCString()} (${date.toISOString().split('T')[0]})`;
            
        case 'short':
            return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
            
        default:
            return date.toString();
    }
}

/**
 * Filters articles by type with consistent logic
 * @param {Array} articles - Array of articles to filter
 * @param {string} filterType - Type to filter by (pearl, micro, badge, etc.)
 * @returns {Array} Filtered articles
 */
function filterArticlesByType(articles, filterType) {
    if (!Array.isArray(articles) || !filterType) return articles || [];
    
    const type = filterType.toLowerCase();
    
    return articles.filter(article => {
        switch (type) {
            case 'pearl':
                return article.type === 'PEARL' || 
                       article.type === 'pearl' || 
                       article.kind === 'pearl';
                       
            case 'micro':
                return article.type === 'Micro' || 
                       article.type === 'micro' || 
                       article.kind === 'micro';
                       
            case 'badge':
            case 'badges':
                return article.type === 'badge' || 
                       article.type === 'pearl';
                       
            case 'credential':
            case 'credentials':
                return article.kind === 'credential';
                
            case 'community':
                return article.kind === 'community';
                
            default:
                return article.type === filterType || article.kind === filterType;
        }
    });
}

/**
 * Creates consistent attestor metadata display
 * @param {Object} attestor - Attestor object
 * @returns {string} HTML for attestor details
 */
function createAttestorMetadataHTML(attestor) {
    return `
        <div class="attestor-detail"><b>ID:</b> <span>${attestor.id}</span></div>
        <div class="attestor-detail"><b>Issuing Sat:</b> <span>${attestor.sat}</span></div>
        <div class="attestor-detail"><b>Active From:</b> <span>${formatTimestamp(attestor.startDate, 'utc')}</span></div>
        <div class="attestor-detail"><b>Active Until:</b> <span>${attestor.endDate === Infinity ? 'Present' : formatTimestamp(attestor.endDate, 'utc')}</span></div>
        <div class="attestor-detail"><b>Allowed Kinds:</b> <span>${attestor.allowedKinds ? attestor.allowedKinds.join(', ') : 'All kinds allowed'}</span></div>
    `;
}

// Expose utilities globally for use in other modules
window.BRC333Utils = {
    createFilterOptions,
    applyFieldFiltering, 
    createClickableLink,
    detectContentType,
    formatTimestamp,
    filterArticlesByType,
    createAttestorMetadataHTML
};
