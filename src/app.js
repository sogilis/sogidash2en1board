// vim: sts=2:sw=2:et

/**
 * Components
 */

const DashApp = React.createClass({
  render: function() {
    return (
      <div className="sogidash-app">
        <nav className="navbar navbar navbar-light navbar-static-top bd-navbar">
          <a className="navbar-brand" href="#">SogiDash<sub>2 en 1</sub> Board</a>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <Content />
          </div>
        </div>
      </div>
    );
  }
});

var Content = React.createClass({
  render: function() {
    if (this.props.currentProject === null) {
      return (
        <div className="col-md-10">
          <p className="alert alert-info">Veuillez sélectionner un projet</p>
        </div>
      );
    }

    return (
      <div className="col-md-10">
        <h1>{this.props.currentProject}</h1>
        <PeopleCharts />
        <MonthChart />
      </div>
    );
  }
});

Content = ReactRedux.connect(
  (state) => {
    return {
      currentProject: state.currentProject
    }
  }
)(Content);

const ProjectsList = React.createClass({
  onProjectChange: function(e) {
    e.preventDefault();
    this.props.changeProject(e.target.textContent);
  },

  projectList: function() {
    return this.props.projects.map((projectName) => {
      var isActive = projectName == this.props.currentProject;
      var navLinkClass = 'nav-link';
      navLinkClass += isActive ? ' active' : '';

      return (
        <li className="nav-item" key={projectName}>
          <a className={navLinkClass} href="" onClick={this.onProjectChange}>{projectName}</a>
        </li>
      );
    });
  },

  render: function() {
    return (
      <div className="col-md-2 projects-list">
        <h2>Projets</h2>
        <ul className="nav nav-pills nav-stacked">
          {this.projectList()}
        </ul>
      </div>
    );
  }
});

const Sidebar = ReactRedux.connect(
  (state) => {
    return {
      projects: state.projects,
      currentProject: state.currentProject,
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
      <div className="people-charts alert alert-info">
        Personne n'a jamais bossé sur ce projet
      </div>
    );
  }
});

const MonthChart = React.createClass({
  render: function() {
    return (
      <div className="month-chart alert alert-info">
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
