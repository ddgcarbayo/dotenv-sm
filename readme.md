## Dotenv-sm
Replace your secrets from .env files using AWS secret manager. Check de .env.example file

Usage: dotenv-sm [options]

Commands:
help     Display help
version  Display version

Options:

- (-s, --secret): AWS secret manager name (required)
- (-k, --aws-key): AWS Key (optional)
- (a, --aws-secret): AWS Secret (optional)
- (-c, --common-secret): AWS secret manager name (optional, overwrited by secret)
- (-d, --dest): Dest .env file. Default .env (defaults to ".env")
- (-o, --origin): Base .env file. (defaults to ".env")
- (-p, --prefix): Prefix. Defaults to (SM:
- (-r, --region): AWS Region (defaults to "eu-west-1")
- (-l, --suffix-length): Suffix length. (defaults to 1)
