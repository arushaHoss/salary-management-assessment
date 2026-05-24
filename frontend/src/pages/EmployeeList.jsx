import { useCallback, useEffect, useState } from 'react';
import { employeeApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { EmployeeForm } from '../components/EmployeeForm';

const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'India', 'Australia', 'Japan', 'Brazil', 'Mexico', 'Singapore', 'Netherlands'];
const jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'UX Designer', 'QA Engineer', 'Solutions Architect', 'Systems Administrator', 'Business Analyst', 'Technical Writer', 'Project Manager', 'Security Engineer', 'Network Engineer', 'Database Administrator', 'Frontend Developer', 'Backend Developer'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getErrorMessage = (error, fallback) => {
  const details = error.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => item.message).join(', ');
  }
  return error.response?.data?.message || error.response?.data?.error || fallback;
};

export function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({ search: '', country: '', jobTitle: '' });
  const [totalPages, setTotalPages] = useState(1);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value.trim() !== '')
      );
      const response = Object.keys(activeFilters).length
        ? await employeeApi.search(activeFilters, page, limit)
        : await employeeApi.getAll(page, limit);

      setEmployees(response.data.employees || []);
      setTotalEmployees(response.data.total || 0);
      setTotalPages(Math.max(response.data.totalPages || 1, 1));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadEmployees, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadEmployees]);

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await employeeApi.create(data);
      closeModal();
      setNotice('Employee created');
      setPage(1);
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create employee'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await employeeApi.update(editingEmployee.id, data);
      closeModal();
      setNotice('Employee updated');
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update employee'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Delete ${employee.fullName}?`)) return;
    try {
      await employeeApi.delete(employee.id);
      setNotice('Employee deleted');
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete employee'));
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', country: '', jobTitle: '' });
    setPage(1);
  };

  return (
    <div className="page employees-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">People</p>
          <h2>Employees</h2>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
          type="button"
        >
          Add Employee
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      <Alert type="success" message={notice} onClose={() => setNotice(null)} />

      <section className="toolbar" aria-label="Employee filters">
        <input
          type="search"
          name="search"
          placeholder="Search name or email"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select name="country" value={filters.country} onChange={handleFilterChange}>
          <option value="">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <select name="jobTitle" value={filters.jobTitle} onChange={handleFilterChange}>
          <option value="">All job titles</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
          aria-label="Rows per page"
        >
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
        </select>
        <button className="btn btn-secondary" onClick={clearFilters} type="button">
          Clear
        </button>
      </section>

      <section className="table-panel">
        <div className="table-summary">
          <strong>{totalEmployees.toLocaleString()}</strong>
          <span>active employees</span>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading employees" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Country</th>
                  <th>Salary</th>
                  <th>Type</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">No employees found</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <strong>{employee.fullName}</strong>
                        <span className="mobile-subtext">{employee.department}</span>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.jobTitle}</td>
                      <td>{employee.department}</td>
                      <td>{employee.country}</td>
                      <td>{formatCurrency(employee.salary)}</td>
                      <td>{employee.employmentType}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-small btn-secondary" onClick={() => { setEditingEmployee(employee); setShowModal(true); }} type="button">
                            Edit
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(employee)} type="button">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="pagination">
        <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)} type="button">
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} type="button">
          Next
        </button>
      </div>

      <Modal isOpen={showModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} onClose={closeModal}>
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={editingEmployee ? handleUpdate : handleCreate}
          onCancel={closeModal}
          isLoading={saving}
        />
      </Modal>
    </div>
  );
}
