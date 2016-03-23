// vim: sts=2:sw=2:et

/**
 * Components
 */

const DashApp = React.createClass({
  render: function() {
    return (
      <div className="sogidash-app">
        <nav className="navbar navbar navbar-light navbar-static-top bd-navbar">
          <a className="navbar-brand" href="index.html">SogiDash<sub>2 en 1</sub> Board</a>
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
    if (this.props.isFetchingData) {
      return (
        <div className="col-md-2 projects-list-loading">
          <p className="text-muted">Chargement des projets…</p>
          <div className="loader-inner ball-scale-ripple-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      );
    }

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
      isFetchingData: state.isFetchingData,
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

var PeopleCharts = React.createClass({
  peopleList: function() {
    return this.props.currentPeople.map((person) => {
      var progressValue = person.duration * 100/30;

      return (
        <div className="row">
          <div className="col-md-1">
            <strong>{person.name}</strong>
          </div>
          <div className="col-md-1 text-muted">
            {person.duration} jours
          </div>
          <div className="col-md-10">
            <progress className="progress progress-info" value={progressValue} max="100">{person.duration} jours</progress>
          </div>
        </div>
      );
    });
  },

  render: function() {
    if (this.props.currentPeople.length <= 0) {
      return (
        <div className="alert alert-info">
          Personne n’a jamais bossé sur ce projet
        </div>
      );
    }

    return (
      <ul className="list-group">
        {this.peopleList()}
      </ul>
    );
  }
});

PeopleCharts = ReactRedux.connect(
  (state) => {
    var currentPeople = [];
    if (state.currentProject !== null) {
      console.log(state.peopleTimeReportByProject);
      currentPeople = state.peopleTimeReportByProject[state.currentProject];
    }

    return { currentPeople };
  }
)(PeopleCharts);

const MonthChart = React.createClass({
  render: function() {
    return (
      <div className="month-chart alert alert-info">
        Il n’y a aucun graphique à montrer pour ce projet
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
    beforeSend: () => dispatch({ type: 'START_FETCH_DATA' }),
    success: (data) => dispatch({
      type: 'RECEIVE_DATA',
      data
    }),
    error: (xhr, status, err) => console.error('Failure', status, err.toString()),
    complete: () => dispatch({ type: 'FINISH_FETCH_DATA' }),
  });
}

/**
 * Reducers
 */

const DEFAULT_PROJECT_NAME = 'OFF';
const appReducer = Redux.combineReducers({
  projects: function(state = [], action){
    if (action.type == 'RECEIVE_DATA') {
      var projects = {};
      for (var occ of action.data.occupations) {
        var projectName = occ.Project === '' ? DEFAULT_PROJECT_NAME : occ.Project;
        projects[projectName] = true;
      }
      return Object.keys(projects);
    }
    return state
  },

  peopleTimeReportByProject: function(state = {}, action) {
    if (action.type == 'RECEIVE_DATA') {
      var timeReport = {};
      for (var occ of action.data.occupations) {
        var projectName = occ.Project === '' ? DEFAULT_PROJECT_NAME : occ.Project;
        var personName = occ.Person;
        var duration = occ.Duration;

        if (timeReport[projectName] === undefined) {
          timeReport[projectName] = [];
        }

        var found = false;
        for (var i = 0 ; i < timeReport[projectName].length ; i++) {
          if (timeReport[projectName][i].name == personName) {
            timeReport[projectName][i].duration += duration;
            found = true;
            break;
          }
        }

        if (!found) {
          timeReport[projectName].push({ name: personName, duration: duration });
        }
      }
      return timeReport;
    }
    return state;
  },

  currentProject: function(state = null, action) {
    if (action.type == 'CHANGE_PROJECT') {
      return action.project;
    }
    return state;
  },

  isFetchingData: function(state = false, action) {
    if (action.type == 'START_FETCH_DATA') {
      return true;
    } else if(action.type == 'FINISH_FETCH_DATA') {
      return false;
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
