import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcSubnetGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', {
      // 'cidr' configures the IP range and size of the entire VPC.
      // The IP space will be divided over the configured subnets.
      cidr: '10.0.0.0/21',

      // 'maxAzs' configures the maximum number of availability zones to use
      maxAzs: 3,
      // 'subnetConfiguration' specifies the "subnet groups" to create.
      // Every subnet group will have a subnet for each AZ, so this
      // configuration will create `3 groups × 3 AZs = 9` subnets.
      subnetConfiguration: [
        {
          // 'subnetType' controls Internet access, as described above.
          subnetType: ec2.SubnetType.PUBLIC,

          // 'name' is used to name this particular subnet group. You will have to
          // use the name for subnet selection if you have more than one subnet
          // group of the same type.
          name: 'Ingress',

          // 'cidrMask' specifies the IP addresses in the range of of individual
          // subnets in the group. Each of the subnets in this group will contain
          // `2^(32 address bits - 24 subnet bits) - 2 reserved addresses = 254`
          // usable IP addresses.
          //
          // If 'cidrMask' is left out the available address space is evenly
          // divided across the remaining subnet groups.
          cidrMask: 24,
        },
        {
          cidrMask: 24,
          name: 'Application',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 28,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,

          // 'reserved' can be used to reserve IP address space. No resources will
          // be created for this subnet, but the IP range will be kept available for
          // future creation of this subnet, or even for future subdivision.
          // reserved: true,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'security group opening 80 port',
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    new ec2.Instance(this, 'IngressInstance1', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });
    new ec2.Instance(this, 'IngressInstance2', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });

    new ec2.Instance(this, 'ApplicationInstance1', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });
    new ec2.Instance(this, 'ApplicationInstance2', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });

    new ec2.Instance(this, 'DatabaseInstance1', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });
    new ec2.Instance(this, 'DatabaseInstance2', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroup,
      keyName: 'my-ec2-4',
    });
  }
}
