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

export default function decorate(block) {
  block.classList.add('footer-block');

  const rows = [...block.children];

  let logoCol = null;
  const navColumns = [];
  let bottomRow = null;

  rows.forEach((row) => {
    const text = row.textContent.trim();
    const pic = row.querySelector('picture');
    const img = row.querySelector('img');
    const links = [...row.querySelectorAll('a')];

    if (pic || img || text.includes('Yippee-itc-logo') || text.includes('scene7.com')) {
      logoCol = row;
    } else if (text.includes('©') || text.toLowerCase().includes('rights reserved') || text.toLowerCase().includes('itc portal')) {
      bottomRow = row;
    } else if (links.length > 0 || text.length > 0) {
      navColumns.push(row);
    }
  });

  block.textContent = '';

  const mainFooter = document.createElement('div');
  mainFooter.classList.add('footer-block-main');

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('footer-block-container');

  const logoWrapper = document.createElement('div');
  logoWrapper.classList.add('footer-block-logo-wrapper');

  if (logoCol) {
    const pic = logoCol.querySelector('picture');
    const img = logoCol.querySelector('img');
    const link = logoCol.querySelector('a');

    if (pic) {
      logoWrapper.append(pic.cloneNode(true));
    } else if (img) {
      logoWrapper.append(img.cloneNode(true));
    } else if (link && link.href) {
      const newImg = document.createElement('img');
      newImg.src = link.href;
      newImg.alt = 'Sunfeast YiPPee! & ITC Logo';
      logoWrapper.append(newImg);
    }
  } else {
    const defaultImg = document.createElement('img');
    defaultImg.src = 'https://s7ap1.scene7.com/is/image/itcportalprod/Yippee-itc-logo-updated-5?fmt=webp-alpha';
    defaultImg.alt = 'Sunfeast YiPPee! & ITC Logo';
    logoWrapper.append(defaultImg);
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
  let copyrightText = '© 2026 YiPPee!. All Rights Reserved.';

  if (bottomRow) {
    const links = [...bottomRow.querySelectorAll('a')];
    const itcLink = links.find((l) => l.textContent.toLowerCase().includes('itc portal'));
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
    }
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

  const socials = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/sunfeast_yippee/',
      svg: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/SunfeastYiPPee/',
      svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@SunfeastYiPPee',
      svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    },
    {
      name: 'X',
      url: 'https://twitter.com/SunfeastYiPPee',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    },
  ];

  socials.forEach((item) => {
    const a = document.createElement('a');
    a.classList.add('footer-block-social-link');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.name);
    a.innerHTML = item.svg;
    socialWrapper.append(a);
  });

  bottomContainer.append(socialWrapper);
  bottomBar.append(bottomContainer);
  block.append(bottomBar);
}
