/**
 * BRC333 ID Layout Module
 * 
 * This module contains HTML templates, CSS styles, and layout-related functions
 * for the Overweb ID card interface.
 * 
 * Usage Examples:
 * - cardHTML: Main HTML structure for the ID card
 * - cardCSS: Complete CSS styling for the interface
 * - updateCardUI(details): Updates card with user details
 * - fitText(element, maxEm, minEm): Auto-sizes text to fit container
 * - showLoadingGif(container): Shows loading animation
 * 
 * Deployed at: https://natowls.xyz/brc333id-layout.js
 */

// HTML TEMPLATES
const cardHTML = `
    <div id="overweb-id-card-container">
        <div id="overweb-id-card-wrapper">
            <div id="overweb-id-card">
                <div id="image-panel"></div>
                <div id="card-right">
                    <h2 class="card-title" id="card-title-text">OVERWEB ID</h2>
                    <div class="card-subtitle" id="card-subtitle-text"></div>
                    <div id="card-scrollable-content">
                        <div class="card-details">
                            <div class="detail-row" id="sns-row"><span class="detail-label">SNS</span><span id="sns-name" class="detail-value"></span></div>
                            <div class="detail-row" id="handle-row"><span class="detail-label">Handle</span><span id="handle-name" class="detail-value"></span></div>
                            <div class="detail-row"><span class="detail-label" id="bridger-no-label-text">Bridger No.</span><span id="bridger-no" class="detail-value"></span></div>
                            <div class="detail-row" id="level-row"><span class="detail-label">Level</span><span id="level" class="detail-value"></span></div>
                            <div class="detail-row" id="credentials-row">
                                <span class="detail-label">Credentials</span>
                                <span class="detail-value" id="credentials-field"><span class="spinner"></span></span>
                            </div>
                            <div class="detail-row" id="badges-row">
                                <span class="detail-label">Badges</span>
                                <span class="detail-value" id="badges-field"><span class="spinner"></span></span>
                            </div>
                            <div class="detail-row" id="microcreds-row">
                                <span class="detail-label">Microcreds</span>
                                <span class="detail-value" id="microcreds-field"><span class="spinner"></span></span>
                            </div>
                        </div>
                        <div id="headline-container">
                            <p id="headline-text"></p>
                        </div>
                    </div>
                    <div id="tech-details">
                        <div class="detail-row-small"><span class="detail-label-small">Protocol</span><span id="protocol" class="detail-value-small"></span></div>
                        <div class="detail-row-small"><span class="detail-label-small">Date</span><span id="date" class="detail-value-small"></span></div>
                        <div class="detail-row-small"><span class="detail-label-small">Block</span><span id="block" class="detail-value-small"></span></div>
                        <div class="detail-row-small" id="inscription-id-row"><span class="detail-label-small">Id</span><span id="inscription-id" class="detail-value-small"></span></div>
                        <div class="detail-row-small"><span class="detail-label-small">Satoshi</span><span id="satoshi" class="detail-value-small"></span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="preface-container" style="display: none;">
        <span id="preface-close">&times;</span>
        <div class="container">
            <h1 class="title"></h1>
            <div class="preface" id="preface"></div>
            <div class="content" id="content"></div>
        </div>
    </div>
    <div id="generic-modal" style="display: none;">
        <div id="generic-modal-content">
            <span id="generic-modal-close">&times;</span>
            <p id="generic-modal-title"></p>
            <textarea id="generic-modal-textarea" readonly></textarea>
            <p id="copy-instruction">To copy: Command-C (Mac) or Ctrl+C (Windows)</p>
        </div>
    </div>
    <div id="id-info-modal" style="display: none;">
        <div id="id-info-modal-content">
            <span id="id-info-modal-close">&times;</span>
            <div id="id-info-modal-text"></div>
        </div>
    </div>
    <div id="meta-communities-modal" style="display:none;">
        <div class="meta-communities-modal-content">
            <span class="meta-communities-close" id="meta-communities-close">&times;</span>
            <h2 id="meta-communities-title">&#11088; Meta-Communities</h2>
            <input type="text" id="meta-communities-search" placeholder="Search communities..." />
            <div id="meta-communities-list"></div>
            <button id="meta-communities-close-btn">Close</button>
        </div>
    </div>`;

// CSS STYLES
const cardCSS = `
    #overweb-id-card-container {
        /* Fixed positioning to center in viewport */
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99;
    }
    #preface-container.active {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-color: #000;
        z-index: 100;
    }
    #preface-close {
        display: none; /* Hidden by default */
        position: absolute;
        top: 15px;
        right: 35px;
        font-size: 40px;
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        z-index: 101;
    }
    #preface-close:hover {
        color: #aaa;
    }
    #overweb-id-card-wrapper {
        width: 90vmin; /* Responsive width based on viewport's smaller dimension */
        max-width: 700px; /* Max size for large screens */
        max-height: 400px;
        aspect-ratio: 7 / 4; /* Maintain the original aspect ratio */
    }
    #overweb-id-card { 
        background-color: #1a1a1a; 
        border-radius: 20px; 
        display: flex; 
        width: 100%; 
        height: 100%; 
        border: 1px solid #333; 
        overflow: hidden; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-size: 2.2vmin; /* Make font size responsive */
    }
    #image-panel { 
        width: 57.14%; /* (400px / 700px) * 100% */
        flex-shrink: 0; 
        background: linear-gradient(135deg, #ff0000, #0000ff); 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        cursor: pointer; 
        position: relative; 
    }
    #image-panel img, #image-panel iframe, #image-panel #qr-code-container, #image-panel #logo-container, #image-panel .html-inscription-container { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        position: absolute; 
        top: 0; 
        left: 0; 
        justify-content: center; 
        align-items: center; 
        border: none; 
    }
    /* Hide all PFP elements by default */
    #image-panel .pfp-hidden {
        display: none !important;
    }
    
    /* Show only active PFP elements */
    #image-panel .pfp-active {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
    }
    /* Ensure all PFP elements can receive hover events when displayed */
    #image-panel img[style*="display: flex"], 
    #image-panel iframe[style*="display: flex"],
    #image-panel #qr-code-container[style*="display: flex"],
    #image-panel #logo-container[style*="display: flex"],
    #image-panel .html-inscription-container[style*="display: flex"],
    #image-panel img:not([style*="display: none"]):not([style=""]),
    #image-panel iframe:not([style*="display: none"]):not([style=""]),
    #image-panel .html-inscription-container:not([style*="display: none"]):not([style=""]) { 
        pointer-events: auto; 
        z-index: 10; 
        transition: transform 0.2s ease-out !important;
    }
    /* Add hover bulge effect to all PFP elements - more specific selectors */
    #image-panel img[style*="display: flex"]:hover,
    #image-panel iframe[style*="display: flex"]:hover,
    #image-panel #qr-code-container[style*="display: flex"]:hover,
    #image-panel #logo-container[style*="display: flex"]:hover,
    #image-panel .html-inscription-container[style*="display: flex"]:hover,
    #image-panel img:not([style*="display: none"]):not([style=""]):hover,
    #image-panel iframe:not([style*="display: none"]):not([style=""]):hover,
    #image-panel .html-inscription-container:not([style*="display: none"]):not([style=""]):hover {
        transform: scale(1.05) !important;
    }
    /* Specific class-based selectors for PFP images */
    #image-panel .pfp-image {
        transition: transform 0.2s ease-out !important;
    }
    #image-panel .pfp-image:hover {
        transform: scale(1.05) !important;
    }

    #image-panel iframe.html-inscription {
        width: 800px; /* Larger viewport for scaling */
        height: 800px;
        transform: scale(0.65); /* Zoom in on the content 0.65 */
        transform-origin: top left;
        pointer-events: none; /* Ignore mouse events */
    }
    #logo-container { 
        background-image: url('https://ordinals.com/content/a428edcb46884cee08efb81400ad95c1a33194829b197e5009ab86274e427c1ai0'); 
        background-size: cover; 
        background-position: center; 
        transition: transform 0.2s ease-out;
        z-index: 10; /* Ensure it's on top for hover events */
        pointer-events: auto; /* Ensure it can receive hover events */
    }
    #logo-container:hover { 
        transform: scale(1.05); 
    }
    #bridger-no-overlay { position: relative; left: 3px; color: white; font-size: 3em; font-weight: bold; font-family: 'Chivo', sans-serif; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
    #qr-code-container { padding: 20px; box-sizing: border-box; display: flex; background-color: #1a1a1a; justify-content: center; align-items: center; }
    #card-right {
        padding: 1.2em; /* Use em for scalable padding */
        color: #f0ead6;
        height: 100%;
        box-sizing: border-box;
        width: 42.86%; /* (300px / 700px) * 100% */
        overflow: hidden; /* Prevent children from expanding the container */
        display: flex;
        flex-direction: column;
    }
    .card-title {
        font-size: 2.2em;
        font-weight: bold;
        letter-spacing: 4px;
        text-align: left;
        margin: 0;
        color: #fff;
        font-family: 'Chivo', sans-serif;
        white-space: nowrap; /* Prevent wrapping */
        overflow: hidden; /* Hide overflow until JS resizes */
        text-overflow: ellipsis; /* Fallback if JS fails */
        flex-shrink: 0;
    }
    .card-subtitle {
        font-size: 0.9em;
        color: #aaa;
        margin: 2px 0 12px 0;
        line-height: 1.1;
        white-space: nowrap; /* Prevent wrapping */
        overflow: hidden; /* Hide overflow until JS resizes */
        text-overflow: ellipsis; /* Fallback if JS fails */
        flex-shrink: 0;
    }
    #card-scrollable-content {
        flex-grow: 1;
        overflow-y: auto;
        min-height: 0;
        margin-bottom: 1em; /* Use em */
        scrollbar-width: thin;
        scrollbar-color: #555 #2a2a2a;
        position: relative;
    }
    #card-scrollable-content::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2em; /* Use em */
        background: linear-gradient(to bottom, rgba(26, 26, 26, 0), rgba(26, 26, 26, 1));
        pointer-events: none;
        transition: opacity 0.2s;
    }
    #card-scrollable-content.scrolled-to-bottom::after {
        opacity: 0;
    }
    #card-scrollable-content::-webkit-scrollbar {
        width: 0.5em; /* Use em */
    }
    #card-scrollable-content::-webkit-scrollbar-track {
        background: #2a2a2a;
    }
    #card-scrollable-content::-webkit-scrollbar-thumb {
        background-color: #555;
        border-radius: 0.25em; /* Use em */
    }
    .card-details { margin: 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.2em; font-size: 0.9em; line-height: 1.2; }
    /* Set SNS through microcredentials rows to smaller fixed size */
    #sns-row, #handle-row, #credentials-row, #badges-row, #microcreds-row, #meta-communities-link { 
        font-size: 1.6vmin !important; /* Smaller fixed size for better fit */
    }
    /* Also set Bridger No and Level rows to smaller fixed size */
    .detail-row:has(#bridger-no), .detail-row:has(#level) {
        font-size: 1.6vmin !important;
    }
    /* Fallback for browsers that don't support :has() */
    .detail-row:nth-child(3), .detail-row:nth-child(4) {
        font-size: 1.6vmin !important;
    }
    #sns-row .detail-label, #sns-row .detail-value,
    #handle-row .detail-label, #handle-row .detail-value,
    #credentials-row .detail-label, #credentials-row .detail-value,
    #badges-row .detail-label, #badges-row .detail-value,
    #microcreds-row .detail-label, #microcreds-row .detail-value { 
        font-size: 1em !important; /* 1em relative to parent fixed size */
    }
    .detail-label { color: #aaa; margin-right: 0.5em; }
    .detail-value { color: #fff; font-weight: bold; }
    .detail-value[style*="cursor: pointer"]:hover { color: #f0c420; }
    .lower-details { background-color: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-top: 15px; }
    .detail-row-small { display: flex; justify-content: space-between; margin-bottom: 1px; font-size: 0.9em; line-height: 1.3; }
    .detail-label-small { color: #aaa; }
    .detail-value-small { color: #fff; font-weight: normal; }
    .spinner {
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #fff;
        border-radius: 50%;
        width: 1em; /* Use em */
        height: 1em; /* Use em */
        animation: spin 1s linear infinite;
        display: inline-block;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    #microcreds-row[style*="cursor: pointer"]:hover .detail-label, 
    #microcreds-row[style*="cursor: pointer"]:hover .detail-value { color: #00BFFF; }
    .card-footer { background-color: rgba(128, 128, 128, 0.1); border-radius: 10px; padding: 15px; font-size: 0.8em; }
    .card-footer .detail-row { margin-bottom: 5px; font-size: 1em; }
    .card-footer .detail-row:last-child { margin-bottom: 0; }
    .container { width: 100%; max-width: 900px; margin: 0 auto; padding: 20px; box-sizing: border-box; color: #F0EAD6; }
    #tech-details {
        background-color: #2a2a2a;
        padding: 0.5em 0.6em; /* Use em */
        border-radius: 0.6em; /* Use em */
        font-size: 0.8em;
        flex-shrink: 0;
    }
    #tech-details .detail-row {
        margin-bottom: 1px;
    }
    #microcreds-field, #badges-field, #inscription-id, #credentials-field {
        cursor: pointer;
    }
    #microcreds-field:hover .detail-value,
    #badges-field:hover .detail-value,
    #credentials-field:hover .detail-value,
    #inscription-id:hover {
        color: #00BFFF;
    }
    .detail-value {
        transition: color 0.3s;
    }
    #generic-modal {
        display: none;
        position: fixed;
        z-index: 101;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
    }
    #generic-modal-content {
        background-color: #2a2a2a;
        padding: 20px;
        border: 1px solid #555;
        border-radius: 10px;
        width: 80%;
        max-width: 600px;
        text-align: center;
        position: relative;
        color: #f0ead6;
    }
    #generic-modal-close {
        color: #aaa;
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    #generic-modal-textarea {
        width: 100%;
        background: #1a1a1a;
        color: #f0ead6;
        border: 1px solid #444;
        border-radius: 5px;
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 10px;
        resize: none;
        text-align: center;
    }
    #copy-instruction {
        font-size: 0.9em;
        color: #aaa;
    }
    .article-content a, .preface a {
        color: var(--color-primary, #00BFFF);
        text-decoration: underline;
    }
    .article-content a:hover, .preface a:hover {
        color: var(--color-primary-hover, #33CCFF);
    }
    #id-info-modal {
        display: none;
        position: fixed;
        z-index: 105;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
    }
    #id-info-modal-content {
        background-color: #2a2a2a;
        padding: 30px;
        border: 1px solid #555;
        border-radius: 10px;
        width: 80%;
        max-width: 700px;
        text-align: left;
        position: relative;
        color: #f0ead6;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    #id-info-modal-close {
        color: #aaa;
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    #id-info-modal-text h1, #id-info-modal-text h2 {
        text-align: center;
    }
    #id-info-modal-text .normal, #id-info-modal-text ul {
        font-size: 1em;
    }
    #id-info-modal-text .bold {
        font-weight: bold;
    }
    #badges-row[style*="cursor: pointer"]:hover .detail-label, 
    #badges-row[style*="cursor: pointer"]:hover .detail-value,
    #credentials-row[style*="cursor: pointer"]:hover .detail-label, 
    #credentials-row[style*="cursor: pointer"]:hover .detail-value {
      color: #00BFFF;
    }
    /* Level row styling - only when level > 1 */
    #level-row.clickable { cursor: pointer; }
    #level-row.clickable:hover .detail-label, #level-row.clickable:hover .detail-value {
      color: #00BFFF;
    }
    #sns-row, #handle-row, #inscription-id-row { cursor: pointer; }
    #sns-row:hover .detail-label, #sns-row:hover .detail-value,
    #handle-row:hover .detail-label, #handle-row:hover .detail-value,
    #inscription-id-row:hover .detail-label-small, #inscription-id-row:hover .detail-value-small {
        color: #00BFFF;
    }
    .human-readable-container {
        padding: 20px;
        color: #f0ead6;
    }
    .human-readable-container .title {
        font-size: 2em;
        margin-bottom: 20px;
        color: #fff;
        border-bottom: 1px solid #555;
        padding-bottom: 10px;
    }
    .attestor-list {
        list-style: none;
        padding: 0;
    }
    .attestor-list li {
        background-color: #2a2a2a;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        border: 1px solid #444;
    }
    .attestor-name {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 10px;
        color: #00BFFF;
    }
    .attestor-detail {
        margin-bottom: 5px;
    }
    .attestor-detail b {
        color: #aaa;
    }
    #headline-container {
        padding-top: 5px;
        margin-top: 5px;
        border-top: 1px solid #444;
    }
    #headline-text {
        font-size: 0.75em;
        line-height: 1.4;
        color: #aaa;
        margin: 0;
        text-align: left;
    }
    #card-right #headline-text strong {
        font-weight: 400 !important;
        color: #fff !important;
    }
    #card-right #headline-text i {
        font-style: italic !important;
        color: #00BFFF !important;
    }
    #headline-text strong {
        font-weight: 700; /* Use numerical weight for robustness */
        color: #fff; /* Make it pure white to stand out */
    }
    #headline-text i {
        font-style: italic;
        color: #00BFFF; /* Use theme blue for emphasis */
    }#meta-communities-modal {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    .meta-communities-modal-content {
        background: #181818; color: #f0ead6; border-radius: 12px; max-width: 600px; width: 95vw; max-height: 90vh; overflow-y: auto; padding: 32px 24px 24px 24px; position: relative;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .meta-communities-close {
        position: absolute; top: 16px; right: 20px; font-size: 2em; cursor: pointer; color: #aaa;
    }
    #meta-communities-title { margin-top: 0; margin-bottom: 16px; }
    #meta-communities-search {
        width: 100%; padding: 8px 12px; margin-bottom: 18px; border-radius: 6px; border: 1px solid #333; background: #222; color: #f0ead6;
    }
    #meta-communities-list { display: flex; flex-direction: column; gap: 16px; }
    .meta-community-card {
        display: flex; gap: 16px; align-items: flex-start; background: #232323; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .meta-community-card img {
        width: 56px; height: 56px; object-fit: cover; border-radius: 8px; background: #333;
    }
    .meta-community-info { flex: 1; }
    .meta-community-name { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
    .meta-community-desc { font-size: 0.98em; margin-bottom: 6px; color: #ccc; }
    .meta-community-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .meta-community-tag {
        background: #333; color: #87cefa; border-radius: 4px; padding: 2px 8px; font-size: 0.92em;
    }
    #meta-communities-close-btn {
        margin-top: 18px; padding: 8px 24px; border-radius: 6px; border: none; background: #444; color: #fff; font-size: 1em; cursor: pointer;
    }
    #meta-communities-close-btn:hover, .meta-communities-close:hover { background: #222; color: #fff; }
`;

// LAYOUT FUNCTIONS

/**
 * Updates the card UI with user details
 * @param {Object} details - User details object
 */
function updateCardUI(details) {
    const cardRight = document.getElementById('card-right');
    if (!cardRight) return;

    const labels = window.config.labels || {};

    cardRight.innerHTML = `
        <div class="card-title">${labels.idName || "OVERWEB ID"}</div>
        <div class="card-subtitle">${labels.idDescription || ""}</div>
        <div class="card-details">
            <div class="detail-row">
                <span class="detail-label">${labels.participant || "Bridger"}:</span>
                <span class="detail-value" id="bridger-name-value">${details.bridgerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${labels.participantNum || "Bridger No."}:</span>
                <span class="detail-value">${details.bridgerNo}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${labels.level || "Level"}:</span>
                <span class="detail-value">${details.level}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${labels.credentials || "Credentials"}:</span>
                <span class="detail-value" id="credentials-count"><div class="spinner-inline"></div></span>
            </div>
            <div class="detail-row" id="badges-row">
                <span class="detail-label">${labels.badges || "Badges"}:</span>
                <span class="detail-value" id="badges-count"><div class="spinner-inline"></div></span>
            </div>
            <div class="detail-row" id="microcreds-row">
                <span class="detail-label">${labels.microcreds || "Microcreds"}:</span>
                <span class="detail-value" id="microcreds-count"><div class="spinner-inline"></div></span>
            </div>
        </div>
        <div class="card-footer">
            <div class="footer-row"><span class="footer-label">${labels.protocol || "Protocol"}:</span> <span class="footer-value">BRC333</span></div>
            <div class="footer-row"><span class="footer-label">${labels.date || "Date"}:</span> <span class="footer-value">${details.date}</span></div>
            <div class="footer-row"><span class="footer-label">${labels.block || "Block"}:</span> <span class="footer-value">${details.block}</span></div>
            <div class="footer-row"><span class="footer-label">${labels.id || "Id"}:</span> <span class="footer-value" id="inscription-id-value">${details.idShort}</span></div>
            <div class="footer-row"><span class="footer-label">${labels.satoshi || "Satoshi"}:</span> <span class="footer-value">${details.satoshi}</span></div>
        </div>
    `;

    adjustTitleFontSize();
    truncateBridgerName();
}

/**
 * Dynamically adjusts font size to fit its container. This function uses a timeout
 * to ensure the browser has completed layout rendering before measuring element widths,
 * preventing a race condition where the check happens too early.
 * @param {HTMLElement} element - The element containing the text.
 * @param {number} maxEm - The maximum font size in em.
 * @param {number} minEm - The minimum font size in em.
 */
function fitText(element, maxEm, minEm) {
    if (!element || !element.textContent) return;

    let currentSize = maxEm;
    element.style.fontSize = `${currentSize}em`;

    // Use a timeout to ensure the browser has time to apply styles and calculate layout
    setTimeout(() => {
        let iterations = 0;
        const maxIterations = 30; // Safety break

        // Using a 1px buffer for safety
        while (element.scrollWidth > element.offsetWidth + 1 && currentSize > minEm && iterations < maxIterations) {
            currentSize = parseFloat((currentSize - 0.1).toFixed(2));
            element.style.fontSize = `${currentSize}em`;
            iterations++;
        }
    }, 150);
}



// EXPOSE TO GLOBAL SCOPE
window.Layout = {
    cardHTML,
    cardCSS,
    updateCardUI,
    fitText
};
