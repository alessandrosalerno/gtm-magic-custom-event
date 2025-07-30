# Magic Custom Event for GTM

A user-friendly GTM Custom Template to push custom events and structured data to the dataLayer. It supports advanced features like data type conversion and the creation of nested objects and arrays via dot notation.

This tag is part of the **Magic Tags** suite and simplifies common tracking setups that would normally require complex custom JavaScript variables.

---
## Features

-   **Flexible Event & Data Pushing**: Easily configure and push any event along with a custom set of structured data parameters.
-   **Advanced Data Type Handling**: Specify whether your data is a `String`, `Number`, or `Boolean`. Includes an **"Inherit"** option to automatically use the data type from a GTM Variable.
-   **Dot Notation Support**: Create complex nested objects and arrays directly from the UI by using dot notation in parameter names (e.g., `ecommerce.items.0.item_name`).
-   **Robust Data Validation**: Automatically validates data types and handles common formatting issues (like European number formats) to ensure high-quality data is sent to the dataLayer.
-   **Custom Data Layer Support**: Works with websites that use a custom name for the `dataLayer` variable.
-   **Conditional Debug Mode**: Enable detailed console logs for easy troubleshooting without affecting the production environment.

---
## How to Install

1.  Download the `template.tpl` file from this repository.
2.  Go to your Google Tag Manager container.
3.  Navigate to the **Templates** section and click **New** under "Tag Templates".
4.  Click the three dots menu (⋮) in the top right corner and select **Import**.
5.  Choose the `template.tpl` file you downloaded and save the template.

---
## Configuration

-   **Event Name**: The name of the event to push to the dataLayer (e.g., `add_to_cart`).
-   **Add Event Data**: Check this box to add custom parameters to the event.
    -   **Event Parameters Table**:
        -   **Parameter Name**: The key for your data point. Dot notation is supported (e.g., `ecommerce.value`).
        -   **Value**: The value for your data point. You can type a static value or insert a GTM Variable (e.g., `{{Click ID}}`).
        -   **Type**: Specify the data type for the value.
            -   **Inherit from Variable**: (Default) Uses the original data type provided by a GTM Variable. This is the recommended option when using variables.
            -   **String/Number/Boolean**: Forces the value to be converted and validated as the selected type. Use this for static values entered manually.
-   **Advanced Settings**
    -   **Use a custom Data Layer name**: Enable this if your website's Data Layer variable is not named `dataLayer`.
    -   **Enable Debug Mode**: Check this to see detailed raw and processed data logs in the browser's console during testing.

---
## Example Use Case

With this tag, you can build complex dataLayer pushes, like a GA4 E-commerce `add_to_cart` event, directly from the GTM interface without custom HTML.

| Parameter Name | Value | Type |
| :--- | :--- | :--- |
| ecommerce.currency | EUR | String |
| ecommerce.value | {{Product Price}} | Inherit from Variable |
| ecommerce.items.0.item_id | {{Product SKU}} | Inherit from Variable |
| ecommerce.items.0.item_name | {{Product Name}} | Inherit from Variable |
| ecommerce.items.0.price | {{Product Price}} | Inherit from Variable |
| ecommerce.items.0.quantity | 1 | Number |

---
## Required Permissions

This template requires the following permission:

-   **Accesses Globals (`dataLayer`)**: Required for pushing the event and its associated data.

---
## License

This project is licensed under the **Apache License 2.0**.
