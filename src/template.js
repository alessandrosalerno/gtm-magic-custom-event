/**
* Magic Custom Event: A GTM Custom Template to easily push events and custom data.
* @author Alessandro Salerno
* @version 1.0.0
*/


// --- GTM APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const makeTableMap = require('makeTableMap');
const logToConsole = require('logToConsole');
const Object = require('Object');
const assertThat = require('assertThat');

// --- Helper Functions ---

/**
 * Logs a message to the console only if debug mode is enabled.
 */

const log = function(level, message) {
    if (data.debugMode) {
        logToConsole(level, message);
    }
};

/**
 * Merges multiple objects into a single new object.
 */

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


/**
 * Logs the content of a GTM UI table to the console for debugging.
 */

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


// --- MAIN EXECUTION FLOW ---

// Determine the Data Layer name from UI input, or default to 'dataLayer'.
const dataLayerName = data.dataLayerName || 'dataLayer';

// Check for permission to access the specified global Data Layer variable.
if (queryPermission('access_globals', 'readwrite', dataLayerName)) {
    const dataLayerPush = createQueue(dataLayerName);
    let eventData = {
        "event": data.eventName
    };
    log('info', 'Preparing to push event: "' + data.eventName + '" to dataLayer: "' + dataLayerName + '"');

    // If the user has checked "Add event data", process the parameters table.
    if (data.addEventData) {
        const varSet = makeTableMap(data.varSet, "varName", "varValue");
        eventData = merge(eventData, varSet);
        logTable(data.varSet, "Event Parameters Table");
    }

    // Push the final event object to the Data Layer.
    dataLayerPush(eventData);
    log('info', 'Event "' + data.eventName + '" successfully pushed to "' + dataLayerName + '".');

    // Signal to GTM that the tag executed successfully.
    data.gtmOnSuccess();

} else {
  
    // If permission is denied, log an error and signal failure.
    log('error', 'Permission to access the dataLayer named "' + dataLayerName + '" was not granted.');
    data.gtmOnFailure();

}
