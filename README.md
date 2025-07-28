# Magic Custom Event for GTM

A user-friendly GTM Custom Template to push events and custom data to the dataLayer, with advanced options for data type management. Part of the **Magic Tags** suite.

This tag simplifies common tracking setups that would normally require custom JavaScript variables by providing a clean UI for managing event parameters and their data types.

## Features

-   **Flexible Event & Data Pushing**: Easily configure and push any event along with a custom set of data parameters.
-   **Advanced Data Type Handling**: Specify whether your data is a `String`, `Number`, or `Boolean`. Includes an "Inherit" option to automatically use the data type from a GTM Variable.
-   **Data Validation**: Automatically validates data types to ensure high-quality data is sent to the dataLayer.
-   **Custom Data Layer Support**: Works with websites that use a custom name for the `dataLayer` variable.
-   **Debug Mode**: Enable detailed console logs for easy troubleshooting.

## How to Install

1.  Download the `template.tpl` file from this repository.
2.  Go to your Google Tag Manager container.
3.  Navigate to the **Templates** section and click **New** under "Tag Templates".
4.  Click the three dots menu (⋮) in the top right corner and select **Import**.
5.  Choose the `template.tpl` file you downloaded and save the template.

## Configuration

-   **Event Name**: The name of the event to push (e.g., `form_submission`).
-   **Add Event Data / Event Parameters Table**: An optional table to add custom data to your event.
    -   **Parameter Name**: The key for your data point (e.g., `product_id`).
    -   **Value**: The value for your data point. You can type a static value or insert a GTM Variable (e.g., `{{Click ID}}`).
    -   **Type**: Specify the data type for the value.
        -   **Inherit from Variable**: (Default) Uses the original data type provided by a GTM Variable (e.g., if your variable returns a number, a number is sent).
        -   **String/Number/Boolean**: Forces the value to be converted and validated as the selected type.
-   **Advanced Settings**
    -   **Use a custom Data Layer name**: Enable this if your website's Data Layer variable is not named `dataLayer`.
    -   **Enable Debug Mode**: Check this to see detailed logs in the browser's console during testing.

## Required Permissions

This template requires the following permission:

-   **Accesses dataLayer**: Required for pushing the event and its associated data.

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/). For commercial use, please contact the author to arrange a separate license.
