// --- Constants & Data ---

const MOCK_POSTS = [
    // Add your posts here.
    
    {
      id: '0',
      type: 'short_post',
      content: "今天我建好了我的网站。",
      tags: ['test'],
      publish_date: '2025-12-25T023:56:00Z',
      media: []
    }
    
];

// --- Icons (SVG Strings) ---
const ICONS = {
    circle: `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

// --- State ---
let state = {
    activeTag: null,
    searchQuery: '',
    route: 'home', // 'home' or 'article'
    articleId: null
};

// --- Utils ---
const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const formatFullDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// --- Core Logic ---

const getAllTags = () => {
    const tags = new Set();
    MOCK_POSTS.forEach(post => post.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
};

const getFilteredPosts = () => {
    let posts = MOCK_POSTS;
    
    // Tag filter
    if (state.activeTag) {
        posts = posts.filter(p => p.tags.includes(state.activeTag));
    }

    // Search filter
    if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        posts = posts.filter(post => 
            (post.title && post.title.toLowerCase().includes(q)) ||
            post.content.toLowerCase().includes(q) ||
            post.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }
    
    // Sort by date desc (if not already sorted)
    posts.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

    return posts;
};

// --- Component Renderers ---

const renderSidebar = () => {
    const allTags = getAllTags();
    
    return `
    <aside class="md:sticky md:top-12 h-fit mb-12 md:mb-0 animate-swiss-reveal">
        <a href="#/" class="block mb-12 js-home-link">
            <h1 class="text-4xl font-bold tracking-tighter mb-2">NOTES.</h1>
            <p class="text-xs font-mono uppercase tracking-[0.2em] text-swiss-gray/60 select-none">
                █████ ██████ ██████
            </p>
        </a>

        <div class="mb-8">
            <input 
                type="text" 
                id="search-input"
                value="${state.searchQuery}"
                placeholder="SEARCH..."
                class="w-full bg-transparent border-b border-swiss-black/20 py-2 text-xs font-mono uppercase tracking-widest text-swiss-black placeholder:text-swiss-gray/50 focus:outline-none focus:border-swiss-orange transition-colors"
            />
        </div>

        <div class="mb-8">
            <h3 class="text-xs font-bold uppercase tracking-widest mb-4 border-b border-swiss-black pb-2">
                Filter by Tag
            </h3>
            <ul class="space-y-2">
                <li>
                    <button class="js-tag-btn text-sm w-full text-left transition-colors flex items-center justify-between group ${state.activeTag === null ? 'text-swiss-orange font-bold' : 'text-swiss-black hover:text-swiss-orange'}" data-tag="">
                        <span>ALL</span>
                        ${state.activeTag === null ? ICONS.circle : ''}
                    </button>
                </li>
                ${allTags.map(tag => `
                    <li>
                        <button class="js-tag-btn text-sm font-mono w-full text-left transition-colors flex items-center justify-between ${state.activeTag === tag ? 'text-swiss-orange font-bold' : 'text-swiss-gray hover:text-swiss-black'}" data-tag="${tag}">
                            <span>#${tag}</span>
                            ${state.activeTag === tag ? ICONS.x : ''}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="text-[10px] text-swiss-gray/40 leading-loose max-w-[200px] font-mono select-none">
            <p>████. ████</p>
            <p>██ ████████ ███████ ██ ███████ ███ ████████.</p>
            <p>████████ ████ ██████ █████████ ██ ████ ███ ██████████.</p>
        </div>
    </aside>
    `;
};

const renderPostCard = (post) => {
    const isLong = post.type === 'long_article';
    const dateStr = formatDate(post.publish_date);
    
    // Tags HTML
    const tagsHtml = post.tags.map(tag => 
        `<span class="text-[10px] font-bold uppercase tracking-widest text-swiss-black/40">#${tag}</span>`
    ).join('');

    // Media HTML (for short posts)
    let mediaHtml = '';
    if (!isLong && post.media) {
        mediaHtml = post.media.map(m => `
            <div class="mt-4 mb-2 overflow-hidden bg-swiss-black/5">
                ${(m.type === 'image' || m.type === 'video') ? 
                    `<img src="${m.url}" alt="${m.caption || ''}" class="w-full h-auto max-h-[500px] object-cover filter grayscale hover:grayscale-0 transition-all duration-500"/>` : ''}
                ${m.caption ? `<div class="mt-2 text-xs font-mono text-swiss-gray text-right">${m.caption}</div>` : ''}
            </div>
        `).join('');
    }

    // Content HTML
    let contentHtml = '';
    if (isLong) {
        contentHtml = `
            <div>
                <a href="#/article/${post.id}" class="block group-hover:opacity-80 transition-opacity">
                    <h2 class="text-3xl font-bold leading-tight tracking-tight mb-4 text-swiss-black">${post.title || ''}</h2>
                    <p class="text-lg text-swiss-black/70 mb-6 leading-relaxed">${post.excerpt || ''}</p>
                </a>
                <a href="#/article/${post.id}" class="inline-flex items-center gap-2 text-swiss-orange font-medium hover:gap-4 transition-all duration-300">
                    Read Article ${ICONS.arrowRight}
                </a>
            </div>
        `;
    } else {
        contentHtml = `
            <div>
                <p class="text-xl leading-relaxed text-swiss-black mb-6 whitespace-pre-wrap">${post.content}</p>
                ${mediaHtml}
            </div>
        `;
    }

    return `
    <div class="group relative border-t border-swiss-black/10 py-12 hover:bg-white/50 transition-colors duration-300 animate-swiss-reveal">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div class="md:col-span-3 flex md:flex-col justify-between md:justify-start gap-2">
                <time class="text-sm font-mono text-swiss-gray">${dateStr}</time>
                <span class="text-xs font-mono uppercase tracking-widest text-swiss-orange hidden md:block">
                    ${isLong ? 'Article' : 'Note'}
                </span>
            </div>
            <div class="md:col-span-9">
                <div class="flex flex-wrap gap-3 mb-4">${tagsHtml}</div>
                ${contentHtml}
            </div>
        </div>
    </div>
    `;
};

const renderHome = () => {
    const posts = getFilteredPosts();
    const sidebarHtml = renderSidebar();

    const timelineHeader = `
        <div class="mb-8 flex items-baseline gap-4 animate-swiss-reveal">
            <h2 class="text-sm font-bold uppercase tracking-widest border-b border-swiss-black pb-2 flex-grow">Timeline</h2>
            ${(state.activeTag || state.searchQuery) ? `
                <span class="text-xs font-mono text-swiss-orange">
                    ${state.activeTag ? `#${state.activeTag}` : ''}
                    ${state.activeTag && state.searchQuery ? '/' : ''}
                    ${state.searchQuery ? `"${state.searchQuery}"` : ''}
                </span>
            ` : ''}
        </div>
    `;

    const postsHtml = posts.length > 0 
        ? posts.map(renderPostCard).join('')
        : `<div class="py-20 text-center text-swiss-gray/40 font-mono animate-swiss-reveal select-none">▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒</div>`;

    const mainHtml = `
        ${timelineHeader}
        <div class="flex flex-col">
            ${postsHtml}
            <div class="py-12 border-t border-swiss-black/10 text-center">
                <span class="text-swiss-black text-2xl">•</span>
            </div>
        </div>
    `;

    return `
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div class="md:col-span-3">${sidebarHtml}</div>
        <main class="md:col-span-9">${mainHtml}</main>
    </div>
    `;
};

const renderArticle = () => {
    const post = MOCK_POSTS.find(p => p.id === state.articleId);
    
    if (!post || post.type !== 'long_article') {
        window.location.hash = '/';
        return '';
    }

    const tagsHtml = post.tags.map(tag => 
        `<span class="text-xs font-mono uppercase tracking-widest text-swiss-gray">#${tag}</span>`
    ).join('');

    let mediaHtml = '';
    if (post.media && post.media.length > 0) {
        mediaHtml = `
        <figure class="mb-12">
            <img src="${post.media[0].url}" alt="${post.media[0].caption || ''}" class="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"/>
            ${post.media[0].caption ? `<figcaption class="mt-2 text-xs text-swiss-gray text-right font-mono">${post.media[0].caption}</figcaption>` : ''}
        </figure>
        `;
    }

    return `
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div class="md:col-span-3 hidden md:block border-r border-dashed border-swiss-black/20 h-full">
            <a href="#/" class="fixed top-12 md:static block">
                <h1 class="text-2xl font-bold tracking-tighter mb-2 hover:text-swiss-orange transition-colors">NOTES.</h1>
            </a>
        </div>
        <main class="md:col-span-8 md:col-start-4">
            <article class="max-w-3xl animate-swiss-reveal pb-20">
                <a href="#/" class="inline-flex items-center gap-2 text-swiss-orange hover:text-swiss-black transition-colors mb-12 group">
                    <span class="transform group-hover:-translate-x-1 transition-transform inline-block">${ICONS.arrowLeft}</span>
                    <span class="font-medium tracking-tight">Back to Timeline</span>
                </a>

                <header class="mb-12">
                    <div class="flex flex-wrap gap-2 mb-6">${tagsHtml}</div>
                    <h1 class="text-4xl md:text-6xl font-bold leading-tight tracking-tighter text-swiss-black mb-6">${post.title}</h1>
                    <div class="flex items-center gap-2 text-swiss-gray text-sm border-l-2 border-swiss-orange pl-3">
                        ${ICONS.clock}
                        <span>${formatFullDate(post.publish_date)}</span>
                    </div>
                </header>

                ${mediaHtml}

                <div class="prose prose-lg prose-neutral max-w-none">
                    ${post.content}
                </div>
            </article>
        </main>
    </div>
    `;
};

// --- App Controller ---

const renderApp = () => {
    const root = document.getElementById('root');
    if (state.route === 'home') {
        root.innerHTML = renderHome();
        attachHomeListeners();
    } else if (state.route === 'article') {
        root.innerHTML = renderArticle();
    }
};

const attachHomeListeners = () => {
    // Search input
    const input = document.getElementById('search-input');
    if (input) {
        input.focus();
        // Move cursor to end
        input.setSelectionRange(input.value.length, input.value.length);
        
        input.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderApp(); // Re-render to show filtered results
        });
    }

    // Tag buttons
    document.querySelectorAll('.js-tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = btn.dataset.tag;
            state.activeTag = tag === "" ? null : tag;
            // Clear tag when clicking ALL, but preserve search query if any? 
            // The React logic was: clear tag, but search query is separate state.
            // React: <Link to="/" onClick={() => setActiveTag(null)}>
            // React: Button onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            
            // If clicking the active tag again, clear it (toggle)
            // Logic handled by btn.dataset.tag logic above combined with checking state
            
            // If data-tag is empty string, it's 'ALL'
            if (tag && state.activeTag === tag) {
                // It was already active, now we toggle off?
                // Wait, if I clicked 'tagA' and it was 'tagA', I want to turn it off?
                // The renderer sets dataset.tag to the specific tag.
                // The logic: if activeTag == tag, set to null.
                // BUT I just set state.activeTag = tag.
                // Let's refine the click handler.
            }
            // Better logic:
            // The render loop sets the dataset.tag properly.
            // If I click 'ALL', tag is empty string.
            // If I click 'Design', tag is 'Design'.
            
            const clickedTag = btn.dataset.tag || null;
            if (state.activeTag === clickedTag && clickedTag !== null) {
               state.activeTag = null; // Toggle off
            } else {
               state.activeTag = clickedTag;
            }
            
            renderApp();
        });
    });

    // Reset Tag when clicking Logo (handled via hash change usually, but explicit click handler in React)
    const homeLink = document.querySelector('.js-home-link');
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            state.activeTag = null;
            // let hash change handle the route, but state update needs to happen
            // renderApp will be called by hashchange if hash changes, or we force it if already on hash
            if (window.location.hash === '' || window.location.hash === '#/') {
                renderApp();
            }
        });
    }
};

const handleHashChange = () => {
    const hash = window.location.hash;
    
    if (hash.startsWith('#/article/')) {
        state.route = 'article';
        state.articleId = hash.replace('#/article/', '');
    } else {
        state.route = 'home';
        state.articleId = null;
    }
    renderApp();
    window.scrollTo(0, 0);
};

// --- Initialization ---

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('DOMContentLoaded', handleHashChange); // Handle initial load

