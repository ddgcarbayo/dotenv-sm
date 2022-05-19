## Dotenv-sm
Replace your secrets from .env files using AWS secret manager using tags

Check de .env.example file

### Commands & options

Commands:
help     Display help
version  Display version

Options:

- (-s, --secret): AWS secret manager name (required)
- (-k, --aws-key): AWS Key (optional)
- (a, --aws-secret): AWS Secret (optional)
- (-c, --common-secret): Secondary (or common) AWS secret manager name (optional, overwrited by secret)
- (-d, --dest): Dest .env file. Default .env (defaults to ".env")
- (-o, --origin): Base .env file. (defaults to ".env")
- (-p, --prefix): Prefix. Defaults to (SM:
- (-r, --region): AWS Region (defaults to "eu-west-1")
- (-l, --suffix-length): Suffix length. (defaults to 1)
- (-t, --tag): Tag for replace by secret value in .env files. (defaults to "(SECRET_MANAGER)")

### Example:

```
npm install -g dotenv-sm
dotenv-sm --origin "./config/.env.pre" --dest ".env.result.example" --secret "aws-secret-name" --common-secret "aws-secret-name-common"
```
