/* eslint-disable */
/* global WebImporter */

// Source: <div class="recipe-carousel">, one row per category:
// cell 1 = category name, cell 2 = paragraphs with recipe image links.
// The texts above/below the carousel are hard-coded in the block on the source.
// Model: block fields heading | subtitle | recipesHeading | viewAllLabel |
// viewLessLabel | viewAllLink (one row each), then recipe-category items:
// category | recipes (richtext) | icon (image).

const DEFAULTS = {
  heading: 'YiPPee! With a Twist!',
  subtitle: 'Explore all the new and exciting ways you can make your YiPPee! Noodles and Pasta',
  recipesHeading: 'Recipes',
  viewAllLabel: 'View all',
  viewLessLabel: 'View less',
};

// icons the block shows by default (files in the code repository root)
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

function field(document, name, ...nodes) {
  const content = nodes.filter(Boolean);
  if (!content.length) return null;
  const frag = document.createDocumentFragment();
  frag.append(document.createComment(` field:${name} `), ...content);
  return frag;
}

function cell(document, ...fields) {
  const parts = fields.filter(Boolean);
  if (!parts.length) return '';
  const frag = document.createDocumentFragment();
  frag.append(...parts);
  return frag;
}

function text(document, value) {
  return value ? document.createTextNode(value) : null;
}

function richtext(document, el) {
  if (!el) return [];
  const hasBlocks = el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol');
  if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
  const content = el.textContent.trim();
  if (!content) return [];
  const p = document.createElement('p');
  p.textContent = content;
  return [p];
}

function image(document, el, alt) {
  const source = el?.querySelector('img');
  let src = source?.getAttribute('src');
  if (!src) return null;
  const img = document.createElement('img');
  img.src = new URL(src, document.baseURI).toString();
  if (source.alt || alt) img.alt = source.alt || alt;
  return img;
}

function defaultIcon(document, category) {
  const path = DEFAULT_ICONS[category.toLowerCase()];
  if (!path) return null;
  const img = document.createElement('img');
  img.src = new URL(path, document.baseURI).toString();
  img.alt = category;
  return img;
}

export default function parse(element, { document }) {
  const configCells = Object.keys(DEFAULTS).map((name) => [
    cell(document, field(document, name, text(document, DEFAULTS[name]))),
  ]);
  // viewAllLink: no target on the source (the button expands the list)
  configCells.push(['']);

  const itemCells = [...element.children].map((row) => {
    const [categoryCell, recipesCell, iconCell] = row.children;
    const category = categoryCell?.textContent.trim() || '';
    return [
      cell(document, field(document, 'category', text(document, category))),
      cell(document, field(document, 'recipes', ...richtext(document, recipesCell))),
      cell(document, field(document, 'icon', image(document, iconCell, category) || (category ? defaultIcon(document, category) : null))),
    ];
  });

  const cells = [...configCells, ...itemCells];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Recipe Carousel', cells });
  element.replaceWith(block);
}
