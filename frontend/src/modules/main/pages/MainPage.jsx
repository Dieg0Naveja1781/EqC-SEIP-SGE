import { DashboardLayout } from "../../../shared/components/DashboardLayout";
import QuickActions from "../components/QuickActions";
import LastSessionTable from "../components/LastSessionTable";
import "../styles/MainPage.css";

function MainPage() {
  return (
    <DashboardLayout title="Página Principal">
      <div className="main-page-wrap">
        <main className="main-page">
          <QuickActions />
          <LastSessionTable />
        </main>
      </div>
    </DashboardLayout>
  );
}

export default MainPage;
