[js script to run through tridactyl](https://github.com/Chic-Tweetz/tridactyl-stuff/blob/main/js/hint_tabs_iframe.js)

make these files available through localhost, in a subdirectory named "hinttabs"

the iframe source is "http://localhost:PORT/hinttabs/index.html"

ie the directory to host is the PARENT directory of hinttabs

localhost port needs to be known - ideally use tridactyl set command so the js script works without modification:
set serverport [port]

eg if using "python -m http.server", by default the port is 8000 so:
set serverport 8000
