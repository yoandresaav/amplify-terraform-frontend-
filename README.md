# Running this App in AWS Amplify

## Prerequisites
Install the infrastructure using terraform. The terraform script will create the AWS User Pools and Identity Pools required for the app to run.
[Github Repository](https://github.com/yoandresaav/amplify-terraform-backend)

1. Install Amplify CLI
[Amplify CLI](https://docs.amplify.aws/gen1/javascript/tools/cli/start/set-up-cli/)

2. Initialize Amplify
```bash
amplify init
```
3. Add Auth from AWS User Pools created with terraform
```bash
amplify import auth
```
4. Add Hosting
```bash
amplify add hosting
```
5. Publish
```bash
amplify publish
```


