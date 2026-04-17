export function PageHeader({ username, onUsernameChange }) {
  return (
    <header className="page-header">
      <div className="brand-block">
        <span className="live-dot" aria-hidden="true" />
        <div>
          <p className="eyebrow">Live Drop</p>
          <h1>Limited Sneaker Release</h1>
        </div>
      </div>

      <div className="identity-control">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="drop-username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter username"
          autoComplete="off"
        />
      </div>
    </header>
  );
}
