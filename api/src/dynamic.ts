import { Request, Response } from "express";
import { AddOn } from "atlassian-connect-express";
import { head as swaggerHead, body as swaggerBody } from "./swaggerui";

/**
 * Generates the HTML that gets included in IFrame in Confluence macro.
 */
export function generateResponseHtml(
  err: unknown,
  confluenceResponse: any,
  body: string
): string {
  // TODO if err || ! confluenceResponse then return error message

  if (confluenceResponse.statusCode !== 200) {
    // TODO move this HTML into a separate file
    return `
      <!DOCTYPE html>
      <html lang="en">
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
      `;
  }

  // Parse response from Confluence
  const bodyParams = JSON.parse(body);
  const text = bodyParams.body;
  const docType = bodyParams.parameters.docType.value;
  // json, yaml, etc
  const docFormat = bodyParams.parameters.docFormat.value;

  // TODO convert spec to json if needed
  const spec = JSON.parse(text);

  // TODO template different files for asyncapi and openapi/swagger
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />   
        ${swaggerHead()}   
    </head>
    <body>
    <script src="https://connect-cdn.atl-paas.net/all.js"></script>
    ${swaggerBody(spec)}
    </body>
    </html>
  `;
}

export function dynamicMacro(
  request: Request,
  response: Response,
  addon: AddOn
) {
  // Parse incoming request from Confluence
  const macroId: string = <string>request.query?.macroId;
  const pageId: string = <string>request.query?.pageId;
  const pageVersion: string = <string>request.query?.pageVersion;

  // Request macro properties
  const url = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;
  const httpClient = addon.httpClient(request);
  httpClient.get(url, (err, confluenceResponse, body: string) => {
    // then generate HTML and respond
    console.log('response', response);
    response
      .send(generateResponseHtml(err, confluenceResponse, body));
  });
}
