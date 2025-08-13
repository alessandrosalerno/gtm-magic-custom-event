# GTM Advanced Custom Event Push

A GTM template for pushing custom events, featuring dynamic dataLayer object construction with dot notation, special operators for array manipulation, explicit data type control, and JSON string parsing.

---
## Features

-   **Flexible Event & Data Pushing**: Push any event along with a completely custom set of structured data parameters.
-   **Dot Notation Support**: Create complex nested objects and arrays using dot notation (e.g., `ecommerce.items.0.item_name`).
-   **Advanced Array Manipulation**: Use special operators (`++`, `+0`, `*`, `-1`) to dynamically push, prepend, or modify elements in an array.
-   **Rich Data Type Handling**:
    -   **Conversion**: Explicitly set data as a `String`, `Number`, or `Boolean`.
    -   **Parsing**: Convert a JSON-formatted string into a live object or array.
    -   **Inheritance**: Preserve the original data type from a GTM Variable.

![Example](images/gtm-advanced-custom-event-push-setting.jpg)
![Example](images/gtm-advanced-custom-event-push-datalayer-push.jpg)

---
## Advanced Array Manipulation

Beyond standard numeric indexing (e.g., `requested_features.0`), the 'Variable' field supports special operators dynamic array manipulation.

| Operator | Name | Use Case | Description | Examples |
| :--- | :--- | :--- | :--- | :--- |
| `++` | Append / Push | **Direct Value**<br>or<br>**Object Property** | Appends a value directly to the end of an array, or appends a new object and sets a property on it. | `related_docs_ids.++`<br>`requested_features.++.name` |
| `+0` | Prepend / Unshift | **Direct Value**<br>or<br>**Object Property** | Prepends a value directly to the beginning of an array, or prepends a new object and sets a property on it. | `related_docs_ids.+0`<br>`requested_features.+0.name` |
| `-1` | Last Element<br>(Selector) | **Object Property** | Selects the last element of an array to modify one of its properties. **Must be followed by a property path.** | `requested_features.-1.priority` |
| `*` | Wildcard / For-Each<br>(Selector) | **Object Property** | Selects all elements in an array and applies a modification. **Must be followed by a property path.** | `requested_features.*.status` |

![Example](images/gtm-advanced-custom-event-push-array-manipulation.jpg)
![Example](images/gtm-advanced-custom-event-push-array-datalayer-push.jpg)

---
## Advanced Settings
-   **Custom Data Layer Support**: Works with GTM that use a custom name for the `dataLayer` variable.
-   **Conditional Debug Mode**: Enable detailed console logs for easy troubleshooting.

![Example](images/gtm-advanced-custom-event-push-advanced-setting.jpg)
---
## How to Install

1.  Download the `template.tpl` file from this repository.
2.  Go to your Google Tag Manager container.
3.  Navigate to the **Templates** section and click **New** under "Tag Templates".
4.  Click the three dots menu (⋮) in the top right corner and select **Import**.
5.  Choose the `template.tpl` file you downloaded and save the template.

---
## Configuration

-   **Event Name**: The name of the event to push to the dataLayer (e.g., `click_and_scroll`).
-   **Add Event Data**: Check this box to add custom parameters to the event.
    -   **Event Parameters**:
        -   **Variable**: The key for your data point. Dot notation is supported (e.g., `ecommerce.value`, `ecommerce.items.0.price`).
        -   **Value**: The value for your data point. You can type a static value or insert a GTM Variable.
        -   **Data Type**: Specify the data type for the value.
            -   **Inherit from Variable**: (Default) preserve the original type from the data source. This is the recommended option if you don't need type conversion.
            -   **String** : Converts any input value into a text string. For example, the number 123 will become the string "123".
            -   **Number** : Converts the input into a numeric format (floating-point). Handles different decimal and thousands separators, automatically converting values like "1,234.56" (US format) or "1.234,56" (EU format) into the standard numeric value 1234.56 .
            -   **Boolean**: Coerces various string and numeric representations into a strict boolean true/false (True/False, 1/0, yes/no, granted/denied, on/off, accepted/rejected). The coercion logic is case-insensitive.
            -   **Array/Object**: Converts a JSON-formatted string into a live JavaScript object or array. This is useful for handling complex data structures passed as a single string. For example, `{"id": "A123", "available": true}` becomes a usable object.
-   **Advanced Settings**
    -   **Use a custom Data Layer name**: Enable this if your website's Data Layer variable is not named "dataLayer". **Note**: After saving, you must manually update the tag's "Accesses Globals" permission to include your custom Data Layer name.
    -   **Enable Debug Mode**: Check this to see detailed raw and processed data logs in the browser's console during testing.

---
## Required Permissions

This template requires the following permission:

-   **Accesses Globals (`dataLayer`)**: Required for pushing the event and its associated data.

---
## License

This project is licensed under the **Apache License 2.0**.
