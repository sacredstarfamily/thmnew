import { Client, Environment, LogLevel } from '@paypal/paypal-server-sdk';
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET as string,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: {
            logBody: true,
        },
        logResponse: {
            logHeaders: true,
        },
    },
});
export default client;