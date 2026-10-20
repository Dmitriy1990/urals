import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSelector } from 'react-redux';
import Loader from './Loader';
import StatusAlert from './StatusAlert';
import OffersToolbar from './OffersToolbar';
import { selectDisplayOffers } from '../store/selectors';
import { formatPrice } from '../utils/format';

const ROW_HEIGHT = 52;

function OfferRow({ row }) {
  return (
    <>
      <td>
        {row.name}
        {row.notRefund && <span className="badge text-bg-warning ms-2">Невозврат</span>}
      </td>
      <td>{row.brand}</td>
      <td className="font-monospace">{row.number}</td>
      <td className="text-end">{formatPrice(row.price)}</td>
      <td className="text-end">{row.stock}</td>
    </>
  );
}

export default function OffersTable() {
  const scrollRef = useRef(null);
  const { selectedBrand, offers, analoguesStatus, analoguesError } = useSelector(
    (state) => state.parts,
  );
  const displayOffers = useSelector(selectDisplayOffers);

  const rowVirtualizer = useVirtualizer({
    count: displayOffers.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  if (!selectedBrand && analoguesStatus === 'idle') {
    return null;
  }

  return (
    <section>
      <h2 className="h5 mb-3">
        Этап 2 — аналоги и предложения
        {selectedBrand ? `: ${selectedBrand}` : ''}
      </h2>
      <StatusAlert message={analoguesStatus === 'failed' ? analoguesError : null} />
      {analoguesStatus === 'loading' && <Loader message="Загрузка аналогов и предложений…" />}
      {analoguesStatus === 'succeeded' && offers.length > 0 && (
        <div className="card border-0 shadow-sm">
          <OffersToolbar totalCount={offers.length} visibleCount={displayOffers.length} />
          {displayOffers.length === 0 ? (
            <div className="card-body text-muted">
              Нет позиций по выбранным фильтрам. Ослабьте условия поиска или снимите «Только в
              наличии».
            </div>
          ) : (
            <div ref={scrollRef} className="offers-scroll table-responsive">
              <table className="table table-striped table-hover align-middle mb-0 offers-table">
                <thead className="table-light">
                  <tr>
                    <th>Наименование</th>
                    <th>Производитель</th>
                    <th>Артикул</th>
                    <th className="text-end">Цена</th>
                    <th className="text-end">Остаток</th>
                  </tr>
                </thead>
                <tbody>
                  {paddingTop > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={5} style={{ height: paddingTop, padding: 0, border: 0 }} />
                    </tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = displayOffers[virtualRow.index];
                    return (
                      <tr key={row.id} data-index={virtualRow.index}>
                        <OfferRow row={row} />
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={5} style={{ height: paddingBottom, padding: 0, border: 0 }} />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
