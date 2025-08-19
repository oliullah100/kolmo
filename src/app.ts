import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import router from "./app/routes";
import GlobalErrorHandler from "./app/errors/globalErrorHandler";


const app: Application = express();
const morganFormat = ":method :url :status :response-time ms";

export const corsOptions = {
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// DO NOT add express.json() or bodyParser before the webhook raw route  // 10.0.20.170

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));



// 2) Now add JSON/body parsers for the rest of the app
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Shamselkon server is running. . ." });
});

// 3) Mount the rest of your routes (these can safely use JSON)
app.use("/api/v1", router);

// Errors
app.use(GlobalErrorHandler);

// 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;







































// import express, { Application, NextFunction, Request, Response } from "express";
// import httpStatus from "http-status";
// import path from "path";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import bodyParser from "body-parser";
// import GlobalErrorHandler from "./app/errors/globalErrorHandler";
// import morgan from "morgan";
// import router from "./app/routes";
// // import cornFunction from "./app/modules/corns";

// const app: Application = express();
// const morganFormat = ":method :url :status :response-time ms";

// export const corsOptions = {
//   origin: ["*"],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

// // Middleware setup
// app.use(express.json());
// app.use(cors(corsOptions));
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

// // app.use(
// //   morgan(morganFormat, {
// //     stream: {
// //       write: (message) => {
// //         const logObject = {
// //           method: message.split(" ")[0],
// //           url: message.split(" ")[1],
// //           status: message.split(" ")[2],
// //           responseTime: message.split(" ")[3],
// //         };
// //         logger.info(JSON.stringify(logObject));
// //       },
// //     },
// //   })
// // );
// //console.log(cornFunction())
// app.use(morgan("dev"));
// // app.use("/uploads", express.static(path.join("/var/www/uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "..","public", "uploads")));// Serve static files from the "uploads" directory
// // Route handler for the root endpoint
// app.get("/", (req: Request, res: Response) => {
//   res.send({
//     message: "The deep blue server is running. . .",
//   });
// });

// // Setup API routes
// app.use("/api/v1", router);

// // Error handling middleware
// app.use(GlobalErrorHandler);

// // 404 Not Found handler
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.status(httpStatus.NOT_FOUND).json({
//     success: false,
//     message: "API NOT FOUND!",
//     error: {
//       path: req.originalUrl,
//       message: "Your requested path is not found!",
//     },
//   });
// });

// export default app;
