// --- 1. GESTION DES STATISTIQUES (VERSION DIST) ---
let phantmStats = JSON.parse(localStorage.getItem('phantm_dist_stats')) || {};

const triggerAd = (slug) => {
    if (!slug) return;
    phantmStats[slug] = (phantmStats[slug] || 0) + 1;
    localStorage.setItem('phantm_dist_stats', JSON.stringify(phantmStats));
    console.clear();
    console.table(phantmStats);
};

// --- 2. FONCTION BARON (DESSIN) ---
const triggerArt = () => {
    const modalText = document.querySelector('.modal-text');
    if (modalText && !document.getElementById('discussion-container')) {
        const originalContent = modalText.innerHTML;
        const imgPath = window.location.pathname.includes('/articles/') ? '../images/BaronNosferatu.png' : 'images/BaronNosferatu.png';
        modalText.innerHTML = `
            <div id="discussion-container" style="text-align:center; animation: fadeIn 0.4s ease; width: 100%;">
                <img src="${imgPath}" alt="Baron" style="max-width: 100%; max-height: 280px; border-radius: 12px; border: 2px solid #28a745; margin-bottom:15px;">
                <p style="color:#28a745; font-family: monospace; font-weight: bold;">[ SESSION BARON ACTIVÉE ]</p>
                <button id="back-to-article" style="margin-top:10px; background: none; border: 1px solid #28a745; color: #28a745; padding: 5px 15px; cursor: pointer; border-radius: 6px;">Retour</button>
            </div>
        `;
        document.getElementById('back-to-article').onclick = () => { modalText.innerHTML = originalContent; };
    }
};

// --- 3. GATE & REWARD - UNLOCK CONTENT ---
function unlockContent(btn) {
    const container = btn.closest('.content-gate');
    const locked = container.querySelector('.locked-content');
    locked.style.display = 'block';
    locked.style.filter = 'none';
    btn.parentElement.style.display = 'none';
    
    let unlockStats = JSON.parse(localStorage.getItem('phantm_unlock_stats')) || {};
    let articleTitle = document.querySelector('h1')?.innerText || 'Inconnu';
    unlockStats[articleTitle] = (unlockStats[articleTitle] || 0) + 1;
    localStorage.setItem('phantm_unlock_stats', JSON.stringify(unlockStats));
    
    triggerArt(); 
}

// --- 4. MENTIONS LÉGALES ---
function openLegalModal() {
    const modal = document.getElementById('article-modal');
    const legalContent = document.getElementById('legal-content');
    if (modal && legalContent) {
        document.getElementById('modal-title').textContent = "Informations Légales";
        document.querySelector('.modal-text').innerHTML = legalContent.innerHTML;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// --- 5. INJECTION PUB NATIVE (LISTE) ---
let adCounter = 0;

const injectInFeedAd = () => {
    const articles = Array.from(document.querySelectorAll('.article-item'));
    if (articles.length === 0) return;

    // On injecte tous les 3 articles (index 2, 5, 8...)
    for (let i = 2; i < articles.length; i += 3) {
        const adCard = document.createElement('div');
        adCard.className = 'article-item ad-native';
        adCard.style.border = "1px dashed #28a745";
        adCard.style.background = "rgba(40, 167, 69, 0.02)";
        adCard.style.padding = "1.5rem";
        adCard.style.borderRadius = "15px";
        
        adCard.innerHTML = `
            <div class="adsense-slot-middle" style="margin-bottom:15px;">
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2582532644612570" crossorigin="anonymous"></script>
                    <ins class="adsbygoogle"
                         style="display:block; text-align:center;"
                         data-ad-layout="in-article"
                         data-ad-format="fluid"
                         data-ad-client="ca-pub-2582532644612570"
                         data-ad-slot="2242585455"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>
        `;

        articles[i].after(adCard);
        adCounter++;
    }
};

// --- 6. INITIALISATION DES BOUTONS D'ACTION ARTICLES ---
function initArticleActionButtons() {
    const actionButtons = document.querySelectorAll('.modal-action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
            const articleTitle = document.querySelector('h1')?.innerText || 'Article Inconnu';
            
            if (btn.classList.contains('share-btn')) {
                triggerArt();
            } else {
                let reactionStats = JSON.parse(localStorage.getItem('phantm_reaction_stats')) || {};
                const type = btn.classList.contains('like-btn') ? 'heart' : 'like';
                reactionStats[`${articleTitle}_${type}`] = (reactionStats[`${articleTitle}_${type}`] || 0) + 1;
                localStorage.setItem('phantm_reaction_stats', JSON.stringify(reactionStats));
                triggerAd('engagement-article');
            }
        });
    });
}

// --- 7. INITIALISATION GLOBALE ---
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.includes('index.html') || href.includes('../')) return;

            e.preventDefault();
            const targetId = href.substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if(pages.length > 0) {
                pages.forEach(p => p.classList.toggle('active', p.id === targetId));
            }
        });
    });

    // Mentions Légales
    const legalLink = document.getElementById('legal-link');
    const legalLinkMobile = document.getElementById('legal-link-mobile');
    if (legalLink) legalLink.onclick = (e) => { e.preventDefault(); openLegalModal(); };
    if (legalLinkMobile) legalLinkMobile.onclick = (e) => { e.preventDefault(); openLegalModal(); };

    // Sidebar Ad
    const sidebarAd = document.querySelector('.ad-sidebar-container');
    if (sidebarAd) sidebarAd.onclick = () => triggerAd('sidebar-fixed-ad');

    // Lancement
    initModal();
    initCanvasAnimation();
    injectInFeedAd(); // Injection des pubs dans le flux
    initArticleActionButtons();
});

// --- 8. MODALE & CANVAS ---
function initModal() {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    const articles = document.querySelectorAll('.article-item');

    articles.forEach(article => {
        article.onclick = () => {
            if (article.classList.contains('ad-native')) return;

            document.getElementById('modal-title').textContent = article.querySelector('.article-title').textContent;
            document.getElementById('modal-date').textContent = article.querySelector('.article-meta').textContent;
            document.getElementById('modal-author').textContent = article.querySelector('.article-author').textContent;
            
            const content = article.querySelector('.full-article-content')?.innerHTML || "";
            const adBanner = `
                <div class="article-ad-box" style="margin-top:25px; padding:20px; background:#fcfcfc; border-radius:15px; border:1px solid #eee; text-align:center;">
                    <small style="color:#bbb; font-size:0.7rem;">PUBLICITÉ</small>
                    <div style="margin-top:10px; color:#444; font-weight:bold;">Sponsor de l'article</div>
                    <button style="margin-top:10px; padding:5px 15px; border-radius:20px; border:1px solid #d7e3fc; background:white; cursor:pointer;" onclick="triggerAd('internal-article-ad')">En savoir plus</button>
                </div>`;
            
            document.querySelector('.modal-text').innerHTML = content + adBanner;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            triggerAd(article.getAttribute('data-slug') || "art");
        };
    });

    document.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
}

function initCanvasAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const resize = () => {
        width = canvas.width = window.innerWidth - (window.innerWidth > 768 ? 200 : 0);
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    const drops = new Array(Math.floor(width / 14)).fill(1);
    setInterval(() => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#d7e3fc';
        drops.forEach((y, i) => {
            ctx.fillText('01'[Math.floor(Math.random()*2)], i * 14, y * 14);
            if (y * 14 > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 50);
}
