


declare docroot=`realpath ./docroot`

declare python_paths=$docroot/local/python
declare dtrack_config=$docroot/local/conf/dtrack.toml

PYTHONPATH=$python_paths DOCUMENT_ROOT=$docroot DTRACK_CONFIG=$dtrack_config python3 -m http.server --cgi -d docroot
 

# vi: se ts=2 sw=2 et:
