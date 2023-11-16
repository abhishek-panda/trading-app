import { Channel, ConsumeMessage, Connection } from "amqplib";
import rabbitMQConn from "../core/rabbitmqConn";
import { QUEUE } from "../events/rabbit";

class RabbitMQModel {
    private connetion: Promise<Connection>
    private channel: Channel;

    constructor() {
        this.connetion = rabbitMQConn.getInstance();
    }

    private async getChannel() {
        if (!this.channel) {
            this.channel = await (await this.connetion).createChannel();
        }
        return this.channel;
    }

    async sendToQueue (name: QUEUE, data: NonNullable<any>) {
        const channel = await this.getChannel();
        await channel.assertQueue(name);
        return channel.sendToQueue(name, Buffer.from(JSON.stringify(data)))
    }

    async subscribe(queueName: QUEUE,onMessage: (data: string) => void) {
        const channel = await this.getChannel();
        channel.consume(queueName, function(msg) {
            if(msg) {
                const data = `${msg.content.toString()}`;
                channel.ack(msg);
                onMessage(data);
            }
        });
    }

}

export default new RabbitMQModel()