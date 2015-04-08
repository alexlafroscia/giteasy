/* globals blanket */

blanket.options({
   modulePrefix: "giteasy",
   filter: "//.*giteasy/.*/",
   antifilter: "//.*(tests|template|config|util).*/",
   loaderExclusions: [],
   enableCoverage: true
});
