module.exports = {
  apps: [
    {
      name: 'time-system-backend',
      script: './src/app.js',
      cwd: '/home/raffinoh/Área de trabalho/DESENVOLVIMENTO/TimeManagementSystem/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true,
      // Configurações de restart automático
      restart_delay: 4000,        // Aguarda 4s antes de reiniciar
      max_restarts: 10,           // Máximo 10 restarts por minuto
      min_uptime: '10s',          // Considera estável após 10s
      // Configurações de monitoramento
      exec_mode: 'fork',
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Restart em caso de exceções
      ignore_watch: ['node_modules', 'logs'],
      exp_backoff_restart_delay: 100
    },
    {
      name: 'time-system-frontend',
      script: './serve-frontend.js',
      cwd: '/home/raffinoh/Área de trabalho/DESENVOLVIMENTO/TimeManagementSystem',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true,
      // Configurações de restart automático
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      exec_mode: 'fork',
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 8000
    }
  ]
};
