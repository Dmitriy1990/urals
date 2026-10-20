import { useDispatch, useSelector } from 'react-redux';
import { setOffersFilter } from '../store/partsSlice';

export default function OffersToolbar({ totalCount, visibleCount }) {
  const dispatch = useDispatch();
  const { offersFilter } = useSelector((state) => state.parts);

  return (
    <div className="card-body border-bottom bg-light py-3">
      <div className="row g-2 align-items-end">
        <div className="col-md-5">
          <label htmlFor="offers-search" className="form-label small mb-1">
            Поиск по таблице
          </label>
          <input
            id="offers-search"
            type="search"
            className="form-control form-control-sm"
            placeholder="Наименование, бренд или артикул"
            value={offersFilter.query}
            onChange={(e) => dispatch(setOffersFilter({ query: e.target.value }))}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="offers-sort" className="form-label small mb-1">
            Сортировка
          </label>
          <select
            id="offers-sort"
            className="form-select form-select-sm"
            value={offersFilter.sort}
            onChange={(e) => dispatch(setOffersFilter({ sort: e.target.value }))}
          >
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="stock-desc">Остаток: больше сначала</option>
            <option value="name-asc">Наименование: А–Я</option>
          </select>
        </div>
        <div className="col-md-4 d-flex flex-wrap align-items-center justify-content-md-end gap-3">
          <div className="form-check form-switch mb-0">
            <input
              id="offers-in-stock"
              className="form-check-input"
              type="checkbox"
              checked={offersFilter.inStockOnly}
              onChange={(e) => dispatch(setOffersFilter({ inStockOnly: e.target.checked }))}
            />
            <label className="form-check-label small" htmlFor="offers-in-stock">
              Только в наличии
            </label>
          </div>
          <span className="small text-muted">
            Показано {visibleCount} из {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
