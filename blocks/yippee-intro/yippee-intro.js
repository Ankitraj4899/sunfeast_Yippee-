import { moveCellInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_SUBHEADING = 'Sunfeast Yippee – Quick & Tasty Instant Noodles & Pasta';

// the heading is split into coloured parts by character position
// ("YiPP" black, then red, yellow and white "e"s)
const HEADING_PARTS = [
  ['yippee-heading-black', 0, 4],
  ['yippee-heading-red', 4, 10],
  ['yippee-heading-yellow', 10, 17],
  ['yippee-heading-white', 17],
];

function decorateHeading(headingCell) {
  let heading = headingCell.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    // no heading element (e.g. plain text): wrap the cell text in an h2
    heading = document.createElement('h2');
    heading.textContent = headingCell.textContent.trim();
    moveCellInstrumentation(headingCell, heading);
    headingCell.replaceChildren(heading);
  }
  heading.classList.add('yippee-intro-heading');

  const headingText = heading.textContent.trim();
  heading.textContent = '';
  HEADING_PARTS.forEach(([className, start, end]) => {
    const part = headingText.substring(start, end);
    if (!part) return;
    const span = document.createElement('span');
    span.classList.add(className);
    span.textContent = part;
    heading.append(span);
  });
}

function decorateDescription(descriptionCell) {
  let description = descriptionCell.querySelector('p');
  if (!description) {
    // bare text without <p>: wrap the cell content
    description = document.createElement('p');
    description.append(...descriptionCell.childNodes);
    descriptionCell.append(description);
  }
  description.classList.add('yippee-intro-description');
}

export default function decorate(block) {
  block.classList.add('yippee-intro');

  // rows in model order: heading (+ headingType) | description | subheading
  const [headingRow, descriptionRow, subheadingRow] = [...block.children];

  if (headingRow) {
    headingRow.classList.add('yippee-intro-row');
    const headingCell = headingRow.firstElementChild || headingRow;
    headingCell.classList.add('yippee-intro-heading-cell');
    decorateHeading(headingCell);
  }

  if (descriptionRow) {
    descriptionRow.classList.add('yippee-intro-row');
    const descriptionCell = descriptionRow.firstElementChild || descriptionRow;
    descriptionCell.classList.add('yippee-intro-description-cell');
    decorateDescription(descriptionCell);
  }

  const bottomHead = document.createElement('h2');
  bottomHead.classList.add('bottom-head');
  const subheadingCell = subheadingRow ? (subheadingRow.firstElementChild || subheadingRow) : null;
  bottomHead.textContent = subheadingCell?.textContent.replace(/\s+/g, ' ').trim()
    || DEFAULT_SUBHEADING;
  moveCellInstrumentation(subheadingCell, bottomHead);
  subheadingRow?.remove();
  block.insertBefore(bottomHead, block.firstChild);

  const yellowShape = document.createElement('div');
  yellowShape.classList.add('yippee-yellow');

  const redShape = document.createElement('div');
  redShape.classList.add('yippee-red');

  const orangeShape = document.createElement('div');
  orangeShape.classList.add('yippee-orange');

  const noodlePattern = document.createElement('div');
  noodlePattern.classList.add('yippee-noodle-pattern');

  block.append(
    yellowShape,
    redShape,
    orangeShape,
    noodlePattern,
  );
}
