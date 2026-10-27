import { moveInstrumentation, moveCellInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_LOGO = 'https://s7ap1.scene7.com/is/image/itcportalprod/Yippee-itc-logo-updated-5?fmt=webp-alpha';
const DEFAULT_LOGO_ALT = 'Sunfeast YiPPee! & ITC Logo';
const DEFAULT_COPYRIGHT = '© 2026 YiPPee!. All Rights Reserved.';

const SOCIALS = [
  {
    name: 'Instagram',
    hosts: ['instagram.com'],
    url: 'https://www.instagram.com/sunfeast_yippee/',
    svg: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
  },
  {
    name: 'Facebook',
    hosts: ['facebook.com', 'fb.com', 'fb.me'],
    url: 'https://www.facebook.com/SunfeastYiPPee/',
    svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  },
  {
    name: 'YouTube',
    hosts: ['youtube.com', 'youtu.be'],
    url: 'https://www.youtube.com/@SunfeastYiPPee',
    svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  },
  {
    name: 'X',
    hosts: ['twitter.com', 'x.com'],
    url: 'https://twitter.com/SunfeastYiPPee',
    svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  },
];

const IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)|scene7\.com\/is\/image/i;

function socialFor(href) {
  let host;
  try {
    host = new URL(href, window.location.href).hostname.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return null;
  }
  return SOCIALS.find((s) => s.hosts.some((h) => host === h || host.endsWith(`.${h}`))) || null;
}

function extractLinksFromRow(colRow) {
  const anchors = [...colRow.querySelectorAll('a')];
  if (anchors.length > 0) {
    return anchors.map((a) => ({
      text: a.textContent.trim(),
      href: a.href || '#',
    }));
  }

  const ps = [...colRow.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter(Boolean);
  if (ps.length > 1) {
    return ps.map((text) => ({ text, href: '#' }));
  }

  const text = colRow.textContent.trim();
  const splitted = text.split(/\s{2,}|\n+|\t+/).map((t) => t.trim()).filter(Boolean);
  if (splitted.length > 1) {
    return splitted.map((t) => ({ text: t, href: '#' }));
  }

  return text ? [{ text, href: '#' }] : [];
}

function isEmptyRow(row) {
  return !row.textContent.trim() && !row.querySelector('picture, img');
}

function isLogoRow(row) {
  const text = row.textContent.trim();
  if (row.querySelector('picture, img') || text.includes('Yippee-itc-logo') || text.includes('scene7.com')) {
    return true;
  }
  const links = [...row.querySelectorAll('a[href]')];
  return links.length === 1 && IMAGE_URL.test(links[0].getAttribute('href'));
}

function isCopyrightRow(row) {
  const text = row.textContent.trim().toLowerCase();
  return text.includes('©') || text.includes('rights reserved') || text.includes('itc portal');
}

function isSocialRow(row) {
  const links = [...row.querySelectorAll('a[href]')];
  return links.length > 0 && links.every((a) => socialFor(a.getAttribute('href')));
}

/**
 * Block fields come first, one row each: logoUrl | logoAltLabel | copyright | socials,
 * followed by one row per footer column. Content authored before these fields existed
 * (the live footer) has a logo row, link columns and a © row in any order, so it is
 * classified by content instead.
 */
function readRows(block) {
  const rows = [...block.children];
  const [logo, alt, copy, social] = rows;

  // new shape: a logo row (or empty) followed by the plain-text logo alt row (or empty);
  // the live footer has a link column in second position
  const hasConfig = rows.length >= 4
    && (isEmptyRow(logo) || isLogoRow(logo) || logo.querySelectorAll('a[href]').length === 1)
    && !alt.querySelector('a, picture, img') && alt.querySelectorAll('p').length <= 1
    && !isCopyrightRow(alt);

  if (hasConfig) {
    const value = (row) => (isEmptyRow(row) ? null : row);
    return {
      logoCol: value(logo),
      altRow: alt,
      bottomRow: value(copy),
      socialRow: value(social),
      navColumns: rows.slice(4).filter((row) => !isEmptyRow(row)),
    };
  }

  let logoCol = null;
  let bottomRow = null;
  let socialRow = null;
  const navColumns = [];

  rows.forEach((row) => {
    const text = row.textContent.trim();
    const links = [...row.querySelectorAll('a')];

    if (isLogoRow(row)) {
      logoCol = row;
    } else if (isCopyrightRow(row)) {
      bottomRow = row;
    } else if (isSocialRow(row)) {
      socialRow = row;
    } else if (links.length > 0 || text.length > 0) {
      navColumns.push(row);
    }
  });

  return {
    logoCol, altRow: null, bottomRow, socialRow, navColumns,
  };
}

export default function decorate(block) {
  block.classList.add('footer-block');

  const {
    logoCol, altRow, bottomRow, socialRow, navColumns,
  } = readRows(block);

  const logoAlt = altRow?.textContent.trim() || '';

  block.textContent = '';

  const mainFooter = document.createElement('div');
  mainFooter.classList.add('footer-block-main');

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('footer-block-container');

  const logoWrapper = document.createElement('div');
  logoWrapper.classList.add('footer-block-logo-wrapper');

  const pic = logoCol?.querySelector('picture');
  const img = logoCol?.querySelector('img');
  const logoLink = logoCol?.querySelector('a[href]');

  if (pic || img) {
    // move the authored image so it keeps its own instrumentation
    const logoImg = img || pic.querySelector('img');
    if (logoImg && (logoAlt || !logoImg.alt)) logoImg.alt = logoAlt || DEFAULT_LOGO_ALT;
    logoWrapper.append(pic || img);
  } else {
    const newImg = document.createElement('img');
    newImg.src = logoLink?.href || DEFAULT_LOGO;
    newImg.alt = logoAlt || DEFAULT_LOGO_ALT;
    if (logoCol) moveCellInstrumentation(logoCol, newImg);
    logoWrapper.append(newImg);
  }

  mainContainer.append(logoWrapper);

  const navWrapper = document.createElement('div');
  navWrapper.classList.add('footer-block-nav');

  navColumns.forEach((colRow, index) => {
    const colDiv = document.createElement('div');
    colDiv.classList.add('footer-block-col');
    if (index < navColumns.length - 1) {
      colDiv.classList.add('has-divider');
    }
    moveInstrumentation(colRow, colDiv);

    const links = extractLinksFromRow(colRow);
    links.forEach((linkData) => {
      const link = document.createElement('a');
      link.classList.add('footer-block-link');
      link.href = linkData.href;
      link.textContent = linkData.text;
      colDiv.append(link);
    });

    navWrapper.append(colDiv);
  });

  mainContainer.append(navWrapper);
  mainFooter.append(mainContainer);
  block.append(mainFooter);

  const bottomBar = document.createElement('div');
  bottomBar.classList.add('footer-block-bottom');

  const bottomContainer = document.createElement('div');
  bottomContainer.classList.add('footer-block-bottom-container');

  const copyrightWrapper = document.createElement('div');
  copyrightWrapper.classList.add('footer-block-copyright-wrapper');

  let itcPortalLink = null;
  let copyrightText = DEFAULT_COPYRIGHT;

  if (bottomRow) {
    const links = [...bottomRow.querySelectorAll('a')];
    const itcLink = links.find((l) => l.textContent.toLowerCase().includes('itc portal'))
      || links.find((l) => l.textContent.trim() && !l.textContent.includes('©'));
    if (itcLink) {
      itcPortalLink = document.createElement('a');
      itcPortalLink.classList.add('footer-block-itc-link');
      itcPortalLink.href = itcLink.href;
      itcPortalLink.textContent = itcLink.textContent.trim();
    }

    const rawText = bottomRow.textContent;
    const match = rawText.match(/©[\s\S]+/);
    if (match) {
      copyrightText = match[0].trim();
    } else {
      const remaining = rawText.replace(itcLink?.textContent || '', '').trim();
      if (remaining) copyrightText = remaining;
    }
    moveCellInstrumentation(bottomRow, copyrightWrapper);
  }

  if (!itcPortalLink) {
    itcPortalLink = document.createElement('a');
    itcPortalLink.classList.add('footer-block-itc-link');
    itcPortalLink.href = 'https://www.itcportal.com';
    itcPortalLink.target = '_blank';
    itcPortalLink.rel = 'noopener noreferrer';
    itcPortalLink.textContent = 'ITC Portal';
  }

  const copySpan = document.createElement('span');
  copySpan.classList.add('footer-block-copyright');
  copySpan.textContent = copyrightText;

  copyrightWrapper.append(itcPortalLink, copySpan);
  bottomContainer.append(copyrightWrapper);

  const socialWrapper = document.createElement('div');
  socialWrapper.classList.add('footer-block-socials');

  const authoredSocials = socialRow ? [...socialRow.querySelectorAll('a[href]')] : [];
  const socials = authoredSocials.length === 0 ? SOCIALS : authoredSocials.map((a) => {
    const known = socialFor(a.getAttribute('href'));
    const label = a.textContent.trim();
    const isUrlLabel = /^(https?:)?\/\//.test(label) || label.startsWith('/');
    return {
      name: (label && !isUrlLabel ? label : '') || known?.name || label,
      url: a.href,
      svg: known?.svg,
    };
  });
  if (socialRow) moveCellInstrumentation(socialRow, socialWrapper);

  socials.forEach((item) => {
    const a = document.createElement('a');
    a.classList.add('footer-block-social-link');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.name);
    if (item.svg) {
      a.innerHTML = item.svg;
    } else {
      a.textContent = item.name;
    }
    socialWrapper.append(a);
  });

  bottomContainer.append(socialWrapper);
  bottomBar.append(bottomContainer);
  block.append(bottomBar);
}
