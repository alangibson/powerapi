import type { Request, Response } from "express";
import type { HostClient } from "atlassian-connect-express";

/**
 * Generates the HTML that gets included in IFrame in Confluence macro.
 */
export function generateResponseTemplate(
  err: unknown,
  confluenceResponse: any,
  body: string
): [ string, object ] {
  // TODO if err || ! confluenceResponse then return error message

  if (confluenceResponse.statusCode !== 200) {
    return [ 'temporary-error.hbs', {} ];
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
  return [ 'swagger-ui.hbs', {
    spec,
    docType,
    docFormat
  } ];
}

export function dynamicMacro(
  request: Request,
  response: Response,
  httpClient: HostClient
) {
  // Parse incoming request from Confluence
  const macroId: string = <string>request.query?.macroId;
  const pageId: string = <string>request.query?.pageId;
  const pageVersion: string = <string>request.query?.pageVersion;

  // Request macro properties
  const url = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;
  httpClient.get(url, (err, confluenceResponse, body: string) => {
    // then generate HTML and respond
    console.log('response', response);
    const [view, options] = generateResponseTemplate(err, confluenceResponse, body)
    response.render(view, options);
  });
}
