import { moveInstrumentation, moveCellInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_ICONS = {
  appetizers: '/Appetizers.webp',
  breakfast: '/breakfast.webp',
  snacks: '/Snacks.webp',
  'fancy meal': '/Fancy-Meal.webp',
  'fancy-meal': '/Fancy-Meal.webp',
  fancy: '/Fancy-Meal.webp',
  pasta: '/Lunch-1.webp',
  lunch: '/Lunch-1.webp',
};

const SAMPLE_TITLES = {
  Appetizers: [
    'Scotch Eggs with Noodles...',
    'Noodles Lollipop Recipe',
    'Finger Fries Recipe with...',
    'Scotch Eggs with Noodles Recipe',
    'Noodles Lollipop Recipe',
  ],
  Breakfast: [
    'Masala Omelette Recipe',
    'Yippee Noodle Paratha Recipe',
    'Yippee Noodle Poha Recipe',
    'Yippee Noodle Sandwich Recipe',
    'Yippee Noodle Upma Recipe',
  ],
  Snacks: [
    'Yippee Noodle Chaat Recipe',
    'Yippee Spring Rolls Recipe',
    'Yippee Noodle Burger Recipe',
    'Noodle Bhel Puri Recipe',
    'Cheese Stuffed Balls Recipe',
  ],
  'Fancy Meal': [
    'Masala Noodle Soup Recipe',
    'Yippee Noodle Curry Recipe',
    'Noodle Fried Rice Recipe',
    'Noodle Manchurian Recipe',
    'Yippee Noodle Pulao Recipe',
  ],
  Pasta: [
    'Yippee Noodle Pizza Recipe',
    'Yippee Noodle Tacos Recipe',
    'Creamy Tomato Pasta Recipe...',
    'Cheesy Macaroni Delight',
    'Spicy Masala Pasta Recipe',
  ],
};

const COOKING_TIMES = ['15 Mins', '15 Mins', '20 Mins', '15 Mins', '20 Mins'];

const S7_BASE = 'https://s7ap1.scene7.com/is/image/itcportalprod';

const DISH_IMAGE_RULES = [
  { match: /fries|finger/i, img: '02_Yippee-Finger-Fries' },
  { match: /scotch|egg/i, img: 'Yippee!%20Scotch%20Eggs-thumb' },
  { match: /pocket|lollipop|cutlet|ball|nugget|burger/i, img: 'YiPPee!%20Pockets-1' },
  { match: /sauce|tamarind|curry|soup|pulao|rice|biryani/i, img: '01_Yippee-Noodles-in-Tamarind-Sauce-1' },
  { match: /pasta|macaroni|pizza|tomato/i, img: 'YiPPee-Pasta-Cauliflower-Pasta-1' },
  { match: /sandwich|taco|roll/i, img: 'YiPPee!%20Pockets-1' },
  { match: /stir|chinese|manchurian|szechuan/i, img: 'Yippee!%20Stir-Fried-thumb' },
  { match: /toast|upma|poha|paratha|omelette|chilla/i, img: 'Yippee!%20Stir-Fried-thumb' },
];

function resolveDynamicRecipeImage(r, idx) {
  if (r.image && r.image.trim().length > 0 && !r.image.endsWith('/') && !r.image.includes('Thumbnail')) {
    return r.image.replace(/&#x26;/g, '&');
  }
  const text = `${r.title || ''} ${r.path || ''}`.toLowerCase();
  for (let i = 0; i < DISH_IMAGE_RULES.length; i += 1) {
    if (DISH_IMAGE_RULES[i].match.test(text)) {
      return `${S7_BASE}/${DISH_IMAGE_RULES[i].img}?fmt=webp-alpha&wid=340&fit=fit,1`;
    }
  }
  const fallbacks = [
    'YiPPee!%20Pockets-1',
    'Yippee!%20Scotch%20Eggs-thumb',
    '02_Yippee-Finger-Fries',
    '01_Yippee-Noodles-in-Tamarind-Sauce-1',
    'Yippee!%20Stir-Fried-thumb',
    'YiPPee-Pasta-Cauliflower-Pasta-1',
  ];
  const chosen = fallbacks[idx % fallbacks.length];
  return `${S7_BASE}/${chosen}?fmt=webp-alpha&wid=340&fit=fit,1`;
}

function parseCookingTime(durationStr) {
  if (!durationStr) return { num: '15', unit: 'Mins' };
  const str = String(durationStr).trim();
  const match = str.match(/(\d+)\s*([a-zA-Z]+)?/);
  if (match) {
    const num = match[1];
    let unit = match[2] || 'Mins';
    if (/^min/i.test(unit)) unit = 'Mins';
    return { num, unit };
  }
  return { num: '15', unit: 'Mins' };
}

const COOK_TIME_CACHE = new Map();

async function fetchRecipeCookTime(path) {
  if (!path) return null;
  const cleanPath = path.replace(/\.html$/, '');
  if (COOK_TIME_CACHE.has(cleanPath)) {
    return COOK_TIME_CACHE.get(cleanPath);
  }

  try {
    const res = await fetch(`${cleanPath}.plain.html`);
    if (!res.ok) return null;
    const html = await res.text();
    const cookMatch = html.match(/<strong>\s*Cook\s*Time\s*<\/strong>\s*<\/p>\s*<p>\s*([^<]+)\s*<\/p>/i)
      || html.match(/Cook\s*Time[^<]*<\/p>\s*<p>\s*([^<]+)\s*<\/p>/i);
    if (cookMatch && cookMatch[1]) {
      const time = cookMatch[1].trim();
      COOK_TIME_CACHE.set(cleanPath, time);
      return time;
    }
  } catch (err) {
    // Ignore fetch failures
  }
  return null;
}

function getTitle(text, category, index) {
  if (text && !text.includes('http') && !text.includes('/') && text.trim().length > 2) {
    return text.trim();
  }

  if (SAMPLE_TITLES[category] && SAMPLE_TITLES[category][index]) {
    return SAMPLE_TITLES[category][index];
  }

  return `${category} Recipe ${index + 1}`;
}

function createPdfBlob(title) {
  const cleanTitle = (title || 'YiPPee Recipe').replace(/[^\w\s-]/g, '').trim() || 'Recipe';
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (${cleanTitle}) /Creator (Sunfeast YiPPee!) /Producer (Sunfeast YiPPee! Recipes) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 190 >>
stream
BT
/F1 22 Tf
50 780 Td
(Sunfeast YiPPee! Recipe) Tj
/F1 16 Tf
0 -40 Td
(${cleanTitle}) Tj
/F1 12 Tf
0 -30 Td
(Delicious noodles and pasta recipe by Sunfeast YiPPee!) Tj
0 -20 Td
(Visit https://sunfeastyippee.com for more exciting recipes.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000109 00000 n 
0000000155 00000 n 
0000000214 00000 n 
0000000335 00000 n 
0000000575 00000 n 
trailer
<< /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
653
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

function downloadRecipePdf(recipe) {
  const blob = createPdfBlob(recipe.title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${(recipe.title || 'yippee_recipe').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')}.pdf`;
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getShareUrl(recipe) {
  if (recipe.path) {
    try {
      return new URL(recipe.path, window.location.origin).href;
    } catch (e) {
      // fallback
    }
  }
  const slug = (recipe.title || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://sunfeastyippee.com/recipes/${slug}`;
}

function closeAllCardPopups() {
  document.querySelectorAll('.recipe-card-popup').forEach((popup) => {
    popup.remove();
  });
}

function openShareModal(recipe) {
  closeAllCardPopups();
  const existingModal = document.querySelector('.recipe-share-modal-backdrop');
  if (existingModal) existingModal.remove();

  const shareUrl = getShareUrl(recipe);
  const recipeTitle = recipe.title || 'Sunfeast YiPPee! Recipe';

  const backdrop = document.createElement('div');
  backdrop.className = 'recipe-share-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'recipe-share-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'recipe-share-title');

  modal.innerHTML = `
    <div class="recipe-share-modal-header">
      <h3 id="recipe-share-title" class="recipe-share-modal-title">Share</h3>
      <button type="button" class="recipe-share-modal-close" aria-label="Close share modal">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="recipe-share-modal-body">
      <div class="recipe-share-social-grid">
        <button type="button" class="recipe-share-social-btn recipe-share-fb" aria-label="Share on Facebook">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </span>
          <span class="recipe-share-label">Facebook</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-tw" aria-label="Share on Twitter">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </span>
          <span class="recipe-share-label">Twitter</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-li" aria-label="Share on LinkedIn">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </span>
          <span class="recipe-share-label">LinkedIn</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-mail" aria-label="Share via Email">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          <span class="recipe-share-label">Mail</span>
        </button>
      </div>
      <div class="recipe-share-copy-row">
        <input type="text" class="recipe-share-url-input" readonly value="${shareUrl}" aria-label="Share URL" />
        <button type="button" class="recipe-share-copy-btn">Copy</button>
      </div>
    </div>
  `;

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };

  const closeModal = () => {
    backdrop.remove();
    document.removeEventListener('keydown', handleEsc);
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  const closeBtn = modal.querySelector('.recipe-share-modal-close');
  closeBtn.addEventListener('click', closeModal);

  const fbBtn = modal.querySelector('.recipe-share-fb');
  fbBtn.addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const twBtn = modal.querySelector('.recipe-share-tw');
  twBtn.addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipeTitle)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const liBtn = modal.querySelector('.recipe-share-li');
  liBtn.addEventListener('click', () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const mailBtn = modal.querySelector('.recipe-share-mail');
  mailBtn.addEventListener('click', () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(`Check out this recipe: ${shareUrl}`)}`;
  });

  const copyBtn = modal.querySelector('.recipe-share-copy-btn');
  const input = modal.querySelector('.recipe-share-url-input');

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        input.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    } else {
      input.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    }
  });

  document.addEventListener('keydown', handleEsc);
  backdrop.append(modal);
  document.body.append(backdrop);
}

function toggleCardPopup(card, recipe, event) {
  event.stopPropagation();
  const existing = card.querySelector('.recipe-card-popup');
  if (existing) {
    existing.remove();
    return;
  }

  closeAllCardPopups();

  const popup = document.createElement('div');
  popup.className = 'recipe-card-popup';
  popup.setAttribute('role', 'menu');
  popup.setAttribute('aria-label', 'Recipe options');

  popup.innerHTML = `
    <div class="recipe-popup-row recipe-popup-header-row">
      <button type="button" class="recipe-popup-btn recipe-popup-share-btn">
        <svg class="recipe-popup-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 8.5V4.5L21.5 11L14 17.5V13.5C9 13.5 5.5 15.5 3 19C4 13.5 7.5 8.5 14 8.5Z"/>
        </svg>
        <span>Share</span>
      </button>
      <button type="button" class="recipe-popup-close-btn" aria-label="Close menu">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="recipe-popup-row">
      <button type="button" class="recipe-popup-btn recipe-popup-download-btn">
        <svg class="recipe-popup-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Download</span>
      </button>
    </div>
  `;

  popup.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const closeBtn = popup.querySelector('.recipe-popup-close-btn');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.remove();
  });

  const shareBtn = popup.querySelector('.recipe-popup-share-btn');
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareModal(recipe);
  });

  const downloadBtn = popup.querySelector('.recipe-popup-download-btn');
  downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllCardPopups();
    downloadRecipePdf(recipe);
  });

  card.append(popup);
}

if (!window.recipePopupListenerAttached) {
  document.addEventListener('click', () => {
    closeAllCardPopups();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCardPopups();
    }
  });
  window.recipePopupListenerAttached = true;
}

const DEFAULT_CATEGORIES = ['Appetizers', 'Breakfast', 'Snacks', 'Fancy Meal', 'Pasta'];

// Block-level fields, in model order: one leading row (one cell) each.
const CONFIG_FIELDS = ['heading', 'subtitle', 'recipesHeading', 'viewAllLabel', 'viewLessLabel', 'viewAllLink'];

const DEFAULT_TEXTS = {
  heading: 'YiPPee! With a Twist!',
  subtitle: 'Explore all the new and exciting ways you can make your YiPPee! Noodles and Pasta',
  recipesHeading: 'Recipes',
  viewAllLabel: 'View all',
  viewLessLabel: 'View less',
};

const IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)|scene7\.com\/is\/image/i;

function isConfigRow(row) {
  if (row.children.length !== 1) return false;
  if (row.querySelector('picture, img')) return false;
  return ![...row.querySelectorAll('a[href]')].some((a) => IMAGE_URL.test(a.getAttribute('href')));
}

/**
 * Splits the block rows into block-level field cells and category item rows.
 * Content authored before the block had fields (the live site) has no config rows.
 */
function readRows(block) {
  const rows = [...block.children];
  const config = {};
  let count = 0;
  while (count < CONFIG_FIELDS.length && count < rows.length && isConfigRow(rows[count])) {
    config[CONFIG_FIELDS[count]] = rows[count].firstElementChild;
    count += 1;
  }
  return {
    config,
    itemRows: rows.slice(count).filter((row) => row.children.length > 0),
  };
}

function cellText(cellEl) {
  return cellEl?.textContent.trim() || '';
}

function cellHref(cellEl) {
  if (!cellEl) return '';
  const a = cellEl.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const text = cellText(cellEl);
  return /^(https?:\/\/|\/)\S+$/.test(text) ? text : '';
}

function recipesFromIndex(indexRecipes, key) {
  const matching = indexRecipes.filter((r) => {
    const rCat = (r.category || '').toLowerCase().trim();
    return rCat === key || rCat.includes(key) || key.includes(rCat);
  });

  return matching.map((r, idx) => {
    const cleanTitle = (r.title || 'YiPPee Recipe')
      .replace(/\s*\|\s*Sunfeast\s*YiPPee!?/i, '')
      .replace(/\s*(with\s+)?(Yippee!?\s*Noodles|Sunfeast\s*YiPPee!?)/gi, '')
      .trim();
    return {
      imageUrl: resolveDynamicRecipeImage(r, idx),
      title: cleanTitle,
      duration: r.cookTime || r.cook_time || r.duration
        || COOKING_TIMES[idx % COOKING_TIMES.length],
      path: r.path || '',
      description: r.description || '',
    };
  });
}

// Recipes authored in the category's "recipes" cell (image links or images).
function recipesFromCell(contentCell, categoryName) {
  const items = [];

  if (contentCell) {
    const links = [...contentCell.querySelectorAll('a')];
    const images = [...contentCell.querySelectorAll('img')];

    if (links.length > 0) {
      links.forEach((link, idx) => {
        const imageUrl = link.href;
        if (!imageUrl) return;

        items.push({
          imageUrl,
          title: getTitle(link.textContent, categoryName, idx),
          duration: COOKING_TIMES[idx % COOKING_TIMES.length],
        });
      });
    } else if (images.length > 0) {
      images.forEach((img, idx) => {
        if (!img.src) return;

        items.push({
          imageUrl: img.src,
          title: getTitle(img.alt, categoryName, idx),
          duration: COOKING_TIMES[idx % COOKING_TIMES.length],
        });
      });
    }
  }

  if (items.length === 0) {
    const defaultUrls = [
      `${S7_BASE}/Yippee!%20Scotch%20Eggs-thumb?fmt=webp-alpha&wid=340&fit=fit,1`,
      `${S7_BASE}/YiPPee!%20Pockets-1?fmt=webp-alpha&wid=340&fit=fit,1`,
      `${S7_BASE}/02_Yippee-Finger-Fries?fmt=webp-alpha&wid=340&fit=fit,1`,
    ];

    defaultUrls.forEach((imgUrl, idx) => {
      items.push({
        imageUrl: imgUrl,
        title: getTitle('', categoryName, idx),
        duration: COOKING_TIMES[idx % COOKING_TIMES.length],
      });
    });
  }

  return items;
}

// Placeholder cards for a category the index has no recipes for
function placeholderRecipes(catName) {
  const sampleList = SAMPLE_TITLES[catName] || ['Delicious Recipe 1', 'Delicious Recipe 2', 'Delicious Recipe 3'];
  const sampleImgs = [
    `${S7_BASE}/Yippee!%20Scotch%20Eggs-thumb?fmt=webp-alpha&wid=340&fit=fit,1`,
    `${S7_BASE}/YiPPee!%20Pockets-1?fmt=webp-alpha&wid=340&fit=fit,1`,
    `${S7_BASE}/02_Yippee-Finger-Fries?fmt=webp-alpha&wid=340&fit=fit,1`,
  ];
  return sampleList.slice(0, 3).map((title, idx) => ({
    imageUrl: sampleImgs[idx % sampleImgs.length],
    title,
    duration: COOKING_TIMES[idx % COOKING_TIMES.length],
    path: '',
  }));
}

/**
 * The AEM site root (e.g. /content/sunfeast-yippee) when the page is rendered by
 * AEM Author (Universal Editor), where /query-index.json does not exist.
 */
function aemAuthorSiteRoot() {
  if (!window.location.hostname.endsWith('.adobeaemcloud.com')) return null;
  const match = window.location.pathname.match(/^\/content\/[^/.]+/);
  return match ? match[0] : null;
}

/**
 * Lists the recipe pages of the AEM site with the query builder (same origin, the
 * author's own session) in the shape of query-index.json rows.
 */
async function fetchAuthorRecipes(siteRoot) {
  const recipesRoot = `${siteRoot}/recipes`;
  const params = new URLSearchParams({
    path: recipesRoot,
    type: 'cq:Page',
    'p.limit': '-1',
    'p.hits': 'full',
    'p.nodedepth': '2',
  });
  const res = await fetch(`/bin/querybuilder.json?${params}`);
  if (!res.ok) return [];
  const { hits = [] } = await res.json();
  return hits
    .filter((hit) => hit['jcr:path'] && hit['jcr:path'] !== recipesRoot)
    .map((hit) => {
      const props = hit['jcr:content'] || {};
      return {
        path: `${hit['jcr:path']}.html`,
        title: props['jcr:title'] || '',
        description: props['jcr:description'] || '',
        category: props.category || '',
        duration: props.duration || '',
        cookTime: props.cooktime || '',
        image: props.image?.fileReference || '',
      };
    });
}

async function fetchIndexRecipes(jsonLink) {
  const res = await fetch(jsonLink);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || json;
}

export default async function decorate(block) {
  const { config, itemRows } = readRows(block);
  const texts = {};
  Object.keys(DEFAULT_TEXTS).forEach((name) => {
    texts[name] = cellText(config[name]) || DEFAULT_TEXTS[name];
  });
  const viewAllHref = cellHref(config.viewAllLink);
  const categoriesData = [];

  // 1. Recipes come from the authored index link, else /query-index.json; on AEM
  // Author, where there is no index, from the site's recipe pages
  const authoredJsonLink = block.querySelector('a[href$=".json"]')?.href;
  const authorSiteRoot = authoredJsonLink ? null : aemAuthorSiteRoot();

  let indexRecipes = [];
  try {
    const data = authorSiteRoot
      ? await fetchAuthorRecipes(authorSiteRoot)
      : await fetchIndexRecipes(authoredJsonLink || '/query-index.json');
    if (Array.isArray(data) && data.length > 0) {
      indexRecipes = data.filter((item) => (
        (item.path && item.path.includes('/recipes')) || item.category || item.duration
      ));
    }
  } catch (err) {
    // Fallback gracefully
  }

  const indexLoaded = indexRecipes.length > 0;

  // 2. Tabs: authored category items in authored order (label + icon), or the
  // default categories when there are none.
  const categoryDefs = itemRows.length > 0
    ? itemRows.map((row) => {
      const cells = [...row.children];
      const [categoryCell, recipesCell, iconCell] = cells;
      const categoryName = categoryCell.textContent.trim() || 'Appetizers';
      const key = categoryName.toLowerCase().trim();
      return {
        category: categoryName,
        icon: iconCell?.querySelector('a[href]')?.href || DEFAULT_ICONS[key] || '/Appetizers.webp',
        iconImg: iconCell?.querySelector('img') || null,
        row,
        categoryCell,
        recipesCell: recipesCell || categoryCell,
      };
    })
    : [];

  if (indexLoaded) {
    // 3. Index available: recipes per category from the index, placeholders when the
    // index has none; extra index categories are appended after the listed ones.
    const listed = categoryDefs.length > 0
      ? categoryDefs
      : DEFAULT_CATEGORIES.map((cat) => ({
        category: cat,
        icon: DEFAULT_ICONS[cat.toLowerCase()] || '/Appetizers.webp',
      }));

    const extraCategories = [];
    indexRecipes.forEach((r) => {
      const cat = (r.category || '').trim();
      if (cat && !listed.some((c) => c.category.toLowerCase() === cat.toLowerCase())) {
        if (!extraCategories.some((ec) => ec.toLowerCase() === cat.toLowerCase())) {
          extraCategories.push(cat);
        }
      }
    });

    listed.forEach((catData) => {
      const key = catData.category.toLowerCase().trim();
      let recipes = recipesFromIndex(indexRecipes, key);
      // If category has no items in index, supply placeholders so tab remains interactive
      if (recipes.length === 0) recipes = placeholderRecipes(catData.category);
      categoriesData.push({ ...catData, recipes });
    });

    extraCategories.forEach((catName) => {
      const key = catName.toLowerCase().trim();
      const recipes = recipesFromIndex(indexRecipes, key);
      if (recipes.length > 0) {
        categoriesData.push({
          category: catName,
          icon: DEFAULT_ICONS[key] || '/Appetizers.webp',
          recipes,
        });
      }
    });
  } else if (categoryDefs.length > 0) {
    // 4. Index unavailable: recipes from the authored recipe links
    categoryDefs.forEach((catData) => {
      categoriesData.push({
        ...catData,
        recipes: recipesFromCell(catData.recipesCell, catData.category),
      });
    });
  } else {
    // 5. No index and no authored categories
    DEFAULT_CATEGORIES.forEach((cat) => {
      const key = cat.toLowerCase();
      categoriesData.push({
        category: cat,
        icon: DEFAULT_ICONS[key] || '/Appetizers.webp',
        recipes: [
          {
            imageUrl: `${S7_BASE}/Yippee!%20Scotch%20Eggs-thumb?fmt=webp-alpha&wid=340&fit=fit,1`,
            title: 'Scotch Eggs with Noodles...',
            duration: '15 Mins',
          },
          {
            imageUrl: `${S7_BASE}/YiPPee!%20Pockets-1?fmt=webp-alpha&wid=340&fit=fit,1`,
            title: 'Noodles Lollipop Recipe',
            duration: '15 Mins',
          },
          {
            imageUrl: `${S7_BASE}/02_Yippee-Finger-Fries?fmt=webp-alpha&wid=340&fit=fit,1`,
            title: 'Finger Fries Recipe with...',
            duration: '20 Mins',
          },
        ],
      });
    });
  }

  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'recipe-carousel-container';

  const header = document.createElement('div');
  header.className = 'recipe-carousel-header';

  const wave = document.createElement('div');
  wave.className = 'recipe-top-wave';

  const heading = document.createElement('h2');
  heading.className = 'recipe-main-title';
  const headingText = document.createElement('span');
  headingText.textContent = texts.heading;
  moveCellInstrumentation(config.heading, headingText);
  heading.append(document.createElement('span'), ' ', headingText, ' ', document.createElement('span'));
  [heading.firstElementChild, heading.lastElementChild].forEach((sparkle) => {
    sparkle.className = 'title-sparkle';
    sparkle.textContent = '✧';
  });

  const subtitle = document.createElement('p');
  subtitle.className = 'recipe-main-subtitle';
  subtitle.textContent = texts.subtitle;
  moveCellInstrumentation(config.subtitle, subtitle);

  header.append(wave, heading, subtitle);

  const nav = document.createElement('div');
  nav.className = 'recipe-categories-nav';

  const section = document.createElement('div');
  section.className = 'recipe-cards-section';

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'recipe-section-title';
  sectionTitle.textContent = texts.recipesHeading;
  moveCellInstrumentation(config.recipesHeading, sectionTitle);

  const carousel = document.createElement('div');
  carousel.className = 'recipe-carousel-stage';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'recipe-arrow recipe-arrow-prev';
  prevBtn.type = 'button';
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'recipe-arrow recipe-arrow-next';
  nextBtn.type = 'button';
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', 'Next');

  const viewport = document.createElement('div');
  viewport.className = 'recipe-viewport';

  const track = document.createElement('div');
  track.className = 'recipe-track';

  viewport.append(track);
  carousel.append(prevBtn, viewport, nextBtn);

  const pagination = document.createElement('div');
  pagination.className = 'recipe-dots';

  const viewAllBtn = document.createElement('button');
  viewAllBtn.className = 'recipe-view-all';
  viewAllBtn.type = 'button';
  viewAllBtn.textContent = texts.viewAllLabel;
  moveCellInstrumentation(config.viewAllLabel, viewAllBtn);

  section.append(sectionTitle, carousel, pagination, viewAllBtn);
  container.append(header, nav, section);
  block.append(container);

  let activeCatIndex = 0;
  let currentIndex = 0;
  let isViewAll = false;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const isTablet = () => window.matchMedia('(max-width: 900px)').matches;

  const getCardsPerView = () => {
    if (isMobile()) return 1;
    if (isTablet()) return 2;
    return 3;
  };

  const getActiveRecipes = () => categoriesData[activeCatIndex]?.recipes || [];

  const getMaxIndex = () => Math.max(0, getActiveRecipes().length - getCardsPerView());

  const updatePagination = () => {
    if (isViewAll) return;
    const perView = getCardsPerView();
    const activePage = Math.floor(currentIndex / perView);

    [...pagination.children].forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activePage);
    });
  };

  const updateTrack = () => {
    if (isViewAll) {
      track.style.transform = 'none';
      return;
    }

    const firstCard = track.querySelector('.recipe-card');
    if (!firstCard) return;

    const { width } = firstCard.getBoundingClientRect();
    let gap = 32;
    if (isMobile()) {
      gap = 0;
    } else if (isTablet()) {
      gap = 20;
    }
    const offset = currentIndex * (width + gap);

    track.style.transform = `translateX(-${offset}px)`;

    const maxIdx = getMaxIndex();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIdx;

    prevBtn.classList.toggle('disabled', prevBtn.disabled);
    nextBtn.classList.toggle('disabled', nextBtn.disabled);

    updatePagination();
  };

  const handleDotClick = (i) => {
    const perView = getCardsPerView();
    currentIndex = Math.min(i * perView, getMaxIndex());
    updateTrack();
  };

  const createPagination = () => {
    pagination.innerHTML = '';
    if (isViewAll) return;

    const recipes = getActiveRecipes();
    const perView = getCardsPerView();
    const pages = Math.ceil(recipes.length / perView);

    if (pages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    for (let i = 0; i < pages; i += 1) {
      const dot = document.createElement('button');
      dot.className = 'recipe-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);

      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => handleDotClick(i));

      pagination.append(dot);
    }
  };

  const createCard = (recipe) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    if (recipe.path) {
      card.dataset.path = recipe.path;
    }

    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'recipe-card-menu';
    menu.setAttribute('aria-label', `Menu for ${recipe.title}`);
    menu.innerHTML = '<span></span><span></span><span></span>';

    menu.addEventListener('click', (e) => {
      toggleCardPopup(card, recipe, e);
    });

    const isLink = Boolean(recipe.path);
    const imageWrap = document.createElement(isLink ? 'a' : 'div');
    imageWrap.className = 'recipe-card-image-wrap';
    if (isLink) {
      imageWrap.href = recipe.path;
      imageWrap.setAttribute('aria-label', recipe.title);
    }

    const img = document.createElement('img');
    img.className = 'recipe-card-img';
    img.src = recipe.imageUrl;
    img.alt = recipe.title;

    imageWrap.append(img);

    const footer = document.createElement('div');
    footer.className = 'recipe-card-footer';

    const title = document.createElement(isLink ? 'a' : 'div');
    title.className = 'recipe-card-title';
    title.textContent = recipe.title;
    if (isLink) {
      title.href = recipe.path;
    }

    const timeWrap = document.createElement('div');
    timeWrap.className = 'recipe-card-time';

    const badge = document.createElement('div');
    badge.className = 'recipe-card-badge';

    const { num, unit } = parseCookingTime(recipe.duration);
    badge.innerHTML = `<span class="badge-number">${num}</span>`;

    const unitEl = document.createElement('span');
    unitEl.className = 'badge-unit';
    unitEl.textContent = unit;

    timeWrap.append(badge, unitEl);
    footer.append(title, timeWrap);
    card.append(menu, imageWrap, footer);

    if (recipe.path && !recipe.duration) {
      fetchRecipeCookTime(recipe.path).then((cookTime) => {
        if (cookTime) {
          const parsed = parseCookingTime(cookTime);
          const numEl = badge.querySelector('.badge-number');
          if (numEl) numEl.textContent = parsed.num;
          unitEl.textContent = parsed.unit;
        }
      });
    }

    return card;
  };

  const renderCards = () => {
    track.innerHTML = '';
    const recipes = getActiveRecipes();

    recipes.forEach((recipe) => {
      track.append(createCard(recipe));
    });

    createPagination();
    updateTrack();
  };

  const activateTab = (idx) => {
    if (activeCatIndex === idx) return;

    activeCatIndex = idx;
    currentIndex = 0;

    [...nav.children].forEach((t, i) => {
      t.classList.toggle('active', i === activeCatIndex);
    });

    renderCards();
  };

  const renderTabs = () => {
    nav.innerHTML = '';

    categoriesData.forEach((catData, idx) => {
      const tab = document.createElement('button');
      tab.className = 'recipe-category-tab';
      tab.type = 'button';
      if (idx === activeCatIndex) tab.classList.add('active');

      const iconWrap = document.createElement('div');
      iconWrap.className = 'recipe-category-icon-wrap';

      let icon;
      if (catData.iconImg) {
        // authored icon: move the image so it keeps its own instrumentation
        icon = catData.iconImg;
        icon.removeAttribute('width');
        icon.removeAttribute('height');
        if (!icon.alt) icon.alt = catData.category;
        icon.className = 'recipe-category-icon';
      } else {
        icon = document.createElement('img');
        icon.className = 'recipe-category-icon';
        icon.src = catData.icon;
        icon.alt = catData.category;
      }

      iconWrap.append(icon);

      const label = document.createElement('span');
      label.className = 'recipe-category-name';
      label.textContent = catData.category;
      if (catData.categoryCell) moveCellInstrumentation(catData.categoryCell, label);
      if (catData.row) moveInstrumentation(catData.row, tab);

      const line = document.createElement('span');
      line.className = 'recipe-category-indicator';

      tab.append(iconWrap, label, line);

      tab.addEventListener('click', () => activateTab(idx));

      nav.append(tab);
    });
  };

  prevBtn.addEventListener('click', () => {
    if (isViewAll) return;
    const step = getCardsPerView();
    currentIndex = Math.max(0, currentIndex - step);
    updateTrack();
  });

  nextBtn.addEventListener('click', () => {
    if (isViewAll) return;
    const step = getCardsPerView();
    currentIndex = Math.min(getMaxIndex(), currentIndex + step);
    updateTrack();
  });

  viewAllBtn.addEventListener('click', () => {
    if (viewAllHref) {
      window.location.href = viewAllHref;
      return;
    }
    isViewAll = !isViewAll;
    block.classList.toggle('is-view-all', isViewAll);

    if (isViewAll) {
      track.style.transform = 'none';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      pagination.style.display = 'none';
      viewAllBtn.textContent = texts.viewLessLabel;
    } else {
      prevBtn.style.display = '';
      nextBtn.style.display = '';
      pagination.style.display = '';
      viewAllBtn.textContent = texts.viewAllLabel;
      currentIndex = 0;
      createPagination();
      updateTrack();
    }
  });

  window.addEventListener('resize', () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    createPagination();
    updateTrack();
  });

  // Universal Editor: selecting a category item shows its tab
  block.addEventListener('aue:ui-select', (e) => {
    if (!e.detail?.selected) return;
    const tab = e.target.closest?.('.recipe-category-tab');
    if (!tab || !nav.contains(tab)) return;
    const idx = [...nav.children].indexOf(tab);
    if (idx >= 0) activateTab(idx);
  });

  renderTabs();
  renderCards();
}
