import { Request, Response } from "express";
import { AddOn } from "atlassian-connect-express";
import { dynamicMacro } from "./dynamic";

test("Dynamic Macro", () => {
  // Given
  const macroId = "macroid";
  const pageId = "pageid";
  const pageVersion = "pageversion";
  // TODO res.statusCode !== 200
  const confluenceResponseStatusCode = 200;
  const openapiSpec = {
    openapi: "3.0.0",
  };
  // TODO asymcapi, swagger
  const docType = "openapi";
  // TODO yaml
  const docFormat = "json";
  // TODO try with real error
  const confluenceResponseErr = null;

  // Mock request
  const request: Request = <Request>(<unknown>{
    query: {
      macroId: macroId,
      pageId: pageId,
      pageVersion: pageVersion,
    },
  });

  // Mock response
  // TODO assert what got sent
  const response: Response = <Response>(<unknown>{
    send: jest.fn(),
  });

  // Mock Confluence addon
  let actualUrl: string | null = null;
  // TODO try with yaml and real json
  const spec = JSON.stringify(openapiSpec);
  const body: string = JSON.stringify({
    body: spec,
    parameters: {
      docType: { value: docType },
      docFormat: { value: docFormat },
    },
  });
  const confluenceResponse = {
    statusCode: confluenceResponseStatusCode,
  };
  const get = jest.fn();
  get.mockImplementation((url, callback) =>
    callback(confluenceResponseErr, confluenceResponse, body)
  );
  const addon: AddOn = <AddOn>(<unknown>{
    httpClient: (request: Request) => ({
      get,
    }),
  });

  // When
  dynamicMacro(request, response, addon);

  // Then

  const expectedUrl = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;

  expect(response.send).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith(expectedUrl, expect.anything());
});

test("Generate Dynamic Macro HTML", () => {
  // TODO try with real error
  const confluenceResponseErr = null;
  // TODO
  // export function generateResponseHtml(
  //   err: unknown,
  //   confluenceResponse: any,
  //   body: string
  // ): string
});
