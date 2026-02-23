import { Link } from 'react-router-dom';
import './styles.css';

export default function Home() {
  return (
    <section className="home-page" data-testid="home-page">
      <header className="home-hero">
        <p className="home-kicker">Test Automation Target</p>
        <h1 id="home-title">A predictable app for end-to-end automation practice</h1>
        <p className="home-intro">
          This application is designed for Selenium, Playwright, and API test training. It focuses on stable
          selectors, realistic user flows, and deterministic behavior that makes tests easier to maintain.
        </p>
        <div className="home-actions">
          <Link className="home-action primary" to="/products">
            Go to shopping flows
          </Link>
          <Link className="home-action" to="/signin">
            Go to auth flows
          </Link>
        </div>
      </header>

      <section className="home-grid" aria-label="What this app is for">
        <article className="home-card">
          <h2>What To Practice</h2>
          <ul>
            <li>Authentication flows: sign up, sign in, restore session, sign out.</li>
            <li>Catalog behavior: category filtering, product search, and row-level actions.</li>
            <li>Navigation and routing checks across protected and public pages.</li>
            <li>API assertions with realistic success and validation error cases.</li>
          </ul>
        </article>

        <article className="home-card">
          <h2>Best Practices</h2>
          <ul>
            <li>Prefer `data-testid` and stable IDs over brittle visual selectors.</li>
            <li>Use explicit waits for UI state changes, not fixed sleep calls.</li>
            <li>Keep tests isolated by creating or resetting data per test case.</li>
            <li>Assert meaningful behavior, not implementation details.</li>
          </ul>
        </article>

        <article className="home-card">
          <h2>Common Anti-Patterns</h2>
          <ul>
            <li>Chaining many UI steps in one test without clear assertions.</li>
            <li>Depending on shared test data that can be modified by other tests.</li>
            <li>Selecting elements by dynamic class names from styling frameworks.</li>
            <li>Ignoring API error paths and only validating happy-path responses.</li>
          </ul>
        </article>
      </section>
    </section>
  );
}
