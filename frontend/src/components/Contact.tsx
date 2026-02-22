import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <section className="contact-page" data-testid="contact-page">
      <h1 id="contact-title">Contact Us</h1>
      <p className="contact-intro">
        Questions about orders, products, or delivery? Reach us using the details below.
      </p>

      <div className="contact-grid">
        <article className="contact-card" aria-label="Customer support email">
          <h2>Email</h2>
          <p>
            <a href="mailto:support@testautomationtarget.local">support@testautomationtarget.local</a>
          </p>
        </article>

        <article className="contact-card" aria-label="Customer support phone">
          <h2>Phone</h2>
          <p>
            <a href="tel:+4700000000">+47 00 00 00 00</a>
          </p>
        </article>

        <article className="contact-card" aria-label="Support hours">
          <h2>Hours</h2>
          <p>Mon-Fri: 07:00-23:00</p>
          <p>Sat-Sun: 08:00-22:00</p>
        </article>
      </div>

      <p className="contact-back">
        <Link to="/products">Back to shopping</Link>
      </p>
    </section>
  );
}
