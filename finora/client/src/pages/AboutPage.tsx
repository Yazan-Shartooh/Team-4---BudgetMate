export default function AboutPage() {
  return (
    <section className="page-stack about-page" aria-labelledby="about-title">
      <header className="page-heading">
        <div>
          <p className="eyebrow">About Finora</p>
          <h1 id="about-title">Money, made easier to understand.</h1>
          <p>
            Finora brings income, spending, monthly budgets, and reports into
            one personal finance workspace.
          </p>
        </div>
      </header>
      <section
        className="card placeholder-intro"
        aria-labelledby="about-purpose-title"
      >
        <p className="eyebrow">The project</p>
        <h2 id="about-purpose-title">A clear view of everyday finances.</h2>
        <p>
          Record income and expenses, compare spending with category limits, and
          review monthly savings from shared financial records.
        </p>
      </section>
      <section className="card feature-card" aria-labelledby="about-data-title">
        <p className="eyebrow">Your data</p>
        <h2 id="about-data-title">The server holds the working records.</h2>
        <p>
          When connected to the NestJS service, refreshing Finora reloads
          transactions and budgets from the running server. Because its records
          are held in memory, restarting that server may reset them.
        </p>
      </section>
      <section className="page-stack" aria-labelledby="about-team-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">The team</p>
            <h2 id="about-team-title">Built together</h2>
          </div>
        </div>
        <div className="feature-grid">
          <section className="card feature-card">
            <span className="feature-number">01</span>
            <h3>Molham</h3>
            <p>
              Application foundation, shared calculations, dashboard, and visual
              system.
            </p>
          </section>
          <section className="card feature-card">
            <span className="feature-number">02</span>
            <h3>Alaa</h3>
            <p>
              Transactions, validation, budgets, and shared transaction and
              feedback components.
            </p>
          </section>
          <section className="card feature-card">
            <span className="feature-number">03</span>
            <h3>Nagham</h3>
            <p>
              Income, monthly reports, category breakdowns, and spreadsheet
              exports.
            </p>
          </section>
        </div>
      </section>
    </section>
  );
}
