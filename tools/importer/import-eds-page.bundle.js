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

  // tools/importer/import-eds-page.js
  var import_eds_page_exports = {};
  __export(import_eds_page_exports, {
    default: () => import_eds_page_default
  });

  // tools/importer/parsers/carousel.js
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
  function image(document, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function link(document, href) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function richtext(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const text9 = el.textContent.trim();
    if (!text9) return [];
    const p = document.createElement("p");
    p.textContent = text9;
    return [p];
  }
  function parse(element, { document }) {
    const cells = [...element.children].map((row) => {
      var _a;
      const [mediaCell, textCell] = row.children;
      const video = (_a = mediaCell == null ? void 0 : mediaCell.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href");
      return [
        cell(
          document,
          field(document, "media_image", image(document, mediaCell)),
          field(document, "media_video", link(document, video))
        ),
        cell(document, field(document, "content_text", ...richtext(document, textCell)))
      ];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/yippee-intro.js
  var DEFAULT_SUBHEADING = "Sunfeast Yippee \u2013 Quick & Tasty Instant Noodles & Pasta";
  function field2(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell2(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text(document, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document.createTextNode(trimmed) : null;
  }
  function richtext2(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const text9 = el.textContent.trim();
    if (!text9) return [];
    const p = document.createElement("p");
    p.textContent = text9;
    return [p];
  }
  function parse2(element, { document }) {
    const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
    let headingEl = null;
    if (heading) {
      headingEl = document.createElement(heading.tagName.toLowerCase());
      headingEl.textContent = heading.textContent.trim();
    }
    const rows = [...element.children];
    const descriptionIndex = rows.findIndex((row) => !row.contains(heading));
    const descriptionRow = rows[descriptionIndex];
    const description = (descriptionRow == null ? void 0 : descriptionRow.firstElementChild) || descriptionRow;
    const subheadingRow = descriptionIndex >= 0 ? rows[descriptionIndex + 1] : null;
    const subheading = (subheadingRow == null ? void 0 : subheadingRow.textContent.trim()) || DEFAULT_SUBHEADING;
    const cells = [
      [cell2(document, field2(document, "heading", headingEl))],
      [cell2(document, field2(document, "description", ...richtext2(document, description)))],
      [cell2(document, field2(document, "subheading", text(document, subheading)))]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "Yippee Intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  var CONFIG = [
    ["heading", "YiPPee!'s Noodle Range"],
    ["tabOneLabel", "Instant Noodles"],
    ["tabTwoLabel", "Cup Noodles"],
    ["firstTabCount", "4"],
    ["viewAllLabel", "View All"],
    ["viewLessLabel", "View Less"]
  ];
  var IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;
  function field3(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell3(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text2(document, value) {
    const trimmed = (value || "").trim();
    return trimmed ? document.createTextNode(trimmed) : null;
  }
  function image2(document, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function richtext3(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const value = el.textContent.trim();
    if (!value) return [];
    const p = document.createElement("p");
    p.textContent = value;
    return [p];
  }
  function isConfigRow(row) {
    if (row.children.length !== 1) return false;
    if (row.querySelector("picture, img")) return false;
    const a = row.querySelector("a[href]");
    return !(a && IMAGE_URL.test(a.getAttribute("href")));
  }
  function parse3(element, { document }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG.length && configCount < rows.length && isConfigRow(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG.map(([name, fallback], index) => {
      const source = index < configCount ? rows[index].textContent : "";
      return [cell3(document, field3(document, name, text2(document, source || fallback)))];
    });
    const itemCells = rows.slice(configCount).map((row) => {
      const [imageCell, textCell] = row.children;
      return [
        cell3(document, field3(document, "image", image2(document, imageCell))),
        cell3(document, field3(document, "text", ...richtext3(document, textCell)))
      ];
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Cards",
      cells: [...configCells, ...itemCells]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/pasta.js
  var CONFIG2 = [
    ["heading", "YiPPee!'s Pasta Range"],
    ["viewMoreLabel", "View More"],
    ["viewLessLabel", "View Less"]
  ];
  var IMAGE_URL2 = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;
  function field4(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell4(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text3(document, value) {
    const trimmed = (value || "").trim();
    return trimmed ? document.createTextNode(trimmed) : null;
  }
  function image3(document, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function isConfigRow2(row) {
    if (row.children.length !== 1) return false;
    if (row.querySelector("picture, img")) return false;
    const a = row.querySelector("a[href]");
    return !(a && IMAGE_URL2.test(a.getAttribute("href")));
  }
  function parse4(element, { document }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG2.length && configCount < rows.length && isConfigRow2(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG2.map(([name, fallback], index) => {
      const source = index < configCount ? rows[index].textContent : "";
      return [cell4(document, field4(document, name, text3(document, source || fallback)))];
    });
    const itemCells = rows.slice(configCount).map((row) => [
      cell4(document, field4(document, "image", image3(document, row)))
    ]);
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Pasta",
      cells: [...configCells, ...itemCells]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/recipe-carousel.js
  var DEFAULTS = {
    heading: "YiPPee! With a Twist!",
    subtitle: "Explore all the new and exciting ways you can make your YiPPee! Noodles and Pasta",
    recipesHeading: "Recipes",
    viewAllLabel: "View all",
    viewLessLabel: "View less"
  };
  var DEFAULT_ICONS = {
    appetizers: "/Appetizers.webp",
    breakfast: "/breakfast.webp",
    snacks: "/Snacks.webp",
    "fancy meal": "/Fancy-Meal.webp",
    "fancy-meal": "/Fancy-Meal.webp",
    fancy: "/Fancy-Meal.webp",
    pasta: "/Lunch-1.webp",
    lunch: "/Lunch-1.webp"
  };
  function field5(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell5(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text4(document, value) {
    return value ? document.createTextNode(value) : null;
  }
  function richtext4(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const content = el.textContent.trim();
    if (!content) return [];
    const p = document.createElement("p");
    p.textContent = content;
    return [p];
  }
  function image4(document, el, alt) {
    const source = el == null ? void 0 : el.querySelector("img");
    let src = source == null ? void 0 : source.getAttribute("src");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = new URL(src, document.baseURI).toString();
    if (source.alt || alt) img.alt = source.alt || alt;
    return img;
  }
  function defaultIcon(document, category) {
    const path = DEFAULT_ICONS[category.toLowerCase()];
    if (!path) return null;
    const img = document.createElement("img");
    img.src = new URL(path, document.baseURI).toString();
    img.alt = category;
    return img;
  }
  function parse5(element, { document }) {
    const configCells = Object.keys(DEFAULTS).map((name) => [
      cell5(document, field5(document, name, text4(document, DEFAULTS[name])))
    ]);
    configCells.push([""]);
    const itemCells = [...element.children].map((row) => {
      const [categoryCell, recipesCell, iconCell] = row.children;
      const category = (categoryCell == null ? void 0 : categoryCell.textContent.trim()) || "";
      return [
        cell5(document, field5(document, "category", text4(document, category))),
        cell5(document, field5(document, "recipes", ...richtext4(document, recipesCell))),
        cell5(document, field5(document, "icon", image4(document, iconCell, category) || (category ? defaultIcon(document, category) : null)))
      ];
    });
    const cells = [...configCells, ...itemCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "Recipe Carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/treasure-hunt.js
  function field6(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell6(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function image5(document, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function link2(document, href) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function parse6(element, { document }) {
    var _a, _b;
    const sourceCells = [...element.children].flatMap((row) => [...row.children]);
    const [mainCell, waveCell] = sourceCells;
    const video = ((_a = mainCell == null ? void 0 : mainCell.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href")) || ((_b = element.querySelector("a[href]")) == null ? void 0 : _b.getAttribute("href"));
    const cells = [
      [cell6(
        document,
        field6(document, "main_image", image5(document, mainCell)),
        field6(document, "main_video", link2(document, video))
      )],
      [cell6(document, field6(document, "wave_image", image5(document, waveCell)))]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "Treasure Hunt", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/world.js
  var DEFAULTS2 = {
    title: "Take A Look At The Better World",
    subtitle: "Learn how we are driving a change through the",
    link: "https://www.sunfeastyippee.com/better-world",
    linkText: "YiPPee! Better World"
  };
  var CONFIG_FIELDS = 3;
  var IMAGE_URL3 = /scene7\.com|\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;
  function field7(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell7(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text5(document, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document.createTextNode(trimmed) : null;
  }
  function link3(document, href, label) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label || href;
    return a;
  }
  function richtext5(document, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const value = el.textContent.trim();
    if (!value) return [];
    const p = document.createElement("p");
    p.textContent = value;
    return [p];
  }
  function imageUrl(el) {
    const a = el == null ? void 0 : el.querySelector("a[href]");
    if (a) return a.getAttribute("href");
    const img = el == null ? void 0 : el.querySelector("img");
    if (img) return img.getAttribute("src");
    const value = (el == null ? void 0 : el.textContent.trim()) || "";
    return /^https?:\/\//.test(value) ? value : "";
  }
  function isConfigRow3(row) {
    if (row.children.length > 1) return false;
    if (row.querySelector("picture, img")) return false;
    const a = row.querySelector("a[href]");
    if (a && IMAGE_URL3.test(a.getAttribute("href"))) return false;
    const value = row.textContent.trim();
    return !(/^https?:\/\//.test(value) && IMAGE_URL3.test(value));
  }
  function parse7(element, { document }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG_FIELDS && configCount < rows.length && isConfigRow3(rows[configCount])) {
      configCount += 1;
    }
    const [titleRow, subtitleRow, linkRow] = rows.slice(0, configCount);
    const title = (titleRow == null ? void 0 : titleRow.textContent.trim()) || DEFAULTS2.title;
    const subtitle = (subtitleRow == null ? void 0 : subtitleRow.textContent.trim()) || DEFAULTS2.subtitle;
    const sourceLink = linkRow == null ? void 0 : linkRow.querySelector("a[href]");
    const href = (sourceLink == null ? void 0 : sourceLink.getAttribute("href")) || DEFAULTS2.link;
    const sourceLabel = sourceLink == null ? void 0 : sourceLink.textContent.trim();
    const label = sourceLabel && sourceLabel !== href ? sourceLabel : DEFAULTS2.linkText;
    const cards = rows.slice(configCount).filter((row) => row.children.length > 0);
    const cells = [
      [cell7(document, field7(document, "title", text5(document, title)))],
      [cell7(document, field7(document, "subtitle", text5(document, subtitle)))],
      [cell7(document, field7(document, "link", link3(document, href, label)))],
      ...cards.map((row) => {
        const [imageCell, textCell] = row.children;
        return [
          cell7(document, field7(document, "imageUrl", link3(document, imageUrl(imageCell)))),
          cell7(document, field7(document, "text", ...richtext5(document, textCell)))
        ];
      })
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "World", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/creativity.js
  var CONFIG_FIELDS2 = [
    ["heading", "Get Creative With Us"],
    ["subtitle", "Take a look at our DIY Videos and upcycle waste"],
    ["viewAllLabel", "View All"],
    ["viewLessLabel", "View Less"]
  ];
  function field8(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell8(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function link4(document, href) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function url(el) {
    const a = el == null ? void 0 : el.querySelector("a[href]");
    if (a) return a.getAttribute("href");
    const img = el == null ? void 0 : el.querySelector("img");
    if (img) return img.getAttribute("src");
    const text9 = (el == null ? void 0 : el.textContent.trim()) || "";
    return /^https?:\/\//.test(text9) ? text9 : "";
  }
  function text6(document, value) {
    if (!value) return null;
    const p = document.createElement("p");
    p.textContent = value;
    return p;
  }
  function isConfigRow4(row) {
    if (row.children.length !== 1) return false;
    const c = row.firstElementChild;
    if (c.querySelector("picture, img, a[href]")) return false;
    return !/^https?:\/\//.test(c.textContent.trim());
  }
  function parse8(element, { document }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG_FIELDS2.length && configCount < rows.length && isConfigRow4(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG_FIELDS2.map(([name, fallback], i) => {
      const value = (i < configCount ? rows[i].textContent.trim() : "") || fallback;
      return [cell8(document, field8(document, name, text6(document, value)))];
    });
    const itemCells = rows.slice(configCount).map((row) => {
      const [imageCell, videoCell] = row.children;
      return [
        cell8(document, field8(document, "imageUrl", link4(document, url(imageCell)))),
        cell8(document, field8(document, "video", link4(document, url(videoCell))))
      ];
    });
    const cells = [...configCells, ...itemCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "Creativity", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/grid-cards.js
  var DEFAULTS3 = {
    title: "#YiPPeelicious",
    subtitle: "Upload your YiPPee! moments and tag us to get featured in our website",
    link: "#",
    linkText: "Join us"
  };
  var CONFIG_FIELDS3 = 3;
  var IMAGE_URL4 = /scene7\.com|\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;
  function field9(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell9(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text7(document, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document.createTextNode(trimmed) : null;
  }
  function link5(document, href, label) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label || href;
    return a;
  }
  function imageUrl2(el) {
    const a = el == null ? void 0 : el.querySelector("a[href]");
    if (a) return a.getAttribute("href");
    const img = el == null ? void 0 : el.querySelector("img");
    if (img) return new URL(img.getAttribute("src"), el.ownerDocument.baseURI).toString();
    const value = (el == null ? void 0 : el.textContent.trim()) || "";
    return /^https?:\/\//.test(value) ? value : "";
  }
  function isConfigRow5(row) {
    if (row.children.length > 1) return false;
    if (row.querySelector("picture, img")) return false;
    const a = row.querySelector("a[href]");
    if (a && IMAGE_URL4.test(a.getAttribute("href"))) return false;
    const value = row.textContent.trim();
    return !(/^https?:\/\//.test(value) && IMAGE_URL4.test(value));
  }
  function parse9(element, { document }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG_FIELDS3 && configCount < rows.length && isConfigRow5(rows[configCount])) {
      configCount += 1;
    }
    const [titleRow, subtitleRow, linkRow] = rows.slice(0, configCount);
    const title = (titleRow == null ? void 0 : titleRow.textContent.trim()) || DEFAULTS3.title;
    const subtitle = (subtitleRow == null ? void 0 : subtitleRow.textContent.trim()) || DEFAULTS3.subtitle;
    const sourceLink = linkRow == null ? void 0 : linkRow.querySelector("a[href]");
    const href = (sourceLink == null ? void 0 : sourceLink.getAttribute("href")) || DEFAULTS3.link;
    const sourceLabel = sourceLink == null ? void 0 : sourceLink.textContent.trim();
    const label = sourceLabel && sourceLabel !== href ? sourceLabel : DEFAULTS3.linkText;
    const items = rows.slice(configCount).map((row) => imageUrl2(row)).filter(Boolean);
    const cells = [
      [cell9(document, field9(document, "title", text7(document, title)))],
      [cell9(document, field9(document, "subtitle", text7(document, subtitle)))],
      [cell9(document, field9(document, "link", link5(document, href, label)))],
      ...items.map((url2) => [cell9(document, field9(document, "imageUrl", link5(document, url2)))])
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "Grid Cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/footer-block.js
  var DEFAULT_LOGO = "https://s7ap1.scene7.com/is/image/itcportalprod/Yippee-itc-logo-updated-5?fmt=webp-alpha";
  var DEFAULT_LOGO_ALT = "Sunfeast YiPPee! & ITC Logo";
  var DEFAULT_COPYRIGHT = [
    ["ITC Portal", "https://www.itcportal.com"],
    ["\xA9 2026 YiPPee!. All Rights Reserved."]
  ];
  var DEFAULT_SOCIALS = [
    ["Instagram", "https://www.instagram.com/sunfeast_yippee/"],
    ["Facebook", "https://www.facebook.com/SunfeastYiPPee/"],
    ["YouTube", "https://www.youtube.com/@SunfeastYiPPee"],
    ["X", "https://twitter.com/SunfeastYiPPee"]
  ];
  var SOCIAL_HOST = /(^|\.)(instagram\.com|facebook\.com|fb\.com|fb\.me|youtube\.com|youtu\.be|twitter\.com|x\.com)$/i;
  function field10(document, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell10(document, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function link6(document, href) {
    if (!href) return null;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function text8(document, value) {
    return value ? document.createTextNode(value) : null;
  }
  function paragraphs(document, entries) {
    return entries.map(([label, href]) => {
      const p = document.createElement("p");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      return p;
    });
  }
  function isSocialRow(document, row) {
    const anchors = [...row.querySelectorAll("a[href]")];
    return anchors.length > 0 && anchors.every((a) => {
      try {
        return SOCIAL_HOST.test(new URL(a.getAttribute("href"), document.baseURI).hostname);
      } catch (e) {
        return false;
      }
    });
  }
  function links(document, row) {
    const anchors = [...row.querySelectorAll("a[href]")];
    if (!anchors.length) {
      const content = row.textContent.trim();
      if (!content) return [];
      const p = document.createElement("p");
      p.textContent = content;
      return [p];
    }
    return anchors.map((a) => {
      const p = document.createElement("p");
      const copy = document.createElement("a");
      copy.href = a.getAttribute("href");
      copy.textContent = a.textContent.trim();
      p.append(copy);
      return p;
    });
  }
  function parse10(element, { document }) {
    let logoUrl = "";
    let logoAlt = "";
    let bottomRow = null;
    let socialRow = null;
    const columns = [];
    [...element.children].forEach((row) => {
      const rowText = row.textContent.trim();
      const img = row.querySelector("img");
      const a = row.querySelector("a[href]");
      if (!logoUrl && (img || /scene7\.com|logo/i.test((a == null ? void 0 : a.getAttribute("href")) || ""))) {
        logoUrl = img ? new URL(img.getAttribute("src"), document.baseURI).toString() : a.getAttribute("href");
        logoAlt = (img == null ? void 0 : img.getAttribute("alt")) || "";
      } else if (rowText.includes("\xA9")) {
        bottomRow = row;
      } else if (!socialRow && isSocialRow(document, row)) {
        socialRow = row;
      } else if (rowText) {
        columns.push(row);
      }
    });
    const copyright = bottomRow ? links(document, bottomRow) : paragraphs(document, DEFAULT_COPYRIGHT);
    const socials = socialRow ? links(document, socialRow) : paragraphs(document, DEFAULT_SOCIALS);
    const cells = [
      [cell10(document, field10(document, "logoUrl", link6(document, logoUrl || DEFAULT_LOGO)))],
      [cell10(document, field10(document, "logoAltLabel", text8(document, logoAlt || DEFAULT_LOGO_ALT)))],
      [cell10(document, field10(document, "copyright", ...copyright))],
      [cell10(document, field10(document, "socials", ...socials))],
      ...columns.map((row) => [cell10(document, field10(document, "links", ...links(document, row)))])
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "Footer Block", cells });
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
    const url2 = new URL(originalURL);
    url2.pathname = url2.pathname.replace(/\.plain\.html$/, "").replace(/\/index$/, "/");
    return url2.toString();
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
        const url2 = new URL(ogImage);
        url2.search = "";
        const img = document.createElement("img");
        img.src = url2.toString();
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

  // tools/importer/import-eds-page.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel": parse,
    "yippee-intro": parse2,
    "cards": parse3,
    "pasta": parse4,
    "recipe-carousel": parse5,
    "treasure-hunt": parse6,
    "world": parse7,
    "creativity": parse8,
    "grid-cards": parse9,
    "footer-block": parse10
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
  var import_eds_page_default = {
    // runs before html2md preprocesses the page
    onLoad: ({ document }) => {
      executeTransformers("onLoad", document.body, { document, params: {} });
    },
    transform: (payload) => {
      const { document, url: url2, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url: url2, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url2, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\.plain\.html$/, "").replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_eds_page_exports);
})();
