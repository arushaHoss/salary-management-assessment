import { useState } from 'react';

const emptyEmployee = {
  fullName: '',
  email: '',
  jobTitle: '',
  department: '',
  country: '',
  salary: '',
  currency: 'USD',
  employmentType: 'Full-time',
  hireDate: '',
};

const jobTitles = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer',
  'UX Designer', 'QA Engineer', 'Solutions Architect', 'Systems Administrator',
  'Business Analyst', 'Technical Writer', 'Project Manager', 'Security Engineer',
  'Network Engineer', 'Database Administrator', 'Frontend Developer', 'Backend Developer',
];

const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Customer Support', 'Data', 'Infrastructure', 'Security'];
const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'India', 'Australia', 'Japan', 'Brazil', 'Mexico', 'Singapore', 'Netherlands'];

const toFormData = (employee) => {
  if (!employee) return emptyEmployee;

  return {
    fullName: employee.fullName || '',
    email: employee.email || '',
    jobTitle: employee.jobTitle || '',
    department: employee.department || '',
    country: employee.country || '',
    salary: employee.salary ?? '',
    currency: employee.currency || 'USD',
    employmentType: employee.employmentType || 'Full-time',
    hireDate: employee.hireDate || '',
  };
};

export function EmployeeForm({ employee = null, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState(toFormData(employee));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    const salary = Number(formData.salary);

    if (formData.fullName.trim().length < 2) nextErrors.fullName = 'Use at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Use a valid email';
    if (!formData.jobTitle) nextErrors.jobTitle = 'Choose a job title';
    if (!formData.department) nextErrors.department = 'Choose a department';
    if (!formData.country) nextErrors.country = 'Choose a country';
    if (formData.salary === '' || Number.isNaN(salary)) nextErrors.salary = 'Enter a salary';
    if (salary < 0) nextErrors.salary = 'Salary cannot be negative';
    if (!formData.hireDate) nextErrors.hireDate = 'Choose a hire date';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      salary: Number(formData.salary),
    });
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group wide">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={isLoading} autoComplete="name" />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>

        <div className="form-group wide">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading || Boolean(employee)} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <select id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={isLoading}>
            <option value="">Select</option>
            {jobTitles.map((title) => <option key={title} value={title}>{title}</option>)}
          </select>
          {errors.jobTitle && <span className="field-error">{errors.jobTitle}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select id="department" name="department" value={formData.department} onChange={handleChange} disabled={isLoading}>
            <option value="">Select</option>
            {departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          {errors.department && <span className="field-error">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select id="country" name="country" value={formData.country} onChange={handleChange} disabled={isLoading}>
            <option value="">Select</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
          {errors.country && <span className="field-error">{errors.country}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salary</label>
          <input id="salary" type="number" name="salary" min="0" value={formData.salary} onChange={handleChange} disabled={isLoading} />
          {errors.salary && <span className="field-error">{errors.salary}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="employmentType">Employment Type</label>
          <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleChange} disabled={isLoading}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="hireDate">Hire Date</label>
          <input id="hireDate" type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} disabled={isLoading} />
          {errors.hireDate && <span className="field-error">{errors.hireDate}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving' : employee ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
}
