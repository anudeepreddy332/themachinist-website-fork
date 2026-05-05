// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const sunIcon = themeToggle?.querySelector('.sun-icon');
const moonIcon = themeToggle?.querySelector('.moon-icon');
const htmlElement = document.documentElement;

if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle(currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeToggle(theme);
    });

    function updateThemeToggle(theme) {
        if (theme === 'dark') {
            themeToggle.classList.add('active');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            themeToggle.classList.remove('active');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
}

// Nav Visibility on Scroll (debounced)
let scrollTimeout;
const nav = document.getElementById('nav');
if (nav) {
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            nav.classList.toggle('visible', window.scrollY > 100);
        }, 10);
    };
    window.addEventListener('scroll', handleScroll);
}

// Smooth Scroll for Anchor Links with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.getElementById('nav')?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - navHeight - 20; // 20px extra breathing room

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeButton = document.querySelector('.close-menu');
if (hamburger && mobileMenu) {
    const toggleMenu = () => {
        const isActive = hamburger.classList.contains('active');
        hamburger.classList.toggle('active', !isActive);
        mobileMenu.classList.toggle('active', !isActive);
        hamburger.setAttribute('aria-expanded', !isActive);
    };

    hamburger.addEventListener('click', toggleMenu);

    if (closeButton) {
        closeButton.addEventListener('click', toggleMenu);
    }

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// Global Card Search (if present)
const siteSearch = document.querySelector('.site-search');
const siteSearchToggle = siteSearch?.querySelector('.site-search-toggle');
const siteSearchInput = siteSearch?.querySelector('.site-search-input');
const searchableCards = Array.from(document.querySelectorAll?.('.article-card') || []);

if (siteSearch && siteSearchToggle && siteSearchInput && searchableCards.length && window.Fuse) {
    const searchData = searchableCards.map(card => ({
        href: card.getAttribute('href') || '#',
        title: card.querySelector('.article-title')?.textContent || '',
        description: card.querySelector('.article-excerpt')?.textContent || ''
    }));

    const fuse = new Fuse(searchData, {
        keys: ['title', 'description'],
        threshold: 0.15,
        ignoreLocation: true,
        includeScore: true
    });

    const searchModal = document.createElement('div');
    searchModal.id = 'searchModal';
    searchModal.className = 'search-modal';
    searchModal.setAttribute('aria-modal', 'true');
    searchModal.setAttribute('role', 'dialog');
    searchModal.setAttribute('aria-label', 'Search results');
    searchModal.hidden = true;

    const searchBackdrop = document.createElement('div');
    searchBackdrop.className = 'search-modal-backdrop';

    const searchPanel = document.createElement('div');
    searchPanel.className = 'search-modal-panel';

    const searchClose = document.createElement('button');
    searchClose.className = 'search-modal-close';
    searchClose.setAttribute('aria-label', 'Close search results');
    searchClose.textContent = '×';

    const searchCount = document.createElement('p');
    searchCount.className = 'search-modal-count';

    const searchResults = document.createElement('div');
    searchResults.className = 'search-modal-results';

    searchPanel.append(searchClose, searchCount, searchResults);
    searchModal.append(searchBackdrop, searchPanel);
    document.body.appendChild(searchModal);

    const closeSearch = () => {
        siteSearch.classList.remove('open');
        siteSearchToggle.setAttribute('aria-expanded', 'false');
        siteSearchToggle.setAttribute('aria-label', 'Open site search');
        siteSearchInput.value = '';
        searchModal.hidden = true;
        searchResults.replaceChildren();
        searchCount.textContent = '';
    };

    const renderResults = (results, searchTerm) => {
        searchResults.replaceChildren();
        searchCount.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'} for "${searchTerm}"`;

        if (!results.length) {
            const noResults = document.createElement('p');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No results found';
            searchResults.appendChild(noResults);
            return;
        }

        results.forEach(result => {
            const item = result.item;
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'article-card search-result-card';

            const title = document.createElement('h3');
            title.className = 'article-title';
            title.textContent = item.title;

            const description = document.createElement('p');
            description.className = 'article-excerpt';
            description.textContent = item.description;

            link.append(title, description);
            searchResults.appendChild(link);
        });
    };

    const updateSearch = () => {
        const searchTerm = siteSearchInput.value.trim();

        if (searchTerm.length < 3) {
            searchModal.hidden = true;
            searchResults.replaceChildren();
            searchCount.textContent = '';
            return;
        }

        const results = fuse.search(searchTerm).sort((a, b) => a.score - b.score);
        renderResults(results, searchTerm);
        searchModal.hidden = false;
    };

    siteSearchToggle.addEventListener('click', () => {
        const isOpen = siteSearch.classList.contains('open');

        if (isOpen) {
            closeSearch();
            return;
        }

        siteSearch.classList.add('open');
        siteSearchToggle.setAttribute('aria-expanded', 'true');
        siteSearchToggle.setAttribute('aria-label', 'Close site search');
        siteSearchInput.focus();
    });

    siteSearchInput.addEventListener('keyup', updateSearch);
    siteSearchInput.addEventListener('search', updateSearch);
    searchClose.addEventListener('click', closeSearch);
    searchBackdrop.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchModal.hidden) {
            closeSearch();
        }
    });
}

// Card Filters (if present)
const filterGroups = document.querySelectorAll?.('.filter-buttons');
if (filterGroups) {
    filterGroups.forEach(group => {
        const filterButtons = group.querySelectorAll('.filter-btn');
        const cardGrid = group.nextElementSibling;
        const articleCards = cardGrid?.querySelectorAll('.article-card');

        if (!articleCards) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                const filter = button.getAttribute('data-filter');
                articleCards.forEach(card => {
                    card.classList.toggle('hidden', !(filter === 'all' || card.dataset.category === filter));
                });
            });
        });
    });
}
