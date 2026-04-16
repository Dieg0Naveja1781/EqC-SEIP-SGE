import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './modules/auth/login/Login';
import Register from './modules/auth/register/Register';
import Dashboard from './modules/dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
