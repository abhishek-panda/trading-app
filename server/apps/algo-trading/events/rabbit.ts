import EventEmitter from 'events';
import rabbitmqModel from '../models/rabbitmqModel';
import logger from '../logger';


export enum QUEUE {
    SINK_DATA = 'SINK_DATA',
    TICK_STREAM = 'TICK_STREAM',
    TA_STREAM = 'TA_STREAM',
};

export enum RBMQEvents {
    SINK_DATA = 'SINK_DATA',
    STREAM_WS_TICKS = 'STREAM_WS_TICKS'
}

const RabbitMQEvent = new EventEmitter();


RabbitMQEvent.on(RBMQEvents.SINK_DATA, sinkData);
RabbitMQEvent.on(RBMQEvents.STREAM_WS_TICKS, streamTick)


function sinkData(data: any) {
    logger.info(`Sink data: ${JSON.stringify(data)}`);
    rabbitmqModel.sendToQueue(QUEUE.SINK_DATA, data);
}


function streamTick(data: any) {
    logger.info(`Tick data: ${JSON.stringify(data)}`);
    rabbitmqModel.sendToQueue(QUEUE.TICK_STREAM, data);
}

rabbitmqModel.subscribe(QUEUE.TA_STREAM, function(data) {
    const content = data?.content.toString();
    logger.info(`TA Candle: ${content}`);
})


export default RabbitMQEvent;