# Magic Custom Event for GTM

A user-friendly GTM Custom Template to easily push events and custom data to the dataLayer, featuring a smart tool for frequency control via cookies.

This tag simplifies common tracking setups that would normally require custom JavaScript variables.

## Features

-   **Flexible Event & Data Pushing**: Easily configure and push any event along with a custom set of data parameters.
-   **Event Frequency Control**: Use a helper cookie to control how often an event fires (e.g., only once per user session).
-   **Debug Mode**: Enable detailed console logs for easy troubleshooting.
-   **User-Friendly**: Designed to be intuitive and simple to configure.
-   **Lightweight & Secure**: Focused on its main task, requiring minimal permissions.

## How to Install

1.  Download the `template.tpl` file from this repository.
2.  Go to your Google Tag Manager container.
3.  Navigate to the **Templates** section and click **New** under "Tag Templates".
4.  Click the three dots menu (⋮) in the top right corner and select **Import**.
5.  Choose the `template.tpl` file you downloaded and save the template.

## Configuration

-   **Enable DataLayer Push**: Main toggle for the event functionality.
    -   **Event Name**: The name of the event to push (e.g., `time_and_scroll`).
    -   **Add Event Data / Event Parameters Table**: A table to add key-value pairs (`varName`, `varValue`) of custom data to your event.
-   **Enable Cookie Generation**: Use this section to control the event's firing logic.
    -   **Cookie Table**: Configure a control cookie here. For example, to fire the event only once, you can check for the existence of this cookie with a GTM variable and set it with this tag.
-   **Debug Mode**: Check this to see detailed logs in the browser's console.

## Required Permissions

This template may require the following permissions based on your configuration:

-   **Accesses dataLayer**: Required for pushing the event and its associated data.
-   **Sets cookies**: Required *only if* you use the "Enable Cookie Generation" feature to control event frequency.

---
