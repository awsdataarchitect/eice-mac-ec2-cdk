# Open source CDK code to demo connectivity to Mac M1 EC2 instance inside VPC using EC2 Instance Connect Endpoint.

This is a CDK project written in TypeScript that provisions an Apple Mac M1 Dedicated Host and EC2 Instance in a private subnet within a VPC. It also sets up an EC2 Instance Connect Endpoint for secure  connectivity to the Mac M1 EC2 instance over the internet. An EventBridge rule activates a Lambda Function, ensuring the automatic termination of the EC2 Instance and the release of the Dedicated Host after a preconfigured interval of 24 hours. This way, you only incur the minimum 1-day charges (approximately $15.60) for using the Mac M1 EC2. The accompanying blog post provides a step-by-step guide on how to access the EC2 Mac Desktop UI from your PC.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

