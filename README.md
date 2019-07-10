# SFTP New File Handler

This repo provides the code for the [Lambda](https://aws.amazon.com/lambda/) function that handles new SFTP uploads for the Prior Art Archive. Each file uploaded via SFTP is:

- Assigned a UUID,
- Appended with metadata for UUID and original filename,
- Copied to its final destination bucket.

On the Lambda function, the following environment variables must be set:

- `sourceBucket`: The name of the source S3 bucket.
- `destinationBucket`: The name of the destination S3 bucket.
- `idResolverUrl`: A URL that will be sent a GET request with `?slug=example` and should return the `id` of the Organization with that slug.

To build the Lambda trigger, use the `yarn package` command and deploy the resulting `deploy.zip` through the Lambda interface.

## Testing and Deployment

This project does not currently use a Lambda framework, so [deployment](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html) and [testing](https://medium.com/@reginald.johnson/testing-aws-lambda-functions-the-easy-way-41cf1ed8c090) must be done manually using the AWS Lambda interfaces.

However, we have a nice yarn script to bundle the project in a format that can be uploaded to Lambda:

```
> yarn package
```

This will generate a deploy.zip file which can be uploaded to Lambda.

## Styles / Linting

We use eslint, to check that your contribution meets the style guidelines just run:

```
> yarn lint
```

## Logging

Check out this [logging documentation](docs/LOG_LEVELS.md) for guidelines around when and how to log.
