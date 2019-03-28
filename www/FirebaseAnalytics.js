var exec = require("cordova/exec");

var PLUGIN_NAME = "FirebaseAnalytics";

var execPromise = function execPromise(cls, action, arg) {
  return new Promise(function (resolve, reject) {
    exec(resolve, reject, cls, action, arg);
  });
};

var execPlugin = function execPlugin(action, arg) {
  return execPromise(PLUGIN_NAME, action, arg);
}; 

// TODO: deduplicate function names, refactor array conversions
module.exports = {
  // TODO: validate logEvent parameters
  logEvent: function logEvent(name, params) {
    return execPlugin("logEvent", [name, params || {}]);
  },
  setUserId: function setUserId(userId) {
    return execPlugin("setUserId", [userId]);
  },
  setUserProperty: function setUserProperty(name, value) {
    return execPlugin("setUserProperty", [name, value]);
  },
  resetAnalyticsData: function resetAnalyticsData() {
    return execPlugin("resetAnalyticsData", []);
  },
  setEnabled: function setEnabled(enabled) {
    return execPlugin("setEnabled", [enabled]);
  },
  setCurrentScreen: function setCurrentScreen(name) {
    return execPlugin("setCurrentScreen", [name]);
  }
};
