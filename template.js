/**
* A user-friendly GTM Custom Template to push events and custom data to the dataLayer,
* with a built-in option to set cookies for event frequency control.
* @author Alessandro Salerno
* @version 1.0.0
*/

// --- Sandboxed JavaScript APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const makeTableMap = require('makeTableMap');
const setCookie = require('setCookie');
const logToConsole = require('logToConsole');
const Object = require('Object');
const getType = require('getType');
const assertThat = require('assertThat');
const encodeUriComponent = require('encodeUriComponent');

// --- Helper Functions ---

// Wrapper function for logging. Logs only if debug mode is enabled.
const log = function(level, message) {
  if (data.debugMode) {
    logToConsole(level, message);
  }
};

// Merges multiple objects into a single one.
const merge = function() {
  const result = {};
  for (let i = 0; i < arguments.length; i++) {
    const obj = arguments[i];
    assertThat(obj, 'Invalid argument passed to the merge function.').isObject();
    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      result[key] = obj[key];
    }
  }
  return result;
};

// Logs the content of a GTM table to the console.
const logTable = function(table, tableName) {
  assertThat(table, 'The provided parameter is not a valid table (array-like).').isDefined().isNotNull().isArray();
  table.forEach(function(row, i) {
    assertThat(row, 'Row ' + i + ' of the table is not a valid object.').isObject();
    let logMessage = (tableName ? tableName + ' - ' : '') + 'Row ' + i + ': ';
    Object.keys(row).forEach(function(key) {
      logMessage += key + '=' + row[key] + ', ';
    });
    log('info', logMessage.slice(0, -2));
  });
};

// Checks permissions and writes a cookie.
const writeCookie = function(cookieName, cookieValue, cookieExpireHours, cookieEncode) {
  if (queryPermission('set_cookies', cookieName)) {
    const cookieOptions = {
      'path': '/',
      'secure': true,
      'samesite': 'Lax',
      'domain': 'auto'
    };
    let maxAge;
    let logMessage = 'Cookie "' + cookieName + '" set with value "' + cookieValue + '"';

    if (cookieExpireHours === 0) {
      maxAge = 0; // Set to 0 for immediate deletion.
      logMessage += ' The cookie has been deleted.';
    } else if (cookieExpireHours > 0) {
      maxAge = cookieExpireHours * 60 * 60; // Duration in seconds.
      logMessage += ' It will expire in ' + cookieExpireHours + ' hours.';
    } else {
      maxAge = undefined; // Becomes a session cookie.
      logMessage += ' It is a session cookie.';
    }

    if (maxAge !== undefined) {
      cookieOptions['max-age'] = maxAge;
    }

    const encodedValue = cookieEncode ? encodeUriComponent(cookieValue) : cookieValue;
    logMessage += cookieEncode ? ' (encoded).' : ' (not encoded).';
    
    setCookie(cookieName, encodedValue, cookieOptions);
    log('info', logMessage);

  } else {
    log('error', 'Permission to write cookie "' + cookieName + '" was denied.');
  }
};

// --- MAIN EXECUTION FLOW ---

// 1. DataLayer Handling
if (data.enableDataLayerPush) {
  if (queryPermission('access_globals', 'readwrite', 'dataLayer')) {
    const dataLayerPush = createQueue('dataLayer');
    let eventData = { "event": data.eventName };

    if (data.addEventData) {
      const varSet = makeTableMap(data.varSet, "varName", "varValue");
      eventData = merge(eventData, varSet);
      logTable(data.varSet, "Event Parameters Table");
    }

    dataLayerPush(eventData);
  } else {
    log("error", "Permission to access the dataLayer was not granted.");
    data.gtmOnFailure();
    return; // Stop execution if permissions fail
  }
}

// 2. Cookie Handling
if (data.enableCookieGen) {
  if (data.cookiesNameAndValue && getType(data.cookiesNameAndValue) === 'array') {
    logTable(data.cookiesNameAndValue, "Cookie Table");
    
    data.cookiesNameAndValue.forEach(function(row, i) {
      let expirationHours;
      if (row.cookieExpiration !== undefined && row.cookieExpiration !== null && row.cookieExpiration !== '') {
        expirationHours = row.cookieExpiration * 1;
        assertThat(expirationHours, 'cookieExpiration in row ' + i + ' must be a number >= 0.').isNumber().isGreaterThanOrEqualTo(0);
      }
      
      assertThat(row.cookieEncode, 'cookieEncode in row ' + i + ' must be a boolean.').isBoolean();
      
      writeCookie(row.cookieName, row.cookieValue, expirationHours, row.cookieEncode);
    });
  } else {
    log('error', 'data.cookiesNameAndValue is not a valid table.');
  }
}

// Success callback
data.gtmOnSuccess();