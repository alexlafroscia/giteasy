/* globals blanket */

blanket.options({
   modulePrefix: "giteasy",
   filter: "//.*giteasy/.*/",
   antifilter: "//.*(tests|template|config).*/",
   loaderExclusions: [],
   enableCoverage: true
});
