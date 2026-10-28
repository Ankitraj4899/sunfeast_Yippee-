/* eslint-disable */
/* global WebImporter */

import recipeInfoParser from './parsers/recipe-info.js';
import edsSourceTransformer from './transformers/eds-source.js';

const PAGE_TEMPLATE = {
  "name": "recipe",
  "description": "Recipe detail pages (/recipes/*): title, intro, recipe-info strip, then Ingredients, Method, Serving Suggestion and Chef's Tips sections; imported from their authored .plain.html into AEM authoring with category/duration page metadata",
  "urls": [
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/masala-noodle-soup.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-burger.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/masala-omelette.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-chaat.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/finger-fries-recipe.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-curry.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-fried-rice.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-cutlets.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-paratha.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-manchurian.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-pizza.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-poha.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-pulao.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-sandwich.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-spring-rolls.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodles-chilla.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-stir-fry.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-tacos.plain.html",
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/recipes/noodle-upma.plain.html"
  ],
  "blocks": [
    {
      "name": "recipe-info",
      "instances": [
        "div.recipe-info"
      ]
    }
  ],
  "sections": []
};

const parsers = {
  'recipe-info': recipeInfoParser,
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
  // runs before html2md preprocesses the page
  onLoad: ({ document }) => {
    executeTransformers('onLoad', document.body, { document, params: {} });
  },

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
