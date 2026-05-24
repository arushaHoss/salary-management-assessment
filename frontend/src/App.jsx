import { useState } from 'react';
import { Header } from './components/Header';
import { EmployeeList } from './pages/EmployeeList';
import { Insights } from './pages/Insights';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('employees');

  return (
    <div className="app-shell">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'employees' ? <EmployeeList /> : <Insights />}
      </main>
    </div>
  );
}

export default App;
