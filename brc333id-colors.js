/**
 * BRC333 ID Colors Module
 * 
 * This module provides color management functionality for BRC333 Overweb ID cards.
 * It handles color input modals, fetching color inscriptions from the blockchain,
 * and applying background colors based on BRC-333 color protocol.
 * 
 * Usage:
 * <script src="https://natowls.xyz/brc333id-colors.js"></script>
 * 
 * Functions:
 * - showColorInputModal(): Shows color input modal
 * - fetchColorInscriptions(): Fetches and processes BRC-333 color inscriptions
 * - processColorInscription(content, inscriptionId): Processes color inscription data
 * - testColorInscription(inscriptionId): Test function for color inscriptions
 * 
 * @author BRC333 Protocol
 * @version 1.0.0
 */

// Color input modal
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
        max-width: 300px;
        width: 90%;
        color: black;
    `;
    
    content.innerHTML = `
        <h3 style="color: black; margin-bottom: 20px;">Set Background Color</h3>
        <p style="color: black; margin-bottom: 15px;">Enter 6-digit hex color:</p>
        <div style="display: flex; align-items: center; justify-content: center; margin: 15px 0;">
            <span style="color: black; font-size: 18px; font-weight: bold; margin-right: 5px;">#</span>
            <input type="text" id="colorInput" placeholder="ff0000" maxlength="6"
                   style="width: 120px; padding: 8px; border: 2px solid black; border-radius: 5px; font-size: 16px; text-align: center; text-transform: uppercase;">
        </div>
        <div style="margin: 20px 0;">
            <button id="setColorBtn" onclick="setColorFromInput()" style="margin: 0 10px; padding: 10px 20px; background: black; color: white; border: none; border-radius: 5px; cursor: pointer;">Set Color</button>
            <button onclick="closeColorModal()" style="margin: 0 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Get references to input and button for live preview
    const colorInput = document.getElementById('colorInput');
    const setColorBtn = document.getElementById('setColorBtn');
    
    // Add input event listener for live preview
    colorInput.addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase();
        
        // Only allow hex characters
        value = value.replace(/[^0-9A-F]/g, '');
        
        // Limit to 6 characters
        if (value.length > 6) {
            value = value.substring(0, 6);
        }
        
        e.target.value = value;
        
        // Update live preview if we have 6 valid hex digits
        if (value.length === 6) {
            const fullColor = '#' + value;
            setColorBtn.style.backgroundColor = fullColor;
            colorInput.style.borderColor = fullColor;
        } else {
            // Reset to default black colors if not valid
            setColorBtn.style.backgroundColor = 'black';
            colorInput.style.borderColor = 'black';
        }
    });
    
    // Focus on input
    setTimeout(() => {
        colorInput.focus();
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
    const value = input.value.trim().toUpperCase();
    
    if (/^[0-9A-F]{6}$/.test(value)) {
        const fullColor = '#' + value;
        document.body.style.backgroundColor = fullColor;
        if (typeof currentBackgroundColor !== 'undefined') {
            currentBackgroundColor = fullColor;
        }
        console.log('Background color set to:', fullColor);
        closeColorModal();
    } else {
        alert('Please enter exactly 6 hex digits (e.g., FF0000)');
    }
}

// Function to fetch and process BRC-333 color inscriptions
async function fetchColorInscriptions() {
    try {
        // Get the current inscription ID from the URL or from the global variable
        let inscriptionId = null;
        
        // Try to get from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        inscriptionId = urlParams.get('id');
        
        // If not in URL, try to get from the global inscriptionId variable
        if (!inscriptionId && window.inscriptionId) {
            inscriptionId = window.inscriptionId;
        }
        
        // If still not found, try to extract from the current page URL
        if (!inscriptionId) {
            const pathParts = window.location.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.includes('i') && lastPart.length > 20) {
                inscriptionId = lastPart;
            }
        }
        
        console.log('[Debug] fetchColorInscriptions - inscriptionId:', inscriptionId);
        
        // Only skip if we don't have a valid inscription ID
        if (!inscriptionId || inscriptionId.includes('.htm')) {
            console.log('[Debug] Invalid inscription ID, skipping color inscription fetch');
            return;
        }
        
        // Get the satoshi number for this inscription
        const inscriptionResponse = await fetch(`https://ordinals.com/r/inscription/${inscriptionId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!inscriptionResponse.ok) {
            console.log('[Debug] Failed to fetch inscription data:', inscriptionResponse.status);
            return;
        }
        
        const inscriptionData = await inscriptionResponse.json();
        const satoshi = inscriptionData.sat;
        
        console.log('[Debug] fetchColorInscriptions - satoshi:', satoshi);
        
        // Fetch inscriptions from the same satoshi using the correct API endpoint
        const response = await fetch(`https://ordinals.com/r/sat/${satoshi}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log('[Debug] Failed to fetch inscriptions for satoshi:', response.status);
            return;
        }
        
        const inscriptions = await response.json();
        console.log('[Debug] fetchColorInscriptions - raw response:', inscriptions);
        console.log('[Debug] fetchColorInscriptions - inscriptions found:', inscriptions.length);
        
        // Check if inscriptions is an array
        if (!Array.isArray(inscriptions)) {
            console.log('[Debug] Response is not an array, checking structure:', typeof inscriptions);
            if (inscriptions && inscriptions.ids) {
                console.log('[Debug] Found inscriptions.ids array:', inscriptions.ids);
                // Use the ids array if available
                for (const inscriptionId of inscriptions.ids) {
                    console.log('[Debug] Processing inscription ID:', inscriptionId);
                    try {
                        const contentResponse = await fetch(`https://ordinals.com/content/${inscriptionId}`);
                        const content = await contentResponse.json();
                        
                        console.log('[Debug] JSON content:', content);
                        
                        if (content.p === 'brc333' && content.o === 'color') {
                            console.log('[Debug] Found BRC-333 color inscription:', inscriptionId);
                            processColorInscription(content, inscriptionId);
                        }
                    } catch (error) {
                        console.log('Error processing inscription:', inscriptionId, error);
                    }
                }
                return;
            } else {
                console.log('[Debug] No valid inscriptions data found');
                return;
            }
        }
        
        // Process each inscription for BRC-333 color data (if it's an array)
        for (const inscription of inscriptions) {
            console.log('[Debug] Processing inscription:', inscription.id, 'content_type:', inscription.content_type);
            if (inscription.content_type === 'application/json') {
                try {
                    const contentResponse = await fetch(`https://ordinals.com/content/${inscription.id}`);
                    const content = await contentResponse.json();
                    
                    console.log('[Debug] JSON content:', content);
                    
                    if (content.p === 'brc333' && content.o === 'color') {
                        console.log('[Debug] Found BRC-333 color inscription:', inscription.id);
                        processColorInscription(content, inscription.id);
                    }
                } catch (error) {
                    console.log('Error processing inscription:', inscription.id, error);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching color inscriptions:', error);
    }
}

function processColorInscription(content, inscriptionId) {
    const { background, pfp } = content;
    
    if (background && /^#[0-9a-fA-F]{6}$/.test(background)) {
        if (pfp === null) {
            // Set for all screens
            defaultBackgroundColor = background;
            document.body.style.backgroundColor = background;
            console.log('Default background color set from inscription:', inscriptionId, background);
        } else if (pfp === -1) {
            // Set for all PFPs only
            pfpBackgroundColors['all'] = background;
            console.log('PFP background color set from inscription:', inscriptionId, background);
        } else if (typeof pfp === 'number' && pfp >= 0) {
            // Set for specific PFP index
            pfpBackgroundColors[pfp] = background;
            console.log(`PFP ${pfp} background color set from inscription:`, inscriptionId, background);
        }
    }
}

// Initialize color system
document.addEventListener('DOMContentLoaded', function() {
    // Color system is now initialized in initSatplication after inscriptionId is available
});

// Background click handler for random color
document.addEventListener('click', function(event) {
    if (event.target === document.body) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
        currentBackgroundColor = randomColor; // Store the current color
        console.log('Background color changed to:', randomColor);
    }
});

// Manual test function for color inscriptions
async function testColorInscription(inscriptionId) {
    console.log('[Debug] Testing color inscription with ID:', inscriptionId);
    
    try {
        // Get the satoshi number for this inscription
        const inscriptionResponse = await fetch(`https://ordinals.com/r/inscription/${inscriptionId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const inscriptionData = await inscriptionResponse.json();
        const satoshi = inscriptionData.sat;
        
        console.log('[Debug] Test - satoshi:', satoshi);
        
        // Fetch inscriptions from the same satoshi
        const response = await fetch(`https://ordinals.com/api/inscriptions?sat=${satoshi}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const inscriptions = await response.json();
        
        console.log('[Debug] Test - inscriptions found:', inscriptions.length);
        
        // Process each inscription for BRC-333 color data
        for (const inscription of inscriptions) {
            console.log('[Debug] Test - Processing inscription:', inscription.id, 'content_type:', inscription.content_type);
            if (inscription.content_type === 'application/json') {
                try {
                    const contentResponse = await fetch(`https://ordinals.com/content/${inscription.id}`);
                    const content = await contentResponse.json();
                    
                    console.log('[Debug] Test - JSON content:', content);
                    
                    if (content.p === 'brc333' && content.o === 'color') {
                        console.log('[Debug] Test - Found BRC-333 color inscription:', inscription.id);
                        processColorInscription(content, inscription.id);
                    }
                } catch (error) {
                    console.log('Error processing inscription:', inscription.id, error);
                }
            }
        }
    } catch (error) {
        console.error('Error testing color inscription:', error);
    }
}

// Initialize color system
window.fetchColorInscriptions = fetchColorInscriptions;
console.log("BRC333 ID Colors module loaded and ready for natowls.xyz deployment");

// Expose functions to global scope for natowls.xyz usage
window.Colors = {
    showColorInputModal,
    closeColorModal,
    setColorFromInput,
    fetchColorInscriptions,
    processColorInscription,
    testColorInscription
}; 