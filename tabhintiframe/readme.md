Some thoughts:

You don't need to message back with the location of the elements in the iframe as that is easy to work out when they're in an evenly spaced grid. 

You also don't need to message the tab ids as the original window calls tabs.query() and has those anyway. 

So the window needs nothing back from the frame. You could even create the iframe source in the js script and not bother messaging at all? 

***

easiest way to check this is probably to download this folder then open localtest.html in Firefox

the iframe src is tabgrid.html (relative path) so localtest.html requires tabgrid.html (and tabgrid.js & tabgrid.css) to be in the same directory

add an iframe to a page

postMessage tab info to populate a grid, then message back with the locations of the grid cells and the tab ids they are associated with

create hintable elements in the original window over the iframe using the location info then switch tab using the tab id of the hint selection

just a test to see if security concerns can be mitigated with iframes while still being usable with hinting
