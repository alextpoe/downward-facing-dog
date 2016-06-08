var React = require('react');
var Link = require('react-router').Link;
var ClientActions = require('../actions/ClientActions');
var SessionStore = require('../stores/SessionStore');
var SessionApiUtil = require('../util/SessionApiUtil');
var ProjectsIndexItem = require('./ProjectsIndexItem');
var ProjectsStore = require('../stores/ProjectsStore');
var TasksIndex = require('./TasksIndex');
var TasksStore = require('../stores/TasksStore');
var NewProjectsForm = require('./NewProjectsForm');


var ProjectsIndex = React.createClass({

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return { projects: ProjectsStore.all(), clicked: false };
  },

  onChange: function () {
    var currentUser = SessionStore.currentUser();
    var projects = ProjectsStore.all()
    if (currentUser && projects) {
      var filteredProjects = [];
      projects.forEach( function(project) {
        project.users.forEach(function (user){
          if (user.id === currentUser.id){
            filteredProjects.push(project)
          }
        })
      })
      this.setState({ projects: filteredProjects })
    } else {
      this.setState({ projects: projects })
    }
    this.context.router.push("/user/projects/" + ProjectsStore.mostRecentProject().id)
  },


  componentDidMount: function () {
    this.projectsListener = ProjectsStore.addListener(this.onChange)
    this.sessionListener = SessionStore.addListener(this.forceUpdate.bind(this), this.onChange)
    ClientActions.fetchAllProjects();
  },


  componentWillUnmount: function () {
    this.projectsListener.remove();
    this.sessionListener.remove();
  },

  newProject: function (event) {
    event.preventDefault();
    this.setState({ clicked: true })
    this.context.router.push("/user/projects/new")
  },



  render: function () {
    var projects;
    if (this.state.projects.length < 1){
      projects = SessionStore.currentUser().projects;
    } else {
      projects = this.state.projects;
    }

    var item = <div></div>;
    if (projects && projects.length > 0) {
      item = (
        projects.map(function (project) {
          return <ProjectsIndexItem project={ project } key={ project.id }/>
        })
      )
    }

    var user = SessionStore.currentUser().username ? SessionStore.currentUser().username : [];
    var user = user.slice(0, 2);

    var children = React.Children.map(this.props.children, function (child, i) {
      return React.cloneElement(child, {
        user: SessionStore.currentUser(),
        key: i
      })
    });

  //   if (this.state.clicked) {
  //     return (
  //     <div className="whole-page group">
  //       <NewProjectsForm>
  //       <div className="sidebar">
  //         <img src={window.landing_logo_url} />
  //         <button onClick={this.newProject} className="signup">+</button>
  //         <ul>
  //           {
  //             item
  //           }
  //         </ul>
  //       </div>
  //       <div className="upward-dog-main">
  //         { children }
  //       </div>
  //     </NewProjectsForm>
  //     </div>
  //   )
  // } else {
      return (
        <div className="whole-page group">
          <div className="sidebar">
            <img src={window.landing_logo_url} />
            <button onClick={this.newProject} className="signup">+</button>
            <ul>
              {
                item
              }
            </ul>
          </div>
          <div className="upward-dog-main">
            <div>{ children }</div>
          </div>
        </div>
      )
    // }
  }
});

module.exports = ProjectsIndex;
