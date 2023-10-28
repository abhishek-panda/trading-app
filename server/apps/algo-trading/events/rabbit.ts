import EventEmitter from 'events';
import rabbitmqModel from '../models/rabbitmqModel';


export enum QUEUE {
    SINK_DATA = 'SINK_DATA',
    TICK_STREAM = 'TICK_STREAM'
};

export enum RBMQEvents {
    SINK_DATA = 'SINK_DATA',
    STREAM_WS_TICKS = 'STREAM_WS_TICKS'
}

const RabbitMQEvent = new EventEmitter();


RabbitMQEvent.on(RBMQEvents.SINK_DATA, sinkData);
RabbitMQEvent.on(RBMQEvents.STREAM_WS_TICKS, streamTick)


function sinkData(data: any) {
    rabbitmqModel.sendToQueue(QUEUE.SINK_DATA, data);
}


function streamTick(data: any) {
    rabbitmqModel.sendToQueue(QUEUE.TICK_STREAM, data);
}


export default RabbitMQEvent;