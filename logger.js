const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [

    new winston.transports.DailyRotateFile({
      filename: "Move-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    }),

    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),

  ],
});

/*
const transport = new (winston.transports.DailyRotateFile)({
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
});
*/

const logMessage = (level, message)=>{
    logger.log({
        date:  new Date().toISOString(),
        level: level,
        message: message
    });
};



const getMessages=()=>{
  return new Promise((resolve, reject)=>{

    const options = {
      from: new Date() - (24 * 60 * 60 * 1000),
      until: new Date(),
      limit: 30,
      start: 0,
      order: 'desc',
      fields: ['message']
    };
    
    //
    // Find items logged between today and yesterday.
    //
    logger.query(options, function (err, results) {
      if (err) {
        reject("");
        //throw err;
      }
      resolve(results);
    });

  });

}

module.exports = {logMessage, getMessages};