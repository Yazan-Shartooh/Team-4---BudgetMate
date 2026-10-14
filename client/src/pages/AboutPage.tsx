const team = [
  [
    "Yazan Shartouh",
    "Team leader",
    "Project coordination, seed data, and prototype integration.",
    "../../public/yazan.png",
  ],
  [
    "Hamid Al Haj",
    "Backend",
    "NestJS API, in-memory services, and API testing collection.",
    "../../public/hamid.png",
  ],
  [
    "Esmaeel Mahfoud",
    "Integration",
    "Backend/frontend integration and final project assembly.",
    "../../public/esmaiel.png",
  ],
  [
    "Mulham Al Kasir",
    "Frontend foundation",
    "Application shell, navigation, shared calculations, dashboard, and Finora styling.",
    "../../public/molham.png",
  ],
  [
    "Alaa Ismaiel",
    "Transactions & budgets",
    "Transaction forms, validation, history, budgets, and shared feedback components.",
    "../../public/alaa.png",
  ],
  [
    "Nagham Jaza",
    "Income & reports",
    "Income views, month filtering, monthly reports, and spreadsheet exports.",
    "../../public/nagham.png",
  ],
];

export default function AboutPage() {
  return (
    <section className="page-stack about-page" aria-labelledby="about-title">
      <header className="page-heading">
        <div>
          <p className="eyebrow">About Finora</p>
          <h1 id="about-title">Money, made easier to understand.</h1>
          <p>Know where your money goes, every month and every category.</p>
        </div>
      </header>
      <section
        className="card about-intro"
        aria-labelledby="about-purpose-title"
      >
        <img src="/finora-icon.svg" className="about-brand" alt="" />
        <div>
          <p className="eyebrow">The project</p>
          <h2 id="about-purpose-title">A clear view of everyday finances.</h2>
          <p>
            Finora is our implementation of the BudgetMate personal finance
            project. Record income and expenses, set monthly category budgets,
            and understand your balance and savings through connected reports.
          </p>
          <p>
            Built with React, TypeScript, and NestJS for a single user, with USD
            as the display currency.
          </p>
        </div>
      </section>
      <div className="feature-grid about-details">
        <section
          className="card feature-card"
          aria-labelledby="about-data-title"
        >
          <p className="eyebrow">Your data</p>
          <h2 id="about-data-title">Working records live on the server.</h2>
          <p>
            Refreshing your browser reloads transactions and budgets from the
            running application server. Records are held in memory, so data may
            reset when the application server restarts. The server starts with
            sample transactions and budgets.
          </p>
        </section>
        <section
          className="card feature-card"
          aria-labelledby="about-export-title"
        >
          <p className="eyebrow">Your records</p>
          <h2 id="about-export-title">Take a snapshot with you.</h2>
          <p>
            Export your filtered transactions or income to Excel. Monthly report
            exports include the selected month's summary, transactions, category
            spending, and budget comparison. Exports are snapshots; importing
            them is not supported.
          </p>
        </section>
      </div>
      <section className="page-stack" aria-labelledby="about-team-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">The team</p>
            <h2 id="about-team-title">Built together</h2>
          </div>
        </div>
        <div className="feature-grid">
          {team.map(([name, role, contribution, imageUrl], index) => (
            <section className="card feature-card" key={name}>
              {" "}
              <img src={imageUrl} />
              <span className="feature-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{name}</h3>
              <p className="eyebrow">{role}</p>
              <p>{contribution}</p>
            </section>
          ))}
        </div>
      </section>
    </section>
  );
}
