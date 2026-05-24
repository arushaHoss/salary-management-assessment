export function Header({ currentPage, onPageChange }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <h1>Salary Management</h1>
            <span>Compensation operations</span>
          </div>
        </div>
        <nav className="nav" aria-label="Primary navigation">
          <button
            className={`nav-btn ${currentPage === 'employees' ? 'active' : ''}`}
            onClick={() => onPageChange('employees')}
            type="button"
          >
            Employees
          </button>
          <button
            className={`nav-btn ${currentPage === 'insights' ? 'active' : ''}`}
            onClick={() => onPageChange('insights')}
            type="button"
          >
            Insights
          </button>
        </nav>
      </div>
    </header>
  );
}
