import PartNumberSearch from './components/PartNumberSearch';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <div className="container py-4 py-md-5" style={{ maxWidth: 960 }}>
      <header className="mb-4">
        <h1 className="h3 mb-2">Подбор автозапчастей</h1>
        <p className="text-muted mb-0">
          Двухэтапный поиск через сервис «Проценка»: сначала производители по артикулу, затем
          аналоги и предложения по выбранному бренду.
        </p>
      </header>

      <PartNumberSearch />
      <BrandList />
      <OffersTable />
    </div>
  );
}
