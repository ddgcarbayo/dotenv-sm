#!/usr/bin/env node

const args = require('args');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

args
  .options([
    { name: ['s', 'secret'], description: 'AWS secret manager name (required)' },
    { name: ['c', 'common-secret'], description: 'AWS secret manager name (optional, overwrited by secret)' },
    { name: ['o', 'origin'], description: 'Base .env file', defaultValue: '.env' },
    { name: ['d', 'dest'], description: 'Dest .env file', defaultValue: '.env' },
    { name: ['p', 'prefix'], description: 'Prefix', defaultValue: '(SM:' },
    { name: ['l', 'suffix-length'], description: 'Suffix length', defaultValue: 1 },
    { name: ['k', 'aws-key'], description: 'AWS Key' },
    { name: ['a', 'aws-secret'], description: 'AWS Secret' },
    { name: ['r', 'region'], description: 'AWS Region', defaultValue: 'eu-west-1' },
  ]);

const config = args.parse(process.argv);
const SECRET_PREFIX = config.prefix; // IMPORTANTE, ACABAR SIEMPRE CON UN ÚNICO SÍMBOLO Q AHORA SERÁ ) O MODIFICAR SCRIPT
const SECRET_SUFFIX_LENGTH = config.suffixLength;

if(config.secret === undefined) {
  console.error('Error. Project secret is required');
  process.exit(1);
}
if (config.awsKey && config.awsSecret) {
  AWS.config.accessKeyId = config.awsKey;
  AWS.config.secretAccessKey = config.awsSecret;
}

AWS.config.region = config.region;

const addConfigs = (data, secrets = {}) => {
  let text = '';
  for (const key in data) {
    const value = data[key];
    const isSecret = value.startsWith(SECRET_PREFIX);
    if (isSecret === true) {
      const secretKey = value.substr(0, value.length - SECRET_SUFFIX_LENGTH).replace(SECRET_PREFIX, '');
      if (secrets[secretKey] !== undefined) {
        data[key] = secrets[secretKey];
      } else {
        // eslint-disable-next-line no-console
        console.error('Secreto no existente', secretKey);
        process.exit(1);
      }
    }

    text += `${ key }=${ data[key] }\r\n`;
  }

  return text;
};

const getEnvFilePath = (file) => {
  if (file.startsWith('/')) { // es un directorio, entendemos que es ruta absoluta y no hacemos nada
    return path.normalize(file);
  } else {
    return path.join(process.cwd(), file);
  }
};

const createConfig = (secrets) => {
  return new Promise((resolve, reject) => {
    try {
      const origin = getEnvFilePath(config.origin);
      const dest = getEnvFilePath(config.dest);
      try {
        const data = dotenv.parse(fs.readFileSync(origin, {encoding: 'utf-8'}));
        const configs = addConfigs(data, secrets);
        try {
          fs.writeFileSync(dest, configs, 'utf-8');
          resolve();
        } catch (e) {
          console.error(`Wrong dest env file path: ${ dest }`);
          reject(e);
        }
      } catch (e) {
        console.error(`Wrong origin env file path: ${ origin }`);
        reject();
      }
    } catch (e) {
      reject(e);
    }
  });
};

const init = async () => {
  try {
    const client = new AWS.SecretsManager();
    const promises = [
      client.getSecretValue({SecretId: config.secret}).promise()
    ];
    if (config.commonSecret) {
      promises.push(client.getSecretValue({SecretId: config.commonSecret}).promise());
    }
    const results = await Promise.all(promises);
    if (results.length === 1) {
      await createConfig(JSON.parse(results[0].SecretString));
    } else {
      await createConfig(Object.assign(JSON.parse(results[1].SecretString), JSON.parse(results[0].SecretString)));
    }
    console.info('dotenv-sm process completed');
  } catch (e) {
    // eslint-disable-next-line no-console
    if (e) {
      console.error(e);
    }
    process.exit(1);
  }
};

init();
