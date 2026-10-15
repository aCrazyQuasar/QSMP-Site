class Logger {
    constructor(name) {
        this.name = name;
    }
    log(message, timestamp, level) {
        let time;
        if(timestamp){
            time = new Date().toISOString();
        } else {
            time = ''
        }
        const formatted = `
            [${this.name}] ${time}:\n${message}
        `;
        if(level === 1) {
            console.log(formatted);
        } else {
            if(level === 2) {
                console.warn(formatted);
            } else {
                console.error(formatted);
            }
        }
    }
}

export default Logger;