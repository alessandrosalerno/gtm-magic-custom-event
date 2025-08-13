/*
* GTM Advanced Custom Event Push:
* A GTM template that pushes custom events by building complex dataLayer objects,
* offering explicit control over data types, nesting, and array manipulation via dot notation.
* @author Alessandro Salerno
* @version 1.0.0
*/

// --- APIs ---
const queryPermission = require('queryPermission');
const createQueue = require('createQueue');
const logToConsole = require('logToConsole');
const Object = require('Object');
const makeNumber = require('makeNumber');
const makeString = require('makeString');
const JSON = require('JSON');
const getType = require('getType');

// --- Inputs ---
const eventName = data.eventName;
const dataLayerName = data.dataLayerName || 'dataLayer';
const addEventData = data.addEventData || false;
const eventParameters = data.varSet || [];
const debugMode = data.debugMode || false;

// --- Helper Functions ---

/**
 * Logs a message to the console only if debug mode is enabled.
 */
const log = function (level, message) {
    if (debugMode) {
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
            logMessage += key + '=' + JSON.stringify(row[key]) + ' | ';
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
 * Helper for setNestedValue - Handles the '*' wildcard operator by recursively calling setNestedValue on each array element.
 */
const handleWildcard = function(current, keys, currentIndex, value) {
    if (getType(current) !== 'array') {
        log('error', 'Cannot use wildcard "*" on a non-array.');
        return;
    }
    const remainingPath = keys.slice(currentIndex + 1).join('.');
    current.forEach(function(element) {
        if (getType(element) === 'object' || getType(element) === 'array') {
            setNestedValue(element, remainingPath, value);
        }
    });
};

/**
 * Helper for setNestedValue - Handles the dynamic array push/unshift operators ('++' and '+0') within a path.
 */
const handleDynamicPushInPath = function(current, key) {
    if (getType(current) !== 'array') {
        log('error', 'Cannot use dynamic push on a non-array.');
        return null; // Return null to indicate failure
    }
    const newObject = {};
    if (key === '++') {
        current.push(newObject);
    } else {
        current.unshift(newObject);
    }
    return newObject;
};

/**
 * Helper for setNestedValue - Ensures that the structure at the current key is of the correct type (array or object).
 */
const ensureStructure = function(current, key, nextKey) {
    const currentLevel = current[key];
    const currentLevelType = getType(currentLevel);
    const needsArray = (nextKey === '++' || nextKey === '+0' || nextKey === '-1' || nextKey === '*' || isIntegerString(nextKey));

    if (needsArray) {
        if (currentLevelType !== 'array') {
            if (currentLevel !== undefined) {
                log('warn', 'Data conflict on key "' + key + '": Overwriting with an Array.');
            }
            current[key] = [];
        }
    } else {
        if (currentLevelType !== 'object') {
            if (currentLevel !== undefined) {
                log('warn', 'Data conflict on key "' + key + '": Overwriting with an Object.');
            }
            current[key] = {};
        }
    }
};

/**
 * Helper for setNestedValue - Assigns the final value at the end of the path, handling special operators.
 */
const assignFinalValue = function(current, finalKey, value) {
    // Resolve '-1' if it's the final key in the path.
    if (finalKey === '-1' && getType(current) === 'array') {
        if (current.length === 0) {
            log('error', 'Cannot use "-1" on an empty array.');
            return;
        }
        finalKey = current.length - 1;
    }

    // Handle direct push/unshift of a value.
    if (finalKey === '++' || finalKey === '+0') {
        if (getType(current) !== 'array') {
            log('error', 'Cannot use dynamic push on a non-array.');
            return;
        }
        if (finalKey === '++') {
            current.push(value);
        } else {
            current.unshift(value);
        }
    } else {
        // Standard assignment for all other keys.
        current[finalKey] = value;
    }
};

/**
 * Sets a nested property on an object using a dot-notation path.
 * This is the main orchestrator function.
 */
const setNestedValue = function (obj, path, value) {
    if (!obj || typeof path !== 'string' || !path.length) return;

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        let key = keys[i];

        if (key === '*') {
            handleWildcard(current, keys, i, value);
            return;
        }

        if (key === '-1' && getType(current) === 'array') {
            if (current.length > 0) key = current.length - 1;
            else { log('error', 'Cannot use "-1" on an empty array.'); return; }
        }

        if (key === '++' || key === '+0') {
            const newCurrent = handleDynamicPushInPath(current, key);
            if (newCurrent) {
                current = newCurrent;
                continue;
            } else return; // Stop if there was an error
        }

        ensureStructure(current, key, keys[i + 1]);
        current = current[key];
    }
    
    assignFinalValue(current, keys[keys.length - 1], value);
};

/**
 * Normalizes a string representing a number, handling both European and US formats.
 * It removes thousand separators and standardizes the decimal separator to a dot (.).
 */
const normalizeNumberString = function (numberString) {

    const hasDots = numberString.indexOf('.') !== -1;
    const hasCommas = numberString.indexOf(',') !== -1;

    // Case 1: Both dots and commas are present
    if (hasDots && hasCommas) {
        const lastDotPosition = numberString.lastIndexOf('.');
        const lastCommaPosition = numberString.lastIndexOf(',');

        if (lastCommaPosition > lastDotPosition) { // European format: "1.234,56"
            return numberString.split('.').join('').split(',').join('.');
        } else { // US format: "1,234.56"
            return numberString.split(',').join('');
        }
    }

    // Case 2: Only commas are present
    else if (hasCommas) {
        const commaCount = numberString.split(',').length - 1;
        if (commaCount > 1) { // Multiple commas are thousand separators: "1,234,567"
            return numberString.split(',').join('');
        } else { // A single comma is a decimal separator: "123,45"
            return numberString.split(',').join('.');
        }
    }

    // Case 3: Only dots are present
    else if (hasDots) {
        const dotsCount = numberString.split('.').length - 1;
        if (dotsCount > 1) { // Multiple dots are thousand separators: "1.234.567"
            return numberString.split('.').join('');
        } else { // A single dot is a decimal separator: "123.45"
            return numberString;
        }
    }

    // Case 4: No separators are present
    else {
        return numberString; // The string is a plain integer like "1234".
    }
};


/**
 * Converts a raw value to a specific type based on a user's selection.
 */
const getTypedValue = function (rawValue, desiredType, varName) {
    // If the type is 'inherit' or not specified, return the raw value with its original type.
    if (desiredType === 'inherit' || !desiredType) {
        return rawValue;
    }
    //String conversion and sanitize
    const stringValue = makeString(rawValue).trim();
    switch (desiredType) {
        case 'number':
            // Call the dedicated normalization function
            const normalizedValue = normalizeNumberString(stringValue);
            const numValue = makeNumber(normalizedValue);
            // Check for NaN, which is the result of a failed conversion.
            if (numValue !== numValue) {
                log('warn', 'Value "' + stringValue + '" for key "' + varName + '" could not be converted to a Number and was skipped.');
                return undefined;
            }
            return numValue;
        case 'boolean':
            const lowerCaseValue = stringValue.toLowerCase();
            if (lowerCaseValue === 'true' || lowerCaseValue === '1' || lowerCaseValue === 'yes' || lowerCaseValue === 'granted' || lowerCaseValue === 'on' || lowerCaseValue === 'accepted' || lowerCaseValue === 'enabled') {
                return true;
            }
            if (lowerCaseValue === 'false' || lowerCaseValue === '0' || lowerCaseValue === 'no' || lowerCaseValue === 'denied' || lowerCaseValue === 'off' || lowerCaseValue === 'rejected' || lowerCaseValue === 'disabled') {
                return false;
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

// Verify permission to access the dataLayer before proceeding.
if (queryPermission('access_globals', 'readwrite', dataLayerName)) {
    // Create the queue for the specified dataLayer.
    const dataLayerPush = createQueue(dataLayerName);
    // Initialize the base event object.
    let eventData = { "event": eventName };
    log('info', 'Preparing to push event: "' + eventName + '" to dataLayer: "' + dataLayerName + '"');
    // Process custom parameters if the user has enabled them.
    if (addEventData) {
        //log event data table if debugMode is active
        if (debugMode) {
            logTable(eventParameters, "Raw Event Parameters Table");
        }
        eventParameters.forEach(function (row) {
            const typedValue = getTypedValue(row.varValue, row.varType, row.varName);
            if (typedValue !== undefined) {
                setNestedValue(eventData, row.varName, typedValue);
            }
        });
        //log processed parameter if debugMode is active
        if (debugMode) {
            const paramsToLog = {};
            Object.keys(eventData).forEach(function (key) {
                if (key !== 'event') {
                    paramsToLog[key] = eventData[key];
                }
            });
            logProcessedParameters(paramsToLog);
        }
    } else {
        log('info', ' Pushing basic event only. No event parameters were added ("addEventData" is false)');
    }
    // Push the final object to the dataLayer.
    dataLayerPush(eventData);
    log('info', 'Event "' + eventName + '" successfully pushed to "' + dataLayerName + '".');
    // Signal success to GTM.
    data.gtmOnSuccess();
} else {
    // If permission is denied, log an error and signal failure. 
    log('error', 'Permission to access the dataLayer named "' + dataLayerName + '" was not granted.');
    data.gtmOnFailure();
}
