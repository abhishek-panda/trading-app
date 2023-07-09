import * as Schedule from 'node-schedule';

export interface AppSchedulerTask {
    rule: Schedule.RecurrenceRule,
    callback: () => void
}

class AppScheduler {
    private schedulers: AppSchedulerTask[] = [];

    run() {
        this.schedulers.forEach(task => {
            Schedule.scheduleJob(task.rule, task.callback);
        });
    }

    register(task: AppSchedulerTask) {
        this.schedulers.push(task);
    }
}

const appScheduler = new AppScheduler();

export default appScheduler;