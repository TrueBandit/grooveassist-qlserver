import 'colors';
import 'dotenv/config';
import { typeDefs } from './graphQL/schema.js';
import { resolvers } from './graphQL/resolvers.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import connectDB from './configs/atlas_db.js';
import bodyParser from 'body-parser';
import cors from 'cors';

// Connect to the database
const startServer = async () => {
  await connectDB();
}

startServer().catch(err => console.error(err));

// Create the GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Initialize the Express application
const app = express();
const httpServer = createServer(app);

// Set up WebSocket server for GraphQL subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

// Initialize Apollo Server with schema and plugins
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

// Apply middleware for GraphQL and other utilities
app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

const PORT = process.env.PORT || 4000;

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
});
