import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSearch, searchBrands, setPartNumber } from '../store/partsSlice';

const DEBOUNCE_MS = 500;
const MIN_LENGTH = 2;

export default function PartNumberSearch() {
  const dispatch = useDispatch();
  const { partNumber, brandsStatus } = useSelector((state) => state.parts);
  const [localValue, setLocalValue] = useState(partNumber);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(partNumber);
  }, [partNumber]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const runSearch = useCallback(
    (value) => {
      const trimmed = value.trim();
      dispatch(setPartNumber(trimmed));
      if (trimmed.length < MIN_LENGTH) {
        dispatch(resetSearch());
        return;
      }
      dispatch(searchBrands(trimmed));
    },
    [dispatch],
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    runSearch(localValue);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="part-number" className="form-label fw-semibold">
        Артикул (номер детали)
      </label>
      <div className="input-group">
        <input
          id="part-number"
          type="text"
          className="form-control form-control-lg"
          placeholder="Например: 01089"
          value={localValue}
          onChange={handleChange}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={brandsStatus === 'loading'}
        >
          Найти
        </button>
      </div>
      <div className="form-text">
        Поиск производителей выполняется автоматически при вводе (не менее {MIN_LENGTH}{' '}
        символов).
      </div>
    </form>
  );
}
