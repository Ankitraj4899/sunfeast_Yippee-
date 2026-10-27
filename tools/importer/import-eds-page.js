/* eslint-disable */
/* global WebImporter */

import carouselParser from './parsers/carousel.js';
import yippeeIntroParser from './parsers/yippee-intro.js';
import cardsParser from './parsers/cards.js';
import pastaParser from './parsers/pasta.js';
import recipeCarouselParser from './parsers/recipe-carousel.js';
import treasureHuntParser from './parsers/treasure-hunt.js';
import worldParser from './parsers/world.js';
import creativityParser from './parsers/creativity.js';
import gridCardsParser from './parsers/grid-cards.js';
import footerBlockParser from './parsers/footer-block.js';
import edsSourceTransformer from './transformers/eds-source.js';

const PAGE_TEMPLATE = {
  "name": "eds-page",
  "description": "Existing Edge Delivery pages (home, nav, footer) imported from their authored .plain.html content into AEM authoring, reusing the project blocks as-is",
  "urls": [
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/index.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/nav.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/footer.plain.html"
  ],
  "blocks": [
    {
      "name": "carousel",
      "instances": [
        "div.carousel"
      ]
    },
    {
      "name": "yippee-intro",
      "instances": [
        "div.yippee-intro"
      ]
    },
    {
      "name": "cards",
      "instances": [
        "div.cards"
      ]
    },
    {
      "name": "pasta",
      "instances": [
        "div.pasta"
      ]
    },
    {
      "name": "recipe-carousel",
      "instances": [
        "div.recipe-carousel"
      ]
    },
    {
      "name": "treasure-hunt",
      "instances": [
        "div.treasure-hunt"
      ]
    },
    {
      "name": "world",
      "instances": [
        "div.world"
      ]
    },
    {
      "name": "creativity",
      "instances": [
        "div.creativity"
      ]
    },
    {
      "name": "grid-cards",
      "instances": [
        "div.grid-cards"
      ]
    },
    {
      "name": "footer-block",
      "instances": [
        "div.footer-block"
      ]
    }
  ],
  "sections": []
};

const parsers = {
  'carousel': carouselParser,
  'yippee-intro': yippeeIntroParser,
  'cards': cardsParser,
  'pasta': pastaParser,
  'recipe-carousel': recipeCarouselParser,
  'treasure-hunt': treasureHuntParser,
  'world': worldParser,
  'creativity': creativityParser,
  'grid-cards': gridCardsParser,
  'footer-block': footerBlockParser,
};

const transformers = [edsSourceTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // source pages are <path>.plain.html; the root page is /index.plain.html
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\.plain\.html$/, '')
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
