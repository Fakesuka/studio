import { getAIStatus } from '../controllers/ai.controller';
import { Response } from 'express';

// Mock Response
const res = {
  json: (data: any) => {
    // Check for exposed sensitive data
    if (data.ollamaUrl || data.ollamaModel) {
      console.error('FAIL: Sensitive data exposed in AI status response');
      if (data.ollamaUrl) console.error('- ollamaUrl is exposed');
      if (data.ollamaModel) console.error('- ollamaModel is exposed');
      process.exit(1);
    } else {
      console.log('PASS: Sensitive data not exposed');
      process.exit(0);
    }
  },
  status: (code: number) => {
    return res;
  }
} as any as Response;

// Mock Request
const req = {} as any;

console.log('Running AI Security Test...');
// Run the controller function
getAIStatus(req, res).catch(err => {
  console.error('Error executing controller:', err);
  process.exit(1);
});
