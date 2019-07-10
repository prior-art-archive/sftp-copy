# Log Levels

We want to use consistant log levels, so here is a rule of thumb on which ones to uses in various circumstances.  This was borrowed from [a helpful stackoverflow thread](https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels).

* **Trace:** The finest logging level. Can be used to log very specific information that is only relevant in a true debugging scenario, e.g., log every database access or every HTTP call etc.
* **Debug:** Information to primary help you to debug your program. E.g., log every time a batching routine empties its batch or a new file is created on disk etc.
* **Info:** General application flow, such as "Starting app", "connecting to db", "registering ...". In short, information which should help any observer understand what the application is doing in general.
* **Warn:** Warns of errors that can be recovered. Such as failing to parse a date or using an unsafe routine. Note though that we should still try to obey the fail fast principle and not hide e.g., configuration errors using warning message, even though we a default value might be provided by the application.
* **Error:** Denotes an often unrecoverable error. Such as failing to open a database connection.
* **Fatal/Critical:** Used to log an error the application cannot recover from, which might lead to an immediate program termination.
