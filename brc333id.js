/**
 * BRC333 ID Core Business Logic Module
 * 
 * This module contains the core business logic functions for the Overweb ID card system.
 * It handles card data population, credential management, view switching, attestation processing,
 * and user interactions. This module is loaded by the orchestration script (o_1.js) which
 * provides the helper functions and initialization logic.
 * 
 * Key Features:
 * - Card data population and UI updates
 * - Credential counting and display
 * - View switching between ID card and preface views
 * - Attestation and attestor processing
 * - Hash-based navigation and routing
 * - PFP (Profile Picture) management
 * - Modal dialogs and user interactions
 * 
 * Dependencies:
 * - Requires o_1.js orchestration script for helper functions
 * - Requires brc333id-layout.js for HTML/CSS templates
 * - Requires brc333id-colors.js for color management
 * 
 * Deployed at: https://natowls.xyz/brc333id.js
 */

/**
 * Generates a CSS gradient from a hexadecimal ID string.
 * @param {string} id - The inscription ID.
 * @returns {string} The CSS linear-gradient string.
 */
function generateGradientFromId(id) {
    console.log('[Debug] generateGradientFromId called with ID:', id);
    
    if (!id || id.length < 14) {
        console.log('[Debug] Invalid ID or too short, using fallback gradient');
        // Fallback gradient if ID is invalid
        return 'linear-gradient(135deg, #ff0000, #0000ff)';
    }
    // Remove the 'i0' suffix if it exists
    const hexId = id.includes('i') ? id.split('i')[0] : id;
    console.log('[Debug] Hex ID (without suffix):', hexId);

    const color1 = `#${hexId.substring(0, 6)}`;
    const color2 = `#${hexId.substring(6, 12)}`;
    
    // Use next two characters for the angle
    const angleHex = hexId.substring(12, 14);
    const angle = Math.round((parseInt(angleHex, 16) / 255) * 360);

    console.log('[Debug] Generated gradient:');
    console.log('[Debug] - Color 1:', color1);
    console.log('[Debug] - Color 2:', color2);
    console.log('[Debug] - Angle hex:', angleHex);
    console.log('[Debug] - Angle degrees:', angle);
    
    const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    console.log('[Debug] - Final gradient:', gradient);

    return gradient;
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

function populateCardData(data) {
    console.log('[Debug] populateCardData received data:', JSON.parse(JSON.stringify(data)));
    const { bridgerName, date, block, level, satoshi, inscriptionId } = data;
    const { snsName, handleName } = bridgerName || { snsName: null, handleName: null };
    console.log(`[Debug] Destructured names -> snsName: ${snsName}, handleName: ${handleName}`);

    const titleEl = document.getElementById('card-title-text');
    const subtitleEl = document.getElementById('card-subtitle-text');

    // Update labels from config
    if (window.idName && titleEl) {
        titleEl.textContent = window.idName;
        window.Layout.fitText(titleEl, 2.2, 0.8); // Allow font to shrink much more
        
        // Load and apply the Zeniq font to the ID name after text fitting
        if (window.idNameFont && window.loadAndApplyFont) {
            console.log('[Debug] Loading Zeniq font for ID name in brc333id.js:', window.idNameFont);
            // Use setTimeout to ensure text fitting is complete before applying font
            setTimeout(() => {
                window.loadAndApplyFont(window.idNameFont, 'card-title-text');
            }, 100);
        }
    }
    if (window.idDescription && subtitleEl) {
        subtitleEl.textContent = window.idDescription;
        window.Layout.fitText(subtitleEl, 0.9, 0.6); // Allow font to shrink more
    }

    if (window.participantNum) document.getElementById('bridger-no-label-text').textContent = window.participantNum;

    const maxNameLength = 17;

    // --- Populate SNS Name ---
    const snsRowEl = document.getElementById('sns-row');
    const snsNameEl = document.getElementById('sns-name');
    console.log(`[Debug] Found sns-row: ${!!snsRowEl}, sns-name: ${!!snsNameEl}`);
    if (snsRowEl) {
        if (snsName && snsName !== 'N/A' && snsName !== 'Unknown') {
            console.log('[Debug] Displaying SNS row.');
            snsRowEl.style.display = 'flex';
            if (snsNameEl) {
                if (snsName.length > maxNameLength) {
                    snsNameEl.textContent = snsName.substring(0, maxNameLength) + '...';
                } else {
                    snsNameEl.textContent = snsName;
                }
                snsRowEl.onclick = () => showGenericModal('SNS Name', snsName);
            }
        } else {
            console.log('[Debug] Hiding SNS row.');
            snsRowEl.style.display = 'none';
        }
    }

    // --- Populate Handle Name ---
    const handleRowEl = document.getElementById('handle-row');
    const handleNameEl = document.getElementById('handle-name');
    console.log(`[Debug] Found handle-row: ${!!handleRowEl}, handle-name: ${!!handleNameEl}`);
    if (handleRowEl) {
        if (handleName && handleName !== 'N/A' && handleName !== 'Unknown') {
            console.log('[Debug] Displaying Handle row.');
            handleRowEl.style.display = 'flex';
            if (handleNameEl) {
                if (handleName.length > maxNameLength) {
                    handleNameEl.textContent = handleName.substring(0, maxNameLength) + '...';
                } else {
                    handleNameEl.textContent = handleName;
                }
                handleRowEl.onclick = () => showGenericModal('Handle', handleName);
            }
        } else {
            console.log('[Debug] Hiding Handle row.');
            handleRowEl.style.display = 'none';
        }
    }

    // --- Populate Headline ---
    const populateHeadline = () => {
        const headlineContainer = document.getElementById('headline-container');
        if (!headlineContainer) {
            console.log('[Debug] Headline container not ready.');
            return false;
        }
        
        const headlineTextEl = document.getElementById('headline-text');
        if (headlineTextEl) {
            const headlineHTML = data.headline || null;

            // Clear existing content
            headlineTextEl.innerHTML = '';

            if (headlineHTML) {
                // Manually build the DOM nodes to bypass sanitization
                const regex = /(<i>.*?<\/i>|<strong>.*?<\/strong>|[^<>]+)/g;
                const parts = headlineHTML.match(regex);

                if (parts) {
                    parts.forEach(part => {
                        if (part.startsWith('<i>')) {
                            const node = document.createElement('i');
                            node.textContent = part.replace(/<\/?i>/g, '');
                            headlineTextEl.appendChild(node);
                        } else if (part.startsWith('<strong>')) {
                            const node = document.createElement('strong');
                            node.textContent = part.replace(/<\/?strong>/g, '');
                            headlineTextEl.appendChild(node);
                        } else {
                            const node = document.createTextNode(part);
                            headlineTextEl.appendChild(node);
                        }
                    });
                }
                
                headlineTextEl.title = headlineHTML.replace(/<[^>]*>?/gm, ''); // Keep clean tooltip
                console.log('[Debug] Headline text successfully set using manual DOM creation.');
            }
            return true;
        }
        return false;
    };

    // Try to populate the headline. If it fails, try again after a short delay.
    if (!populateHeadline()) {
        setTimeout(populateHeadline, 500);
    }

    // --- Setup Scroll Fade Effect ---
    const scrollableContent = document.getElementById('card-scrollable-content');
    if (scrollableContent) {
        const handleScroll = () => {
            const isAtBottom = scrollableContent.scrollHeight - scrollableContent.scrollTop <= scrollableContent.clientHeight + 1;
            if (isAtBottom) {
                scrollableContent.classList.add('scrolled-to-bottom');
            } else {
                scrollableContent.classList.remove('scrolled-to-bottom');
            }
        };
        scrollableContent.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
    }

    const inscriptionIdField = document.getElementById('inscription-id');
    const inscriptionIdRow = document.getElementById('inscription-id-row');
    if (inscriptionIdRow) {
        if (inscriptionId) {
            if (inscriptionIdField) inscriptionIdField.textContent = `${inscriptionId.slice(0, 10)}...${inscriptionId.slice(-5)}`;
            inscriptionIdRow.onclick = () => showGenericModal('Inscription ID', inscriptionId);
        } else {
            if (inscriptionIdField) inscriptionIdField.textContent = 'N/A';
            inscriptionIdRow.onclick = null;
        }
    }

    // Defensive check for other elements, just in case
    const bridgerNoEl = document.getElementById('bridger-no');
    if (bridgerNoEl) bridgerNoEl.textContent = bridgerNo;
    const levelEl = document.getElementById('level');
    const levelRow = document.getElementById('level-row');
    if (levelEl) {
        levelEl.textContent = toRoman(level || 1);
        
        // Make level clickable if greater than 1
        if (levelRow && level > 1) {
            levelRow.classList.add('clickable');
            levelRow.onclick = () => {
                // Find the highest level among credentials for this inscription ID
                const recipientCredentials = window.articles ? window.articles.filter(a => a.recipient === inscriptionId) : [];
                const maxLevel = recipientCredentials.length > 0 ? Math.max(...recipientCredentials.map(a => parseInt(a.level) || 1)) : level;
                // Show all credentials for this inscription ID with the highest level
                const highestLevelCredentials = recipientCredentials.filter(a => parseInt(a.level) === maxLevel);
                showPrefaceView(highestLevelCredentials);
            };
        } else if (levelRow) {
            levelRow.classList.remove('clickable');
            levelRow.onclick = null;
        }
    }
    const protocolEl = document.getElementById('protocol');
    if (protocolEl) protocolEl.textContent = "BRC333";
    const dateEl = document.getElementById('date');
    if (dateEl) dateEl.textContent = date;
    const blockEl = document.getElementById('block');
    if (blockEl) blockEl.textContent = block;
    const satoshiEl = document.getElementById('satoshi');
    if (satoshiEl) satoshiEl.textContent = satoshi || satplication;

    const imagePanel = document.getElementById('image-panel');
    if (imagePanel && inscriptionId) {
        const gradient = generateGradientFromId(inscriptionId);
        imagePanel.style.background = gradient;
    }
}

function updateCredentialCounts(inscriptionId) {
    if (!articles) return;

    console.log('inscriptionId',inscriptionId);
    // Filter articles by current inscription ID
    const recipientArticles = articles.filter(article => article.recipient === inscriptionId);
    
    const badges = recipientArticles.filter(article => article.type === 'badge' || article.type === 'pearl').length;
    const microcredentials = recipientArticles.filter(article => article.type === 'micro').length;
    const totalCredentials = recipientArticles.filter(article => article.kind === 'credential').length;
    console.log('badges',badges);
    console.log('microcredentials',microcredentials);
    console.log('totalCredentials',totalCredentials);

    const credentialsField = document.getElementById('credentials-field');
    const badgesField = document.getElementById('badges-field');
    const microcredsField = document.getElementById('microcreds-field');

    // Get the row elements
    const credentialsRow = document.getElementById('credentials-row');
    const badgesRow = document.getElementById('badges-row');
    const microcredsRow = document.getElementById('microcreds-row');

    // Update counts and manage clickability
    if (credentialsField) credentialsField.textContent = totalCredentials;
    if (badgesField) badgesField.textContent = badges;
    if (microcredsField) microcredsField.textContent = microcredentials;

    // Make rows clickable or non-clickable based on counts
    if (credentialsRow) {
        if (totalCredentials > 0) {
            credentialsRow.style.cursor = 'pointer';
            credentialsRow.onclick = () => showPrefaceView(recipientArticles);
        } else {
            credentialsRow.style.cursor = 'default';
            credentialsRow.onclick = null;
        }
    }

    if (badgesRow) {
        if (badges > 0) {
            badgesRow.style.cursor = 'pointer';
            badgesRow.onclick = () => showPrefaceView(recipientArticles.filter(a => a.type === 'badge' || a.type === 'pearl'));
        } else {
            badgesRow.style.cursor = 'default';
            badgesRow.onclick = null;
        }
    }

    if (microcredsRow) {
        if (microcredentials > 0) {
            microcredsRow.style.cursor = 'pointer';
            microcredsRow.onclick = () => showPrefaceView(recipientArticles.filter(a => a.type === 'micro'));
        } else {
            microcredsRow.style.cursor = 'default';
            microcredsRow.onclick = null;
        }
    }
}

async function showPrefaceView(articlesToDisplay, showSearchUI = true) {
    console.log('[Debug] showPrefaceView called with:', articlesToDisplay, 'showSearchUI:', showSearchUI);
    
    const idCardContainer = document.getElementById('overweb-id-card-container');
    const prefaceContainer = document.getElementById('preface-container');
    const prefaceDiv = document.getElementById('preface');
    const contentDiv = document.getElementById('content');
    const closeBtn = document.getElementById('preface-close');

    console.log('[Debug] Found elements:', {
        idCardContainer: !!idCardContainer,
        prefaceContainer: !!prefaceContainer,
        prefaceDiv: !!prefaceDiv,
        contentDiv: !!contentDiv,
        closeBtn: !!closeBtn
    });

    if (idCardContainer) idCardContainer.style.display = 'none';
    if (prefaceContainer) {
        prefaceContainer.style.display = 'flex';
        prefaceContainer.classList.add('active');
    }

    if (prefaceDiv) prefaceDiv.style.display = showSearchUI ? 'block' : 'none';
    if (closeBtn) closeBtn.style.display = showSearchUI ? 'none' : 'block';

    if (contentDiv) {
        contentDiv.innerHTML = ''; // Clear previous content
        contentDiv.style.display = 'block';
    }
    
    // If we have a list of articles, display them.
    if (articlesToDisplay && window.BRC333Attestations && typeof window.BRC333Attestations.displayAttestationLinks === 'function') {
        console.log('[Debug] Calling BRC333Attestations.displayAttestationLinks with:', articlesToDisplay);
        window.filteredResults = articlesToDisplay;
        currentPage = 1;
        
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
        const options = {
            itemsPerPage: window.ITEMS_PER_PAGE || 10,
            excludeFields: window.excludeFields || [],
            allowedKinds: window.allowedKinds || []
        };
        
        try {
            await window.BRC333Attestations.displayAttestationLinks(articlesToDisplay, attestationsContainer, options);
            console.log('[Debug] Attestation links displayed successfully');
        } catch (error) {
            console.error('[Debug] Error displaying attestation links:', error);
            // Fallback display
            attestationsContainer.innerHTML = '<p style="color: red;">Error displaying attestations. Please try again.</p>';
        }
    } else if (articlesToDisplay && articlesToDisplay.length > 0) {
        console.log('[Debug] BRC333Attestations module not available, using fallback display');
        // Fallback: display articles directly
        let html = '<div class="articles-container"><h1>Attestations</h1><ul>';
        for (const article of articlesToDisplay) {
            html += `<li><strong>${article.title}</strong></li>`;
        }
        html += '</ul></div>';
        if (contentDiv) {
            contentDiv.innerHTML = html;
        }
    } else {
        console.log('[Debug] No articles to display or articles array is empty');
        if (contentDiv) {
            contentDiv.innerHTML = '<p>No attestations found.</p>';
        }
    }
}

function switchToIdCardView() {
    const prefaceContainer = document.getElementById('preface-container');
    prefaceContainer.style.display = 'none';
    prefaceContainer.classList.remove('active');
    document.getElementById('overweb-id-card-container').style.display = 'flex';
}
window.switchToIdCardView = switchToIdCardView;

async function switchToPrefaceView() {
    const idCardContainer = document.getElementById('overweb-id-card-container');
    const prefaceContainer = document.getElementById('preface-container');
    const prefaceDiv = document.getElementById('preface');
    const contentDiv = document.getElementById('content');

    console.log('[Debug] switchToPrefaceView triggered.');

    if (idCardContainer) {
        idCardContainer.style.display = 'none';
    }

    if (prefaceContainer) {
        prefaceContainer.style.display = 'flex';
        prefaceContainer.classList.add('active');
    }

    if (prefaceDiv) {
        prefaceDiv.style.display = 'block';
        prefaceDiv.style.opacity = '1';
    }
    if (contentDiv) {
        contentDiv.style.display = 'none';
    }
}

async function setupCardInteractivity(satoshi, profileData = null) {
    console.log(`[Debug] === SETUP CARD INTERACTIVITY START ===`);
    console.log(`[Debug] setupCardInteractivity called with satoshi: ${satoshi}, profileData:`, profileData);
    
    // Use global variables correctly, clearing them instead of re-declaring
    pfpElements.length = 0;
    pfpState = 0;

    const imagePanel = document.getElementById('image-panel');
    if (!imagePanel) {
        console.error("Image panel not found, cannot set up interactivity.");
        return;
    }
    imagePanel.innerHTML = '';

    // Get primary persona names for static displays (logo/QR)
    const primarySnsName = profileData?.names?.snsName || "N/A";
    const primaryHandleName = profileData?.names?.handleName || "N/A";
    const personas = profileData?.personas || [];

    console.log(`[Debug] Primary names for static displays - SNS: ${primarySnsName}, Handle: ${primaryHandleName}`);
    console.log(`[Debug] Found ${personas.length} personas for cycling`);

    // --- Create PFP elements in the specified order ---
    
    // 1. Add all persona PFPs first (in order)
    for (const persona of personas) {
        if (persona.data.pfpId) {
            console.log(`[Debug] Creating PFP element for persona: ${persona.name} with pfpId: ${persona.data.pfpId}`);
        try {
                const inscMeta = await getMetadata(`https://ordinals.com/r/inscription/${persona.data.pfpId}`);
            if (inscMeta && inscMeta.content_type) {
                let personaPfpElement;
                if (inscMeta.content_type.startsWith('image/')) {
                    personaPfpElement = document.createElement('img');
                        personaPfpElement.src = `${baseUrl}/content/${persona.data.pfpId}`;
                    personaPfpElement.className = 'pfp-image';
                        personaPfpElement.setAttribute('data-persona', persona.name);
                    personaPfpElement.onload = function() {
                        if (personaPfpElement.naturalWidth < imagePanel.offsetWidth) {
                            personaPfpElement.style.imageRendering = 'pixelated';
                            personaPfpElement.style.imageRendering = 'crisp-edges';
                        }
                    };
                    
                    // Add hover event listeners for debugging and manual scaling
                    personaPfpElement.addEventListener('mouseenter', (e) => {
                            console.log(`[Debug] Persona PFP image mouse enter - hover should trigger for ${persona.name}`);
                        personaPfpElement.style.transform = 'scale(1.05)';
                        personaPfpElement.style.transition = 'transform 0.2s ease-out';
                        e.stopPropagation = false;
                    });
                    personaPfpElement.addEventListener('mouseleave', (e) => {
                            console.log(`[Debug] Persona PFP image mouse leave - hover should end for ${persona.name}`);
                        personaPfpElement.style.transform = 'scale(1)';
                        e.stopPropagation = false;
                    });
                    
                } else if (inscMeta.content_type.startsWith('text/html')) {
                    // Create a container for the iframe and overlay
                    personaPfpElement = document.createElement('div');
                    personaPfpElement.className = 'html-inscription-container pfp-image';
                        personaPfpElement.setAttribute('data-persona', persona.name);
                    personaPfpElement.style.cssText = `
                        width: 100%;
                        height: 100%;
                        position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        transform-origin: center center;
                    `;
                    
                        // Create iframe for HTML inscription
                    const iframe = document.createElement('iframe');
                        iframe.src = `https://ordinals.com/content/${persona.data.pfpId}`;
                    iframe.className = 'html-inscription';
                    iframe.style.cssText = `
                            width: 800px !important;
                            height: 800px !important;
                            border: none !important;
                            transform: scale(0.5) !important;
                            transform-origin: top left !important;
                            pointer-events: none !important;
                    `;
                    
                    // Create transparent overlay for click handling
                    const overlay = document.createElement('div');
                    overlay.className = 'iframe-click-overlay';
                    overlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: transparent;
                        z-index: 2;
                        cursor: pointer;
                    `;
                    
                    // Add hover event listeners to the container
                    personaPfpElement.addEventListener('mouseenter', (e) => {
                            console.log(`[Debug] Persona PFP iframe container mouse enter - hover should trigger for ${persona.name}`);
                        personaPfpElement.style.transform = 'scale(1.05)';
                        personaPfpElement.style.transition = 'transform 0.2s ease-out';
                    });
                    personaPfpElement.addEventListener('mouseleave', (e) => {
                            console.log(`[Debug] Persona PFP iframe container mouse leave - hover should end for ${persona.name}`);
                        personaPfpElement.style.transform = 'scale(1)';
                    });
                    
                    // Append iframe and overlay to container
                    personaPfpElement.appendChild(iframe);
                    personaPfpElement.appendChild(overlay);
                    
                    // Add load event listener to handle sizing
                    iframe.onload = function() {
                            console.log(`[Debug] HTML PFP iframe loaded successfully for ${persona.name}`);
                        
                        // Try to access iframe content for sizing
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (iframeDoc) {
                                // Add responsive styling to the iframe content
                                const style = iframeDoc.createElement('style');
                                style.textContent = `
                                    html, body { 
                                        margin: 0; 
                                        padding: 0; 
                                        width: 100vw !important;
                                        height: 100vh !important;
                                        overflow: hidden;
                                        background: transparent;
                                        transform: scale(1);
                                        transform-origin: center center;
                                    }
                                    * {
                                        box-sizing: border-box;
                                    }
                                `;
                                iframeDoc.head.appendChild(style);
                                    console.log(`[Debug] Successfully injected viewport-based styling into HTML PFP for ${persona.name}`);
                            }
                        } catch (e) {
                                console.log(`[Debug] Could not access iframe content (CORS), applying container-based scaling for ${persona.name}`);
                            
                            // Apply container-based scaling since we can't access iframe content
                            setTimeout(() => {
                                const containerWidth = imagePanel.offsetWidth;
                                const containerHeight = imagePanel.offsetHeight;
                                console.log(`[Debug] Starting HTML PFP sizing analysis (container: ${containerWidth}x${containerHeight})`);
                                
                                    // The iframe is already scaled by CSS (800px * 0.5 = 400px)
                                    // Container is already set to flex with center alignment
                                    const iframeScaledWidth = 800 * 0.5; // 400px
                                    const iframeScaledHeight = 800 * 0.5; // 400px
                                
                                    console.log(`[Debug] HTML PFP container ready (${containerWidth}x${containerHeight}), iframe scaled to ${iframeScaledWidth}x${iframeScaledHeight}`);
                                }, 100);
                        }
                    };
                }

                if (personaPfpElement) {
                    pfpElements.push(personaPfpElement);
                        console.log(`[Debug] Successfully created persona PFP element for ${persona.name}:`, personaPfpElement.className, personaPfpElement.tagName);
                }
            }
            } catch (error) {
                console.error(`[Debug] Error creating PFP element for persona ${persona.name}:`, error);
            }
        }
    }

    // 2. Add any HTML/image inscriptions directly on the sat (not persona-based)
    try {
        if (satoshi) {
            const allInscriptionsOnSat = await getInscriptionsForSat(satoshi);
            for (let i = 0; i < allInscriptionsOnSat.length; i++) {
                const id = allInscriptionsOnSat[i];
                
                // Skip if this inscription is already used as a persona PFP
                const isPersonaPfp = personas.some(persona => persona.data.pfpId === id);
                if (isPersonaPfp) {
                    console.log(`[Debug] Skipping inscription ${id} - already used as persona PFP`);
                    continue;
                }
                
                try {
                    const inscMeta = await getMetadata(`https://ordinals.com/r/inscription/${id}`);
                    if (inscMeta && inscMeta.content_type) {
                        let directPfpElement;
                        
                        if (inscMeta.content_type.startsWith('image/')) {
                            directPfpElement = document.createElement('img');
                            directPfpElement.src = `${baseUrl}/content/${id}`;
                            directPfpElement.className = 'pfp-image';
                            directPfpElement.setAttribute('data-type', 'direct-image');
                            directPfpElement.setAttribute('data-inscription-id', id);
                            directPfpElement.onload = function() {
                                if (directPfpElement.naturalWidth < imagePanel.offsetWidth) {
                                    directPfpElement.style.imageRendering = 'pixelated';
                                    directPfpElement.style.imageRendering = 'crisp-edges';
                                }
                            };
                            
                            // Add hover event listeners
                            directPfpElement.addEventListener('mouseenter', (e) => {
                                console.log(`[Debug] Direct image PFP mouse enter - hover should trigger for ${id}`);
                                directPfpElement.style.transform = 'scale(1.05)';
                                directPfpElement.style.transition = 'transform 0.2s ease-out';
                                e.stopPropagation = false;
                            });
                            directPfpElement.addEventListener('mouseleave', (e) => {
                                console.log(`[Debug] Direct image PFP mouse leave - hover should end for ${id}`);
                                directPfpElement.style.transform = 'scale(1)';
                                e.stopPropagation = false;
                            });
                            
                        } else if (inscMeta.content_type.startsWith('text/html')) {
                            // Create a container for the iframe and overlay
                            directPfpElement = document.createElement('div');
                            directPfpElement.className = 'html-inscription-container pfp-image';
                            directPfpElement.setAttribute('data-type', 'direct-html');
                            directPfpElement.setAttribute('data-inscription-id', id);
                            directPfpElement.style.cssText = `
                                width: 100%;
                                height: 100%;
                                position: relative;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transform-origin: center center;
                            `;
                            
                            // Create iframe for HTML inscription
                            const iframe = document.createElement('iframe');
                            iframe.src = `https://ordinals.com/content/${id}`;
                            iframe.className = 'html-inscription';
                            iframe.style.cssText = `
                                width: 800px !important;
                                height: 800px !important;
                                border: none !important;
                                transform: scale(0.65) !important;
                                transform-origin: top left !important;
                                pointer-events: none !important;
                            `;
                            
                            // Create transparent overlay for click handling
                            const overlay = document.createElement('div');
                            overlay.className = 'iframe-click-overlay';
                            overlay.style.cssText = `
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: transparent;
                                z-index: 2;
                                cursor: pointer;
                            `;
                            
                            // Add hover event listeners to the container
                            directPfpElement.addEventListener('mouseenter', (e) => {
                                console.log(`[Debug] Direct HTML PFP container mouse enter - hover should trigger for ${id}`);
                                directPfpElement.style.transform = 'scale(1.05)';
                                directPfpElement.style.transition = 'transform 0.2s ease-out';
                            });
                            directPfpElement.addEventListener('mouseleave', (e) => {
                                console.log(`[Debug] Direct HTML PFP container mouse leave - hover should end for ${id}`);
                                directPfpElement.style.transform = 'scale(1)';
                            });
                            
                            // Append iframe and overlay to container
                            directPfpElement.appendChild(iframe);
                            directPfpElement.appendChild(overlay);
                            
                            // Add load event listener to handle sizing
                            iframe.onload = function() {
                                console.log(`[Debug] Direct HTML PFP iframe loaded successfully for ${id}`);
                                
                                // Try to access iframe content for sizing
                                try {
                                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                    if (iframeDoc) {
                                        // Add responsive styling to the iframe content
                                        const style = iframeDoc.createElement('style');
                                        style.textContent = `
                                            html, body { 
                                                margin: 0; 
                                                padding: 0; 
                                                width: 100vw !important;
                                                height: 100vh !important;
                                                overflow: hidden;
                                                background: transparent;
                                                transform: scale(1);
                                                transform-origin: center center;
                                            }
                                            * {
                                                box-sizing: border-box;
                                            }
                                        `;
                                        iframeDoc.head.appendChild(style);
                                        console.log(`[Debug] Successfully injected viewport-based styling into direct HTML PFP for ${id}`);
                                    }
                                } catch (e) {
                                    console.log(`[Debug] Could not access iframe content (CORS), applying container-based scaling for ${id}`);
                                    
                                    // Apply container-based scaling since we can't access iframe content
                                    setTimeout(() => {
                                        const containerWidth = imagePanel.offsetWidth;
                                        const containerHeight = imagePanel.offsetHeight;
                                        console.log(`[Debug] Starting direct HTML PFP sizing analysis (container: ${containerWidth}x${containerHeight})`);
                                        
                                        // The iframe is already scaled by CSS (800px * 0.65 = 520px)
                                        // Container is already set to flex with center alignment
                                        const iframeScaledWidth = 800 * 0.65; // 520px
                                        const iframeScaledHeight = 800 * 0.65; // 520px
                                        
                                        console.log(`[Debug] Direct HTML PFP container ready (${containerWidth}x${containerHeight}), iframe scaled to ${iframeScaledWidth}x${iframeScaledHeight}`);
                                    }, 100);
                                }
                            };
                        }
                        
                        if (directPfpElement) {
                            pfpElements.push(directPfpElement);
                            console.log(`[Debug] Successfully created direct PFP element for ${id}:`, directPfpElement.className, directPfpElement.tagName);
                        }
                    }
                } catch (err) {
                    console.warn(`Could not process inscription ${id} on sat ${satoshi}:`, err);
                }
            }
        }
    } catch (error) {
        console.error("Failed to fetch direct PFPs from inscription's satoshi:", error);
    }

    // 3. Add Logo (with primary persona's handle/SNS)
    const logoContainer = document.createElement('div');
    logoContainer.id = 'logo-container';
    logoContainer.className = 'pfp-image';
    logoContainer.setAttribute('data-type', 'logo');
                            
    // Add hover event listeners for debugging
    logoContainer.addEventListener('mouseenter', (e) => {
        console.log('[Debug] Logo container mouse enter - hover should trigger');
                                e.stopPropagation = false;
                            });
    logoContainer.addEventListener('mouseleave', (e) => {
        console.log('[Debug] Logo container mouse leave - hover should end');
                                e.stopPropagation = false;
                            });
                            
    const bridgerNumberOverlay = document.createElement('span');
    bridgerNumberOverlay.id = 'bridger-no-overlay';
    bridgerNumberOverlay.textContent = bridgerNo;
    if (bridgerNo) {
        const len = bridgerNo.length;
        if (len >= 6) { bridgerNumberOverlay.style.fontSize = '2.3em'; }
        else if (len === 5) { bridgerNumberOverlay.style.fontSize = '2.8em'; }
    }
    logoContainer.appendChild(bridgerNumberOverlay);
    pfpElements.push(logoContainer);
                            
    // 3. Add QR Code (with primary persona's handle/SNS)
    const qrCodeContainer = document.createElement('div');
    qrCodeContainer.id = 'qr-code-container';
    qrCodeContainer.className = 'pfp-image';
    qrCodeContainer.setAttribute('data-type', 'qr');
    const qrUrl = `https://ordinals.com/content/${inscriptionId}`;
    jQuery(qrCodeContainer).qrcode({ text: qrUrl, width: 300, height: 300, colorDark: "#fff", colorLight: "#1a1a1a" });
                            
    // Add hover event listeners for debugging
    qrCodeContainer.addEventListener('mouseenter', (e) => {
        console.log('[Debug] QR code container mouse enter - hover should trigger');
        e.stopPropagation = false;
                            });
    qrCodeContainer.addEventListener('mouseleave', (e) => {
        console.log('[Debug] QR code container mouse leave - hover should end');
        e.stopPropagation = false;
                            });
                            
    pfpElements.push(qrCodeContainer);

    // Add all elements to the image panel
    pfpElements.forEach(el => imagePanel.appendChild(el));
                            
    // Add hover hint tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'persona-cycle-tooltip';
    tooltip.textContent = 'Click to cycle personas';
    tooltip.style.cssText = `
                                            position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 10;
    `;
    imagePanel.appendChild(tooltip);
    
    // Show tooltip on hover
    imagePanel.addEventListener('mouseenter', () => {
        if (personas.length > 1) {
            tooltip.style.opacity = '1';
        }
    });
    
    imagePanel.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });
    
    console.log(`[Debug] Total PFP elements created: ${pfpElements.length}`);
    pfpElements.forEach((el, index) => {
        const personaName = el.getAttribute('data-persona');
        const elementType = el.getAttribute('data-type');
        console.log(`[Debug] PFP ${index}: ${personaName ? `Persona: ${personaName}` : `Type: ${elementType}`} - ${el.className} ${el.tagName}`);
        console.log(`[Debug] PFP ${index} computed style:`, window.getComputedStyle(el).display, window.getComputedStyle(el).position, window.getComputedStyle(el).width, window.getComputedStyle(el).height);
    });
    
    // Expose pfpElements to global scope for JSON endpoint access
    window.pfpElements = pfpElements;
    console.log(`[Debug] Exposed ${pfpElements.length} PFP elements to window.pfpElements`);
    
    // Set initial view: Start with the first persona (index 0)
    if (pfpElements.length > 0) {
        // First hide all elements using class-based approach only
        pfpElements.forEach(el => {
            el.classList.remove('pfp-active');
            el.classList.add('pfp-hidden');
        });
        
        // Start with the first persona (index 0)
        pfpState = 0;
        pfpElements[pfpState].classList.remove('pfp-hidden');
        pfpElements[pfpState].classList.add('pfp-active');
        console.log(`[Debug] Setting initial PFP view to index: ${pfpState}`);
        console.log(`[Debug] Showing PFP element:`, pfpElements[pfpState].className, pfpElements[pfpState].tagName);
        console.log(`[Debug] Active PFP computed style:`, window.getComputedStyle(pfpElements[pfpState]).display, window.getComputedStyle(pfpElements[pfpState]).visibility, window.getComputedStyle(pfpElements[pfpState]).opacity);
        console.log(`[Debug] Active PFP classList:`, pfpElements[pfpState].classList.toString());
        
        // Force a style recalculation
        setTimeout(() => {
            console.log(`[Debug] After timeout - Active PFP computed style:`, window.getComputedStyle(pfpElements[pfpState]).display, window.getComputedStyle(pfpElements[pfpState]).visibility, window.getComputedStyle(pfpElements[pfpState]).opacity);
        }, 1000);
    }

    // Set up click cycling
    imagePanel.addEventListener('click', (e) => {
        console.log('[Debug] Image panel clicked. Target:', e.target.tagName, e.target.id, e.target.className);
        if (pfpElements.length === 0) return;
        
        // Hide current element
        pfpElements[pfpState].classList.remove('pfp-active');
        pfpElements[pfpState].classList.add('pfp-hidden');
        
        // Move to next element (circular)
        pfpState = (pfpState + 1) % pfpElements.length;
        
        // Show new element
        pfpElements[pfpState].classList.remove('pfp-hidden');
        pfpElements[pfpState].classList.add('pfp-active');
        
        // Log what we're showing
        const currentElement = pfpElements[pfpState];
        const personaName = currentElement.getAttribute('data-persona');
        const elementType = currentElement.getAttribute('data-type');
        const displayName = personaName ? `Persona: ${personaName}` : `Type: ${elementType}`;
        
        console.log(`[Debug] Cycled to PFP index: ${pfpState} - ${displayName}`);
        
        // Update SNS/handle display based on what's showing
        if (personaName) {
            // Show the current persona's names
            const currentPersona = personas.find(p => p.name === personaName);
            if (currentPersona) {
                updateNameDisplay(currentPersona.data.snsName || primarySnsName, currentPersona.data.handleName || primaryHandleName);
                updateHeadlineDisplay(currentPersona.data.headline || '');
            }
        } else {
            // Show primary persona's names for logo/QR
            updateNameDisplay(primarySnsName, primaryHandleName);
            updateHeadlineDisplay(profileData.headline || '');
        }
    });

    // Function to update name display
    function updateNameDisplay(snsName, handleName) {
        const snsElement = document.getElementById('sns-name');
        const handleElement = document.getElementById('handle-name');
        
        if (snsElement && snsName && snsName !== 'N/A') {
            snsElement.textContent = snsName;
            snsElement.style.display = 'block';
        }
        if (handleElement && handleName && handleName !== 'N/A') {
            handleElement.textContent = handleName;
            handleElement.style.display = 'block';
        }
    }

    // Note: Click handlers for credential rows are now managed in updateCredentialCounts() 
    // based on whether there are items to display

    // Apply PFP background colors if available
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

    // Function to update headline display
    function updateHeadlineDisplay(headlineHtml) {
        const headlineTextEl = document.getElementById('headline-text');
        if (headlineTextEl) {
            headlineTextEl.innerHTML = '';
            if (headlineHtml) {
                // Same parsing as in populateCardData
                const regex = /(<i>.*?<\/i>|<strong>.*?<\/strong>|[^<>]+)/g;
                const parts = headlineHtml.match(regex);
                if (parts) {
                    parts.forEach(part => {
                        if (part.startsWith('<i>')) {
                            const node = document.createElement('i');
                            node.textContent = part.replace(/<\/?i>/g, '');
                            headlineTextEl.appendChild(node);
                        } else if (part.startsWith('<strong>')) {
                            const node = document.createElement('strong');
                            node.textContent = part.replace(/<\/?strong>/g, '');
                            headlineTextEl.appendChild(node);
                        } else {
                            const node = document.createTextNode(part);
                            headlineTextEl.appendChild(node);
                        }
                    });
                }
                headlineTextEl.title = headlineHtml.replace(/<[^>]*>?/gm, '');
            }
        }
    }
}

function setView(index) {
    if (index < 0 || index >= pfpElements.length) {
        console.error(`Invalid view index: ${index}`);
        return;
    }
    // Ensure card view is active
    switchToIdCardView();

    pfpElements[pfpState].classList.remove('pfp-active');
    pfpElements[pfpState].classList.add('pfp-hidden');
    pfpState = index;
    pfpElements[pfpState].classList.remove('pfp-hidden');
    pfpElements[pfpState].classList.add('pfp-active');
}

async function handleHashChange(articles) {
    const existingDisplay = document.getElementById('fullscreen-display');
    if (existingDisplay) existingDisplay.remove();
    
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    console.log(`[Debug] Raw hash: "${hash}"`);
    console.log(`[Debug] Hash ends with '/json': ${hash.endsWith('/json')}`);
    
    const jsonMode = hash.endsWith('/json');
    const cleanHash = jsonMode ? hash.slice(0, -('/json'.length)) : hash;
    
    console.log(`[Debug] Clean hash: "${cleanHash}"`);
    
    const [route, ...params] = cleanHash.split('/');
    
    console.log(`[Debug] Hash changed. Route: ${route}, Params: ${params}, JsonMode: ${jsonMode}`);

    if (jsonMode) {
        let jsonData;
        switch (route) {
            case 'attestors': {
                console.log('[Debug] Attestors route hit (JSON mode).');
                console.log('[Debug] window.validAttestors:', window.validAttestors);
                jsonData = window.validAttestors || [];
                break;
            }
            case 'attestations': {
                const attestorIndex = parseInt(params[0], 10);
                if (!isNaN(attestorIndex) && attestorIndex > 0) {
                    if (window.validAttestors && window.validAttestors.length >= attestorIndex) {
                        const singleAttestor = [window.validAttestors[attestorIndex - 1]];
                        jsonData = await fetchAttestations(singleAttestor);
                    } else {
                        jsonData = { error: "Invalid attestor index." };
                    }
                } else {
                    // Use test articles when testing is true, otherwise fetch from attestors
                    if (testing) {
                        console.log('[Debug] Getting all test articles for JSON');
                        jsonData = await getAllTestArticles();
                        console.log('[Debug] JSON data length:', jsonData.length);
                        console.log('[Debug] JSON data:', jsonData);
                    } else if (window.validAttestors && window.validAttestors.length > 0) {
                        jsonData = await fetchAttestations(window.validAttestors);
                    } else {
                        jsonData = { error: "No valid attestors found." };
                    }
                }
                break;
            }
            case 'pfp': {
                jsonData = pfpElements.map(el => ({ tagName: el.tagName, src: el.src, id: el.id }));
                break;
            }
            case 'cred':
            case 'micro':
            case 'pearl': {
                 if (articles) {
                    let articlesToDisplay = articles;
                    if (route === 'pearl') {
                        articlesToDisplay = articles.filter(article => article.type === 'PEARL');
                    } else if (route === 'micro') {
                        articlesToDisplay = articles.filter(article => article.type === 'Micro');
                    }
                    jsonData = articlesToDisplay;
                 } else {
                    jsonData = { error: "Articles not available." };
                 }
                break;
            }
            case 'reinscription': {
                if (window.satoshi) {
                    const reinscriptionData = await fetchAllReinscriptionData(window.satoshi);
                    displayReinscriptionData(reinscriptionData);
                } else {
                    displayGenericContent('<p style="color: red;">Satoshi not available to fetch reinscription data.</p>');
                 }
                break;
            }
            default:
                jsonData = { error: "Invalid JSON route." };
        }
        // Clean the JSON data to prevent display issues with long HTML content
        const cleanJsonData = JSON.parse(JSON.stringify(jsonData, (key, value) => {
            if (key === 'html' && typeof value === 'string') {
                // Remove HTML content entirely from JSON output to prevent truncation
                return '[HTML content removed for display]';
            }
            return value;
        }));
        const jsonString = JSON.stringify(cleanJsonData, null, 2);
        const htmlContent = `<pre style="white-space: pre-wrap; word-wrap: break-word; color: #f0ead6; background-color: #1a1a1a; padding: 20px; border-radius: 10px; height: 100vh; box-sizing: border-box; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;">${jsonString}</pre>`;
        displayJsonContent(htmlContent);
        return;
    }

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
                    showPrefaceView(attestations, false);
                } else {
                    displayGenericContent('<p style="color: red;">Invalid attestor index.</p>');
                }
            } else {
                // Use test articles when testing is true, otherwise fetch from attestors
                if (testing) {
                    console.log('[Debug] Using test articles for attestations view');
                    const testAttestations = await getAllTestArticles();
                    console.log('[Debug] Test attestations:', testAttestations);
                    if (testAttestations && testAttestations.length > 0) {
                        // Add bridger number to titles for display
                        const articlesWithBridgerInfo = testAttestations.map(article => ({
                            ...article,
                            title: article.bridgerNo ? `${article.title} (${article.author || article.issuer || 'Unknown'}): Bridger ${article.bridgerNo}` : `${article.title} by ${article.author || article.issuer || 'Unknown'}`
                        }));
                        showPrefaceView(articlesWithBridgerInfo, false);
                    } else {
                        displayGenericContent('<p style="color: red;">No test attestations found.</p>');
                    }
                } else if (window.validAttestors && window.validAttestors.length > 0) {
                    const attestations = await fetchAttestations(window.validAttestors);
                    showPrefaceView(attestations, false);
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
                    setView(globalIndex);
                }
            }
            break;
        }
        case 'cred': {
            await switchToPrefaceView();
            const index = parseInt(params[0], 10);

            if (!isNaN(index) && index > 0) {
                if (window.BRC333Tags && typeof window.BRC333Tags.resetTagView === 'function') {
                    await window.BRC333Tags.resetTagView();
                }
                if (articles && articles.length >= index) {
                    const targetArticle = articles[index - 1];
                    if (targetArticle) {
                        await displayArticle(targetArticle);
                    }
                } else {
                    console.warn("Articles not loaded or index out of bounds.");
                }
            } else { 
                if (window.BRC333Tags && typeof window.BRC333Tags.resetTagView === 'function') {
                    await window.BRC333Tags.resetTagView();
                } else {
                    if (typeof refreshArticleList === 'function') {
                        await refreshArticleList(articles);
                    }
                }
            }
            break;
        }
        case 'micro':
        case 'pearl': {
            const filterType = route.charAt(0).toUpperCase() + route.slice(1);
            const results = articles.filter(article => article.type === filterType);
            showPrefaceView(results, true);
            break;
        }
        case 'reinscription': {
            if (window.satoshi) {
                const reinscriptionData = await fetchAllReinscriptionData(window.satoshi);
                displayReinscriptionData(reinscriptionData);
            } else {
                displayGenericContent('<p style="color: red;">Satoshi not available to fetch reinscription data.</p>');
            }
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
                const actionDate = action.date ? new Date(action.date).getTime() : metadata.timestamp * 1000;
                
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
                    };
                    break;
                case 'edit':
                    if (currentAttestor) {
                        // Only update fields that are explicitly provided in the edit action
                        if (action.name) currentAttestor.name = action.name;
                        if (action.sat) currentAttestor.sat = action.sat;
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

async function fetchNamesFromSat(satoshi) {
    if (!satoshi) return { snsName: "N/A", handleName: "N/A" };

    let snsName = "N/A";
    let handleName = "N/A";

    try {
        const inscriptionIds = await getInscriptionsForSat(satoshi);
        // Iterate backwards to find the latest of each
        for (let i = inscriptionIds.length - 1; i >= 0; i--) {
            // If we've found both, we can stop searching
            if (snsName !== "N/A" && handleName !== "N/A") break;

            const id = inscriptionIds[i];
            try {
                const content = await getInscriptionContent(id);
                if (typeof content === 'string') {
                    const trimmedContent = content.trim();
                    if (snsName === "N/A" && (trimmedContent.endsWith('.meta') || trimmedContent.endsWith('.sats'))) {
                        snsName = trimmedContent;
                    }
                    if (handleName === "N/A" && trimmedContent.startsWith('@')) {
                        handleName = trimmedContent;
                    }
                }
            } catch (err) { /* ignore individual content fetch errors */ }
        }
    } catch (error) {
        console.error("Failed to fetch inscriptions for Bridger name:", error);
    }
    
    return { snsName, handleName };
}

function setupIdInfoModal() {
    document.addEventListener('keydown', (e) => {
        const idCardContainer = document.getElementById('overweb-id-card-container');
        if ((e.key === 'i' || e.key === 'I') && idCardContainer.style.display !== 'none') {
            let content = '';
            if (window.description) {
                content += window.description;
            }
            if (window.overwebIdInstructions) {
                content += window.overwebIdInstructions;
            }
            displayGenericContent(content);
        }
    });
}

async function showFilteredPrefaceView(filterType) {
    await switchToPrefaceView();

    if (window.articles) {
        let results;
        if (filterType) {
            results = window.articles.filter(article => article.type === filterType);
        } else {
            results = window.articles;
        }
        
        window.filteredResults = results;
        currentPage = 1;

        if (typeof window.refreshArticleList === 'function') {
            await window.refreshArticleList(results, filterType || 'All');
        } else {
            console.error("refreshArticleList function not found.");
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
        modal.style.display = 'flex';
        modalTextarea.select();
    }
}

function setupGenericModal() {
    const modal = document.getElementById('generic-modal');
    const closeModalBtn = document.getElementById('generic-modal-close');

    if (modal && closeModalBtn) {
        const closeModal = () => {
            modal.style.display = 'none';
        };

        closeModalBtn.onclick = closeModal;
        modal.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
}

async function fetchNamesFromParent(inscriptionId) {
    if (testing) return { snsName: "daveed.meta", handleName: "@daveed" };
    if (!inscriptionId) return { snsName: "N/A", handleName: "N/A" };

    const parentId = await getParentInscriptionId(inscriptionId);
    if (!parentId) {
        return { snsName: "N/A", handleName: "N/A" };
    }

    try {
        const metadata = await getInscriptionMetadata(parentId);
        if (metadata && metadata.meta && metadata.meta.name) {
             const name = metadata.meta.name;
             if (name.endsWith('.meta') || name.endsWith('.sats')) {
                 return { snsName: name, handleName: "N/A" };
             }
             if (name.startsWith('@')) {
                 return { snsName: "N/A", handleName: name };
             }
        }
        
            const content = await getInscriptionContent(parentId);
        if (typeof content === 'string') {
            const trimmedContent = content.trim();
            if (trimmedContent.endsWith('.meta') || trimmedContent.endsWith('.sats')) {
                return { snsName: trimmedContent, handleName: "N/A" };
            }
            if (trimmedContent.startsWith('@')) {
                return { snsName: "N/A", handleName: trimmedContent };
            }
        }
        return { snsName: "N/A", handleName: "N/A" };
    } catch (error) {
        console.error('Error fetching parent inscription data:', error);
        return { snsName: "N/A", handleName: "N/A" };
    }
}

function displayGenericContent(htmlContent) {
    showPrefaceView(null, false);
    const contentDiv = document.getElementById('content');
    const prefaceDiv = document.getElementById('preface');
    if (prefaceDiv) {
        prefaceDiv.style.display = 'none'; // Hide search/filter controls
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
                    <div class="attestor-detail"><b>ID:</b> <span>${attestor.id}</span></div>
                    <div class="attestor-detail"><b>Issuing Sat:</b> <span>${attestor.sat}</span></div>
                    <div class="attestor-detail"><b>Active From:</b> <span>${new Date(attestor.startDate).toUTCString()}</span></div>
                    <div class="attestor-detail"><b>Active Until:</b> <span>${attestor.endDate === Infinity ? 'Present' : new Date(attestor.endDate).toUTCString()}</span></div>
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
    console.log('[Debug] Click detected on:', e.target.tagName, e.target.id, e.target.className);
    // Only trigger if the click is on the background (body), not a child element
    if (e.target === document.body || e.target.id === 'preface-container' || e.target.id === 'overweb-id-card-container') {
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        console.log('[Debug] Background click detected, changing color to:', randomColor);
        document.body.style.backgroundColor = randomColor;
        
        // Also update preface-container if visible (but NOT overweb-id-card-container to preserve rounded corners)
        const prefaceContainer = document.getElementById('preface-container');
        if (prefaceContainer) {
            prefaceContainer.style.backgroundColor = randomColor;
            console.log('[Debug] Updated preface container background');
        }
        
        // Explicitly ensure overweb-id-card-container has NO background color
        const idCardContainer = document.getElementById('overweb-id-card-container');
        if (idCardContainer) {
            idCardContainer.style.backgroundColor = 'transparent';
            console.log('[Debug] Ensured ID card container is transparent');
        }
    }
});

// Add keyboard event listeners
document.addEventListener('keydown', function(event) {
    // Check if the Overweb ID card is currently displayed
    const idCardContainer = document.getElementById('overweb-id-card-container');
    const prefaceContainer = document.getElementById('preface-container');
    const isIdCardVisible = idCardContainer && idCardContainer.style.display !== 'none';
    const isPrefaceVisible = prefaceContainer && prefaceContainer.style.display === 'flex';
    
    if (event.key.toLowerCase() === 's') {
        // Check if any modals are currently open
        const metaCommunitiesModal = document.getElementById('meta-communities-modal');
        const genericModal = document.getElementById('generic-modal');
        const attestationModal = document.getElementById('attestation-modal');
        const colorModal = document.getElementById('colorInputModal');
        const idInfoModal = document.getElementById('id-info-modal');
        
        const isAnyModalOpen = (metaCommunitiesModal && metaCommunitiesModal.style.display !== 'none') ||
                              (genericModal && genericModal.style.display !== 'none') ||
                              (attestationModal && attestationModal.style.display !== 'none') ||
                              (colorModal && colorModal.style.display !== 'none') ||
                              (idInfoModal && idInfoModal.style.display !== 'none');
        
        // Only show color input modal when ID card is visible AND preface is NOT visible AND no other modals are open
        if (isIdCardVisible && !isPrefaceVisible && !isAnyModalOpen) {
            showColorInputModal();
        }
    } else if (event.key === ' ') {
        // Spacebar - trigger random color change like background click
        event.preventDefault(); // Prevent page scroll
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
        currentBackgroundColor = randomColor; // Store the current color
        
        // Also update preface-container if visible (but NOT overweb-id-card-container to preserve rounded corners)
        if (prefaceContainer) {
            prefaceContainer.style.backgroundColor = randomColor;
            console.log('[Debug] Updated preface container background via spacebar');
        }
        
        // Explicitly ensure overweb-id-card-container has NO background color
        if (idCardContainer) {
            idCardContainer.style.backgroundColor = 'transparent';
            console.log('[Debug] Ensured ID card container is transparent via spacebar');
        }
        
        console.log('Background color changed to:', randomColor);
    } else if (event.key === '/') {
        // / key - trigger logo click (cycle through PFPs) - only when ID card is visible
        if (isIdCardVisible && !isPrefaceVisible) {
        event.preventDefault(); // Prevent default / behavior
        if (pfpElements.length > 0) {
            pfpElements[pfpState].classList.remove('pfp-active');
            pfpElements[pfpState].classList.add('pfp-hidden');
            pfpState = (pfpState + 1) % pfpElements.length;
            pfpElements[pfpState].classList.remove('pfp-hidden');
            pfpElements[pfpState].classList.add('pfp-active');
            console.log('Cycled to PFP:', pfpState);
            }
        }
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

async function fetchCardProfileData(satoshi, mainIdAddress) {
    console.log(`[Debug] Starting fetchCardProfileData for sat: ${satoshi}, address: ${mainIdAddress}`);
    // ---- Data Stores ----
    const personas = {}; // Stores state of each persona
    const personaTimestamps = {}; // Tracks last update for each persona
    const generalColors = { pfp: {} }; // For non-persona color inscriptions
    const standaloneNames = { snsName: "N/A", handleName: "N/A" };
    let latestStandaloneNameTimestamp = 0;

    // ---- Main Processing Loop ----
    try {
        const inscriptionIds = await getInscriptionsForSat(satoshi);
        console.log(`[Debug] Found ${inscriptionIds.length} total inscriptions on sat.`);
        // Process chronologically (oldest to newest) to build state
        for (const id of inscriptionIds) {
            // Use a self-invoking async function to handle promises within the loop correctly
            await (async () => {
                const [rawContent, meta] = await Promise.all([
                    getInscriptionContent(id), // Fetch as text first
                    getMetadata(`https://ordinals.com/r/inscription/${id}`)
                ]);

                console.log(`[Debug] Processing inscription ${id}...`);
                if (!rawContent || !meta) {
                    console.log(`[Debug] -> Skipping: No content or metadata.`);
                    return; // Use return instead of continue for this scoped function
                }

                let content;
                try {
                    content = JSON.parse(rawContent);
                } catch (e) {
                    // Not valid JSON, so treat as potential string data
                    if (typeof rawContent === 'string') {
                        console.log(`[Debug] -> Is a string. Content: "${rawContent.substring(0, 30)}..."`);
                        const trimmed = rawContent.trim();
                        const timestamp = meta.timestamp;
                        if (timestamp > latestStandaloneNameTimestamp) {
                            if (trimmed.endsWith('.meta') || trimmed.endsWith('.sats')) standaloneNames.snsName = trimmed;
                            if (trimmed.startsWith('@')) standaloneNames.handleName = trimmed;
                            latestStandaloneNameTimestamp = timestamp;
                            console.log(`[Debug] -> Updated standalone names:`, standaloneNames);
                        }
                    }
                    return; // Skip the rest for this non-JSON inscription
                }

                console.log(`[Debug] -> Parsed as JSON. Op: ${content.op}, Persona: ${content.persona}`);
                const timestamp = meta.timestamp;

                // Handle arrays of profile objects
                const profileObjects = Array.isArray(content) ? content : [content];
                
                for (const profileContent of profileObjects) {
                // Handle Profile updates (case-insensitive check for 'p')
                    if (profileContent.p && profileContent.p.toLowerCase() === 'brc333' && profileContent.op === 'profile' && profileContent.persona) {
                    // The profile inscription is a reinscription, so its owner is already guaranteed to be the sat owner.
                        console.log(`[Debug] -> Valid profile found. Action: ${profileContent.action}`);
                        const { persona, action, ...data } = profileContent;
                    const validateAndGetData = async (id, expectedOwnerAddress) => {
                        // Handle case where id might be wrapped in an array
                        const cleanId = Array.isArray(id) ? id[0] : id;
                        
                        // Add validation to ensure the ID is a real ID, not a placeholder
                        if (!cleanId || typeof cleanId !== 'string' || !/^[a-f0-9]{64}i\d+$/.test(cleanId)) {
                            console.log(`[Debug] Invalid inscription ID format: ${cleanId}. Skipping.`);
                            return { ok: false };
                        }
                        console.log(`[Debug] -> Validating inscription ID: ${cleanId} against owner ${expectedOwnerAddress}`);
                        const itemMeta = await getMetadata(`https://ordinals.com/r/inscription/${cleanId}`);
                        
                        // Security Check: Referenced asset must be owned by the same address as the main ID.
                        if (!itemMeta || itemMeta.address !== expectedOwnerAddress) {
                            console.warn(`[Security] Referenced item ${cleanId} is not owned by the expected address ${expectedOwnerAddress}. Skipping.`);
                            return { ok: false };
                        }
                        
                        // If we get here, validation passed.
                        const itemContent = await getInscriptionContent(cleanId);
                        console.log(`[Debug] -> Successfully validated ${cleanId}`);
                        return { ok: true, content: itemContent ? itemContent.trim() : '', id: cleanId };
                    };
                    switch (action) {
                        case 'add':
                            console.log(`[Debug] -> Action 'add' for persona '${persona}'.`);
                            personas[persona] = {};
                        case 'edit':
                            if (!personas[persona]) personas[persona] = {};
                            const p = personas[persona];
                            console.log(`[Debug] -> Action 'edit' for persona '${persona}'. Current state:`, JSON.parse(JSON.stringify(p)));

                            if (data.headline) p.headline = data.headline;
                            if (data.colors) p.colors = data.colors;
                            if (data.priority) p.priority = data.priority;
                                if (data.order !== undefined) p.order = data.order;

                            if (data.snsId) { 
                                const sns = await validateAndGetData(data.snsId, mainIdAddress); 
                                if (sns.ok) {
                                    p.snsName = sns.content;
                                    console.log(`[Debug] -> Set snsName: ${sns.content}`);
                                }
                            }
                            if (data.handleId) { 
                                const handle = await validateAndGetData(data.handleId, mainIdAddress); 
                                if (handle.ok) {
                                    p.handleName = handle.content;
                                    console.log(`[Debug] -> Set handleName: ${handle.content}`);
                                }
                            }
                            if (data.pfpId) { 
                                console.log(`[Debug] -> Processing pfpId: ${data.pfpId}`);
                                const pfp = await validateAndGetData(data.pfpId, mainIdAddress); 
                                if (pfp.ok) {
                                    p.pfpId = pfp.id;
                                    console.log(`[Debug] -> Set pfpId: ${pfp.id}`);
                                } else {
                                    // Store the raw pfpId even if validation fails - let future edits fix it
                                    p.pfpId = data.pfpId;
                                    console.log(`[Debug] -> Stored raw pfpId for future correction: ${data.pfpId}`);
                                }
                            }
                            
                            personaTimestamps[persona] = timestamp;
                            console.log(`[Debug] -> New state for '${persona}':`, JSON.parse(JSON.stringify(p)));
                            break;
                        case 'delete':
                            console.log(`[Debug] -> Action 'delete' for persona '${persona}'.`);
                            delete personas[persona];
                            delete personaTimestamps[persona];
                            break;
                    }
                    }
                }

                // Handle Color updates (check for 'o' instead of 'op' and case-insensitive 'p')
                if (content.p && content.p.toLowerCase() === 'brc333' && content.o === 'color') {
                    console.log(`[Debug] -> Valid color inscription found.`);
                    if (content.background && content.pfp === null) {
                        generalColors.background = content.background;
                        console.log(`[Debug] -> Set general background color: ${content.background}`);
                    }
                    if (content.pfp === -1) {
                        generalColors.pfp.all = content.background;
                        console.log(`[Debug] -> Set all PFP background color: ${content.background}`);
                    }
                    if (typeof content.pfp === 'number' && content.pfp >= 0) {
                        generalColors.pfp[content.pfp] = content.background;
                         console.log(`[Debug] -> Set PFP index ${content.pfp} background color: ${content.background}`);
                    }
                } else if (typeof content === 'string') {
                    const trimmed = content.trim();
                    if (timestamp > latestStandaloneNameTimestamp) {
                        if (trimmed.endsWith('.meta') || trimmed.endsWith('.sats')) standaloneNames.snsName = trimmed;
                        if (trimmed.startsWith('@')) standaloneNames.handleName = trimmed;
                        latestStandaloneNameTimestamp = timestamp;
                    }
                }
            })();
        }
    } catch (error) {
        console.error("Error building comprehensive profile state:", error);
    }

    // ---- Log all personas after processing all reinscriptions ----
    console.log('[Debug] === ALL PERSONAS AFTER PROCESSING ALL REINSCRIPTIONS ===');
    console.log('[Debug] Total personas found:', Object.keys(personas).length);
    Object.keys(personas).forEach(personaName => {
        console.log(`[Debug] Persona '${personaName}':`, JSON.parse(JSON.stringify(personas[personaName])));
        console.log(`[Debug] Persona '${personaName}' timestamp:`, personaTimestamps[personaName]);
        console.log(`[Debug] Persona '${personaName}' pfpId:`, personas[personaName].pfpId);
        console.log(`[Debug] Persona '${personaName}' pfpId type:`, typeof personas[personaName].pfpId);
    });
    console.log('[Debug] === END PERSONA DUMP ===');

    // ---- Determine Active Persona and Final Profile ----
    const allPersonaNames = Object.keys(personas);

    // Sort by order (asc), then by timestamp (asc) for ties, then by inscription order
    allPersonaNames.sort((nameA, nameB) => {
        const personaA = personas[nameA];
        const personaB = personas[nameB];
        const orderA = personaA.order ?? Number.MAX_SAFE_INTEGER; // No order = lowest priority
        const orderB = personaB.order ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
            return orderA - orderB; // Lower order = higher priority
        }
        // If orders are equal, use timestamp (earlier = higher priority)
        return personaTimestamps[nameA] - personaTimestamps[nameB];
    });

    const primaryPersonaName = allPersonaNames.length > 0 ? allPersonaNames[0] : null;
    console.log(`[Debug] Sorted persona order: [${allPersonaNames.join(', ')}]. Primary is: ${primaryPersonaName}`);
    const primaryPersona = primaryPersonaName ? personas[primaryPersonaName] : null;

    // Merge Data for Final Display Profile (Persona > General > Default)
    const finalProfile = {
        headline: primaryPersona?.headline || null,
        pfpId: primaryPersona?.pfpId || null,
        snsName: primaryPersona?.snsName || standaloneNames.snsName,
        handleName: primaryPersona?.handleName || standaloneNames.handleName,
        colors: {
            background: primaryPersona?.colors?.background || generalColors.background,
            pfp: { ...generalColors.pfp, ...(primaryPersona?.colors?.pfp || {}) }
        }
    };

    console.log('[Debug] Final merged profile data:', finalProfile);
    console.log('[Debug] Final pfpId value:', finalProfile.pfpId);
    console.log('[Debug] Final pfpId type:', typeof finalProfile.pfpId);

    // Return a structured object with all personas for cycling
    return {
        headline: finalProfile.headline,
        pfpId: finalProfile.pfpId,
        colors: finalProfile.colors,
        names: {
            snsName: finalProfile.snsName,
            handleName: finalProfile.handleName
        },
        // Add all personas for cycling mechanism
        personas: allPersonaNames.map(name => ({
            name: name,
            data: personas[name],
            timestamp: personaTimestamps[name],
            order: personas[name].order ?? Number.MAX_SAFE_INTEGER
        }))
    };
}

async function fetchAllReinscriptionData(satoshi) {
    console.log(`[Debug] Fetching all reinscription data for sat: ${satoshi}`);
    const data = {
        directImages: [],
        directNames: [],
        profileReferences: []
    };

    if (!satoshi) return data;

    try {
        const inscriptionIds = await getInscriptionsForSat(satoshi);
        
        for (const id of inscriptionIds) {
            const [rawContent, meta] = await Promise.all([
                getInscriptionContent(id),
                getMetadata(`https://ordinals.com/r/inscription/${id}`)
            ]);

            if (!meta) continue;

            const item = {
                id,
                contentType: meta.content_type,
                timestamp: meta.timestamp,
                address: meta.address,
                content: rawContent
            };

            if (meta.content_type.startsWith('image/')) {
                data.directImages.push(item);
            } else if (meta.content_type.startsWith('text/')) {
                const trimmed = rawContent.trim();
                if (trimmed.startsWith('@') || trimmed.endsWith('.meta') || trimmed.endsWith('.sats')) {
                    data.directNames.push(item);
                }
            } else if (meta.content_type === 'application/json') {
                try {
                    const profileContent = JSON.parse(rawContent);
                    if (profileContent.p && profileContent.p.toLowerCase() === 'brc333' && profileContent.op === 'profile') {
                        const refs = [];
                        if(profileContent.pfpId) refs.push({type: 'PFP', id: profileContent.pfpId});
                        if(profileContent.snsId) refs.push({type: 'SNS', id: profileContent.snsId});
                        if(profileContent.handleId) refs.push({type: 'Handle', id: profileContent.handleId});
                        
                        data.profileReferences.push({
                            profileId: id,
                            persona: profileContent.persona,
                            references: refs
                        });
                    }
                } catch(e) { /* ignore parse error */ }
            }
        }
    } catch (error) {
        console.error("Error fetching reinscription data:", error);
    }
    
    console.log('[Debug] Fetched reinscription data:', data);
    return data;
}

function displayReinscriptionData(data) {
    let html = `<div class="human-readable-container">
        <h1 class="title">All On-Sat Data</h1>`;

    // Direct Images
    html += '<h2>Directly Inscribed Images</h2>';
    if (data.directImages.length > 0) {
        html += '<ul class="attestor-list">';
        data.directImages.forEach(item => {
            html += `<li>
                <div class="attestor-name">Image: ${item.id}</div>
                <div><a href="https://ordinals.com/content/${item.id}" target="_blank"><img src="${baseUrl}/content/${item.id}" style="max-width: 100px; max-height: 100px; border: 1px solid #fff;"></a></div>
                <div class="attestor-detail"><b>Content Type:</b> <span>${item.contentType}</span></div>
                <div class="attestor-detail"><b>Owner:</b> <span style="font-size: 0.8em; word-break: break-all;">${item.address}</span></div>
            </li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>None found.</p>';
    }

    // Direct Names
    html += '<h2>Directly Inscribed Names</h2>';
    if (data.directNames.length > 0) {
        html += '<ul class="attestor-list">';
        data.directNames.forEach(item => {
            html += `<li>
                <div class="attestor-name">${item.content}</div>
                <div class="attestor-detail"><b>Inscription ID:</b> <span>${item.id}</span></div>
                <div class="attestor-detail"><b>Owner:</b> <span style="font-size: 0.8em; word-break: break-all;">${item.address}</span></div>
            </li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>None found.</p>';
    }

    // Profile References
    html += '<h2>Profile-Referenced Items</h2>';
    if (data.profileReferences.length > 0) {
        html += '<ul class="attestor-list">';
        data.profileReferences.forEach(item => {
            html += `<li>
                <div class="attestor-name">From Profile: ${item.profileId} (Persona: <b>${item.persona}</b>)</div>`;
            item.references.forEach(ref => {
                 html += `<div class="attestor-detail" style="margin-left: 20px;"><b>${ref.type}:</b> <span><a href="https://ordinals.com/inscription/${ref.id}" target="_blank">${ref.id}</a></span></div>`;
            });
            html += `</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>None found.</p>';
    }

    html += '</div>';
    displayGenericContent(html);
}

async function fetchBridgerName(satoshi) {
    if (!satoshi) return "Anonymous";

    if (testing) {
        return "daveed.meta";
    }

    try {
        const inscriptionIds = await getInscriptionsForSat(satoshi);
        // Iterate backwards to find the latest
        for (let i = inscriptionIds.length - 1; i >= 0; i--) {
            const id = inscriptionIds[i];
            try {
                const content = await getInscriptionContent(id);
                if (typeof content === 'string' && (content.trim().startsWith('@') || content.trim().endsWith('.meta') || content.trim().endsWith('.sats'))) {
                    return content.trim();
                }
            } catch (err) {
                console.warn(`Could not fetch content for ${id} while checking for Bridger name:`, err);
            }
        }
    } catch (error) {
        console.error("Failed to fetch inscriptions for Bridger name:", error);
    }
    
    return "Anonymous"; // Default if none found
}

// EXPOSE FUNCTIONS TO GLOBAL SCOPE
window.ID = {
    generateGradientFromId,
    toRoman,
    populateCardData,
    updateCredentialCounts,
    showPrefaceView,
    switchToIdCardView,
    switchToPrefaceView,
    setupCardInteractivity,
    setView,
    handleHashChange,
    processAttestors,
    fetchAttestations,
    fetchCardProfileData,
    fetchNamesFromSat,
    setupIdInfoModal,
    showFilteredPrefaceView,
    showGenericModal,
    setupGenericModal,
    fetchNamesFromParent,
    displayJsonContent,
    displayGenericContent,
    displayHumanReadableAttestors,
    loadPFPImages,
    fetchAllReinscriptionData,
    displayReinscriptionData,
    fetchBridgerName
};

/**
 * USAGE EXAMPLES:
 * 
 * // Generate gradient from inscription ID
 * const gradient = generateGradientFromId("abc123def456i0");
 * 
 * // Convert number to Roman numeral
 * const level = toRoman(3); // Returns "III"
 * 
 * // Populate card with user data
 * populateCardData({
 *     bridgerName: "daveed.meta",
 *     date: "2024-01-15",
 *     block: 12345,
 *     level: 2,
 *     satoshi: 1234567890,
 *     inscriptionId: "abc123...i0"
 * });
 * 
 * // Update credential counts
 * updateCredentialCounts(); // Reads from global articles array
 * 
 * // Switch between views
 * switchToIdCardView(); // Show ID card
 * switchToPrefaceView(); // Show credentials list
 * 
 * // Show filtered credentials
 * showFilteredPrefaceView("PEARL"); // Show only PEARL credentials
 * 
 * // Display modal with information
 * showGenericModal("Inscription ID", "abc123def456...i0");
 * 
 * // Process hash navigation
 * handleHashChange(articles); // Handle URL hash changes
 * 
 * // Setup card interactivity
 * setupCardInteractivity(1234567890); // Setup click handlers and PFPs
 * 
 * // Display attestors in human-readable format
 * displayHumanReadableAttestors(validAttestors);
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

// --- Minimal fix: updateNameDisplay always updates and hides if empty ---
function updateNameDisplay(snsName, handleName) {
    const snsElement = document.getElementById('sns-name');
    const handleElement = document.getElementById('handle-name');
    if (snsElement) {
        snsElement.textContent = (snsName && snsName !== 'N/A') ? snsName : '';
        snsElement.style.display = snsElement.textContent ? 'block' : 'none';
    }
    if (handleElement) {
        handleElement.textContent = (handleName && handleName !== 'N/A') ? handleName : '';
        handleElement.style.display = handleElement.textContent ? 'block' : 'none';
    }
}
