import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AMI, INSTANCE_TYPE, DEDICATED_HOST_INSTANCE_TYPE, KEY_PAIR, TERMINATION_HOURS ,AZ} from './cdk-parameters';

export class MacCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      cidr: '10.0.0.0/16',
      //maxAzs: 1,
      // Specify the AZ for the VPC
      availabilityZones: [AZ] ,
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

   
    // Private Subnet vpc.selectSubnets
    const privateSubnet = vpc.selectSubnets({  
      availabilityZones: [AZ], 
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds[0];

    // Security Group for Instance Connect Endpoint
    const instanceConnectSG = new ec2.SecurityGroup(this, 'InstanceConnectSecurityGroup', {
      vpc,
      allowAllOutbound: false, // Set allowAllOutbound to false for customized outbound rules
    });


    // Security Group for EC2 Instance
    const ec2SG = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc,
      allowAllOutbound: false, // Set allowAllOutbound to false for customized outbound rules
    });

    // Add inbound rule to allow SSH from Instance Connect SG to EC2 SG
    ec2SG.addIngressRule(instanceConnectSG, ec2.Port.tcp(22), 'Allow SSH from Instance Connect SG');

    // Add outbound rule to allow SSH from Instance Connect SG to EC2 SG
    instanceConnectSG.addEgressRule(ec2SG, ec2.Port.tcp(22), 'Allow SSH to EC2 SG');


    // Create the InstanceConnectEndpoint
    const instanceConnectEndpoint = new cdk.aws_ec2.CfnInstanceConnectEndpoint(this,
       'InstanceConnectEndpointProviderResource', {
        subnetId: privateSubnet,
      securityGroupIds: [instanceConnectSG.securityGroupId],
    });

    
    // Dedicated Host
    const dedicatedHost = new ec2.CfnHost(this, 'MyDedicatedHost', {
      availabilityZone: AZ,
      instanceType: DEDICATED_HOST_INSTANCE_TYPE,
    });

    // Create EC2 Instance
    const instance = new ec2.CfnInstance(this, 'MyEC2Instance', {
      instanceType: INSTANCE_TYPE,
      imageId: AMI,
      keyName: KEY_PAIR,
      subnetId: privateSubnet,
      securityGroupIds: [ec2SG.securityGroupId],
      hostId: dedicatedHost.ref,
    });

    // Lambda Function
    const terminateHostAndInstanceFunction = new lambda.Function(this, 'TerminateHostAndInstanceFunction', {
      functionName: 'TerminateHostAndInstance',
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.lambda_handler',
      timeout: cdk.Duration.minutes(10), // Increase timeout to 10 minutes
      code: lambda.Code.fromAsset('lambda/terminate-host-instance'), // Path to your Lambda function code,
    });

    // Grant Lambda function permissions
    terminateHostAndInstanceFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'ec2:Describe*',
          "ec2:TerminateInstances",          // Terminate EC2 instances
          "ec2:ReleaseHosts",               // Release dedicated hosts
        ],
        resources: ["*"], // Update with specific resources if needed
      })
    );

    // Event Rule
    const terminationEventRule = new cdk.aws_events.Rule(this, 'TerminationEventRule', {
      description: 'Terminate Dedicated Host and Instance',
      schedule: cdk.aws_events.Schedule.rate(cdk.Duration.hours(TERMINATION_HOURS)),
    });

    terminationEventRule.addTarget(new cdk.aws_events_targets.LambdaFunction(terminateHostAndInstanceFunction, {
      event: cdk.aws_events.RuleTargetInput.fromObject({
        DedicatedHostId: dedicatedHost.ref,
        InstanceId: instance.ref,
      }),
    }));

    // Outputs
    new cdk.CfnOutput(this, 'DedicatedHostIdOutput', {
      value: dedicatedHost.ref,
      description: 'Dedicated Host ID',
    });

    new cdk.CfnOutput(this, 'InstanceIdOutput', {
      value: instance.ref,
      description: 'EC2 Instance ID',
    });
  }
}
