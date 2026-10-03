import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../utils/format";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="landing-brand">StreetPulse<span className="landing-brand-dot" /></Link>
          <nav aria-label="Main navigation">
            <a className="landing-process-link" href="#process">The process</a>
            <Link to="/login">Sign in</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="landing-intro" aria-labelledby="landing-title">
          <img className="landing-photo" src="https://upload.wikimedia.org/wikipedia/commons/3/36/Potholes_in_Bengaluru_road.jpg" alt="Damaged road surface in Bengaluru" />
          <div className="landing-photo-shade" />
          <div className="landing-container landing-intro-content">
            <p className="landing-eyebrow">Bengaluru / Civic issue reporting</p>
            <h1 id="landing-title">StreetPulse</h1>
            <p className="landing-lead">Report the damage.<br />Follow the repair.</p>
            <p className="landing-description">Potholes, waterlogging, broken footpaths. One place for your report and the photo record of what happens next.</p>
            <div className="landing-actions">
              <Link to="/login?register=1" className="landing-primary">Report an issue</Link>
              <Link to="/login" className="landing-secondary">Track my reports</Link>
            </div>
            <p className="landing-location">Bengaluru, Karnataka</p>
          </div>
          <a className="landing-photo-credit" href="https://commons.wikimedia.org/wiki/File:Potholes_in_Bengaluru_road.jpg" target="_blank" rel="noreferrer">Photo: Mallikarjunasj / CC0</a>
        </section>
        <section id="process" className="landing-container landing-process">
          <div className="landing-section-heading"><h2>From report to repair.</h2><span>A record at every step</span></div>
          <ol className="landing-steps">
          {[
            ["01", "Report the issue", "A photo and a location give your report a place on the map."],
            ["02", "Follow the work", "Assigned teams add progress updates and repair evidence."],
            ["03", "Check the outcome", "Review the repair. Disputed or uncertain results go to an administrator."],
          ].map(([number, title, description]) => (
            <li key={number}>
              <span className="landing-step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
          </ol>
        </section>
      </main>
      <footer className="landing-container landing-footer">
        <span>StreetPulse <span className="landing-footer-city">/ Bengaluru</span></span>
        <nav aria-label="Legal"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms &amp; conditions</Link></nav>
      </footer>
    </div>
  );
}
