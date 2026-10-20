import { useDispatch, useSelector } from 'react-redux';
import { loadAnalogues, selectBrand, setBrandFilter } from '../store/partsSlice';
import { selectDisplayBrands } from '../store/selectors';
import Loader from './Loader';
import StatusAlert from './StatusAlert';
import { formatPrice } from '../utils/format';

export default function BrandList() {
  const dispatch = useDispatch();
  const {
    brands,
    brandsStatus,
    brandsError,
    selectedBrand,
    partNumber,
    analoguesStatus,
    brandFilter,
  } = useSelector((state) => state.parts);
  const displayBrands = useSelector(selectDisplayBrands);

  const handleSelect = (brand) => {
    dispatch(selectBrand(brand));
    dispatch(loadAnalogues({ number: partNumber, brand }));
  };

  if (brandsStatus === 'idle' && brands.length === 0) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">Этап 1 — выбор производителя</h2>
        {brandsStatus === 'succeeded' && brands.length > 0 && (
          <span className="badge text-bg-secondary">{brands.length} брендов</span>
        )}
      </div>
      <StatusAlert message={brandsStatus === 'failed' ? brandsError : null} />
      {brandsStatus === 'loading' && <Loader message="Загрузка списка производителей…" />}
      {brandsStatus === 'succeeded' && brands.length > 0 && (
        <>
          {brands.length > 8 && (
            <div className="mb-3">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Фильтр по бренду или названию…"
                value={brandFilter}
                onChange={(e) => dispatch(setBrandFilter(e.target.value))}
              />
            </div>
          )}
          {displayBrands.length === 0 ? (
            <p className="text-muted mb-0">Ни один производитель не подходит под фильтр.</p>
          ) : (
            <div className="row g-3">
              {displayBrands.map((item) => {
                const isSelected = selectedBrand === item.brand;
                return (
                  <div key={item.brand} className="col-md-6 col-lg-4">
                    <button
                      type="button"
                      className={`card brand-card w-100 text-start border ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(item.brand)}
                      disabled={analoguesStatus === 'loading'}
                    >
                      <div className="card-body">
                        <div className="fw-bold">{item.brand}</div>
                        {item.sampleName && (
                          <div className="text-muted small text-truncate">{item.sampleName}</div>
                        )}
                        <div className="small mt-2">
                          от {formatPrice(item.minPrice)} · остаток: {item.totalStock} шт.
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
