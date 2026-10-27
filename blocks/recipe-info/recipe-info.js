/**
 * Recipe info: a list of label/value items (Prep Time, Cook Time, Serves, Difficulty).
 * Authored either as one row with one cell per item, or as one row per item.
 * The authored cells are kept in place, so their editor instrumentation stays intact.
 * @param {Element} block The recipe-info block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('recipe-info-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.matches('[data-aue-prop], [data-aue-resource]')) return;
      cell.classList.add('recipe-info-item');
      const label = cell.querySelector('strong');
      if (label) label.classList.add('recipe-info-label');
    });
  });
}
