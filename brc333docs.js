//  **********************************************************************************************************
//  brc333docs.js
//  The Open Docs satplication script 
//  
//  This script loads the satplication logic and BRC333 modules, activates Time Travel, and decompresses the logic script
//
//  Created: Shiftshapr (2024-11-1)
//  **********************************************************************************************************
//  About BRC333 Protocol: 
//  The BRC333 Dynamic Ordinals protocol, incubated by Pachaverse, has evolved into a DMT (Digital Matter Theory) 
//  gamification protocol that supports dynamic UNAT ordinals. It transcends traditional protocol boundaries, 
//  embodying a philosophy that champions ordinals as unique digital artifacts on the Bitcoin blockchain, which  
//  offers humanity a perpetual connection to a decentralized web.
//
//  Key features of BRC333 DMT gamification include:
//  - Messages and updates from the future appearing and occurring on specific blocks
//  - Support for up to 8 special powers
//  - Visual moon representation that follows the real-world moon cycle
//
//  Technically, BRC333 creates visual elements directly on pixel canvases or through vector-based SVG images, 
//  allowing for unmatched flexibility in design, color, and interactivity. This approach breathes life into 
//  digital collectibles, making them dynamic and interactive, capable of evolving over time and reacting to 
//  user interactions.
//
//  For more info on BRC333, visit https://brc333.xyz
//  **********************************************************************************************************


function applyStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        body {
            background-color: black;
            margin: 0;
            padding: 0;
            color: #F0EAD6;
            font-family: Helvetica, Arial, sans-serif;
            overflow: hidden;
        }
        .container {
            position: relative;
            max-width: 600px;
            margin: 0 auto;
            height: 100vh;
            overflow-y: auto;
        }
        #preface, #content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            padding: 20px;
            position: relative;
            z-index: 1;
        }
        #preface p, #content p, #preface h2, #content h2 {
            max-width: 100%;
            word-wrap: break-word;
        }
        img {
            width: 100%;
            height: auto;
        }
        #initial-image {
            position: relative;
            z-index: 1;
        }
        .title {
            position: absolute;
            top: var(--title-top-offset, 35%);
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            color: orangered;
            white-space: pre-line;
            font-size: 150%;
            z-index: 2;
        }
        .article-links a[data-info] {
            position: relative;
            display: inline-block;
        }

        .article-links a[data-info]:hover:after {
            content: attr(data-info);
            position: absolute;
            left: 0;
            bottom: calc(100% + 5px);
            width: 96.3%;
            white-space: pre-wrap;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        }
        .content {
            display: none;
            padding: 20px;
        }
        } .indented {
            padding-left: 20px; 
        }
        :root {
            --title-top-offset: 25%;
        }
        .preface {
            display: none;
            padding: 20px;
            background-color: black;
            color: #F0F0F0;
        }
        #lfgButton {
            background-color: #00BFFF;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            display: block;
            margin-left: auto !important;
            margin-right: 0 !important;
        }
        .navigation-buttons {
            display: flex important!;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
            width: 100%;
        }
        .navigation-buttons button {
            display: inline-block;
            background-color: #00BFFF;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
        }
        .container .content .navigation-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
            width: 100%;
        }
        .title, #initial-image, #preface, #content {
            transition: opacity 0.5s ease-in-out, display 0.5s ease-in-out;
        }
        #initial-image, .title {
            opacity: 0;
            display: none;
        }
        #initial-image {
            background-color: black;
        }
        dl {
            padding-left: 20px;
        }
        dt {
            font-weight: bold;
            margin-bottom: 5px;
        }

        dd {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        body {
            overflow: hidden;
        }
        .article-links {
            margin: 8px 0;
            padding: 0;
            border: none;
        }
        .article-links a, .reply-link, .tag-link {
            color: #00BFFF;
            text-decoration: none;
        }
        .article-links a {
            display: block;
            margin: 10px 0;
        }
        .article-links a:hover, .reply-link:hover, .tag-link:hover {
            color: #87CEFA;
            text-decoration: underline;
            background-color: rgba(0, 191, 255, 0.1);
            transition: all 0.3s ease;
        }
        .reply-link:hover, .tag-link:hover {
            color: #ff8533;
            background-color: rgba(255, 107, 0, 0.1);
        }
        .article-links a:hover {
            border-radius: 3px;
        }
        .pagination {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .page-button {
            background-color: #000080;
            color: white;
            border: none;
            padding: 5px 15px;
            cursor: pointer;
        }
        .current-page {
            background-color: #ff8c00;
        }
        .search-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 20px 0;
            padding: 10px;
            background: rgba(255, 107, 0, 0.1);
            border-radius: 5px;
        }

        .search-input {
            width: 200px;
            padding: 8px;
            border: 1px solid #00BFFF;
            border-radius: 3px;
        }

        .filter-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .search-input {
            width: 150px; 
        }
        .search-input, .date-filter {
            border-color: #00BFFF;
            color: #F0F0F0;
            background: transparent;
            height: 38px;
            box-sizing: border-box;
            padding: 0 10px;
            border: 1px solid #00BFFF;
            border-radius: 3px;
        }
        .page-button, #prefaceButton, #restartButton, #lfgButton {
            background-color: #00BFFF;
            color: white;
            height: 38px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 15px;
        }
        .pagination, #lfgButton {
            margin: 0;
            line-height: 38px;
            vertical-align: middle;
        }
        #lfgButton {
            margin-left: auto;
            margin-right: 0;
        }
        .page-button:hover, #prefaceButton:hover, #restartButton:hover, #lfgButton:hover {
            background-color: #87CEFA;
        }

        .pagination span {
            color: #00BFFF;
        }
        .controls-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
        }
        .italic-text {
            font-style: italic;
            color: #00BFFF;
        }
        .page-size-selector {
            height: 38px;
            padding: 0 20px 0 5px;
            border: 1px solid #00BFFF;
            border-radius: 3px;
            background: linear-gradient(to left, #f0f0f0 1.5em, white 1.5em);
            color: #00BFFF;
            cursor: pointer;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FF4500%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5em top 50%;
            background-size: 0.65em auto;
        }
        .page-size-selector:hover {
            background: rgba(255, 69, 0, 0.1);
        }
        .article-links a:visited {
            color: #87CEFA; 
        }
        .reply-link, .tag-link {
            color: #ff6b00;
        }

        .article-links a {
            color: #00BFFF; /* Default link color */
        }
        .metadata-box {
            background: rgba(128, 128, 128, 0.1);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .metadata-item {
            color: #999;
            margin: 5px 0;
            font-size: 0.9em;
        }
        .tag-cloud-container {
            margin: 10px 0;
        }
        .tag-cloud {
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px;
            margin: 5px 0;
            background: rgba(128, 128, 128, 0.1);
            border-radius: 5px;
            font-size: 0.9em;
        }
        .tag-cloud.open {
            display: flex;
        }
        .tag-cloud-controls {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .tag-cloud-toggle, .clear-tags, .close-tags {
            background: #00BFFF;
            color: white;
            padding: 3px 12px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            font-size: 0.8em;
        }
        .tag-cloud-tag {
            padding: 5px 10px;
            border-radius: 15px;
            color: #00BFFF;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .tag-cloud-tag.selected {
            background: #00BFFF;
            color: white;
        }
        .reply-link, .tag-link {
            color: #00BFFF;
            text-decoration: none;
        }

        .reply-link:hover, .tag-link:hover {
            color: #ff6b00;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(styleSheet);
}

/**
 * Fetches and processes layout content
 * @returns {Promise<void>}
 */
async function fetchLayoutContent() {
    const inscriptionIds = await getInscriptionsForSat(config.layoutSat, null, true);
    if (!inscriptionIds || inscriptionIds.length === 0) return;
    
    let layoutHTML = await getInscriptionContent(inscriptionIds[0]);

    if (testing === true) {
        layoutHTML = layoutHTML.replace(/src="\//g, 'src="https://ordinals.com/');
    }
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = layoutHTML;
    
    const elements = ['initial-image', 'title', 'preface'].forEach(id => {
        const newElement = tempContainer.querySelector(`#${id}, .${id}`);
        const currentElement = document.querySelector(`#${id}, .${id}`);
        if (newElement && currentElement) {
            currentElement.outerHTML = newElement.outerHTML;
        }
    });
}

/**
 * Fetches and processes all articles
 * @returns {Promise<Array>} Array of processed articles
 */
async function fetchArticles() {
    console.log('fetchArticles called from:', new Error().stack);
    const inscriptionIds = await getInscriptionsForSat(config.articlesSat);
    let activeArticles = new Map();
    let modifications = [];
    
    // First pass: collect all articles and their content
    for (const id of inscriptionIds) {
        //const manifestResponse = await getInscriptionContent(id, true);
        const manifestResponse = tempArticles;
        
        if (manifestResponse?.p === 'brc333' && manifestResponse.op === 'activate') {
            // Load all articles with their full content
            for (const article of manifestResponse.articles) {
                let articleContent = await getInscriptionContent(article.id);
                //console.log("articleContent", articleContent);
                if (testing === true) {
                    articleContent = articleContent.replace(/src="\//g, 'src="https://ordinals.com/');
                }
                
                const processedContent = await processArticleContent(articleContent);
                article.html = processedContent.html;
                article.title = article.title || processedContent.title;
                activeArticles.set(article.id, article);
            }
        } else if (manifestResponse?.p === 'brc333' && manifestResponse.op === 'modify') {
            modifications.push(manifestResponse);
        }
    }

    if (testing === true && typeof testmods !== 'undefined') {
        modifications.push(testMods);
    }
    
    for (const modification of modifications) {
        if (modification.updates) {
            for (const update of modification.updates) {
                const existingArticle = activeArticles.get(update.id);
                if (existingArticle) {
                    // Update properties
                    Object.assign(existingArticle, update);
                    
                    // Apply content modifications if specified
                    if (update.lines && update.content) {
                        const lines = existingArticle.html.split('\n');
                        lines.splice(
                            update.lines.start - 1,
                            update.lines.end - update.lines.start + 1,
                            ...update.content
                        );
                        existingArticle.html = lines.join('\n');
                        if (testing) console.log('existingArticle.html',existingArticle.html);
                    }
                }
            }
        }
        
        if (modification.deletes) {
            for (const deleteId of modification.deletes) {
                activeArticles.delete(deleteId);
            }
        }
    }
    return Array.from(activeArticles.values());
}

/**
 * Displays article links with pagination
 * @param {Array} articles - The articles to display
 * @returns {void}
 */
async function displayArticleLinks(articles) {
    if (testing) console.log('Initial currentPage:', currentPage,'\nInitial ITEMS_PER_PAGE:', ITEMS_PER_PAGE);
    
    const preface = document.querySelector('#preface');
    const tagCloud = createTagCloud();

    if (!currentPage) currentPage = 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    if (testing) console.log('Calculated startIndex:', startIndex);
    
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageArticles = articles.slice(startIndex, endIndex);
    if (testing) console.log('pageArticles', pageArticles);

    // Create content div if it doesn't exist
    if (!document.getElementById('content')) {
        const contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        contentDiv.className = 'content';
        document.querySelector('.container').appendChild(contentDiv);
    }

    // Create navigation buttons
    const navButtons = document.createElement('div');
    navButtons.className = 'navigation-buttons';
    const prefaceButton = document.createElement('button');
    prefaceButton.id = 'prefaceButton';
    prefaceButton.textContent = 'BACK';
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'REFRESH';
    navButtons.appendChild(prefaceButton);
    navButtons.appendChild(restartButton);
    document.getElementById('content').appendChild(navButtons);

    // Create article links first
    const linkList = document.createElement('div');
    linkList.className = 'article-links';
    preface.appendChild(linkList);

    const existingSearchControls = document.querySelector('.search-controls');
    if (!existingSearchControls) {
        addSearchControls();
    }
    const searchControls = document.querySelector('.search-controls');
    searchControls.after(createTagCloud());
    
    (async () => {
        for (const [index, article] of pageArticles.entries()) {
            const link = await createArticleLink(article, index, startIndex);
            linkList.appendChild(link);
        }
    })();

    const controlsContainer = addPaginationAndButton(articles);
    preface.appendChild(controlsContainer);
}

/**
 * Creates pagination controls and LFG button
 * @param {Array} articles - The articles to paginate
 * @returns {HTMLElement} Container with pagination and button
 */
function addPaginationAndButton(articles) {
    const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
    if (testing)  console.log('Articles length:', articles.length, '\nItems per page:', ITEMS_PER_PAGE,'\nTotal pages:', totalPages);

    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.marginTop = '20px';
    controlsContainer.style.width = '100%';

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.style.display = 'flex';
    paginationDiv.style.gap = '10px';
    paginationDiv.style.alignItems = 'center';

    // First page button
    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.className = 'page-button';
        firstButton.textContent = '1';
        firstButton.onclick = () => {
            currentPage = 1;
            refreshArticleList();
        };
        paginationDiv.appendChild(firstButton);
    }

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'page-button';
        prevButton.textContent = '<';
        prevButton.onclick = () => {
            currentPage--;
            refreshArticleList();
        };
        paginationDiv.appendChild(prevButton);
    }

    // Current page text
    const pageText = document.createElement('span');
    pageText.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationDiv.appendChild(pageText);


    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-button';
        nextButton.textContent = '>';
        nextButton.onclick = () => {
            currentPage++;
            refreshArticleList();
    };
        paginationDiv.appendChild(nextButton);

        // Last page button/number
        const lastButton = document.createElement('button');
        lastButton.className = 'page-button';
        lastButton.textContent = totalPages;
        lastButton.onclick = () => {
            currentPage = totalPages;
            refreshArticleList();
        };
        paginationDiv.appendChild(lastButton);
    }

    // Create page size selector
    const sizeSelector = document.createElement('select');
    sizeSelector.className = 'page-size-selector';
    [10, 25, 50].forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size} per page`;
        option.selected = size === ITEMS_PER_PAGE;
        sizeSelector.appendChild(option);
    });
    
    // Add event listener
    sizeSelector.addEventListener('change', (e) => {
        ITEMS_PER_PAGE = parseInt(e.target.value);
        currentPage = 1;
        refreshArticleList();
    });

    const lfgButton = document.createElement('button');
    lfgButton.id = 'lfgButton';
    lfgButton.textContent = 'Call For Ideas';
    lfgButton.addEventListener('click', async (event) => {
        event.stopImmediatePropagation();
        const articles = await fetchArticles();
        
        preface.style.opacity = '0';
        setTimeout(() => {
            preface.style.display = 'none';
            content.style.display = 'block';
            content.innerHTML = articles[0].html;
            
            addNavigationButtons(content);
            content.scrollTop = 0;
            setTimeout(() => {
                content.style.opacity = '1';
                content.scrollIntoView({behavior: 'smooth'});
            }, 50);
        }, 500);
    });

    controlsContainer.appendChild(paginationDiv);
    controlsContainer.appendChild(sizeSelector);
    controlsContainer.appendChild(lfgButton);

    return controlsContainer;
}

/**
 * Processes article content into standardized format
 * @param {string} content - Raw article content
 * @returns {Object} - Processed article with title and html
 */
async function processArticleContent(content) {
    try {
        const jsonContent = JSON.parse(content);
        return {
            title: jsonContent.title || 'Untitled',
            html: jsonContent.content || jsonContent.html || content
        };
    } catch {
        if (content.trim().startsWith('<')) {
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = content;
            const titleElement = tempContainer.querySelector('h1, h2') || tempContainer.querySelector('div');
            return {
                title: titleElement ? titleElement.textContent : 'Untitled',
                html: content
            };
        }
        if (content.includes('#') || content.includes('```')) {
            const html = marked.parse(content);
            const title = content.split('\n')[0].replace(/#/g, '').trim();
            return {
                title: title || 'Untitled',
                html: html
            };
        }
        return {
            title: 'Text Document',
            html: `<div style="white-space: pre-wrap; word-wrap: break-word;">${content}</div>`
        };
    }
}

/**
 * Creates article link element with event handlers
 * @param {Object} article - Article data object
 * @param {number} index - Article index
 * @param {number} startIndex - Starting index for pagination
 * @returns {HTMLElement} Configured link element
 */
async function createArticleLink(article, index, startIndex) {
    const globalIndex = startIndex + index + 1;
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = `${startIndex + index + 1}. ${article.title}`;
    
    const timestamp = await processArticleDate(article);
    
    const date = new Date(timestamp);
    const localDate = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
            
    let hoverInfo = `AUTHOR: ${article.author}\nPUBLISHED: ${localDate}`;
    if (article['reply-to']) {
        const replyToArticle = articles.find(a => a.id === article['reply-to']);
        console.log('Found reply article:', replyToArticle);

        const replyTitle = replyToArticle ? replyToArticle.title : article['reply-to'];
        hoverInfo += `\nIN REPLY TO: ${replyTitle}`;
    }
    if (article.medium) {
        hoverInfo += `\nMEDIUM: ${article.medium}`;
    }
    if (article.source) {
        hoverInfo += `\nSOURCE: ${article.source}`;
    }
    if (article.subject) {
        hoverInfo += `\nSUBJECT: ${article.subject}`;
    }

    link.dataset.info = hoverInfo;
    
    link.onclick = async (e) => {
        console.log('Link clicked for article:', article.title);
        console.log('Current page before display:', currentPage);

        e.preventDefault();
        e.stopPropagation();
        console.log('Starting display of article:', article.title);
        
        preface.style.opacity = '0';
        preface.style.display = 'none';
        content.style.display = 'block';
        
        console.log('Before displayArticle call');
        await displayArticle(article);
        console.log('After displayArticle call');
        
        content.scrollTop = 0;
        content.style.opacity = '1';
        content.scrollIntoView({behavior: 'smooth'});
        console.log('Display sequence completed');
    };
    
    
    return link;
}

/**
 * Refreshes the article list for current page
 * @returns {void}
 */
async function refreshArticleList() {
    console.log('refreshArticleList called from:', new Error().stack);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    console.log('Refreshing article list for page:', currentPage);
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageArticles = filteredResults.slice(startIndex, endIndex);

    // Create new article links
    const linkList = document.createElement('div');
    linkList.className = 'article-links';
    
    for (const [index, article] of pageArticles.entries()) {
        const link = await createArticleLink(article, index, startIndex);
        linkList.appendChild(link);
    }    

    // Update DOM
    const oldLinkList = document.querySelector('.article-links');
    oldLinkList.replaceWith(linkList);

    // Update pagination controls
    const controlsContainer = document.querySelector('#preface > div[style*="display: flex"]');
    const newControlsContainer = addPaginationAndButton(filteredResults);
    controlsContainer.replaceWith(newControlsContainer);
}

/**
 * Displays an article in the content area with navigation
 * @param {Object} article - The article object containing html content
 * @param {number} index - Index of the article in the list
 * @returns {void}
 */
async function displayArticle(article) {
    const contentDiv = document.getElementById('content');
    const metadataBox = document.createElement('div');
    metadataBox.className = 'metadata-box';

    const timestamp = await processArticleDate(article);
    const date = new Date(timestamp);
    const localDate = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const replyToArticle = articles.find(a => a.id === article['reply-to']);
    console.log('Found reply article:', replyToArticle);

    // Create metadata items container
    const metadataItems = document.createElement('div');

    // Add author
    const authorItem = document.createElement('div');
    authorItem.className = 'metadata-item';
    authorItem.textContent = `AUTHOR: ${article.author}`;
    metadataItems.appendChild(authorItem);

    // Add published date
    const dateItem = document.createElement('div');
    dateItem.className = 'metadata-item';
    dateItem.textContent = `PUBLISHED: ${localDate}`;
    metadataItems.appendChild(dateItem);

    // Add reply-to if exists
    if (replyToArticle) {
        const replyItem = document.createElement('div');
        replyItem.className = 'metadata-item';
        replyItem.textContent = 'IN REPLY TO: ';
        const replyLink = document.createElement('a');
        replyLink.href = '#';
        replyLink.className = 'reply-link';
        replyLink.textContent = replyToArticle.title;
        replyLink.addEventListener('click', (e) => {
            e.preventDefault();
            displayArticle(replyToArticle);
        });
        replyItem.appendChild(replyLink);
        metadataItems.appendChild(replyItem);
    }

    // Add medium if exists
    if (article.medium) {
        const mediumItem = document.createElement('div');
        mediumItem.className = 'metadata-item';
        mediumItem.textContent = `MEDIUM: ${article.medium}`;
        metadataItems.appendChild(mediumItem);
    }

    // Add source if exists
    if (article.source) {
        const sourceItem = document.createElement('div');
        sourceItem.className = 'metadata-item';
        sourceItem.textContent = `SOURCE: ${article.source}`;
        metadataItems.appendChild(sourceItem);
    }

    // Add subject if exists
    if (article.subject) {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'metadata-item';
        subjectItem.textContent = `SUBJECT: ${article.subject}`;
        metadataItems.appendChild(subjectItem);
    }

    // In displayArticle function, in the tags section
    if (article.tags) {
        const tagsItem = document.createElement('div');
        tagsItem.className = 'metadata-item';
        tagsItem.textContent = 'TAGS: ';
        
        article.tags.forEach((tag, index) => {
            const tagLink = document.createElement('a');
            tagLink.href = '#';
            tagLink.className = 'tag-link';
            tagLink.textContent = tag;
            tagLink.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = e.target.textContent;
                
                // Open tag cloud if closed
                const tagCloud = document.querySelector('.tag-cloud');
                const toggleButton = document.querySelector('.tag-cloud-toggle');
                const actionButtons = document.querySelector('.tag-cloud-controls');
                
                tagCloud.classList.add('open');
                toggleButton.style.display = 'none';
                actionButtons.style.display = 'flex';
                
                // Highlight matching tag
                const tagElement = document.querySelector(`.tag-cloud-tag[data-tag="${tag}"]`);
                tagElement.classList.add('selected');
                
                // Filter articles
                filteredResults = articles.filter(article => 
                    article.tags && article.tags.includes(tag)
                );
                currentPage = 1;
                
                // Switch views
                content.style.display = 'none';
                preface.style.display = 'block';
                preface.style.opacity = '1';
                
                refreshArticleList();
            });
            tagsItem.appendChild(tagLink);
            if (index < article.tags.length - 1) {
                tagsItem.appendChild(document.createTextNode(', '));
            }
        });
        metadataItems.appendChild(tagsItem);
    }



    metadataBox.appendChild(metadataItems);
    contentDiv.innerHTML = '';
    contentDiv.appendChild(metadataBox);

    // Add separator after metadata
    const metadataSeparator = document.createElement('hr');
    metadataSeparator.style.margin = '20px 0';
    metadataSeparator.style.border = '0';
    metadataSeparator.style.borderTop = '1px solid rgba(255, 69, 0, 0.2)';
    contentDiv.appendChild(metadataSeparator);

    // Clean and add content
    let cleanContent = article.html;
    if (typeof cleanContent === 'string') {
        const lines = cleanContent.split('\n');
        if (lines[0] && lines[0].trim().startsWith('On')) {
            lines.shift();
            cleanContent = lines.join('\n');
        }
    }

    contentDiv.insertAdjacentHTML('beforeend', `<div class="article-content">${cleanContent}</div>`);

    // Add separator before navigation
    const navSeparator = document.createElement('hr');
    navSeparator.style.margin = '20px 0';
    navSeparator.style.border = '0';
    navSeparator.style.borderTop = '1px solid rgba(255, 69, 0, 0.2)';
    contentDiv.appendChild(navSeparator);

    addNavigationButtons(contentDiv);
}


/**
 * Filters articles based on search criteria
 * @param {Array} articles - Array of articles to filter
 * @param {string} searchTerm - Search term
 * @param {string} fromDate - Start date filter
 * @param {string} toDate - End date filter
 * @returns {Array} Filtered articles
 */

async function filterArticles(event) {
    const searchInterface = window.brc333Search.get(sourceId);
    if (testing) console.log('Retrieved search interface:', searchInterface);

    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const fromDate = document.querySelector('.date-filter').value;
    const toDate = document.querySelectorAll('.date-filter')[1].value;
    
    // Use the search interface
    filteredResults = searchInterface.search({
        searchTerm,
        fromDate,
        toDate
    });
    
    refreshArticleList();
}

/**
 * Creates pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Page change callback
 * @returns {HTMLElement} Pagination controls container
 */
function createPaginationControls(currentPage, totalPages, onPageChange) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    if (currentPage > 1) {
        addPageButton(paginationDiv, '1', () => onPageChange(1));
        addPageButton(paginationDiv, '<', () => onPageChange(currentPage - 1));
    }

    const pageText = document.createElement('span');
    pageText.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationDiv.appendChild(pageText);

    if (currentPage < totalPages) {
        addPageButton(paginationDiv, '>', () => onPageChange(currentPage + 1));
        addPageButton(paginationDiv, totalPages.toString(), () => onPageChange(totalPages));
    }

    return paginationDiv;
}

/**
 * Adds search and date filter controls to the interface
 * @returns {void} 
 */
function addSearchControls() {
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-controls';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = searchPlaceholder;
    searchInput.addEventListener('input', (event) => filterArticles(event));

    const dateControls = document.createElement('div');
    dateControls.className = 'filter-controls';
    
    const fromDate = document.createElement('input');
    fromDate.type = 'date';
    fromDate.className = 'date-filter';
    fromDate.addEventListener('change', filterArticles);
    
    const toDate = document.createElement('input');
    toDate.type = 'date';
    toDate.className = 'date-filter';
    toDate.addEventListener('change', filterArticles);
    
    dateControls.append('From:', fromDate, 'To:', toDate);
    searchDiv.append(searchInput, dateControls);
    document.querySelector('.article-links').before(searchDiv);
}

/**
 * Adds page size selector dropdown to pagination controls
 * @returns {void}
 */
function addPageSizeControl() {
    const sizeSelector = document.createElement('select');
    sizeSelector.className = 'page-size-selector';
    
    [10, 25, 50].forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size} per page`;
        option.selected = size === ITEMS_PER_PAGE;
        sizeSelector.appendChild(option);
    });
    
    sizeSelector.addEventListener('change', (e) => {
        ITEMS_PER_PAGE = parseInt(e.target.value);
        currentPage = 1;
        refreshArticleList();
    });
    
    // Add to pagination controls
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.insertBefore(sizeSelector, paginationDiv.firstChild);
}

/**
 * Adds navigation buttons to content
 * @param {HTMLElement} contentDiv - Content container element
 * @param {Function} onBack - Back button callback
 * @param {Function} onRefresh - Refresh button callback
 */
function addNavigationButtons(contentDiv) {
    const navButtons = document.createElement('div');
    navButtons.className = 'navigation-buttons';
    
    const prefaceButton = document.createElement('button');
    prefaceButton.id = 'prefaceButton';
    prefaceButton.textContent = 'BACK';
    prefaceButton.addEventListener('click', (event) => {
        content.style.display = 'none';
        preface.style.display = 'block';
        preface.style.opacity = '0';
        preface.scrollTop = 0;
        setTimeout(() => {
            preface.style.opacity = '1';
        }, 50);
        event.stopPropagation();
    });
    
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'REFRESH';
    restartButton.addEventListener('click', (event) => {
        const content = document.getElementById('content');
        const preface = document.getElementById('preface');
        const initialImage = document.getElementById('initial-image');
        const container = document.querySelector('.container');
    
        content.style.display = 'none';
        preface.style.display = 'none';
        initialImage.style.display = 'block';
        initialImage.style.opacity = '1';
        
        setTimeout(() => {
            container.addEventListener('mouseover', handleMouseOver);
        }, 100);
    });
    
    navButtons.appendChild(prefaceButton);
    navButtons.appendChild(restartButton);
    contentDiv.appendChild(navButtons);
}

/**
 * Displays a custom modal with the given message
 * @param {string} message - The message to display in the modal
 */
function showCustomModal(message) {
    const modal = document.getElementById('customModal');
    const modalContent = document.getElementById('modalContent');
    const modalText = document.getElementById('modalText');

    modalText.innerHTML = message.replace(/\n/g, '<br>');
    modal.style.display = 'block';

    modalText.innerHTML = message.replace(/\n/g, '<br>');
    modal.style.display = 'block';

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

/**
 * Loads and configures the marked markdown parser
 * @returns {Promise<void>} Resolves when marked is loaded and configured
 */
async function loadMarked() {
    const markedResponse = await fetch('https://ordinals.com/content/fbac58f3425e1f087aafde7aeeb04c9620f8df56b46e4e1299c03aa97211ba04i0');
    let markedText = await markedResponse.text();
    markedText = markedText.replace(/export\s*{[\s\S]*?};/, 'window.marked = marked;');
    
    const script = document.createElement('script');
    script.textContent = markedText;
    document.head.appendChild(script);
}

/**
 * Handles mouse over events for initial display
 * @returns {void}
 */
function handleMouseOver() {
    const container = document.querySelector('.container');
    const initialImage = document.getElementById('initial-image');
    const title = document.querySelector('.title');
    const preface = document.getElementById('preface');
    initialImage.style.opacity = '0.75';
    title.style.display = 'block';
        title.style.opacity = '1';
        setTimeout(() => {
            initialImage.style.opacity = '0';
            title.style.opacity = '0';
            setTimeout(() => {
                initialImage.style.display = 'none';
                title.style.display = 'none';
                preface.style.display = 'block';
            preface.scrollTop = 0;
            setTimeout(() => {
                preface.style.opacity = '1';
            }, 50);
            }, 500);
    }, 2000);
    container.removeEventListener('mouseover', handleMouseOver);
}

/**
 * Creates a searchable interface for article data
 * @param {string} sourceId - Unique identifier for the data source
 * @returns {Object} Search interface with methods:
 *   - search({Object} filters) - Searches articles with specified filters
 *     - searchTerm {string} - Text to search for
 *     - fromDate {string} - Start date filter
 *     - toDate {string} - End date filter  
 *     - author {string} - Author filter
 *     - limit {number} - Max results to return
 *     - offset {number} - Number of results to skip
 */
window.brc333Search = new Map();

function createSearchableInterface(sourceId) {
    
    const searchInterface = {
        search: (filters = {}) => {
            const {
                searchTerm = '',
                fromDate = null,
                toDate = null,
                author = '',
                limit = 50,
                offset = 0
            } = filters;
            
            if (testing) console.log('Search called with filters:', filters);
            
            return articles.filter(article => {
                const matchesSearch = !searchTerm || 
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    article.html.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.author.toLowerCase().includes(searchTerm.toLowerCase());
                
                const articleDate = new Date(article.timestamp * 1000);
                const matchesDate = (!fromDate || articleDate >= new Date(fromDate)) && 
                                  (!toDate || articleDate <= new Date(toDate));
                
                const matchesAuthor = !author || 
                    article.author.toLowerCase().includes(author.toLowerCase());
                
                return matchesSearch && matchesDate && matchesAuthor;
            })
            .slice(offset, offset + limit)
            .map(article => ({
                id: article.id,
                title: article.title,
                author: article.author,
                timestamp: article.timestamp,
                preview: article.html.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
            }));
        }
    };

    window.brc333Search.set(sourceId, searchInterface);    
    return searchInterface;
}

/**
 * Processes the date for an article, handling both explicit dates and inscription timestamps
 * @param {Object} article - The article object containing either date string or inscription id
 * @param {string} article.date - Optional date string in format "DD MMM YYYY HH:mm:ss Z" 
 * @param {string} article.id - The inscription id to get timestamp from if no date provided
 * @returns {number} Timestamp in milliseconds
 */
async function processArticleDate(article) {
    console.log('Processing article date:', article);
    if (article.date) {
        // Parse the provided date string
        return new Date(article.date).getTime();
    } else {
        // Get timestamp from inscription ID if no date provided
        const inscriptionTimestamp = await getInscriptionTimestamp(article.id);
        return inscriptionTimestamp * 1000; // Convert to milliseconds
    }
}

/**
 * Retrieves the timestamp from an inscription's metadata
 * @param {string} inscriptionId - The inscription ID to lookup
 * @returns {number} Unix timestamp in seconds
 */
async function getInscriptionTimestamp(inscriptionId) {
    try {
        const response = await fetch(`https://ordinals.com/r/inscription/${inscriptionId}`);
        const data = await response.json();
        console.log('Response:', response);
        return data.timestamp;
    } catch (error) {
        console.log(`Error fetching timestamp for inscription ${inscriptionId}:`, error);
        return Date.now() / 1000; // Return current timestamp as fallback
    }
}

function createTagCloud() {
    const tagFrequency = {};
    const selectedTags = new Set();
    
    articles.forEach(article => {
        article.tags?.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
    });

    const maxFreq = Math.max(...Object.values(tagFrequency));
    const container = document.createElement('div');
    container.className = 'tag-cloud-container';

    const controls = document.createElement('div');
    controls.className = 'tag-cloud-controls';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'tag-cloud-toggle';
    toggleButton.textContent = 'Show Tags';

    const tagCloud = document.createElement('div');
    tagCloud.className = 'tag-cloud';

    Object.entries(tagFrequency).forEach(([tag, freq]) => {
        const size = 0.8 + (freq / maxFreq) * 0.7;
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-cloud-tag';
        tagElement.textContent = tag;
        tagElement.style.fontSize = `${size}em`;
        tagElement.dataset.tag = tag;
        
        tagElement.onclick = () => {
            tagElement.classList.toggle('selected');
            if (tagElement.classList.contains('selected')) {
                selectedTags.add(tag);
            } else {
                selectedTags.delete(tag);
            }
            
            filteredResults = articles.filter(article => 
                selectedTags.size === 0 || 
                article.tags?.some(t => selectedTags.has(t))
            );
            currentPage = 1;
            refreshArticleList();
        };
        
        tagCloud.appendChild(tagElement);
    });

    const actionButtons = document.createElement('div');
    actionButtons.className = 'tag-cloud-controls';
    actionButtons.style.display = 'none';
    
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-tags';
    clearButton.textContent = 'Clear';
    clearButton.onclick = () => {
        selectedTags.clear();
        document.querySelectorAll('.tag-cloud-tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        filteredResults = articles;
        currentPage = 1;
        refreshArticleList();
    };
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-tags';
    closeButton.textContent = 'Close';

    toggleButton.onclick = () => {
        tagCloud.classList.add('open');
        toggleButton.style.display = 'none';
        actionButtons.style.display = 'flex';
    };

    closeButton.onclick = () => {
        tagCloud.classList.remove('open');
        toggleButton.style.display = 'block';
        actionButtons.style.display = 'none';
    };

    controls.appendChild(toggleButton);
    actionButtons.appendChild(clearButton);
    actionButtons.appendChild(closeButton);
    container.appendChild(controls);
    container.appendChild(tagCloud);
    container.appendChild(actionButtons);
    
    return container;
}

function updateFiltering(selectedTags) {
    filteredResults = articles.filter(article => {
        if (selectedTags.size === 0) return true;
        return article.tags?.some(tag => selectedTags.has(tag));
    });
    refreshArticleList();
}

function updateClearButton(selectedTags) {
    const clearButton = document.querySelector('.clear-tags');
    clearButton.classList.toggle('visible', selectedTags.size > 0);
}

// Modify displayArticle to highlight matching tags
function highlightMatchingTags(article) {
    document.querySelectorAll('.tag-cloud-tag').forEach(tagElement => {
        if (article.tags?.includes(tagElement.textContent)) {
            tagElement.classList.add('selected');
        }
    });
}

// Add functions to window for use in other scripts
window.Docs = {
    applyStyles,
    fetchLayoutContent,
    fetchArticles,
    displayArticleLinks,
    addPaginationAndButton,
    processArticleContent,
    createArticleLink,
    displayArticle,
    refreshArticleList,
    filterArticles,
    createPaginationControls,
    addSearchControls,
    addNavigationButtons,
    showCustomModal,
    loadMarked,
    handleMouseOver,
    createSearchableInterface,
    processArticleDate,
    getInscriptionTimestamp
};
