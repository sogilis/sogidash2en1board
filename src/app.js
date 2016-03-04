// vim: sts=2:sw=2:et

/**
 * Components
 */
const DashApp = React.createClass({
  render: function() {
    return (
      <div className="container">
        <h1>SogiDash<sub>2 en 1</sub> Board</h1>

        <Sidebar />

        <div className="content">
          <PeopleCharts />
          <MonthChart />
        </div>
      </div>
    );
  }
});

const Sidebar = React.createClass({
  render: function() {
    return (
      <div className="projects-list">
        Nous n'avons jamais bossé sur aucun projet
      </div>
    );
  }
});

const PeopleCharts = React.createClass({
  render: function() {
    return (
      <div className="people-charts">
        Personne n'a jamais bossé sur ce projet
      </div>
    );
  }
});

const MonthChart = React.createClass({
  render: function() {
    return (
      <div className="month-chart">
        Il n'y a aucun graphique à montrer pour ce projet
      </div>
    );
  }
});

/**
 * Configure store
 */
const store = Redux.createStore(() => {});

const Provider = ReactRedux.Provider;
ReactDOM.render(
  <Provider store={store}>
    <DashApp />
  </Provider>,
  document.getElementById('app')
);
