import ampq, {Connection} from 'amqplib';


export default class RabbitMQConn {
    private static instance: Promise<Connection>;
  

    private constructor() {}

    public static getInstance() {
        if (!RabbitMQConn.instance) {
            const settings = {
                protocol: 'amqp',
                hostname: 'localhost',
                port: 5672,
                username: 'guest',
                password: 'guest',
                vhost: '/',
                authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"]
            };
            RabbitMQConn.instance = ampq.connect(settings);
        }

        return RabbitMQConn.instance;
    }
}