easiest way to check this is probably to download this folder then open localtest.html in Firefox

the iframe src is tabgrid.html (relative path) so localtest.html requires tabgrid.html (and tabgrid.js & tabgrid.css) to be in the same directory

add an iframe to a page

postMessage tab info to populate a grid, then message back with the locations of the grid cells and the tab ids they are associated with

create hintable elements in the original window over the iframe using the location info then switch tab using the tab id of the hint selection

just a test to see if security concerns can be mitigated with iframes while still being usable with hinting
