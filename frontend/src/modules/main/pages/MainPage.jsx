import MainHeader from '../components/MainHeader';
import QuickActions from '../components/QuickActions';
import LastSessionTable from '../components/LastSessionTable';
import '../styles/MainPage.css';

function MainPage() {
  return (
    <div className="main-page-wrap">
      <header className="main-top-header">
        <MainHeader username="ExampleText" />
      </header>

      <main className="main-page">
        <QuickActions />
        <LastSessionTable />
      </main>
    </div>
  );
}

export default MainPage;
