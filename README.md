AWS API Gateway does not have a feature that allows you to copy settings from one method to another. This cli fixes that. Super useful when you have many similar methods like OPTIONS requests for CORS.

Install: `npm install -g api-gateway-copy-method`

Usage: `api-gateway-copy-method <apiName> <sourcePath> <sourceMethod> <destPath> <destMethod>`

Example: `api-gateway-copy-method "Blog API" /posts/{id} GET /blogPosts/{id} GET`

Important Notes:
1. destPath must already exist in the UI
2. destMethod must not exist. An error will be thrown if it does.
3. cacheNamespace is NOT copied between methods. First off, this is not settable in the current AWS web UI. Second it seems unlikely you would want to share cache namespaces between methods.
