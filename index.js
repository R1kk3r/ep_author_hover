var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  checked_state = 'checked';
  if (settings.ep_author_hover){
    if (settings.ep_author_hover.disabledByDefault == true){
      checked_state = '';
    }
  }
  args.content = args.content + eejs.require('ep_author_hover/templates/settings.ejs', {checked : checked_state});
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + '<link rel="stylesheet" href="/static/plugins/ep_author_hover/static/css/jquery.qtip.min.css"></link>';
  return cb();
}

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  args.content = args.content + '<script type="text/javascript" src="/static/plugins/ep_author_hover/static/js/jquery.qtip.min.js"></script>';
  return cb();
}
