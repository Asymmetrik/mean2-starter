# Angular2 MEAN Starter #

[![Build Status](https://travis-ci.org/Asymmetrik/mean2-starter.svg?branch=staging)](https://travis-ci.org/Asymmetrik/mean2-starter)
[![Code Climate](https://codeclimate.com/github/Asymmetrik/mean2-starter/badges/gpa.svg)](https://codeclimate.com/github/Asymmetrik/mean2-starter)
[![Test Coverage](https://codeclimate.com/github/Asymmetrik/mean2-starter/badges/coverage.svg)](https://codeclimate.com/github/Asymmetrik/mean2-starter/coverage)

MEAN starter with MongoDB, Express, Angular 2, and Node.

## Getting Started ##

### Prerequisites ###
1. MongoDB installed and running (http://mongodb.org)
1. Node.js and NPM installed (http://nodejs.org)
1. Gulp.js installed globally (http://gulpjs.com)
1. Bunyan.js installed globally (http://github.com/trentm/node-bunyan)

MongoDB is the primary persistance layer for all application artifacts.
Node.js is the runtime environment for the server, which is implemented as an Express application.
Gulp.js is used as the build system.
Bunyan is a logging framework. We will pipe the console output through the bunyan cli to format json log output into human readable form.


### Installation ###
1. Clone from Git
1. Run 'npm install' from the project directory.


### Configuration ###
Application configuration is controlled by a combination of the 'NODE_ENV' environment variable, which specifies the name of the config file located under './config/env' which should be used by the application. That directory contains a 'development.template.js' file which you should rename to 'development.js' and use for development purposes as it is already ignored by the .gitignore file. To customize your environment for development, you can override any top-level property located in 'default.js'. Each property is documented in the default file.


### Running the Application ###
We use Gulp to build and run the application. There are several tasks in the gulpfile that can be used to build/run/test the application. See gulpfile.js (the 'Main Tasks' section near the bottom of the file) for the tasks that can be executed along with documentation for each.

To build the production application files, run the following command:

$ gulp build

To run the app in development mode (assuming you have development mode enabled in the configuration file), run the following command:

$ export NODE_ENV=development && gulp dev | bunyan

This will set the NODE_ENV environment variable to your config file (eg. 'development' or 'production'), run the 'dev' gulp task, and pipe the output to bunyan, which serializes your log output to human-readable form.
The 'dev' task starts the Node.js server on port 3000 (default). Node.js is run using nodemon, which will monitor the directory system for changes, restarting the app automatically on changes.


### Production vs Development Mode ###
The application has a few different ways it can be run that have an impact on overhead and rebuild time.

* Production mode serves all assets (other than the few things that are generated by Node) statically from the /dist dir. This includes all Client-side code, styles, and supporting files. Production mode is not meant to be used for development. Sourcemap availability is spotty, resources are minified, and there is no auto-reload of the application based on changes to resources.
* Development mode serves all assets (other than the few things that are generated by Node) dynamically from Webpack dev middleware. Again, this is all Client-side resources. Webpack dev middleware internally watches all source files and recompiles and reserves them as they are changed. Due to how Webpack dev middleware caches files and performs partial recompiles, time from change to compilation and browser reload can be almost 1/10th what it is in Production mode.
* Currently, the style build is separate from Webpack for all application styles. This is due to issues with sourcemaps and with how autoreload works. Basically, if we build it ourselves, it is way faster and better.
* Using 'gulp dev' to run the server will run the server using nodemon, reloading the application if you make changes. It will also watch all the style files and rebuild them if changed.
* You can run the server in development manually (without using gulp) if you wanted to temporarily put the production server into development mode for troubleshooting.


To run the application in production mode:

1. Run the 'build' gulp task to generate the production assets.
1. Set the 'mode' environment configuration property to 'production'. This will make the application use the production assets loaded from the /public directory.
1. Run the server using either 'gulp dev' or 'node ./src/server/server.js'. The latter will run the application directly using node, 'gulp dev' will run it using nodemon and reload the app when files change (not recommended when running in production mode).


To run the application in development mode:

1. Set the 'mode' environment configuration property to 'development'. This will make the application use the development assets loaded from the ./public/dev directory and from the Webpack dev middleware.
1. Run the server using 'gulp dev' (without using gulp, watches on the style, server, and html files will not work)
1. Do your development. Changes to server files will cause a reload of the server. Changes to client styles will cause gulp to recompile the styles and, if enabled, livereload will reload the styles. Changes to Typescript files will be picked up and recompiled by Webpack and livereload will reload the client.


### Testing ###
To test the application:

The mean2 starter supports testing of both server-side code, using mocha, and client-side code, using karma. Currently, only unit and integretion tests have been implemented. There are two relevant gulp tasks: `test` and `test-ci`.


#### Test ####
`gulp test`

Executes the server and client tests using a watch on all test and source files for server- and client-side code. The tests will re-execute upon any changes.

For the server-side code tests, you can optionally pass in either of two parameters:

1. `--bail`: Pass this parameter to make the mocha tests stop on the first test failure. This can be useful if you want to speed up testing.
1. `--filter=regex`: Pass this parameter with a valid request in string format to filter the tests to run by spec filename.

These parameters are not currently supported for the client side tests.

You can execute only the server-side test or the client-side tests using `gulp test-server` and `gulp test-client` respectively.


#### Test CI ####
`gulp test-ci`

This task is intended to be used by a continuous integration system. When run, it generates both a test report and a coverage report (for server-side test only) under a ./reports directory. The tests are run without a filesystem watch and will only run once.


## Adding External Modules ##
The easiest way to get external modules (both client and server) into the mean2 starter is to use npm. Server modules don't normally require anything more than adding the module to the package.json. Try to be consistent with how we declare semantic version dependencies (e.g. "foo": "2.2" to allow patch updates) when possible. Also, please note that the package.json file is organized to group related packages, avoid using --save and --save-dev when installing packages as this will rewrite the package.json file and destroy the organization.

Integrating client modules can be more complicated for the following reasons:
* Packages are deployed using any number of module systems (e.g. amd, umd, es6, es2015, commonjs, etc).
* Packages may optionally include typings definitions (*.d.ts files), or you may need to install typings from a typings system like DefinitelyTyped
* Packages that only exist as globally declared namespaces may need to be added using the Webpack Provider plugin


### Importing a module from NPM ###

1. The first step is to identify the package and add it to the package.json file. All client dependencies are bundled for production by Webpack, therefore all Client-side dependencies are declared in the "devDependencies" section of the package.json file.
1. Next, add the dependency to the vendor.ts file. This isn't necessary to make the application work, but it is how Webpack understands what is application code versus vendor code and bundles it into the application and vendor bundles.
1. Once you've done that, you can import and reference the code as needed. Dependending on the type of library, you may either do a named import (import { FooModule } from "...") or an aliased import (import * as d3 from "..."). There are also situations where you may need to just import the file (import "file"). This situation might arise if you have two modules where one extends the other and the first exports the module in question but the second merely extends it.

