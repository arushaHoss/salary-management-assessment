import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { insightApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#0891b2'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error || 'Failed to load insights';

export function Insights() {
  const [stats, setStats] = useState(null);
  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, countriesRes, deptRes, earnersRes, distRes] = await Promise.all([
          insightApi.getOrganizationStats(),
          insightApi.getAllCountries(),
          insightApi.getDepartments(selectedCountry || null),
          insightApi.getTopEarners(10, selectedCountry || null),
          insightApi.getSalaryDistribution(selectedCountry || null),
        ]);

        if (ignore) return;

        setStats(statsRes.data);
        setCountries(countriesRes.data.countries || []);
        setDepartments(deptRes.data.departments || []);
        setTopEarners(earnersRes.data.topEarners || []);
        setDistribution(
          Object.entries(distRes.data.distribution || {}).map(([range, count]) => ({
            range,
            count,
          }))
        );
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadInsights();
    return () => {
      ignore = true;
    };
  }, [selectedCountry]);

  const countryChartData = selectedCountry
    ? countries.filter((country) => country.country === selectedCountry)
    : countries.slice(0, 10);

  return (
    <div className="page insights-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Salary Insights</h2>
        </div>
        <select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} aria-label="Filter country">
          <option value="">All countries</option>
          {countries.map((country) => (
            <option key={country.country} value={country.country}>{country.country}</option>
          ))}
        </select>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading insights" />
      ) : (
        <>
          {stats && (
            <section className="stats-grid" aria-label="Organization statistics">
              <div className="stat-card">
                <span>Total Employees</span>
                <strong>{stats.totalEmployees.toLocaleString()}</strong>
              </div>
              <div className="stat-card">
                <span>Average Salary</span>
                <strong>{formatCurrency(stats.avgSalary)}</strong>
              </div>
              <div className="stat-card">
                <span>Salary Range</span>
                <strong>{formatCurrency(stats.minSalary)} - {formatCurrency(stats.maxSalary)}</strong>
              </div>
              <div className="stat-card">
                <span>Countries</span>
                <strong>{stats.countries}</strong>
              </div>
              <div className="stat-card">
                <span>Departments</span>
                <strong>{stats.departments}</strong>
              </div>
            </section>
          )}

          <section className="charts-grid">
            <div className="chart-panel">
              <div className="panel-heading">
                <h3>Average Salary by Country</h3>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={countryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="country" />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="avgSalary" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-panel">
              <div className="panel-heading">
                <h3>Salary Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={distribution} dataKey="count" nameKey="range" innerRadius={58} outerRadius={96} paddingAngle={2}>
                    {distribution.map((entry, index) => (
                      <Cell key={entry.range} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list">
                {distribution.map((item, index) => (
                  <span key={item.range}>
                    <i style={{ background: COLORS[index % COLORS.length] }} />
                    {item.range}: {item.count}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="chart-panel">
            <div className="panel-heading">
              <h3>Departments</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" />
                <YAxis yAxisId="salary" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                <YAxis yAxisId="count" orientation="right" allowDecimals={false} />
                <Tooltip formatter={(value, name) => (name === 'avgSalary' ? formatCurrency(value) : value)} />
                <Bar yAxisId="salary" dataKey="avgSalary" fill="#16a34a" name="avgSalary" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="count" dataKey="headcount" fill="#ca8a04" name="headcount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="table-panel">
            <div className="panel-heading">
              <h3>Top Earners</h3>
            </div>
            <div className="top-earners">
              {topEarners.length === 0 ? (
                <div className="empty-state">No top earners found</div>
              ) : (
                topEarners.map((employee, index) => (
                  <div className="earner-row" key={employee.id}>
                    <div className="rank">{index + 1}</div>
                    <div>
                      <strong>{employee.fullName}</strong>
                      <span>{employee.jobTitle} / {employee.department} / {employee.country}</span>
                    </div>
                    <strong>{formatCurrency(employee.salary)}</strong>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
