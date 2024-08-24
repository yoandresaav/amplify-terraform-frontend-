# Running this App in AWS Amplify

## Prerequisites
Install the infrastructure using terraform. The terraform script will create the AWS User Pools and Identity Pools required for the app to run.
[Github Repository](https://github.com/yoandresaav/amplify-terraform-backend)


1. Install Amplify CLI
[Amplify CLI](https://docs.amplify.aws/gen1/javascript/tools/cli/start/set-up-cli/)

2. Copy .env.local to .env
Find `VITE_BACKEND_URL` and add the URL of the API Gateway created with terraform.

3. Initialize Amplify
```bash
amplify init
```
Mind that the Amplify default project `build` folder in vite should be `dist`. 
[Youtube Video](https://youtu.be/8sgivEVsjFE?t=1198) 
Instead of accepting the default configuration, choose `n` and set the build folder to `dist`.

4. Add Auth from AWS User Pools created with terraform
```bash
amplify import auth
```
Select the `User Pool only` created with terraform.
[YouTube Video](https://youtu.be/8sgivEVsjFE?t=1300)

5. Add Hosting
```bash
amplify add hosting
```

Select Amazon S3 and Amazon CloudFront

6. Publish
```bash
amplify publish
```


