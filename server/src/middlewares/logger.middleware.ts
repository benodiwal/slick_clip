import morgan from 'morgan';

const logger = () => morgan(':method :url :status - :response-time ms');

export default logger;
