import express from 'express';
import client from 'prom-client';
import { createClient } from '@supabase/supabase-js';

const app = express();
const register = new client.Registry();

// Create a Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'lawhelp_'
});

// Custom metrics
const activeUsers = new client.Gauge({
  name: 'lawhelp_active_users',
  help: 'Number of active users in the last 5 minutes'
});

const chatRequests = new client.Counter({
  name: 'lawhelp_chat_requests_total',
  help: 'Total number of chat requests'
});

const responseTime = new client.Histogram({
  name: 'lawhelp_response_time_seconds',
  help: 'Response time in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const lawyerApplications = new client.Counter({
  name: 'lawhelp_lawyer_applications_total',
  help: 'Total number of lawyer applications'
});

register.registerMetric(activeUsers);
register.registerMetric(chatRequests);
register.registerMetric(responseTime);
register.registerMetric(lawyerApplications);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    // Update active users metric
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gt('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());
    
    activeUsers.set(count || 0);
    
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).end();
  }
});

// Start server
const port = process.env.METRICS_PORT || 9090;
app.listen(port, () => {
  console.log(`Metrics server listening on port ${port}`);
});