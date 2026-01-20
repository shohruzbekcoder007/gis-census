import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GIS Census API',
            version: '1.0.0',
            description: 'GIS Census loyihasi uchun API dokumentatsiyasi',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Development server',
            },
            {
                url: 'http://172.16.8.38:8080',
                description: 'Development server for other devices',
            },
        ],
        components: {
            securitySchemes: {
                xAuthToken: {
                    type: 'apiKey',
                    name: 'x-auth-token',
                    in: 'header',
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
