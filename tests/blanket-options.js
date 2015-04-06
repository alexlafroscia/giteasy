/* globals blanket */

blanket.options({
   modulePrefix: "giteasy",
   filter: "//.*giteasy/.*/",
   antifilter: "//.*(tests|template).*/",
   loaderExclusions: [],
   enableCoverage: true
});