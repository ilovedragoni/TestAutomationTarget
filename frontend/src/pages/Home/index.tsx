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
          selectors, realistic user flows, and deterministic behavior that makes tests easier to maintain across auth,
          cart, checkout, and order-history scenarios.
        </p>
        <div className="home-actions">
          <Link className="home-action primary" to="/products">
            Go to shopping flows
          </Link>
          <Link className="home-action" to="/checkout">
            Go to checkout flow
          </Link>
          <Link className="home-action" to="/profile">
            Go to profile orders
          </Link>
        </div>
      </header>

      <section className="home-grid" aria-label="What this app is for">
        <article className="home-card">
          <h2>What To Practice</h2>
          <ul>
            <li>
              Authentication flows
              <ul>
                <li>Sign up with valid and invalid payloads.</li>
                <li>Sign in with session creation and restore behavior.</li>
                <li>Sign out and protected-route access checks.</li>
              </ul>
            </li>
            <li>
              Catalog behavior
              <ul>
                <li>Category filtering with predictable result sets.</li>
                <li>Search queries and empty-result handling.</li>
                <li>Pagination and product-card actions.</li>
              </ul>
            </li>
            <li>
              Cart behavior
              <ul>
                <li>Authenticated add/remove/decrement flows.</li>
                <li>Persistence across page refresh for signed-in users.</li>
                <li>Cart badge/count and totals verification.</li>
              </ul>
            </li>
            <li>
              Checkout behavior
              <ul>
                <li>Shipping and payment input validation rules.</li>
                <li>Successful order submission and cart clearing.</li>
                <li>One-time confirmation page navigation.</li>
              </ul>
            </li>
            <li>
              Order history
              <ul>
                <li>Profile Orders list after checkout.</li>
                <li>Order metadata, line items, and subtotal assertions.</li>
                <li>Refresh behavior and error handling.</li>
              </ul>
            </li>
            <li>
              Routing and API checks
              <ul>
                <li>Protected versus public route access paths.</li>
                <li>Success and validation-error API assertions.</li>
                <li>End-to-end flow consistency across UI and backend state.</li>
              </ul>
            </li>
          </ul>
        </article>

        <article className="home-card">
          <h2>Best Practices</h2>
          <ul>
            <li>Prefer `data-testid` and stable IDs over brittle visual selectors.</li>
            <li>Use explicit waits for UI state changes, not fixed sleep calls.</li>
            <li>Keep tests isolated by creating or resetting data per test case.</li>
            <li>Assert meaningful behavior, not implementation details.</li>
            <li>Keep each test focused on one business outcome and one failure reason.</li>
            <li>Use page objects or screen helpers to centralize UI interactions.</li>
            <li>Verify both UI and API state for critical flows like checkout and orders.</li>
            <li>Use deterministic test data factories with clear naming conventions.</li>
            <li>Tag tests by scope (`smoke`, `regression`, `api`) for selective execution.</li>
            <li>Run tests with consistent browser, viewport, locale, and timezone settings.</li>
            <li>Capture traces/screenshots only on failure to reduce noise and storage costs.</li>
            <li>Assert network responses and status codes for high-risk backend calls.</li>
            <li>Validate accessibility signals: focus order, labels, and ARIA states.</li>
            <li>Mock only true external dependencies; keep app APIs real where possible.</li>
            <li>Retry only idempotent actions and document why retry is acceptable.</li>
            <li>Use contract checks between frontend payloads and backend validation rules.</li>
            <li>Track flaky tests and quarantine with owner + fix deadline.</li>
            <li>Version and review test utilities with the same rigor as product code.</li>
            <li>Keep CI feedback fast with parallelization and reliable test sharding.</li>
            <li>Include negative-path and permission tests for authenticated endpoints.</li>
            <li>Use seed/fixture snapshots to stabilize large data setup across suites.</li>
            <li>Log correlation IDs in tests to map UI failures to backend logs quickly.</li>
            <li>Ensure teardown is resilient so failed tests do not poison later runs.</li>
          </ul>
        </article>

        <article className="home-card">
          <h2>Common Anti-Patterns</h2>
          <ul>
            <li>Chaining many UI steps in one test without clear assertions.</li>
            <li>Depending on shared test data that can be modified by other tests.</li>
            <li>Selecting elements by dynamic class names from styling frameworks.</li>
            <li>Ignoring API error paths and only validating happy-path responses.</li>
            <li>Using arbitrary sleeps (`wait(2000)`) instead of event-driven waits.</li>
            <li>Over-mocking app APIs so tests never exercise real integration points.</li>
            <li>Asserting pixel-perfect layout in functional end-to-end tests.</li>
            <li>Combining multiple user roles in one test case and state setup.</li>
            <li>Hard-coding credentials, IDs, and order numbers in assertions.</li>
            <li>Ignoring cleanup, which leaves orphaned data and cross-test leakage.</li>
            <li>Treating flaky tests as normal and repeatedly rerunning until green.</li>
            <li>Masking backend failures by asserting only front-end toast messages.</li>
            <li>Skipping auth boundary tests for protected routes and API endpoints.</li>
            <li>Letting selectors drift without refactoring shared test helpers.</li>
            <li>Using broad selectors that match multiple elements unpredictably.</li>
            <li>Running all tests serially, causing slow feedback and hidden coupling.</li>
            <li>Not pinning test environment config, causing locale/timezone drift.</li>
            <li>Ignoring browser console and network errors during assertions.</li>
            <li>Using test order dependencies where one test requires another to run first.</li>
            <li>Failing to verify persisted outcomes after refresh or re-login scenarios.</li>
            <li>Allowing nondeterministic data generation without stable seeds.</li>
            <li>Writing long end-to-end tests to cover logic better suited for API/unit tests.</li>
            <li>Treating retries as a permanent fix for race conditions.</li>
          </ul>
        </article>
      </section>
    </section>
  );
}
