/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-recipe.js
  var import_recipe_exports = {};
  __export(import_recipe_exports, {
    default: () => import_recipe_default
  });

  // tools/importer/parsers/recipe-info.js
  function field(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function richtext(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const text = el.textContent.trim();
    if (!text) return [];
    const p = document.createElement("p");
    p.textContent = text;
    return [p];
  }
  function parse(element, { document }) {
    const items = [...element.children].flatMap((row) => [...row.children]).filter((c) => c.textContent.trim());
    const cells = items.map((item) => [
      cell(document, field(document, "text", ...richtext(document, item)))
    ]);
    const block = WebImporter.Blocks.createBlock(document, { name: "Recipe Info", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/eds-source.js
  var PLACEHOLDER_DESCRIPTION = "Use this template repository as the starting point for new AEM projects.";
  var AEM_SITE_ROOT = "/content/sunfeast-yippee";
  function toAemPagePaths(element) {
    element.querySelectorAll('a[href^="/"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (href.startsWith("//") || href.startsWith(AEM_SITE_ROOT)) return;
      const [path, rest = ""] = href.split(/(?=[?#])/);
      if (/\/media_|\.[a-z0-9]{2,5}$/i.test(path)) return;
      const page = path.endsWith("/") ? `${path}index` : path;
      a.setAttribute("href", `${AEM_SITE_ROOT}${page}${rest}`);
    });
  }
  function sourcePageUrl(originalURL) {
    const url = new URL(originalURL);
    url.pathname = url.pathname.replace(/\.plain\.html$/, "").replace(/\/index$/, "/");
    return url.toString();
  }
  function readSourceHead(originalURL) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", sourcePageUrl(originalURL), false);
      xhr.send();
      if (xhr.status !== 200) return null;
      return new DOMParser().parseFromString(xhr.responseText, "text/html");
    } catch (e) {
      return null;
    }
  }
  function meta(doc, name) {
    const el = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return el ? (el.getAttribute("content") || "").trim() : "";
  }
  function mediaName(src) {
    try {
      return new URL(src, "https://x/").pathname.split("/").pop();
    } catch (e) {
      return "";
    }
  }
  function buildMetadata(element, document, source) {
    var _a;
    const cells = {};
    const title = (_a = source.querySelector("title")) == null ? void 0 : _a.textContent.trim();
    if (title) cells.Title = title;
    const description = meta(source, "description");
    if (description && description !== PLACEHOLDER_DESCRIPTION) cells.Description = description;
    const ogImage = meta(source, "og:image");
    if (ogImage && !/default-meta-image/.test(ogImage)) {
      const name = mediaName(ogImage);
      const inContent = [...element.querySelectorAll("img")].some((img) => mediaName(img.getAttribute("src") || "") === name);
      if (!inContent) {
        const url = new URL(ogImage);
        url.search = "";
        const img = document.createElement("img");
        img.src = url.toString();
        cells.image = img;
      }
    }
    const category = meta(source, "category");
    if (category) cells.category = category;
    const duration = meta(source, "duration");
    if (duration) cells.duration = duration;
    const cooktime = meta(source, "cooktime") || meta(source, "cook-time");
    if (cooktime) cells.cooktime = cooktime;
    if (!Object.keys(cells).length) return null;
    return WebImporter.Blocks.createBlock(document, { name: "Metadata", cells });
  }
  function transform(hookName, element, payload) {
    var _a;
    const { document } = payload;
    const originalURL = ((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url;
    if (hookName === "onLoad") {
      element.querySelectorAll("a[href]").forEach((a) => {
        const parent = a.parentElement;
        if (!parent || parent.tagName === "P" || parent.querySelectorAll(":scope > a").length < 2) return;
        const p = document.createElement("p");
        a.replaceWith(p);
        p.append(a);
      });
    }
    if (hookName === "beforeTransform") {
      element.querySelectorAll("span.icon").forEach((icon) => {
        const name = [...icon.classList].find((c) => c.startsWith("icon-"));
        icon.replaceWith(document.createTextNode(name ? `:${name.substring(5)}:` : ""));
      });
      const sections = [...element.children].filter((el) => el.tagName === "DIV");
      sections.slice(1).forEach((section) => {
        section.before(document.createElement("hr"));
      });
    }
    if (hookName === "afterTransform") toAemPagePaths(element);
    if (hookName === "afterTransform" && originalURL) {
      const source = readSourceHead(originalURL);
      const metadata = source ? buildMetadata(element, document, source) : null;
      if (metadata) {
        element.append(document.createElement("hr"), metadata);
      }
    }
  }

  // tools/importer/import-recipe.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "recipe-info": parse
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_recipe_default = {
    // runs before html2md preprocesses the page
    onLoad: ({ document }) => {
      executeTransformers("onLoad", document.body, { document, params: {} });
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\.plain\.html$/, "").replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_recipe_exports);
})();
