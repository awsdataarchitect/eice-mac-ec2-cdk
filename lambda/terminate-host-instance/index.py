import boto3
import time

def terminate_host_and_instance(event, context):
    # Retrieve the parameter values from the event
    dedicated_host_id = event['DedicatedHostId']
    instance_id = event['InstanceId']

    # Create EC2 client
    ec2_client = boto3.client('ec2')

    try:
                  # Terminate the EC2 instance
                  ec2_client.terminate_instances(InstanceIds=[instance_id])

                  # Wait for the EC2 instance to be terminated
                  waiter = ec2_client.get_waiter('instance_terminated')
                  waiter.wait(InstanceIds=[instance_id])

                  # Release the Dedicated Host
                  ec2_client.release_hosts(HostIds=[dedicated_host_id])

                  # Add a delay to allow time for the host to be released
                  time.sleep(30)

                  print("Termination complete.")
    except Exception as e:
                  print(f"Error terminating resources: {e}")
                  # Handle the error scenario

def lambda_handler(event, context):
              
    terminate_host_and_instance(event, context)