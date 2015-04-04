# ==============================================================================
# Ember CLI Build Box
#
# Exports a build Ember CLI application to /usr/src/app
# ==============================================================================
FROM node:latest
MAINTAINER Alex LaFroscia <alex@lafroscia.com>
EXPOSE 4200 35729

# Install dependencies
RUN npm install -g ember-cli@0.2.2 bower


# ==============================================================================
# Set up some variables
# ==============================================================================

ENV EMBER /usr/local/bin/ember
ENV SRCDIR /usr/src
ENV BUILDDIR $SRCDIR/build
ENV DISTDIR $BUILDDIR/dist
ENV APPDIR /usr/share/nginx/html


# ==============================================================================
#
# Build the Ember App
#
# ==============================================================================

WORKDIR $BUILDDIR
COPY . $BUILDDIR/

RUN ["npm", "install"]
RUN ["bower", "--allow-root", "install"]
RUN $EMBER build
RUN mkdir -p $APPDIR && cp -a $DISTDIR/. $APPDIR/
VOLUME $APPDIR

CMD ls
