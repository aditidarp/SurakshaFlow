const filterList = (list, search) =>
  list.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

const DosDontContent = ({ data, search }) => {
  if (!data) return null;

  return (
    <div className="cards-row">
      {["before", "during", "after"].map((phase) => (
        <div className="card" key={phase}>
          <h3>{phase.toUpperCase()}</h3>
          <ul>
            {filterList(data[phase], search).map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DosDontContent;

