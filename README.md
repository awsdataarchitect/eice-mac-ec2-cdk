# Open source CDK code to demo connectivity to Mac M1 EC2 instance inside VPC using EC2 Instance Connect Endpoint.

This is a CDK project written in Typescript that provisions Mac M1 Dedicated Host and EC2 Instance in a private subnet in a VPC and provisions EC2 Instance Connect Endpoint to connect securely over the internet. An EventBride rule triggers a Lambda Function to terminate the EC2 Instance and release the Dedicated Host after preconfigured internal of 24 hours so you only incurr the minimum 1 day of charges (~ $15.60) for using the Mac EC2. The accompanying blog post shows how to access the EC2 Mac Desktop UI from the PC.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

