export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onReset,
}) {
  const { genres = [], languages = [], cities = [], theatres = [] } = options;

  // Filter theatres dropdown if city is selected
  const availableTheatres =
    filters.location && filters.location !== 'All'
      ? theatres.filter((t) => t.city.toLowerCase() === filters.location.toLowerCase())
      : theatres;

  // Generate date options (Today, Tomorrow, next 4 days)
  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    let label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (i === 0) label = `Today (${label})`;
    else if (i === 1) label = `Tomorrow (${label})`;
    dateOptions.push({ value: dateStr, label });
  }

  const hasActiveFilters =
    filters.search ||
    filters.genre !== 'All' ||
    filters.language !== 'All' ||
    filters.location !== 'All' ||
    filters.theatre !== 'All' ||
    filters.date !== 'All';

  return (
    <div className="filter-bar-container">
      {/* Top row: Search input */}
      <div className="filter-search-row">
        <div className="search-box-large">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search movies by title, genre, actor..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              className="clear-search-btn"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Second row: Filter dropdowns */}
      <div className="filter-dropdowns-grid">
        {/* Genre filter */}
        <div className="filter-control-group">
          <label htmlFor="filter-genre">Genre</label>
          <select
            id="filter-genre"
            value={filters.genre}
            onChange={(e) => onFilterChange('genre', e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language filter */}
        <div className="filter-control-group">
          <label htmlFor="filter-language">Language</label>
          <select
            id="filter-language"
            value={filters.language}
            onChange={(e) => onFilterChange('language', e.target.value)}
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Location / City filter */}
        <div className="filter-control-group">
          <label htmlFor="filter-location">Location / City</label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(e) => {
              onFilterChange('location', e.target.value);
              // Reset theatre if location changes
              onFilterChange('theatre', 'All');
            }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Cities' : `📍 ${c}`}
              </option>
            ))}
          </select>
        </div>

        {/* Theatre filter */}
        <div className="filter-control-group">
          <label htmlFor="filter-theatre">Theatre</label>
          <select
            id="filter-theatre"
            value={filters.theatre}
            onChange={(e) => onFilterChange('theatre', e.target.value)}
          >
            <option value="All">All Theatres</option>
            {availableTheatres.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date filter */}
        <div className="filter-control-group">
          <label htmlFor="filter-date">Date</label>
          <select
            id="filter-date"
            value={filters.date}
            onChange={(e) => onFilterChange('date', e.target.value)}
          >
            <option value="All">All Dates</option>
            {dateOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters pill list & Reset button */}
      {hasActiveFilters && (
        <div className="active-filters-row">
          <span className="active-filters-label">Active Filters:</span>
          {filters.search && (
            <span className="filter-pill">
              Search: "{filters.search}"
              <button onClick={() => onFilterChange('search', '')}>×</button>
            </span>
          )}
          {filters.genre !== 'All' && (
            <span className="filter-pill">
              {filters.genre}
              <button onClick={() => onFilterChange('genre', 'All')}>×</button>
            </span>
          )}
          {filters.language !== 'All' && (
            <span className="filter-pill">
              {filters.language}
              <button onClick={() => onFilterChange('language', 'All')}>×</button>
            </span>
          )}
          {filters.location !== 'All' && (
            <span className="filter-pill">
              📍 {filters.location}
              <button onClick={() => onFilterChange('location', 'All')}>×</button>
            </span>
          )}
          {filters.theatre !== 'All' && (
            <span className="filter-pill">
              Theatre
              <button onClick={() => onFilterChange('theatre', 'All')}>×</button>
            </span>
          )}
          {filters.date !== 'All' && (
            <span className="filter-pill">
              📅 {filters.date}
              <button onClick={() => onFilterChange('date', 'All')}>×</button>
            </span>
          )}
          <button className="reset-all-filters-btn" onClick={onReset}>
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
