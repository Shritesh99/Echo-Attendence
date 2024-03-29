import dotenv from "dotenv";
import { ApolloServer } from "apollo-server";

import typeDefs from "./typedefs";
import resolvers from "./resolvers";

// Database Config
import { mongo } from "./utils/db";
import { isAuth } from "./utils/passport";

(async () => {
	try {
		// Dotenv config
		dotenv.config();
		const { NODE_ENV } = process.env;

		// DB
		await mongo.connect();

		const server = new ApolloServer({
			cors: true,
			playground: NODE_ENV === "development" ? true : false,
			introspection: true,
			tracing: true,
			path: "/",
			typeDefs,
			resolvers,
			context: async ({ req, res }) => {
				const auth = await isAuth(req, res);
				return {
					req,
					res,
					isAuth: auth,
					token: auth
						? req.headers.authorization.split(" ")[1]
						: undefined,
				};
			},
		});

		// The `listen` method launches a web server.
		server
			.listen()
			.then((url) => console.log(`🚀  Server ready at ${url.url}`));
	} catch (e) {
		console.error(e);
	}
})();
