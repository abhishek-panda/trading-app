import EventEmitter from 'events';
import rabbitmqModel from '../models/rabbitmqModel';


const RabbitMQEvent = new EventEmitter();


RabbitMQEvent.on('sink-data', sinkData);
RabbitMQEvent.on('stream-ws-ticks', streamTick)


function sinkData() {
    // rabbitmqModel.sendToQueue()
}


function streamTick() {
     // rabbitmqModel.sendToQueue()
}


export default RabbitMQEvent;