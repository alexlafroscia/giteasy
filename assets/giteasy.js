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

    tagName: "ul",
    classNames: ["card-list"],

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
define('giteasy/controllers/index', ['exports', 'ember', 'giteasy/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    actions: {
      login: function () {
        var url = "https://github.com/login/oauth/authorize?client_id=";
        url += config['default'].API.GITHUB_CLIENT_ID;
        url += "&scope=user,repo";
        location.href = url;
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
define('giteasy/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/choose', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h2");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),-1,-1);
            content(env, morph0, context, "name");
            content(env, morph1, context, "description");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","link");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "link-to", ["repo", get(env, context, "owner.login"), get(env, context, "name")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"class","navbar");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("GitEasy");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","card container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","card-list");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1, 1]),0,1);
        inline(env, morph0, context, "input", [], {"classNames": "repo-filter", "placeholder": "Search for a repo", "value": get(env, context, "filter")});
        block(env, morph1, context, "each", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/components/file-upload', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/components/render-files', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("  Loading...\n");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createTextNode("    There was a problem loading the files!\n");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("          ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, content = hooks.content;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                  content(env, morph0, context, "file.name");
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
                var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                block(env, morph0, context, "link-to", ["repo.files", get(env, context, "file.path")], {}, child0, null);
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("        ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("a");
                var el2 = dom.createTextNode("\n          ");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n        ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element0 = dom.childAt(fragment, [1]);
                var morph0 = dom.createMorphAt(element0,0,1);
                element(env, element0, context, "action", ["downloadFile", get(env, context, "file.name")], {});
                content(env, morph0, context, "file.name");
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("li");
              dom.setAttribute(el1,"class","no-link");
              var el2 = dom.createTextNode("\n");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("      ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
              set(env, context, "file", blockArguments[0]);
              block(env, morph0, context, "if", [get(env, context, "file.isFolder")], {}, child0, child1);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "each", [get(env, context, "files")], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "isRejected")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "isLoading")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"class","site-head");
        dom.setAttribute(el1,"class","jumbotron");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"id","site-head-title");
        var el3 = dom.createTextNode("GitEasy");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"id","login");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        dom.setAttribute(el4,"id","site-head-sub-title");
        var el5 = dom.createTextNode("A Gitway Drug!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-sm-offset-4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        var el6 = dom.createTextNode("Git Started!");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2, 1, 3, 1, 1]);
        element(env, element0, context, "action", ["login"], {});
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/oauth', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/orgs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h2");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
          content(env, morph0, context, "login");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/repo', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"class","site-head-sm");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"id","site-head-title-sm");
        var el3 = dom.createTextNode("GitEasy");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","toolbarIcon glyphicon glyphicon-plus");
        dom.setAttribute(el2,"title","Upload a file or folders");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","toolbarIcon glyphicon glyphicon-save");
        dom.setAttribute(el2,"title","Download a file or folders");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(element0,0,1);
        var morph1 = dom.createMorphAt(element0,5,6);
        inline(env, morph0, context, "file-upload", [], {"path": get(env, context, "path"), "repo": get(env, context, "repo"), "uploadSuccess": "refreshList"});
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/repo/edit-file', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createTextNode("test\n");
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/repo/files', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "render-files", [], {"repo": get(env, context, "repo"), "path": get(env, context, "path")});
        return fragment;
      }
    };
  }()));

});
define('giteasy/templates/repo/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "render-files", [], {"repo": get(env, context, "repo"), "path": get(env, context, "path")});
        return fragment;
      }
    };
  }()));

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
  require("giteasy/app")["default"].create({"name":"giteasy","version":"0.0.0.39512d47"});
}

/* jshint ignore:end */
//# sourceMappingURL=giteasy.map