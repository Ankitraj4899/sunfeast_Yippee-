export default function decorate(block) {
  block.classList.add('yippee-intro');
  const rows = [...block.children];
  const headingRow = rows[0];
  const descriptionRow = rows[1];
  headingRow.classList.add('yippee-intro-row');
  descriptionRow.classList.add('yippee-intro-row');

  const headingCell = headingRow.children[0];
  const descriptionCell = descriptionRow.children[0];

  headingCell.classList.add('yippee-intro-heading-cell');
  descriptionCell.classList.add('yippee-intro-description-cell');

  const heading = headingCell.querySelector('h2');
  const description = descriptionCell.querySelector('p');

  heading.classList.add('yippee-intro-heading');
  description.classList.add('yippee-intro-description');

  const headingText = heading.textContent.trim();

  heading.textContent = '';

  const blackText = document.createElement('span');
  blackText.classList.add('yippee-heading-black');
  blackText.textContent = headingText.substring(0, 4);

  const redText = document.createElement('span');
  redText.classList.add('yippee-heading-red');
  redText.textContent = headingText.substring(4, 10);

  const yellowText = document.createElement('span');
  yellowText.classList.add('yippee-heading-yellow');
  yellowText.textContent = headingText.substring(10, 17);

  const whiteText = document.createElement('span');
  whiteText.classList.add('yippee-heading-white');
  whiteText.textContent = headingText.substring(17);

  heading.append(
    blackText,
    redText,
    yellowText,
    whiteText,
  );

  const bottomHead = document.createElement('h2');
  bottomHead.classList.add('bottom-head');
  bottomHead.textContent = 'Sunfeast Yippee – Quick & Tasty Instant Noodles & Pasta';
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
