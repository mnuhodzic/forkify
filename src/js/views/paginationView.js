import View from './view';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1 and there are other pages
    if (currPage === 1 && numPages > 1) return this.#nextBttn(currPage);
    // Last page
    if (currPage === numPages && numPages > 1)
      return this.#previousBttn(currPage);
    // There is previous and next page
    if (currPage > 1 && currPage < numPages)
      return [this.#nextBttn(currPage), this.#previousBttn(currPage)].join('');
    // Page 1 and no other pages
    return '';
  }

  #previousBttn(page) {
    return `
      <button data-goto="${page - 1}" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${page - 1}</span>
      </button>`;
  }

  #nextBttn(page) {
    return ` 
      <button data-goto="${page + 1}" class="btn--inline pagination__btn--next">
        <span>Page ${page + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button> `;
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      handler(+btn.dataset.goto);
    });
  }
}

export default new PaginationView();
