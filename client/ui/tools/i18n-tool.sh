
#
# script directory
#
declare script_dir=`dirname $0`

#
# command procedure
#
cmd=main_proc



#
# main procedure
#
function main_proc()
{
  if [ -n "$PROJECT_ROOT" ]; then
    local prj_root=`realpath $PROJECT_ROOT`
    local opts=''
    if [ -n "$PACKAGE_NAME" ]; then
      opts="$opts --package-name=$PACKAGE_NAME" 
    fi
    if [ -n "$PACKAGE_VERSION" ]; then
      opts="$opts --package-version=$PACKAGE_VERSION" 
    fi
    if [ -n "$MSGID_BUGS_ADDRESS" ]; then
      opts="$opts --msgid-bugs-address=$MSGID_BUGS_ADDRESS" 
    fi
    find src -type f -name '*.ts*' \
      | xgettext \
        -L javascript -k -kgetDomainText:2 \
        ${opts} \
        --copyright-holder="$COPYRIGHT" \
        -f -  -o -
  fi
}

#
# load configuration
#
function load_config()
{
  local config_file=$script_dir/i18n-tool.rc
  if [ -f "$config_file" ] ; then
    source $config_file
  fi
}

#
# show help message
#
function show_help()
{
  local script_name=`basename $0`
  cat <<EOS
$script_name [OPTION]
-h      show this message
EOS
}

#
# parse option
#
function parse_option()
{
  while getopts h opt "$@" ; do

    case $opt in #(
      h)
        cmd=show_help
        ;;
      ?|:)
        cmd=show_help
        ;;
    esac
  done
}

load_config
parse_option "$@"

$cmd


# vi: se ts=2 sw=2 et:
