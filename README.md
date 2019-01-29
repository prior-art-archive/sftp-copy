# SFTP New File Handler

This repo provides the code for the lambda function that handles new SFTP uploads for the Prior Art Archive. Each file uploaded via SFTP is:

- Assigned a UUID,
- Appended with metadata for UUID and original filename,
- Copied to its final destination bucket.

On the lambda function, two environment variables must be set:

- `sourceBucket`: The name of the source S3 bucket.
- `idResolverUrl`: A URL that will be sent a GET request with `?slug=example` and should return the `id` of the Organization with that slug.

To build the lambda trigger, compress `lambda.js` and `node_modules` into a .zip file and upload that through the lamba interface.