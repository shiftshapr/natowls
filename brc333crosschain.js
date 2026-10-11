//  **********************************************************************************************************
//  brc333crosschain.js
//  The Cross-Chain module for BRC333 cross-chain NFTs
//  
//  This script handles hash parsing and the creation of the JSON object for the cross-chain module.
//
//  Created: Shiftshapr (2024-11-1)
//  **********************************************************************************************************
//  About the BRC333 Protocol and Satplications:
//  
//  BRC333 transcends the traditional boundaries of a protocol; it embodies a philosophy. It champions the
//  idea that ordinals&mdash;unique digital artifacts on the Bitcoin blockchain&mdash;offer humanity a 
//  perpetual connection to a decentralized web. This connection is not just technical but philosophical, 
//  suggesting a future where digital content has permanence and utility.
//
//  The latest evolution of BRC333 introduces cross-chain NFTs, enabling assets to be minted, displayed, and
//  traded across multiple blockchains while remaining permanently anchored to Bitcoin for authenticity and 
//  provenance. By leveraging BRC333 reinscriptions, these NFTs are not only immutable but also dynamic, 
//  allowing traits to change, unlock, or evolve over time. Unlike traditional NFTs that rely on centralized 
//  hosting solutions like IPFS or Arweave, BRC333 cross-chain NFTs use Bitcoin as the ultimate source of 
//  truth, ensuring that metadata and imagery remain forever accessible and verifiable. This breakthrough 
//  expands the reach of Ordinals beyond Bitcoin, bringing permanent yet flexible NFTs to ecosystems like 
//  Ethereum, Solana, XRP, and beyond.
//
//  This advancement is further powered by Digital Matter Theory (DMT), which ensures that NFTs are not 
//  arbitrary creations but are instead derived from structured patterns in Bitcoin's block data. By using  
//  DMT, BRC333 NFTs inherit a provable lineage, reinforcing their authenticity and uniqueness. This  
//  breakthrough expands the reach of Ordinals beyond Bitcoin, bringing permanent yet flexible NFTs to  
//  ecosystems like Ethereum, Solana, XRP, and beyond.
//
//  Technically, BRC333 distinguishes itself by how it handles visual content. Instead of relying on static
//  image files, it utilizes code to create visual elements directly on pixel canvases or through vector-
//  based SVG images. This method allows for unmatched flexibility in terms of design, color, and 
//  interactivity. BRC333 breathes life into digital collectibles, making them dynamic, interactive, and 
//  gamifiable. These "dynamic ordinals" can evolve over time, react to user interactions, have ability 
//  scores reflective of their traits, and incorporate onchain audio or visual elements through recursive 
//  programming. This approach not only makes digital artifacts more engaging but also opens up new 
//  possibilities for reinvention, interaction, and gamification.
//
//  For more information on BRC333, visit https://brc333.xyz
//  *********************************************************************************************************/

/**
 * Displays JSON output in the designated HTML elements.
 * @param {string} jsonString - The JSON string to be displayed.
 */
function displayJsonOutput(jsonString) {
    const jsonOutputDiv = document.getElementById('jsonOutput');
    const jsonTextPre = document.getElementById('jsonText');

    if (jsonOutputDiv && jsonTextPre) {
        jsonTextPre.textContent = jsonString;
        jsonOutputDiv.style.display = 'block';
    } else {
        console.error('JSON output elements not found in the DOM.');
    }
}

/**
 * Generates a JSON object from URL parameters and traits, then displays it.
 * @param {string} collectionName - The name of the collection.
 * @param {string} jsonId - The ID for the JSON content.
 * @param {number} collectionIndex - The index of the collection.
 * @param {number} block - The block number
 * @param {number} blockIndex - The index of the block.
 * @param {Array} traits - An array of traits to be included in the JSON.
 */
function generateJsonFromUrl(collectionName, jsonId, collectionIndex, block, blockIndex, traits, description) {
    const attributes = traits.map(trait => {
        const categoryInfo = categoryData.find(c => c.trait === trait);
        return {
            "trait_type": categoryInfo ? categoryInfo.categoryName : "Unknown",
            "value": trait
        };
    });

    const jsonOutput = {
        "name": `${collectionName} #${collectionIndex} (DMT #${blockIndex+1})`,
        "image": `https://ordinals.com/content/${jsonId}#/block/${block}`,
        "collection": {
            "name": `${collectionName}`,
            "description": `${description}`
        },
        "DMT block": block,
        "attributes": attributes
    };

    const jsonString = JSON.stringify(jsonOutput, null, 2);
    displayJsonOutput(jsonString); 
}

/**
 * Extracts inscription ID from various URL formats.
 * @param {string} url - URL containing inscription ID in either content/[ID] or ord.io/[number] format.
 * @param {string|null} [testingId=null] - Optional testing ID to return if no match is found.
 * @returns {Promise<string|null>} The extracted inscription ID or null if not found.
 * @example
 * // Returns "abc123..." from "domain/content/abc123..."
 * // Returns "xyz789..." from "ord.io/12345" by fetching page
 */
async function getInscriptionId(url, testingId = null) {
    let id = null;
    const contentPattern = /(.+)\/content\/([a-zA-Z0-9]+)/;
    const inscriptionPattern = /(.+)\/inscription\/([a-zA-Z0-9]+)/;
    const ordPattern = /ord\.io\/(\d+)/;

    const contentMatch = url.match(contentPattern);
    const inscriptionMatch = url.match(inscriptionPattern);

    if (contentMatch) {
        id = contentMatch[2];
    } else if (inscriptionMatch) {
        id = inscriptionMatch[2];
    } else {
        const ordMatch = url.match(ordPattern);
        if (ordMatch) {
            id = await getOrdIoInscriptionId(ordMatch[1]);
        } else {
            id = testingId;
        }
    }
    return id;
}

/**
 * Fetches and extracts the inscription ID from ord.io using the given inscription number.
 * @param {string} inscriptionNumber - The inscription number to fetch the ID for.
 * @returns {Promise<string|null>} The extracted inscription ID or null if not found.
 */
async function getOrdIoInscriptionId(inscriptionNumber) {
    const fetchUrl = `https://www.ord.io/${inscriptionNumber}`;
    try {
        // Fetch the page and parse the inscription ID
        const response = await fetch(fetchUrl);
        const pageText = await response.text();
        console.log(pageText);
        
        // Use DOMParser to parse the HTML and find the full inscription ID
        const parser = new DOMParser();
        const doc = parser.parseFromString(pageText, 'text/html');
        
        // Assume inscription ID is stored in a meta tag (replace selector if necessary)
        const metaTag = doc.querySelector('meta[name="inscription-id"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        } else {
            console.error("Inscription ID not found on page.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching the inscription page:", error);
        return null;
    }
}

/**
 * Processes the current URL to extract collection and block information.
 * @param {string|null} [testingUrl=null] - Optional testing URL.
 * @returns {Promise<Object>} An object containing match, collection, collectionIndex, blockIndex, blk, testing, and jsonId.
 */
async function processUrl(testingUrl = null) {
    const url = window.location.href;
    let match, collection, blockIndex, blk, testing, collectionIndex, jsonId; 
    
    const urlPattern = /\/(.)\/metadata\/(\d+)\.json/;
    const urlPattern2 = /\/(.)\/(\d+)/;
    const urlPattern3 = /\/block\/(\d+)/;

    match = url.match(urlPattern);
    console.log('match', match);
    const match2 = url.match(urlPattern2);
    console.log('match2', match2);
    const match3 = url.match(urlPattern3);
    console.log('match3', match3);


    if (match) {
        collection = match[1];
        collectionIndex = parseInt(match[2]);
        console.log('collection', collection);
        console.log('collectionIndex', collectionIndex);
        blockIndex = collectionIndex - 1 + collection * 1111;
        console.log('blockIndex', blockIndex);
        blk = blocks[blockIndex];
        console.log('blk (after match)', blk);
        jsonId = await getInscriptionId(url, testingUrl);
        if (testing) console.log('jsonId', jsonId);
    } else if (match2) {
        collection = match2[1];
        collectionIndex = parseInt(match2[2]);
        console.log('collection', collection);
        console.log('collectionIndex', collectionIndex);
        blockIndex = collectionIndex - 1 + collection * 1111;
        console.log('blockIndex', blockIndex);
        blk = blocks[blockIndex];
        console.log('blk (after match2)', blk);
    } else if (match3) {
        blk = parseInt(match3[1]);
        console.log('blk (after match3)', blk);
    }

    if (!match) {
        const jsonOutputDiv = document.getElementById('jsonOutput');
        if (jsonOutputDiv.style.display === 'block') {
            jsonOutputDiv.style.display = 'none';
        }
    }

    if (url.includes('test') || url.endsWith('/test')) testing = true;
    console.log('testing after matching', testing);

    return {
        match,
        collection,
        collectionIndex,
        blockIndex,
        blk,
        jsonId,
        testing
    };
}

window.BRC333CrossChain = {
    processUrl,
    getInscriptionId,
    generateJsonFromUrl,
    displayJsonOutput,
    getOrdIoInscriptionId
};

// Example usage of processUrl function:
// const { match, collection, collectionIndex, blockIndex, jsonId } = await BRC333CrossChain.processUrl(testing,blk);

// Example usage of getInscriptionId function:
// const inscriptionId = await BRC333CrossChain.getInscriptionId(window.location.href);

// Example usage of generateJsonFromUrl function:
// BRC333CrossChain.generateJsonFromUrl(collectionName, jsonId, collectionIndex, block, blockIndex, traits, description);

// Example usage of getOrdIoInscriptionId function:
// const inscriptionId = await BRC333CrossChain.getOrdIoInscriptionId('12345');

// Note: You need to implement an eventListener to call the main logic function that calls the processUrl function like this:
// window.addEventListener('hashchange', () => loadAndModify(now));


