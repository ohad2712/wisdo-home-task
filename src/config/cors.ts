import { CorsOptions } from 'cors';

const whitelist: String[] = ['*'];

const options: CorsOptions = {
  credentials: true,
  origin: (requestOrigin, callback) => {
    if (whitelist.includes('*')) {
      return callback(null, true);
    }

    if (!requestOrigin) {
      return callback(new Error());
    }

    if (!whitelist.includes(requestOrigin)) {
      return callback(new Error());
    }

    return callback(null, true);
  },
};

export default options;
