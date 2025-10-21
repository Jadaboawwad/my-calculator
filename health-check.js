#!/usr/bin/env node

/**
 * Health Check Script for Unified System Complete
 * This script checks if the application is running properly
 */

const http = require('http');
const https = require('https');

const config = {
  host: process.env.HEALTH_CHECK_HOST || 'localhost',
  port: process.env.HEALTH_CHECK_PORT || 3000,
  path: process.env.HEALTH_CHECK_PATH || '/health',
  timeout: process.env.HEALTH_CHECK_TIMEOUT || 5000,
  protocol: process.env.HEALTH_CHECK_PROTOCOL || 'http'
};

function checkHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.path,
      method: 'GET',
      timeout: config.timeout
    };

    const client = config.protocol === 'https' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            status: 'healthy',
            statusCode: res.statusCode,
            response: data.trim(),
            timestamp: new Date().toISOString()
          });
        } else {
          reject({
            status: 'unhealthy',
            statusCode: res.statusCode,
            response: data.trim(),
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        status: 'timeout',
        error: 'Request timeout',
        timestamp: new Date().toISOString()
      });
    });

    req.end();
  });
}

// Run health check
checkHealth()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  });