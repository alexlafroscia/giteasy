define('giteasy/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'giteasy/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('giteasy/components/file-upload', ['exports', 'ember-uploader/file-field'], function (exports, FileField) {

  'use strict';

  exports['default'] = FileField['default'].extend({
    repo: null,
    token: null,

    filesDidChange: (function () {
      var _this = this;
      var repo = this.get("repo");
      var files = this.get("files");

      // Get path to file
      var path = this.get("path");
      if (path.slice(-1) === "/") {
        path = "";
      }
      path += files[0].name;

      var commit = "Upload file " + files[0].name;
      var reader = new FileReader();

      reader.onload = function () {
        console.log("uploading the file");
        var file = reader.result;

        repo.write("master", path, file, commit, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.debug("it worked!");
            _this.sendAction("uploadSuccess");
          }
        });
      };

      reader.onerror = function () {
        reader.abort();
      };

      reader.readAsText(files[0]);
    }).observes("files")

  });

});
define('giteasy/components/render-files', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(Ember['default'].PromiseProxyMixin, {

    classNames: ["render-file-list"],

    isLoading: true,
    files: null,

    getFiles: (function () {
      var _this = this;
      var repo = this.get("repo");
      var path = this.get("path");
      if (path.slice(-1) === "/") {
        path = path.substring(0, path.length - 1);
      }
      new Ember['default'].RSVP.Promise(function (resolve, reject) {
        repo.contents("master", path, function (err, contents) {
          if (!Ember['default'].isBlank(err)) {
            reject(err);
          } else {
            resolve(contents);
          }
        });
      }).then(function (contents) {
        // Add the `isFolder` property to each object and resolve
        // the resulting array
        return new Ember['default'].RSVP.resolve(contents.map(function (item) {
          if (item.type === "dir") {
            item.isFolder = true;
            item.isFile = false;
          } else {
            item.isFolder = false;
            item.isFile = true;
          }
          return item;
        }));
      }).then(function (contents) {
        return new Ember['default'].RSVP.resolve(contents.sortBy("isFile", "name"));
      }).then(function (contents) {
        _this.set("files", contents);
        _this.set("isLoading", false);
      })["catch"](function (error) {
        console.error(error);
        _this.set("error", error);
        _this.set("isRejected", true);
        _this.set("isLoading", false);
      });
    }).on("init").observes("path"),

    // Actions
    actions: {

      downloadFile: function (fileName) {
        var repo = this.get("repo");
        var path = this.get("path");
        repo.read("master", path + fileName, function (err, data) {
          if (!Ember['default'].isBlank(err)) {
            console.error(err);
          } else {
            window.open("data:text;charset=utf-8," + data);
          }
        });
      }

    }


  });

});
define('giteasy/controllers/choose', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({

    // Sort the content by name
    sortBy: ["name"],

    // The filter to search by
    filter: "",

    // Return the filtered content
    arrangedContent: (function () {
      var content = this.get("content");
      var filter = this.get("filter").toLowerCase();

      // If the filter is empty, return all of the content
      if (Ember['default'].isBlank(filter)) {
        return content;
      }

      var arrangedContent = content.filter(function (item) {
        if (!Ember['default'].isBlank(item.name)) {
          if (item.name.toLowerCase().indexOf(filter) >= 0) {
            return true;
          }
        }

        if (!Ember['default'].isBlank(item.description)) {
          if (item.description.toLowerCase().indexOf(filter) >= 0) {
            return true;
          }
        }

        return false;
      });
      return arrangedContent;
    }).property("content", "filter")

  });

});
define('giteasy/controllers/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    actions: {
      login: function () {
        location.href = "https://github.com/login/oauth/authorize?client_id=a588178358290293b65d&scope=user,repo";
      }
    }
  });

});
define('giteasy/controllers/orgs', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ArrayController.extend({});

});
define('giteasy/controllers/repo', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    repo: Ember['default'].computed.alias("session.currentRepo"),
    path: "/",
    token: Ember['default'].computed.alias("session.accessToken"),
    owner: Ember['default'].computed.alias("session.repo.owner"),
    repoName: Ember['default'].computed.alias("session.repo.name"),

    actions: {
      refreshList: function () {
        console.debug("test");
        this.propertyWillChange("path");
      }
    }
  });

});
define('giteasy/controllers/repo/files', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    repo: Ember['default'].computed.alias("session.currentRepo"),
    path: Ember['default'].computed.alias("model")

  });

});
define('giteasy/controllers/repo/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    repo: Ember['default'].computed.alias("session.currentRepo"),
    path: ""

  });

});
define('giteasy/controllers/user', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    repo: Ember['default'].computed.alias("session.currentRepo")
  });

});
define('giteasy/initializers/app-version', ['exports', 'giteasy/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('giteasy/initializers/export-application-global', ['exports', 'ember', 'giteasy/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal) {
      window[classifiedName] = application;
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('giteasy/initializers/session-service', ['exports'], function (exports) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.inject("route", "session", "service:session");
    application.inject("controller", "session", "service:session");
  }exports['default'] = {
    name: "session-service",
    initialize: initialize
  };

});
define('giteasy/router', ['exports', 'ember', 'giteasy/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("index", { path: "/" });
    this.route("oauth");
    this.route("choose", { path: "/choose" });
    this.route("repo", { path: ":owner_id/:repo_id" }, function () {
      this.route("editFile", { path: "files/*file_path/edit" });
      this.route("files", { path: "files/*file_path" });
    });
  });

  exports['default'] = Router;

});
define('giteasy/routes/choose', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function () {
      var user = this.session.get("user");
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        user.repos(function (err, repos) {
          if (!Ember['default'].isBlank(err)) {
            reject(err);
          } else {
            resolve(repos);
          }
        });
      });
    }
  });

});
define('giteasy/routes/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('giteasy/routes/oauth', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    beforeModel: function (transition) {
      var params = transition.queryParams;
      localStorage.setItem("accessToken", params.access_token);
      this.session.set("accessToken", params.access_token);
      this.transitionTo("choose");
    }
  });

});
define('giteasy/routes/repo', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function (params) {
      this.session.get("repo").set("owner", params.owner_id);
      this.session.get("repo").set("name", params.repo_id);

      var github = this.session.get("github");
      var repo = github.getRepo(params.owner_id, params.repo_id);
      this.session.set("currentRepo", repo);
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        repo.show(function (err, repo) {
          if (!Ember['default'].isBlank(err)) {
            reject(err);
          } else {
            resolve(repo);
          }
        });
      });
    }
  });

});
define('giteasy/routes/repo/edit-file', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('giteasy/routes/repo/files', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function (params) {
      return params.file_path;
    }
  });

});
define('giteasy/routes/repo/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('giteasy/services/session', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({

    user: null,
    accessToken: null,

    repo: Ember['default'].Object.create({
      owner: null,
      name: null
    }),

    init: function () {
      if (Ember['default'].isPresent(localStorage.accessToken)) {
        this.set("accessToken", localStorage.accessToken);
        this.loginUser();
      }
    },


    organizations: (function () {
      var user = this.get("user");
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        user.orgs(function (err, orgs) {
          // Handle the error if there is one
          if (!Ember['default'].isBlank(err)) {
            reject(err);
          } else {
            resolve(orgs);
          }
        });
      });
    }).property("user"),


    allRepos: (function () {
      var user = this.get("user");
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        user.repos(function (err, repos) {
          if (!Ember['default'].isBlank(err)) {
            reject(err);
          } else {
            resolve(repos);
          }
        });
      });
    }).property("user"),


    loginUser: (function () {
      var github = new Github({
        token: this.get("accessToken"),
        auth: "oauth"
      });

      // Store the github property
      this.set("github", github);

      // Set the user property
      var user = github.getUser();
      this.set("user", user);
    }).observes("accessToken")

  });

});
define('giteasy/templates/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1;


    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('giteasy/templates/choose', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n      <div class=\"repo\">\n        ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],data:data},helper ? helper.call(depth0, "repo", "owner.login", "name", options) : helperMissing.call(depth0, "link-to", "repo", "owner.login", "name", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      </div>\n    ");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n          <h3>");
    stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</h3>\n          <p>");
    stack1 = helpers._triageMustache.call(depth0, "description", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</p>\n        ");
    return buffer;
    }

    data.buffer.push("<header class=\"site-head jumbotron\">\n  <h1 id=\"site-head-title\">GitEasy</h1>\n</header>\n\n<section class=\"container\">\n  <div class=\"row\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'classNames': ("repo-filter"),
      'placeholder': ("Search for a repo"),
      'value': ("filter")
    },hashTypes:{'classNames': "STRING",'placeholder': "STRING",'value': "ID"},hashContexts:{'classNames': depth0,'placeholder': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  </div>\n</section>\n\n<section class=\"container\">\n  <div class=\"row\">\n    <div class=\"render-repo-list\">\n    ");
    stack1 = helpers.each.call(depth0, {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </div>\n  </div>\n</section>\n");
    return buffer;
    
  });

});
define('giteasy/templates/components/file-upload', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1;


    stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('giteasy/templates/components/render-files', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    
    data.buffer.push("\n  Loading...\n");
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n\n  \n  ");
    stack1 = helpers['if'].call(depth0, "isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    }
  function program4(depth0,data) {
    
    
    data.buffer.push("\n    There was a problem loading the files!\n  ");
    }

  function program6(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n\n    \n    <ul>\n    ");
    stack1 = helpers.each.call(depth0, "files", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </ul>\n\n  ");
    return buffer;
    }
  function program7(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      ");
    stack1 = helpers['if'].call(depth0, "isFolder", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    ");
    return buffer;
    }
  function program8(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n        <li class=\"repoTreeName repoFolder\">\n          <span class=\"repoTreeIcon glyphicon glyphicon-folder-close\"></span>\n          ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "repo.files", "path", options) : helperMissing.call(depth0, "link-to", "repo.files", "path", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </li>\n      ");
    return buffer;
    }
  function program9(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            ");
    stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n          ");
    return buffer;
    }

  function program11(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n        <li class=\"repoTreeName repoFile\">\n          <span class=\"repoTreeIcon glyphicon glyphicon-list-alt\"></span>\n          <a ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "downloadFile", "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(">\n            ");
    stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n          </a>\n        </li>\n      ");
    return buffer;
    }

    data.buffer.push("\n");
    stack1 = helpers['if'].call(depth0, "isLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('giteasy/templates/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, escapeExpression=this.escapeExpression;


    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n<header class =\"site-head\" class = \"jumbotron\">\n	<h1 id =\"site-head-title\">GitEasy</h1>\n</header>\n<section class = \"container-fluid\">\n	<section id = 'login' class = \"row\">\n		<div class = \"row\">\n			<h4 id =\"site-head-sub-title\">A Gitway Drug!</h4>\n		</div>\n		<div class = \"row\">\n			<div class = \"col-sm-offset-4\">\n				<button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "login", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(" id = \"login-open-button\" >Git Started!</button>\n			</div>\n		</div>\n	</section>\n</section>\n");
    return buffer;
    
  });

});
define('giteasy/templates/oauth', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1;


    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('giteasy/templates/orgs', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, self=this;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n  <h2>");
    stack1 = helpers._triageMustache.call(depth0, "login", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</h2>\n");
    return buffer;
    }

    stack1 = helpers.each.call(depth0, {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('giteasy/templates/repo', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push("<header class =\"site-head-sm\">\n  <h1 id =\"site-head-title-sm\">GitEasy</h1>\n</header>\n\n<section class=\"container\">\n  <section id='show-repo' class = \"row\">\n    <section id='taskbar-repo' class = \"row\">\n      <section class=\"col-sm-offset-5 col-sm-5\">\n\n        ");
    data.buffer.push(escapeExpression((helper = helpers['file-upload'] || (depth0 && depth0['file-upload']),options={hash:{
      'path': ("path"),
      'repo': ("repo"),
      'uploadSuccess': ("refreshList")
    },hashTypes:{'path': "ID",'repo': "ID",'uploadSuccess': "STRING"},hashContexts:{'path': depth0,'repo': depth0,'uploadSuccess': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "file-upload", options))));
    data.buffer.push("\n\n        <button class=\"toolbarIcon glyphicon glyphicon-plus\" title=\"Upload a file or folders\"></button>\n        <button class=\"toolbarIcon glyphicon glyphicon-save\" title=\"Download a file or folders\"></button>\n\n      </section>\n    </section>\n    <section id='repo-dir' class=\"row\">\n      <section class=\"col-sm-12\">\n        ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      </section>\n    </section>\n  </section>\n</section>\n");
    return buffer;
    
  });

});
define('giteasy/templates/repo/edit-file', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    


    data.buffer.push("test\n");
    
  });

});
define('giteasy/templates/repo/files', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push(escapeExpression((helper = helpers['render-files'] || (depth0 && depth0['render-files']),options={hash:{
      'repo': ("repo"),
      'path': ("path")
    },hashTypes:{'repo': "ID",'path': "ID"},hashContexts:{'repo': depth0,'path': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "render-files", options))));
    data.buffer.push("\n\n");
    return buffer;
    
  });

});
define('giteasy/templates/repo/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push(escapeExpression((helper = helpers['render-files'] || (depth0 && depth0['render-files']),options={hash:{
      'repo': ("repo"),
      'path': ("path")
    },hashTypes:{'repo': "ID",'path': "ID"},hashContexts:{'repo': depth0,'path': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "render-files", options))));
    data.buffer.push("\n\n");
    return buffer;
    
  });

});
define('giteasy/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('giteasy/tests/components/file-upload.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/file-upload.js should pass jshint', function() { 
    ok(true, 'components/file-upload.js should pass jshint.'); 
  });

});
define('giteasy/tests/components/render-files.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/render-files.js should pass jshint', function() { 
    ok(true, 'components/render-files.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/choose.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/choose.js should pass jshint', function() { 
    ok(true, 'controllers/choose.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/index.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/index.js should pass jshint', function() { 
    ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/orgs.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/orgs.js should pass jshint', function() { 
    ok(true, 'controllers/orgs.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/repo.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/repo.js should pass jshint', function() { 
    ok(true, 'controllers/repo.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/repo/files.jshint', function () {

  'use strict';

  module('JSHint - controllers/repo');
  test('controllers/repo/files.js should pass jshint', function() { 
    ok(true, 'controllers/repo/files.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/repo/index.jshint', function () {

  'use strict';

  module('JSHint - controllers/repo');
  test('controllers/repo/index.js should pass jshint', function() { 
    ok(true, 'controllers/repo/index.js should pass jshint.'); 
  });

});
define('giteasy/tests/controllers/user.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/user.js should pass jshint', function() { 
    ok(true, 'controllers/user.js should pass jshint.'); 
  });

});
define('giteasy/tests/helpers/resolver', ['exports', 'ember/resolver', 'giteasy/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('giteasy/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('giteasy/tests/helpers/start-app', ['exports', 'ember', 'giteasy/app', 'giteasy/router', 'giteasy/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('giteasy/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('giteasy/tests/initializers/session-service.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/session-service.js should pass jshint', function() { 
    ok(true, 'initializers/session-service.js should pass jshint.'); 
  });

});
define('giteasy/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/choose.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/choose.js should pass jshint', function() { 
    ok(true, 'routes/choose.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/oauth.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/oauth.js should pass jshint', function() { 
    ok(true, 'routes/oauth.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/repo.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/repo.js should pass jshint', function() { 
    ok(true, 'routes/repo.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/repo/edit-file.jshint', function () {

  'use strict';

  module('JSHint - routes/repo');
  test('routes/repo/edit-file.js should pass jshint', function() { 
    ok(true, 'routes/repo/edit-file.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/repo/files.jshint', function () {

  'use strict';

  module('JSHint - routes/repo');
  test('routes/repo/files.js should pass jshint', function() { 
    ok(true, 'routes/repo/files.js should pass jshint.'); 
  });

});
define('giteasy/tests/routes/repo/index.jshint', function () {

  'use strict';

  module('JSHint - routes/repo');
  test('routes/repo/index.js should pass jshint', function() { 
    ok(true, 'routes/repo/index.js should pass jshint.'); 
  });

});
define('giteasy/tests/services/session.jshint', function () {

  'use strict';

  module('JSHint - services');
  test('services/session.js should pass jshint', function() { 
    ok(true, 'services/session.js should pass jshint.'); 
  });

});
define('giteasy/tests/test-helper', ['giteasy/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('giteasy/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/components/file-upload-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("file-upload", "FileUploadComponent", {});

  ember_qunit.test("it renders", function () {
    expect(2);

    // creates the component instance
    var component = this.subject();
    equal(component._state, "preRender");

    // appends the component to the page
    this.append();
    equal(component._state, "inDOM");
  });
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('giteasy/tests/unit/components/file-upload-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/file-upload-test.js should pass jshint', function() { 
    ok(true, 'unit/components/file-upload-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/components/render-files-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("render-files", "RenderFilesComponent", {});

  ember_qunit.test("it renders", function () {
    expect(2);

    // creates the component instance
    var component = this.subject({
      path: "/"
    });
    equal(component._state, "preRender");

    // appends the component to the page
    this.append();
    equal(component._state, "inDOM");
  });
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('giteasy/tests/unit/components/render-files-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/render-files-test.js should pass jshint', function() { 
    ok(true, 'unit/components/render-files-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/choose-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:choose", "ChooseController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/choose-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/choose-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/choose-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/orgs-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:orgs", "OrgsController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/orgs-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/orgs-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/orgs-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/repo-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:repo", "RepoController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/repo-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/repo-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/repo-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/repo/files-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:repo/files", "RepoFilesController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/repo/files-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/repo');
  test('unit/controllers/repo/files-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/repo/files-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/repo/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:repo/index", "RepoIndexController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/repo/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/repo');
  test('unit/controllers/repo/index-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/repo/index-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/controllers/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:user", "UserController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/controllers/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/user-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/user-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/choose-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:choose", "ChooseRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/choose-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/choose-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/choose-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:index", "IndexRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/oauth-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:oauth", "OauthRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/oauth-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/oauth-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/oauth-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/repo-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:repo", "RepoRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/repo-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/repo-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/repo-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/repo/files-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:repo/files", "RepoFilesRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/repo/files-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/repo');
  test('unit/routes/repo/files-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/repo/files-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/routes/repo/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:repo/index", "RepoIndexRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('giteasy/tests/unit/routes/repo/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/repo');
  test('unit/routes/repo/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/repo/index-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/services/session-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("service:session", "SessionService", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var service = this.subject();
    ok(service);
  });
  // Specify the other units that are required for this test.
  // needs: ['service:foo']

});
define('giteasy/tests/unit/services/session-test.jshint', function () {

  'use strict';

  module('JSHint - unit/services');
  test('unit/services/session-test.js should pass jshint', function() { 
    ok(true, 'unit/services/session-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/views/index-choose-repo-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:index-choose-repo", "IndexChooseRepoView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('giteasy/tests/unit/views/index-choose-repo-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/index-choose-repo-test.js should pass jshint', function() { 
    ok(true, 'unit/views/index-choose-repo-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/views/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:index", "IndexView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('giteasy/tests/unit/views/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/index-test.js should pass jshint', function() { 
    ok(true, 'unit/views/index-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/unit/views/repo-dir/edit-file-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:repo-dir/edit-file", "RepoDirEditFileView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('giteasy/tests/unit/views/repo-dir/edit-file-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views/repo-dir');
  test('unit/views/repo-dir/edit-file-test.js should pass jshint', function() { 
    ok(true, 'unit/views/repo-dir/edit-file-test.js should pass jshint.'); 
  });

});
define('giteasy/tests/views/index-choose-repo.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/index-choose-repo.js should pass jshint', function() { 
    ok(true, 'views/index-choose-repo.js should pass jshint.'); 
  });

});
define('giteasy/tests/views/index.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/index.js should pass jshint', function() { 
    ok(true, 'views/index.js should pass jshint.'); 
  });

});
define('giteasy/tests/views/repo-dir/edit-file.jshint', function () {

  'use strict';

  module('JSHint - views/repo-dir');
  test('views/repo-dir/edit-file.js should pass jshint', function() { 
    ok(true, 'views/repo-dir/edit-file.js should pass jshint.'); 
  });

});
define('giteasy/views/index-choose-repo', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].View.extend({
		didInsertElement: function () {
			//stuffs for header functionality
			$(".site-head").prepend("<div class='canvasContainer' style='width:0; height:0;'><canvas id='demo-canvas'></canvas</div>");

			$(function () {
				var width,
				    height,
				    largeHeader,
				    canvas,
				    ctx,
				    points,
				    target,
				    animateHeader = true,
				    numberOfPoints = 10,
				    pointSizeMin = 7,
				    pointSizeMax = 25;

				// Main
				initHeader();
				initAnimation();
				addListeners();

				function initHeader() {
					width = window.innerWidth;
					height = window.innerHeight;
					target = { x: width / 2, y: height / 2 };

					largeHeader = document.getElementsByClassName("site-head")[0];

					canvas = document.getElementById("demo-canvas");
					canvas.width = $(".site-head").width();
					canvas.height = $(".site-head").height();
					ctx = canvas.getContext("2d");

					// create points
					points = [];
					for (var x = 0; x < width; x = x + width / numberOfPoints) {
						for (var y = 0; y < height; y = y + height / numberOfPoints) {
							var px = x + Math.random() * width / numberOfPoints;
							var py = y + Math.random() * height / numberOfPoints;
							var p = { x: px, originX: px, y: py, originY: py };
							points.push(p);
						}
					}

					// for each point find the 5 closest points
					for (var i = 0; i < points.length; i++) {
						var closest = [];
						var p1 = points[i];
						for (var j = 0; j < points.length; j++) {
							var p2 = points[j];
							if (p1 !== p2) {
								var placed = false;
								for (var k = 0; k < 5; k++) {
									if (!placed) {
										if (closest[k] === undefined) {
											closest[k] = p2;
											placed = true;
										}
									}
								}

								for (var l = 0; l < 5; l++) {
									if (!placed) {
										if (getDistance(p1, p2) < getDistance(p1, closest[l])) {
											closest[l] = p2;
											placed = true;
										}
									}
								}
							}
						}
						p1.closest = closest;
					}

					// assign a circle to each point
					for (i = 0; i < points.length; i++) {
						var c = new Circle(points[i], Math.random() * (pointSizeMax - pointSizeMin) + pointSizeMin, "rgba(255,255,255,0.3)");
						points[i].circle = c;
					}
				}

				// Event handling
				function addListeners() {
					if (!("ontouchstart" in window)) {
						window.addEventListener("mousemove", mouseMove);
					}
					window.addEventListener("scroll", scrollCheck);
					window.addEventListener("resize", resize);
				}

				function mouseMove(e) {
					var posx = 0,
					    posy = 0;
					if (e.pageX || e.pageY) {
						posx = e.pageX;
						posy = e.pageY;
					} else if (e.clientX || e.clientY) {
						posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
						posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
					}
					target.x = posx;
					target.y = posy;
				}

				function scrollCheck() {
					if (document.body.scrollTop > height) {
						animateHeader = false;
					} else {
						animateHeader = true;
					}
				}

				function resize() {
					width = window.innerWidth;
					height = window.innerHeight;
					largeHeader.style.height = height + "px";
					canvas.width = width;
					canvas.height = height;
				}

				// animation
				function initAnimation() {
					animate();
					for (var i = 0; i < points.length; i++) {
						shiftPoint(points[i]);
					}
				}

				function animate() {
					if (animateHeader) {
						ctx.clearRect(0, 0, width, height);
						for (var i = 0; i < points.length; i++) {
							// detect points in range
							if (Math.abs(getDistance(target, points[i])) < 4000) {
								points[i].active = 0.3;
								points[i].circle.active = 0.6;
							} else if (Math.abs(getDistance(target, points[i])) < 20000) {
								points[i].active = 0.1;
								points[i].circle.active = 0.3;
							} else if (Math.abs(getDistance(target, points[i])) < 40000) {
								points[i].active = 0.02;
								points[i].circle.active = 0.1;
							} else {
								points[i].active = 0;
								points[i].circle.active = 0;
							}

							drawLines(points[i]);
							points[i].circle.draw();
						}
					}
					requestAnimationFrame(animate);
				}

				function shiftPoint(p) {
					TweenLite.to(p, 1 + 1 * Math.random(), { x: p.originX - 50 + Math.random() * 100,
						y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
						onComplete: function () {
							shiftPoint(p);
						} });
				}

				// Canvas manipulation
				function drawLines(p) {
					if (!p.active) {
						return;
					}
					for (var i = 0; i < p.closest.length; i++) {
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p.closest[i].x, p.closest[i].y);
						ctx.strokeStyle = "rgba(255,255,255," + p.active + ")";
						ctx.stroke();
					}
				}

				function Circle(pos, rad, color) {
					var _this = this;

					// constructor
					(function () {
						_this.pos = pos || null;
						_this.radius = rad || null;
						_this.color = color || null;
					})();

					this.draw = function () {
						if (!_this.active) {
							return;
						}
						ctx.beginPath();
						ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
						ctx.fillStyle = "rgba(255,255,255," + _this.active + ")";
						ctx.fill();
					};
				}

				// Util
				function getDistance(p1, p2) {
					return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
				}
			});
		}
	});

});
define('giteasy/views/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].View.extend({
		didInsertElement: function () {
			//stuffs for header functionality
			$(".site-head").prepend("<div class='canvasContainer' style='width:0; height:0;'><canvas id='demo-canvas'></canvas</div>");

			$(function () {
				var width,
				    height,
				    largeHeader,
				    canvas,
				    ctx,
				    points,
				    target,
				    animateHeader = true,
				    numberOfPoints = 10,
				    pointSizeMin = 7,
				    pointSizeMax = 25;

				// Main
				initHeader();
				initAnimation();
				addListeners();

				function initHeader() {
					width = window.innerWidth;
					height = window.innerHeight;
					target = { x: width / 2, y: height / 2 };

					largeHeader = document.getElementsByClassName("site-head")[0];

					canvas = document.getElementById("demo-canvas");
					canvas.width = $(".site-head").width();
					canvas.height = $(".site-head").height();
					ctx = canvas.getContext("2d");

					// create points
					points = [];
					for (var x = 0; x < width; x = x + width / numberOfPoints) {
						for (var y = 0; y < height; y = y + height / numberOfPoints) {
							var px = x + Math.random() * width / numberOfPoints;
							var py = y + Math.random() * height / numberOfPoints;
							var p = { x: px, originX: px, y: py, originY: py };
							points.push(p);
						}
					}

					// for each point find the 5 closest points
					for (var i = 0; i < points.length; i++) {
						var closest = [];
						var p1 = points[i];
						for (var j = 0; j < points.length; j++) {
							var p2 = points[j];
							if (p1 !== p2) {
								var placed = false;
								for (var k = 0; k < 5; k++) {
									if (!placed) {
										if (closest[k] === undefined) {
											closest[k] = p2;
											placed = true;
										}
									}
								}

								for (var l = 0; l < 5; l++) {
									if (!placed) {
										if (getDistance(p1, p2) < getDistance(p1, closest[l])) {
											closest[l] = p2;
											placed = true;
										}
									}
								}
							}
						}
						p1.closest = closest;
					}

					// assign a circle to each point
					for (i = 0; i < points.length; i++) {
						var c = new Circle(points[i], Math.random() * (pointSizeMax - pointSizeMin) + pointSizeMin, "rgba(255,255,255,0.3)");
						points[i].circle = c;
					}
				}

				// Event handling
				function addListeners() {
					if (!("ontouchstart" in window)) {
						window.addEventListener("mousemove", mouseMove);
					}
					window.addEventListener("scroll", scrollCheck);
					window.addEventListener("resize", resize);
				}

				function mouseMove(e) {
					var posx = 0,
					    posy = 0;
					if (e.pageX || e.pageY) {
						posx = e.pageX;
						posy = e.pageY;
					} else if (e.clientX || e.clientY) {
						posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
						posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
					}
					target.x = posx;
					target.y = posy;
				}

				function scrollCheck() {
					if (document.body.scrollTop > height) {
						animateHeader = false;
					} else {
						animateHeader = true;
					}
				}

				function resize() {
					width = window.innerWidth;
					height = window.innerHeight;
					largeHeader.style.height = height + "px";
					canvas.width = width;
					canvas.height = height;
				}

				// animation
				function initAnimation() {
					animate();
					for (var i = 0; i < points.length; i++) {
						shiftPoint(points[i]);
					}
				}

				function animate() {
					if (animateHeader) {
						ctx.clearRect(0, 0, width, height);
						for (var i = 0; i < points.length; i++) {
							// detect points in range
							if (Math.abs(getDistance(target, points[i])) < 4000) {
								points[i].active = 0.3;
								points[i].circle.active = 0.6;
							} else if (Math.abs(getDistance(target, points[i])) < 20000) {
								points[i].active = 0.1;
								points[i].circle.active = 0.3;
							} else if (Math.abs(getDistance(target, points[i])) < 40000) {
								points[i].active = 0.02;
								points[i].circle.active = 0.1;
							} else {
								points[i].active = 0;
								points[i].circle.active = 0;
							}

							drawLines(points[i]);
							points[i].circle.draw();
						}
					}
					requestAnimationFrame(animate);
				}

				function shiftPoint(p) {
					TweenLite.to(p, 1 + 1 * Math.random(), { x: p.originX - 50 + Math.random() * 100,
						y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
						onComplete: function () {
							shiftPoint(p);
						} });
				}

				// Canvas manipulation
				function drawLines(p) {
					if (!p.active) {
						return;
					}
					for (var i = 0; i < p.closest.length; i++) {
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p.closest[i].x, p.closest[i].y);
						ctx.strokeStyle = "rgba(255,255,255," + p.active + ")";
						ctx.stroke();
					}
				}

				function Circle(pos, rad, color) {
					var _this = this;

					// constructor
					(function () {
						_this.pos = pos || null;
						_this.radius = rad || null;
						_this.color = color || null;
					})();

					this.draw = function () {
						if (!_this.active) {
							return;
						}
						ctx.beginPath();
						ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
						ctx.fillStyle = "rgba(255,255,255," + _this.active + ")";
						ctx.fill();
					};
				}

				// Util
				function getDistance(p1, p2) {
					return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
				}
			});
		}
	});

});
define('giteasy/views/repo-dir/edit-file', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function () {
            var editor = ace.edit("editor");
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/javascript");
        }
    });

});
/* jshint ignore:start */

define('giteasy/config/environment', ['ember'], function(Ember) {
  var prefix = 'giteasy';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("giteasy/tests/test-helper");
} else {
  require("giteasy/app")["default"].create({"name":"giteasy","version":"0.0.0.812accb2"});
}

/* jshint ignore:end */
//# sourceMappingURL=giteasy.map