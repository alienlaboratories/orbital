# Serverless


## Custom Domains

- Config `serverless-domain-manager` plugin and `customDomain`
  - https://www.npmjs.com/package/serverless-domain-manager
  - https://serverless.com/blog/api-gateway-multiple-services
- Register name and cert with AWS (approve via AWS account email.)
  - https://serverless.com/blog/serverless-api-gateway-domain
  - http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html
- `sls create_domain` then `sls deploy`
  - NOTE: Takes about an hour for `sls delete_domain` to release CERT.

