/**
* Magic Custom Event: A GTM Custom Template to easily push events and custom data.
* @author Alessandro Salerno
* @version 1.0.0
*/

// --- Sandboxed JavaScript APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const logToConsole = require('logToConsole');
const Object = require('Object');
const assertThat = require('assertThat');
const makeNumber = require('makeNumber');
const JSON = require('JSON');

// --- Helper Functions ---

/**
 * Logs a message to the console only if debug mode is enabled.
 */
const log = function (level, message) {
    if (data.debugMode) {
        logToConsole(level, message);
    }
};

/**
 * Merges multiple objects into a single new object.
 */
const merge = function () {
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
const logTable = function (table, tableName) {
    assertThat(table, 'The provided parameter is not a valid table (array-like).').isDefined().isNotNull().isArray();
    table.forEach(function (row, i) {
        assertThat(row, 'Row ' + i + ' of the table is not a valid object.').isObject();
        let logMessage = (tableName ? tableName + ' - ' : '') + 'Row ' + i + ': ';
        Object.keys(row).forEach(function (key) {
            logMessage += key + '=' + row[key] + ', ';
        });
        log('info', logMessage.slice(0, -2));
    });
};


// Helper function to check for integer strings without Regex or other unavailable APIs.
const isIntegerString = function (str) {
    if (!str || str.length === 0) {
        return false;
    }
    const num = makeNumber(str);
    // Checks for NaN, ensures it's a whole number (no decimals), and is not negative.
    if (num !== num || num % 1 !== 0 || num < 0) {
        return false;
    }
    return true;
};

const setNestedValue = function (obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];

        const isNextKeyAnIndex = isIntegerString(nextKey);

        if (isNextKeyAnIndex) {
            current[key] = current[key] || [];
        } else {
            current[key] = current[key] || {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
};

// --- MAIN EXECUTION FLOW ---

const dataLayerName = data.dataLayerName || 'dataLayer';

if (queryPermission('access_globals', 'readwrite', dataLayerName)) {

    const dataLayerPush = createQueue(dataLayerName);
    let eventData = { "event": data.eventName };

    log('info', 'Preparing to push event: "' + data.eventName + '" to dataLayer: "' + dataLayerName + '"');

    if (data.addEventData) {

        logTable(data.varSet, "Raw Event Parameters Table");
        const finalParameters = {};

        data.varSet.forEach(function (row) {
            const rawValue = row.varValue;
            const varName = row.varName;
            const desiredType = row.varType || 'inherit';

            if (desiredType === 'inherit') {
                setNestedValue(finalParameters, varName, rawValue);
            } else {
                const stringValue = '' + rawValue;
                switch (desiredType) {
                    case 'number':
                        const normalizedValue = stringValue.replace(',', '.');
                        const numValue = makeNumber(normalizedValue);
                        if (numValue !== numValue) {
                            log('warn', 'Value "' + stringValue + '" for key "' + varName + '" could not be converted to a Number and was skipped.');
                        } else {
                            setNestedValue(finalParameters, varName, numValue);
                        }
                        break;
                    case 'boolean':
                        const lowerCaseValue = stringValue.toLowerCase();
                        if (lowerCaseValue === 'true' || lowerCaseValue === 'false') {
                            setNestedValue(finalParameters, varName, lowerCaseValue === 'true');
                        } else {
                            log('warn', 'Value "' + stringValue + '" for key "' + varName + '" could not be converted to a Boolean and was skipped.');
                        }
                        break;
                    case 'string':
                        setNestedValue(finalParameters, varName, stringValue);
                        break;
                    default:
                        setNestedValue(finalParameters, varName, rawValue);
                }
            }
        });

        eventData = merge(eventData, finalParameters);

        let processedLogMessage = 'Event Parameters Processed (with types): ';
        const keys = Object.keys(finalParameters);
        if (keys.length > 0) {
            keys.forEach(function (key, i) {
                let valueToLog = finalParameters[key];
                const valueType = typeof valueToLog;

                // Se il valore è un oggetto (e non null), lo convertiamo in stringa JSON per il log
                if (valueType === 'object' && valueToLog !== null) {
                    valueToLog = JSON.stringify(valueToLog);
                }

                processedLogMessage += key + '=' + valueToLog + ' (' + valueType + ')';
                if (i < keys.length - 1) {
                    processedLogMessage += ', ';
                }
            });
            log('info', processedLogMessage);
        } else {
            log('info', 'No valid event parameters were processed to be pushed.');
        }

        dataLayerPush(eventData);
        log('info', 'Event "' + data.eventName + '" successfully pushed to "' + dataLayerName + '".');

        data.gtmOnSuccess();

    } else {
        log('error', 'Permission to access the dataLayer named "' + dataLayerName + '" was not granted.');
        data.gtmOnFailure();
    }
}
