const ami = require('asterisk-manager');

class AMIService {
  constructor(config, eventHandlers, logger) {
    this.config = config;
    this.eventHandlers = eventHandlers;
    this.connection = null;
    this.logger = logger || console; // Fallback para console
  }

  connect() {
    this.connection = ami(
      this.config.AMI_PORT,
      this.config.AMI_HOST,
      this.config.AMI_USER,
      this.config.AMI_PASSWORD,
      true
    );

    this.connection.on('connect', () => {
      this.logger.info(`Conectado ao AMI com sucesso`);
    });

    this.connection.on('error', (error) => {
      this.logger.error(`Erro na conexão AMI: ${error}`);
    });

    this.connection.on('managerevent', (event) => {
      if (this.config.AMI_ALLOWED_EVENTS.includes(event.event)) {
        this.eventHandlers.handleEvent(event);
      } else {
        this.logger.info(`Evento não configurado em config.js, ignorado: ${event.event}`);
      }
    });

    this.connection.connect();
  }

  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
      this.logger.info(`Disconnected`);
    }
  }
}

module.exports = AMIService;