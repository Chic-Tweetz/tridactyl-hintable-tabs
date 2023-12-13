this script creates hintable tabs but puts the tab information within an iframe

the iframe uses a local file as its source through localhost

[js script to run through tridactyl](https://github.com/Chic-Tweetz/tridactyl-stuff/blob/main/hintable-tabs-localhost-iframe/js/hinttabs-iframe.js)

the hinttabs directory should be downloaded and its parent directory made available through localhost

the iframe source in the script to run through tridactyl is "http://localhost:PORT/hinttabs/index.html"

the script uses tridactyl's config to get "serverport" so to not have to edit it, use tridactyl's set command:

set serverport [port]

eg if using "python -m http.server", by default the port is 8000 so:

set serverport 8000


if serverport is not set, a command "serverstart" will be executed, which on my machine starts a localhost server and returns its port


