import { Link } from 'react-router-dom';
import './styles.css';

const automationAreas = [
  'Authentication: sign up, sign in, session restore, and protected routes.',
  'Catalog flows: category filters, search, pagination, and add-to-cart actions.',
  'Checkout flows: validation, saved checkout data, order creation, and confirmation.',
  'Profile flows: order history, account updates, saved addresses, payment methods, and notifications.',
];

const engineeringNotes = [
  'Frontend and backend run separately and communicate over HTTP.',
  'GitHub Actions now runs split frontend and backend CI workflows.',
  'Frontend unit/integration coverage and backend JaCoCo reporting are available in CI artifacts.',
  'Stable ids and data-testids are kept intentionally for automation use.',
];

const testGuidance = [
  'Use page-level UI tests for user journeys, slice tests for state logic, and API checks for backend contracts.',
  'Prefer deterministic data and explicit waits over hard-coded sleeps.',
  'Verify persisted outcomes after refresh, checkout, and re-login scenarios.',
  'Keep PR feedback fast by separating frontend and backend checks.',
];

export default function Home() {
  return (
    <section className="home-page" data-testid="home-page">
      <header className="home-hero">
        <p className="home-kicker">Test Automation Target</p>
        <h1 id="home-title">A stable automation target with realistic full-stack flows</h1>
        <p className="home-intro">
          This application is built for UI, API, and CI test practice. It combines stable selectors with realistic auth,
          cart, checkout, and profile scenarios so automation work can focus on behavior instead of brittle setup.
        </p>
        <div className="home-actions">
          <Link className="home-action primary" to="/products">
            Explore product flows
          </Link>
          <Link className="home-action" to="/checkout">
            Inspect checkout
          </Link>
          <Link className="home-action" to="/profile">
            Inspect profile flows
          </Link>
        </div>
        <div className="home-status" aria-label="Project status highlights">
          <span className="home-pill">Split frontend/backend runtime</span>
          <span className="home-pill">Frontend Vitest suite</span>
          <span className="home-pill">Backend JaCoCo in CI</span>
          <span className="home-pill">Stable automation selectors</span>
        </div>
      </header>

      <section className="home-grid" aria-label="What this app is for">
        <article className="home-card">
          <h2>What To Automate</h2>
          <ul>
            {automationAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="home-card">
          <h2>Project State</h2>
          <ul>
            {engineeringNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="home-card">
          <h2>Testing Guidance</h2>
          <ul>
            {testGuidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
}
