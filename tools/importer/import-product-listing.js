/* eslint-disable */
/* global WebImporter */

import sunfeastYippeeProductsParser from './parsers/sunfeast-yippee-products.js';
import edsSourceTransformer from './transformers/eds-source.js';

const PAGE_TEMPLATE = {
  "name": "product-listing",
  "description": "Product listing page (/pages/): breadcrumb, title, category tabs and product cards from the sunfeast-yippee-products block; imported from its authored .plain.html into AEM authoring",
  "urls": [
    "https://main--sunfeast-yippee--ankitraj4899.aem.live/pages/index.plain.html"
  ],
  "blocks": [
    {
      "name": "sunfeast-yippee-products",
      "instances": [
        "div.sunfeast-yippee-products"
      ]
    }
  ],
  "sections": []
};

const parsers = {
  'sunfeast-yippee-products': sunfeastYippeeProductsParser,
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
