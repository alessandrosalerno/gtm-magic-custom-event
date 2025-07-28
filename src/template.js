/**
 * Magic Custom Event: A GTM Custom Template to easily push events and custom data.
 * @author Alessandro Salerno
 * @version 1.0.0
 */

// --- GTM APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const logToConsole = require('logToConsole');
const Object = require('Object');
const assertThat = require('assertThat');
const makeNumber = require('makeNumber');

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

        // Log the raw input table for debugging purposes.
        logTable(data.varSet, "Raw Event Parameters Table");

        const finalParameters = {};

        data.varSet.forEach(function(row) {
            let finalValue;
            const rawValue = row.varValue;
            const varName = row.varName;
            const desiredType = row.varType || 'inherit';

            if (desiredType === 'inherit') {
                finalValue = rawValue;
            } else {
                const stringValue = '' + rawValue;
                switch (desiredType) {
                    case 'number':
                        const normalizedValue = stringValue.replace(',', '.');
                        const numValue = makeNumber(normalizedValue);
                        assertThat(numValue, 'Value "' + stringValue + '" for key "' + varName + '" is not a valid number.').isNumber();
                        finalValue = numValue;
                        break;
                    case 'boolean':
                        const lowerCaseValue = stringValue.toLowerCase();
                        assertThat(lowerCaseValue === 'true' || lowerCaseValue === 'false', 'Value for boolean type must be "true" or "false".').isTrue();
                        finalValue = (lowerCaseValue === 'true');
                        break;
                    case 'string':
                        finalValue = stringValue;
                        break;
                    default:
                        finalValue = rawValue;
                }
            }

            finalParameters[varName] = finalValue;
        });

        eventData = merge(eventData, finalParameters);

        let processedLogMessage = 'Event Parameters Processed (with types): ';
        const keys = Object.keys(finalParameters);
        keys.forEach(function(key, i) {
            processedLogMessage += key + '=' + finalParameters[key] + ' (' + (typeof finalParameters[key]) + ')';
            if (i < keys.length - 1) {
                processedLogMessage += ', ';
            }
        });
        log('info', processedLogMessage);
    }

    // Push the final event object to the Data Layer.
    dataLayerPush(eventData);
    log('info', 'Event "' + data.eventName + '" successfully pushed to "' + dataLayerName + '".');

    data.gtmOnSuccess();

} else {

    // If permission is denied, log an error and signal failure. 
    log('error', 'Permission to access the dataLayer named "' + dataLayerName + '" was not granted.');
    data.gtmOnFailure();
}
