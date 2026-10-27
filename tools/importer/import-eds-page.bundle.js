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
  function field(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function image(document2, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document2.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document2.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function link(document2, href) {
    if (!href) return null;
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function richtext(document2, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const text9 = el.textContent.trim();
    if (!text9) return [];
    const p = document2.createElement("p");
    p.textContent = text9;
    return [p];
  }
  function parse(element, { document: document2 }) {
    const cells = [...element.children].map((row) => {
      var _a;
      const [mediaCell, textCell] = row.children;
      const video = (_a = mediaCell == null ? void 0 : mediaCell.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href");
      return [
        cell(
          document2,
          field(document2, "media_image", image(document2, mediaCell)),
          field(document2, "media_video", link(document2, video))
        ),
        cell(document2, field(document2, "content_text", ...richtext(document2, textCell)))
      ];
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/yippee-intro.js
  var DEFAULT_SUBHEADING = "Sunfeast Yippee \u2013 Quick & Tasty Instant Noodles & Pasta";
  function field2(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell2(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text(document2, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document2.createTextNode(trimmed) : null;
  }
  function richtext2(document2, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const text9 = el.textContent.trim();
    if (!text9) return [];
    const p = document2.createElement("p");
    p.textContent = text9;
    return [p];
  }
  function parse2(element, { document: document2 }) {
    const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
    let headingEl = null;
    if (heading) {
      headingEl = document2.createElement(heading.tagName.toLowerCase());
      headingEl.textContent = heading.textContent.trim();
    }
    const rows = [...element.children];
    const descriptionIndex = rows.findIndex((row) => !row.contains(heading));
    const descriptionRow = rows[descriptionIndex];
    const description = (descriptionRow == null ? void 0 : descriptionRow.firstElementChild) || descriptionRow;
    const subheadingRow = descriptionIndex >= 0 ? rows[descriptionIndex + 1] : null;
    const subheading = (subheadingRow == null ? void 0 : subheadingRow.textContent.trim()) || DEFAULT_SUBHEADING;
    const cells = [
      [cell2(document2, field2(document2, "heading", headingEl))],
      [cell2(document2, field2(document2, "description", ...richtext2(document2, description)))],
      [cell2(document2, field2(document2, "subheading", text(document2, subheading)))]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Yippee Intro", cells });
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
  function field3(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell3(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text2(document2, value) {
    const trimmed = (value || "").trim();
    return trimmed ? document2.createTextNode(trimmed) : null;
  }
  function image2(document2, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document2.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document2.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function richtext3(document2, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const value = el.textContent.trim();
    if (!value) return [];
    const p = document2.createElement("p");
    p.textContent = value;
    return [p];
  }
  function isConfigRow(row) {
    if (row.children.length !== 1) return false;
    if (row.querySelector("picture, img")) return false;
    const a = row.querySelector("a[href]");
    return !(a && IMAGE_URL.test(a.getAttribute("href")));
  }
  function parse3(element, { document: document2 }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG.length && configCount < rows.length && isConfigRow(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG.map(([name, fallback], index) => {
      const source = index < configCount ? rows[index].textContent : "";
      return [cell3(document2, field3(document2, name, text2(document2, source || fallback)))];
    });
    const itemCells = rows.slice(configCount).map((row) => {
      const [imageCell, textCell] = row.children;
      return [
        cell3(document2, field3(document2, "image", image2(document2, imageCell))),
        cell3(document2, field3(document2, "text", ...richtext3(document2, textCell)))
      ];
    });
    const block = WebImporter.Blocks.createBlock(document2, {
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
  function field4(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell4(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text3(document2, value) {
    const trimmed = (value || "").trim();
    return trimmed ? document2.createTextNode(trimmed) : null;
  }
  function image3(document2, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document2.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document2.baseURI);
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
  function parse4(element, { document: document2 }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG2.length && configCount < rows.length && isConfigRow2(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG2.map(([name, fallback], index) => {
      const source = index < configCount ? rows[index].textContent : "";
      return [cell4(document2, field4(document2, name, text3(document2, source || fallback)))];
    });
    const itemCells = rows.slice(configCount).map((row) => [
      cell4(document2, field4(document2, "image", image3(document2, row)))
    ]);
    const block = WebImporter.Blocks.createBlock(document2, {
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
  function field5(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell5(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text4(document2, value) {
    return value ? document2.createTextNode(value) : null;
  }
  function richtext4(document2, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const content = el.textContent.trim();
    if (!content) return [];
    const p = document2.createElement("p");
    p.textContent = content;
    return [p];
  }
  function image4(document2, el, alt) {
    const source = el == null ? void 0 : el.querySelector("img");
    let src = source == null ? void 0 : source.getAttribute("src");
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = new URL(src, document2.baseURI).toString();
    if (source.alt || alt) img.alt = source.alt || alt;
    return img;
  }
  function defaultIcon(document2, category) {
    const path = DEFAULT_ICONS[category.toLowerCase()];
    if (!path) return null;
    const img = document2.createElement("img");
    img.src = new URL(path, document2.baseURI).toString();
    img.alt = category;
    return img;
  }
  function parse5(element, { document: document2 }) {
    const configCells = Object.keys(DEFAULTS).map((name) => [
      cell5(document2, field5(document2, name, text4(document2, DEFAULTS[name])))
    ]);
    configCells.push([""]);
    const itemCells = [...element.children].map((row) => {
      const [categoryCell, recipesCell, iconCell] = row.children;
      const category = (categoryCell == null ? void 0 : categoryCell.textContent.trim()) || "";
      return [
        cell5(document2, field5(document2, "category", text4(document2, category))),
        cell5(document2, field5(document2, "recipes", ...richtext4(document2, recipesCell))),
        cell5(document2, field5(document2, "icon", image4(document2, iconCell, category) || (category ? defaultIcon(document2, category) : null)))
      ];
    });
    const cells = [...configCells, ...itemCells];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Recipe Carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/treasure-hunt.js
  function field6(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell6(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function image5(document2, el) {
    const source = el == null ? void 0 : el.querySelector("img");
    if (!source || !source.getAttribute("src")) return null;
    const img = document2.createElement("img");
    const url2 = new URL(source.getAttribute("src"), document2.baseURI);
    url2.search = "";
    img.src = url2.toString();
    if (source.alt) img.alt = source.alt;
    return img;
  }
  function link2(document2, href) {
    if (!href) return null;
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function parse6(element, { document: document2 }) {
    var _a, _b;
    const sourceCells = [...element.children].flatMap((row) => [...row.children]);
    const [mainCell, waveCell] = sourceCells;
    const video = ((_a = mainCell == null ? void 0 : mainCell.querySelector("a[href]")) == null ? void 0 : _a.getAttribute("href")) || ((_b = element.querySelector("a[href]")) == null ? void 0 : _b.getAttribute("href"));
    const cells = [
      [cell6(
        document2,
        field6(document2, "main_image", image5(document2, mainCell)),
        field6(document2, "main_video", link2(document2, video))
      )],
      [cell6(document2, field6(document2, "wave_image", image5(document2, waveCell)))]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Treasure Hunt", cells });
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
  function field7(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell7(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text5(document2, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document2.createTextNode(trimmed) : null;
  }
  function link3(document2, href, label) {
    if (!href) return null;
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = label || href;
    return a;
  }
  function richtext5(document2, el) {
    if (!el) return [];
    const hasBlocks = el.querySelector("p, h1, h2, h3, h4, h5, h6, ul, ol");
    if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
    const value = el.textContent.trim();
    if (!value) return [];
    const p = document2.createElement("p");
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
  function parse7(element, { document: document2 }) {
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
      [cell7(document2, field7(document2, "title", text5(document2, title)))],
      [cell7(document2, field7(document2, "subtitle", text5(document2, subtitle)))],
      [cell7(document2, field7(document2, "link", link3(document2, href, label)))],
      ...cards.map((row) => {
        const [imageCell, textCell] = row.children;
        return [
          cell7(document2, field7(document2, "imageUrl", link3(document2, imageUrl(imageCell)))),
          cell7(document2, field7(document2, "text", ...richtext5(document2, textCell)))
        ];
      })
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "World", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/creativity.js
  var CONFIG_FIELDS2 = [
    ["heading", "Get Creative With Us"],
    ["subtitle", "Take a look at our DIY Videos and upcycle waste"],
    ["viewAllLabel", "View All"],
    ["viewLessLabel", "View Less"]
  ];
  function field8(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell8(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function link4(document2, href) {
    if (!href) return null;
    const a = document2.createElement("a");
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
  function text6(document2, value) {
    if (!value) return null;
    const p = document2.createElement("p");
    p.textContent = value;
    return p;
  }
  function isConfigRow4(row) {
    if (row.children.length !== 1) return false;
    const c = row.firstElementChild;
    if (c.querySelector("picture, img, a[href]")) return false;
    return !/^https?:\/\//.test(c.textContent.trim());
  }
  function parse8(element, { document: document2 }) {
    const rows = [...element.children];
    let configCount = 0;
    while (configCount < CONFIG_FIELDS2.length && configCount < rows.length && isConfigRow4(rows[configCount])) {
      configCount += 1;
    }
    const configCells = CONFIG_FIELDS2.map(([name, fallback], i) => {
      const value = (i < configCount ? rows[i].textContent.trim() : "") || fallback;
      return [cell8(document2, field8(document2, name, text6(document2, value)))];
    });
    const itemCells = rows.slice(configCount).map((row) => {
      const [imageCell, videoCell] = row.children;
      return [
        cell8(document2, field8(document2, "imageUrl", link4(document2, url(imageCell)))),
        cell8(document2, field8(document2, "video", link4(document2, url(videoCell))))
      ];
    });
    const cells = [...configCells, ...itemCells];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Creativity", cells });
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
  function field9(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell9(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function text7(document2, value) {
    const trimmed = (value || "").replace(/\s+/g, " ").trim();
    return trimmed ? document2.createTextNode(trimmed) : null;
  }
  function link5(document2, href, label) {
    if (!href) return null;
    const a = document2.createElement("a");
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
  function parse9(element, { document: document2 }) {
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
      [cell9(document2, field9(document2, "title", text7(document2, title)))],
      [cell9(document2, field9(document2, "subtitle", text7(document2, subtitle)))],
      [cell9(document2, field9(document2, "link", link5(document2, href, label)))],
      ...items.map((url2) => [cell9(document2, field9(document2, "imageUrl", link5(document2, url2)))])
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Grid Cards", cells });
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
  function field10(document2, name, ...nodes) {
    const content = nodes.filter(Boolean);
    if (!content.length) return null;
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${name} `), ...content);
    return frag;
  }
  function cell10(document2, ...fields) {
    const parts = fields.filter(Boolean);
    if (!parts.length) return "";
    const frag = document2.createDocumentFragment();
    frag.append(...parts);
    return frag;
  }
  function link6(document2, href) {
    if (!href) return null;
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function text8(document2, value) {
    return value ? document2.createTextNode(value) : null;
  }
  function paragraphs(document2, entries) {
    return entries.map(([label, href]) => {
      const p = document2.createElement("p");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      return p;
    });
  }
  function isSocialRow(document2, row) {
    const anchors = [...row.querySelectorAll("a[href]")];
    return anchors.length > 0 && anchors.every((a) => {
      try {
        return SOCIAL_HOST.test(new URL(a.getAttribute("href"), document2.baseURI).hostname);
      } catch (e) {
        return false;
      }
    });
  }
  function links(document2, row) {
    const anchors = [...row.querySelectorAll("a[href]")];
    if (!anchors.length) {
      const content = row.textContent.trim();
      if (!content) return [];
      const p = document2.createElement("p");
      p.textContent = content;
      return [p];
    }
    return anchors.map((a) => {
      const p = document2.createElement("p");
      const copy = document2.createElement("a");
      copy.href = a.getAttribute("href");
      copy.textContent = a.textContent.trim();
      p.append(copy);
      return p;
    });
  }
  function parse10(element, { document: document2 }) {
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
        logoUrl = img ? new URL(img.getAttribute("src"), document2.baseURI).toString() : a.getAttribute("href");
        logoAlt = (img == null ? void 0 : img.getAttribute("alt")) || "";
      } else if (rowText.includes("\xA9")) {
        bottomRow = row;
      } else if (!socialRow && isSocialRow(document2, row)) {
        socialRow = row;
      } else if (rowText) {
        columns.push(row);
      }
    });
    const copyright = bottomRow ? links(document2, bottomRow) : paragraphs(document2, DEFAULT_COPYRIGHT);
    const socials = socialRow ? links(document2, socialRow) : paragraphs(document2, DEFAULT_SOCIALS);
    const cells = [
      [cell10(document2, field10(document2, "logoUrl", link6(document2, logoUrl || DEFAULT_LOGO)))],
      [cell10(document2, field10(document2, "logoAltLabel", text8(document2, logoAlt || DEFAULT_LOGO_ALT)))],
      [cell10(document2, field10(document2, "copyright", ...copyright))],
      [cell10(document2, field10(document2, "socials", ...socials))],
      ...columns.map((row) => [cell10(document2, field10(document2, "links", ...links(document2, row)))])
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Footer Block", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/eds-source.js
  function sourcePageUrl(originalURL) {
    const url2 = new URL(originalURL);
    url2.pathname = url2.pathname.replace(/\.plain\.html$/, "").replace(/\/index$/, "/");
    return url2.toString();
  }
  function readSourceTitle(originalURL) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", sourcePageUrl(originalURL), false);
      xhr.send();
      if (xhr.status !== 200) return "";
      const match = xhr.responseText.match(/<title>([^<]*)<\/title>/i);
      if (!match) return "";
      const txt = document.createElement("textarea");
      txt.innerHTML = match[1];
      return txt.value.trim();
    } catch (e) {
      return "";
    }
  }
  function transform(hookName, element, payload) {
    var _a;
    if (hookName !== "beforeTransform") return;
    const { document: document2 } = payload;
    const originalURL = ((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url;
    if (!document2.title && originalURL) {
      const title = readSourceTitle(originalURL);
      if (title) document2.title = title;
    }
    element.querySelectorAll("span.icon").forEach((icon) => {
      const name = [...icon.classList].find((c) => c.startsWith("icon-"));
      icon.replaceWith(document2.createTextNode(name ? `:${name.substring(5)}:` : ""));
    });
    const sections = [...element.children].filter((el) => el.tagName === "DIV");
    sections.slice(1).forEach((section) => {
      section.before(document2.createElement("hr"));
    });
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
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_eds_page_default = {
    transform: (payload) => {
      const { document: document2, url: url2, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url: url2, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url2, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\.plain\.html$/, "").replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_eds_page_exports);
})();
