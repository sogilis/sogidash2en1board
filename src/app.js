// vim: sts=2:sw=2:et

/**
 * Components
 */

var DashApp = React.createClass({
  render: function() {
    return (
      <div className="container">
        <h1>SogiDash<sub>2 en 1</sub> Board</h1>

        <Sidebar />

        <div className="content">
          <h2>{this.props.currentProject}</h2>
          <PeopleCharts />
          <MonthChart />
        </div>
      </div>
    );
  }
});

DashApp = ReactRedux.connect(
  (state) => {
    var currentProject = 'Aucun projet sélectionné';
    if (state.currentProject != null) {
      currentProject = state.currentProject;
    }
    return { currentProject }
  }
)(DashApp);

const ProjectsList = React.createClass({
  onProjectChange: function(e) {
    e.preventDefault();
    this.props.changeProject(e.target.textContent);
  },

  projectList: function() {
    return this.props.projects.map((projectName) => {
      return (
        <li key={projectName}>
          <a href="" onClick={this.onProjectChange}>{projectName}</a>
        </li>
      );
    });
  },

  render: function() {
    return (
      <div className="projects-list">
        <h2>Projets</h2>
        <ul>
          {this.projectList()}
        </ul>
      </div>
    );
  }
});

const Sidebar = ReactRedux.connect(
  (state) => {
    return {
      projects: state.projects
    }
  },
  (dispatch) => {
    return {
      changeProject: (project) => dispatch({
        type: 'CHANGE_PROJECT',
        project,
      })
    }
  }
)(ProjectsList);

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
 * API fetching
 */
function fetchData(dispatch) {
  $.ajax({
    url: DashEndpoint,
    dataType: 'json',
    cache: false,
    success: (data) => dispatch({
      type: 'RECEIVE_DATA',
      data
    }),
    error: (xhr, status, err) => console.error('Failure', status, err.toString())
  });
}

/**
 * Reducers
 */
const appReducer = Redux.combineReducers({
  projects: function(state = [], action){
    if (action.type == 'RECEIVE_DATA') {
      var projects = {};
      for (var occ of action.data.occupations) {
        projects[occ.Project] = true;
      }
      return Object.keys(projects);
    }
    return state
  },

  currentProject: function(state = null, action) {
    if (action.type == 'CHANGE_PROJECT') {
      return action.project;
    }
    return state;
  },
});

/**
 * Configure store
 */
function thunkMiddleware({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

const createStoreWithMiddleware = Redux.applyMiddleware(
  thunkMiddleware
)(Redux.createStore);
const store = createStoreWithMiddleware(appReducer);

store.dispatch(fetchData);

const Provider = ReactRedux.Provider;
ReactDOM.render(
  <Provider store={store}>
    <DashApp />
  </Provider>,
  document.getElementById('app')
);
