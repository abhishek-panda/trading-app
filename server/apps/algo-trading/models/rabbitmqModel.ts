import { Channel } from "amqplib";
import rabbitMQConn from "../core/rabbitmqConn";

class RabbitMQModel {

    private channel: Channel;

    constructor() {
        this.init();
    }

    private async init() {
        this.channel = await (await rabbitMQConn).createChannel();
    }

    async sendToQueue (name: string, data: NonNullable<any>) {
        await this.channel.assertQueue(name);
        return this.channel.sendToQueue(name, Buffer.from(JSON.stringify(data)))
    }

}

export default new RabbitMQModel()