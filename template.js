/**
* Magic Custom Event: A user-friendly GTM template to push custom events and structured data. Supports data type conversion and nested objects via dot notation.
* @author Alessandro Salerno
* @version 1.0.0
*/

// --- APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const logToConsole = require('logToConsole');
const Object = require('Object');
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
 * Logs the content of a GTM UI table to the console for debugging.
 */
const logTable = function (table, tableName) {
    table.forEach(function (row, i) {
        let logMessage = (tableName ? tableName + ' - ' : '') + 'Row ' + i + ': ';
        Object.keys(row).forEach(function (key) {
            logMessage += key + '=' + row[key] + ', ';
        });
        log('info', logMessage.slice(0, -2));
    });
};
/**
 * Check for integer strings
 */
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

/**
 * Sets a nested property on an object using a dot-notation path, automatically creating arrays for numeric keys (e.g., 'products.0.name').
 */
const setNestedValue = function (obj, path, value) {
    // Exit early if input is invalid or path is empty
    if (!obj || typeof path !== 'string' || !path.length) return;
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

/**
 * Converts a raw value to a specific type based on a user's selection.
*/
const getTypedValue = function (rawValue, desiredType, varName) {
    // If the type is 'inherit' or not specified, return the raw value with its original type.
    if (desiredType === 'inherit' || !desiredType) {
        return rawValue;
    }
    //String conversion
    const stringValue = '' + rawValue;
    switch (desiredType) {
        case 'number':
            const normalizedValue = stringValue.split('.').join('').split(',').join('.');
            const numValue = makeNumber(normalizedValue);
            // Check for NaN, which is the result of a failed conversion.
            if (numValue !== numValue) {
                log('warn', 'Value "' + stringValue + '" for key "' + varName + '" could not be converted to a Number and was skipped.');
                return undefined;
            }
            return numValue;
        case 'boolean':
            const lowerCaseValue = stringValue.toLowerCase();
            // Strictly check if the string is either 'true' or 'false'.
            if (lowerCaseValue === 'true' || lowerCaseValue === 'false') {
                return lowerCaseValue === 'true';
            }            
            log('warn', 'Value "' + stringValue + '" for key "' + varName + '" could not be converted to a Boolean and was skipped.');
            return undefined;
        case 'string':
            return stringValue;
    }
    // Fallback for any unexpected 'desiredType' values.
    return rawValue;
};

/**
 * Logs the final, type-converted parameters for debugging.
 */
const logProcessedParameters = function (parameters) {
    let processedLogMessage = 'Event Parameters Processed (with types): ';
    const keys = Object.keys(parameters);
    if (keys.length > 0) {
        keys.forEach(function (key, i) {
            let valueToLog = parameters[key];
            const valueType = typeof valueToLog;
            valueToLog = JSON.stringify(valueToLog);
            processedLogMessage += key + '=' + valueToLog + ' (' + valueType + ')';
            if (i < keys.length - 1) {
                processedLogMessage += ', ';
            }
        });
        log('info', processedLogMessage);
    } else {
        log('info', 'No valid event parameters were processed to be pushed.');
    }
};


// --- MAIN EXECUTION FLOW ---

// Get the custom dataLayer name or default to 'dataLayer'.
const dataLayerName = data.dataLayerName || 'dataLayer';
// Verify permission to access the dataLayer before proceeding.
if (queryPermission('access_globals', 'readwrite', dataLayerName)) {
    // Create the queue for the specified dataLayer.
    const dataLayerPush = createQueue(dataLayerName);
    // Initialize the base event object.
    let eventData = { "event": data.eventName };
    log('info', 'Preparing to push event: "' + data.eventName + '" to dataLayer: "' + dataLayerName + '"');
    // Process custom parameters if the user has enabled them.
    if (data.addEventData) {
        //log event data table if debugMode is active
        if (data.debugMode) {
            logTable(data.varSet, "Raw Event Parameters Table");
        }
        const finalParameters = {};
        // Loop over each row in the parameter table.
        data.varSet.forEach(function (row) {
            // Call the helper function to convert the raw value to its desired type.
            const typedValue = getTypedValue(row.varValue, row.varType, row.varName);
            // Only add the parameter if the type conversion was successful
            if (typedValue !== undefined) {
                setNestedValue(finalParameters, row.varName, typedValue);
            }
        });
        // Directly assign processed parameters to event object
        Object.keys(finalParameters).forEach(function (key) {
            eventData[key] = finalParameters[key];
        });
        //log processed parameter if debugMode is active
        if (data.debugMode) {
            // Call the new, isolated logging function.
            logProcessedParameters(finalParameters);
        }
    } else {        
        log('info', ' Pushing basic event only. No event parameters were added ("addEventData" is false)');      
    }
    // Push the final object to the dataLayer.
    dataLayerPush(eventData);
    log('info', 'Event "' + data.eventName + '" successfully pushed to "' + dataLayerName + '".');    
    // Signal success to GTM.
    data.gtmOnSuccess();
} else {
    // If permission is denied, log an error and signal failure. 
    log('error', 'Permission to access the dataLayer named "' + dataLayerName + '" was not granted.');
    data.gtmOnFailure();
}

