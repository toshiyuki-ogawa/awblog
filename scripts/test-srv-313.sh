declare script_path=`realpath $0`
declare script_dir=`dirname $script_path`
declare docroot=`realpath ./docroot`

declare python_paths=$docroot/local/python
declare dtrack_config=$docroot/local/conf/dtrack.toml
declare acc_ctrl_config=$docroot/local/conf/acc-ctrl.toml
declare awblog_config=$docroot/local/conf/awb.toml

PYTHONPATH=$python_paths DOCUMENT_ROOT=$docroot DTRACK_CONFIG=$dtrack_config ACC_CTRL_CONFIG=$acc_ctrl_config AWBLOG_CONFIG=$awblog_config python3 $script_dir/test-srv-313.py -d docroot
 

# vi: se ts=2 sw=2 et:
