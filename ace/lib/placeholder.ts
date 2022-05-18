
/**
 * Proxy requests from Confluence for imagePlaceholder to PlantUML rendering server.
 */
 export function macroPlaceholder(request, response, addon) {
     console.error('TODO implement macroPlaceholder');
    // const imageType = request.query['imageType']; // Required
    // // Cast these to string because we know they will only ever be a single string
    // const escapedUrl = <string>request.query['url']; // Required
    // const encodedUML = <string>request.query['encodedUML']; // Optional
    // // const contentLanguage = request.query['language']; // Optional. Usually 'plantuml'
    // const encoded = extractEncodedUML(escapedUrl, encodedUML);

    // const proxy = https.request(
    //     {
    //         hostname: 'render.powerplantuml.com',
    //         port: 443,
    //         path: `/${imageType}/${encoded}`,
    //         method: 'GET'
    //     },
    //     res => {
    //         response.writeHead(res.statusCode, res.headers);
    //         res.pipe(response, { end: true });
    //     });
    
    // request.pipe(proxy, { end: true });
    return null;
}
