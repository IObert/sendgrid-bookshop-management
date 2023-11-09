# SendGrid Bookshop Management

> This sample project demonstrates how to combine the [Twilio SendGrid API](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started) with an application built with the [SAP Cloud Application Programming Model](https://cap.cloud.sap/docs/). Basic information about this project can be found in this repository. For more details, please refer to the [following blog post](TODO).

[![title image](./docs/title-image.png)](TODO)


The project builds on the well-established bookshop scenario and improves the user experience of the bookshop owner. Every time the stock of a particular book goes below a pre-defined threshold, a notification email is sent to to a shop manager. If the manager then want to restock this item, they can simply reply to the email to trigger that action. The SendGrid platform will then invoke a inbound parse (aka webhook) provided by this application to order more books.


## Prerequisites
- Sign up for a free [SendGrid account](https://signup.sendgrid.com/). No credit card required.
- A verified sender (either a [Single Sender Verification](https://docs.sendgrid.com/ui/sending-email/sender-verification) or [Domain Authentication](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication#maincontent))
- Point the [MX record](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook#set-up-an-mx-record) of your domain to SendGrid
- [Node.js](https://nodejs.org/en/download/) installed (version 18 or newer)
- [ngrok](https://ngrok.com/download) installed
- [Cloud Application Programming Model (CDS) Command Line Interface](https://www.npmjs.com/package/@sap/cds-dk) installed
- [SQLite binary](https://cap.cloud.sap/docs/advanced/troubleshooting#how-do-i-install-sqlite-on-windows) installed (Unix users probably already have it)

Optional: 
[Visual Studio Code](https://code.visualstudio.com/Download) with the following extensions installed:
- The [language support extension](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds)
- The [REST client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)


## Getting started
1. Clone this repository and navigate into it
    ```sh
    git clone https://github.com/IObert/sendgrid-bookshop-management.git
    cd sendgrid-bookshop-management
    ```

1. To connect this project to your SendGrid account, you need to include the API Key. It's crucial to keep it private and exclude it from the codebase you check into a git repository. So it makes sense to keep them in the environment variable of the project. In any CAP project, the `default-env.json` file is the perfect place for these secrets as it's already on the `.gitignore` list, and all properties are automatically loaded in the environment variables during startup. For this application, include the sender and receiver number of the text messages to the new file `default-env.json` as well:
    ```json
    {
        "SENDGRID_API_KEY": "SG.XXXXXXX",
        "SENDGRID_SENDER": "alice@example.com",
        "SENDGRID_RECEIVER": "bob@example.com"
    }
    ```
1. Install all dependencies and start the server
    ```sh
    npm install
    npm start
    ```
1. Start `ngrok`
    ```sh
    ngrok http 4004
    ```
    ![ngrok](./docs/ngrok.png)
    > Alternatily, you can also deploy the app to the cloud and use the URL of the deployed app
1. Go to the [SendGrid Dashboard](https://app.sendgrid.com/settings/parse) and navigate to **Settings > Inbound Parse**. Add the HTTPS URL that the previous step printed with the `/sendgridInbound` suffix to the section.
    ![webhook](./docs/inbound.png)
1. Trigger a request to order 95 books which results in a warning email to your inbox
    ![low-stock](./docs/low-stock.png)
1. Let's give it a shot. Respond with "Yes 2000" to the email you received a few minutes ago. Now query the current stock info via the first HTTP request once more.
    ![restocked](./docs/restocked.png)

## Known Issues
If this weren't just a demo but a production app, it would make sense to add proper state management to the application to save which book needs to be reordered instead of extracting this information from the initial email body.

## Get Support

Check out the relevant documentation at [Twilio SendGrid API](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started) and [cap.cloud.sap](https://cap.cloud.sap). <br>
If you have a question, find a bug, or otherwise need support, please open an issue in this repository.

## License

This project is licensed under the Apache Software License, version 2.0, except as noted otherwise in the [LICENSE](LICENSE) file.
