import SwaggerUI from 'swagger-ui';

export function dynamicMacro(request, response, addon) {

    // Parse incoming request from Confluence
    const macroId = <string>request.query['macroId'];
    const pageId = <string>request.query['pageId'];
    const pageVersion = <string>request.query['pageVersion'];

    // Request macro properties
    const httpClient = addon.httpClient(request);
    const url = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;

    httpClient.get(url, (err, res, body) => {

        if (res.statusCode !== 200) {
            // TODO move this HTML into a separate file
            return response.send(`
            <html>
            <body>
            <script src="https://connect-cdn.atl-paas.net/all.js"></script>
            <p>
            We could not fetch the content of your diagram.
            </p>
            <p>
            If you are seeing this in preview mode, you can ignore this error. 
            Due to a longstanding bug in the new Confluence editor,
            it's not possible to fetch macro content immediately after saving it.
            </p>
            <p>
            <b>No data has been lost.</b>
            After publishing the page, the image will render normally.
            </p>
            </body>
            </html>
            `);
        }

        // Parse response from Confluence
        const bodyParams = JSON.parse(body);
        const text = bodyParams.body;
        const docType = bodyParams.parameters.docType.value;
        // json, yaml, etc
        const docFormat = bodyParams.parameters.docFormat.value;

        // TODO template different files for asyncapi and openapi/swagger
        response.send(`
        <html>
        <body>
        <script src="https://connect-cdn.atl-paas.net/all.js"></script>
        <!-- TODO page goes here -->
        </body>
        </html>
        `);
    });
 }
