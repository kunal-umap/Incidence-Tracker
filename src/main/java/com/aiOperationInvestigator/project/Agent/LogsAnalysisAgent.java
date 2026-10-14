package com.aiOperationInvestigator.project.Agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

@Component
public class LogsAnalysisAgent {

    private final ChatClient chatClient;

    public LogsAnalysisAgent(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String analyzeLogs(String incidentDescription) {

        String applicationLogs = """
    2026-10-14 23:10:01.125 INFO  [http-nio-8080-exec-1] PaymentController -
    requestId=REQ-1001 Received request GET /api/payments/customer/12345

    2026-10-14 23:10:01.142 INFO  [http-nio-8080-exec-1] PaymentService -
    requestId=REQ-1001 Fetching payment history for customerId=12345

    2026-10-14 23:10:02.890 WARN  [http-nio-8080-exec-1] HikariPool -
    Connection acquisition took 1748 ms. Active connections=48,
    idle connections=2, waiting threads=15, maximum pool size=50

    2026-10-14 23:10:03.105 WARN  [http-nio-8080-exec-4] DatabaseQueryLogger -
    requestId=REQ-1002 Slow SQL query detected. Query execution time=2850 ms,
    query=SELECT * FROM payment_transactions WHERE customer_id=12345
    ORDER BY transaction_date DESC

    2026-10-14 23:10:04.220 WARN  [http-nio-8080-exec-6] PaymentService -
    requestId=REQ-1003 Database response delayed. Query duration=3200 ms,
    endpoint=/api/payments/summary

    2026-10-14 23:10:05.015 ERROR [http-nio-8080-exec-8] HikariPool -
    Connection is not available, request timed out after 3000ms.
    Active connections=50, idle connections=0, waiting threads=22

    2026-10-14 23:10:05.020 ERROR [http-nio-8080-exec-8] PaymentController -
    requestId=REQ-1004 Failed to process request GET /api/payments/summary.
    Exception=SQLTransientConnectionException

    2026-10-14 23:10:06.310 WARN  [http-nio-8080-exec-3] DatabaseQueryLogger -
    requestId=REQ-1005 Query execution time exceeded threshold.
    Query duration=4150 ms, query=SELECT COUNT(*) FROM payment_transactions
    WHERE status='PENDING'

    2026-10-14 23:10:07.450 WARN  [http-nio-8080-exec-5] PaymentService -
    requestId=REQ-1006 Payment history API response time=5200 ms

    2026-10-14 23:10:08.700 WARN  [http-nio-8080-exec-7] HikariPool -
    Connection acquisition latency increasing. Active connections=50,
    idle connections=0, waiting threads=31, maximum pool size=50

    2026-10-14 23:10:09.180 ERROR [http-nio-8080-exec-9] PaymentService -
    requestId=REQ-1007 Database operation failed after retries.
    Exception=SQLTransientConnectionException

    2026-10-14 23:10:10.220 WARN  [http-nio-8080-exec-2] DatabaseQueryLogger -
    requestId=REQ-1008 Slow query detected. Query duration=6100 ms,
    query=SELECT * FROM payment_transactions
    WHERE status='PENDING' AND transaction_date >= '2026-10-01'

    2026-10-14 23:10:11.400 INFO  [http-nio-8080-exec-4] PaymentController -
    requestId=REQ-1009 Request completed with HTTP status=200,
    totalResponseTime=6800 ms

    2026-10-14 23:10:12.550 WARN  [http-nio-8080-exec-6] HikariPool -
    Connection pool utilization remains at 100%.
    Active connections=50, idle connections=0, waiting threads=35

    2026-10-14 23:10:13.680 ERROR [http-nio-8080-exec-10] PaymentController -
    requestId=REQ-1010 Request failed with HTTP status=500.
    endpoint=/api/payments/customer/67890,
    exception=SQLTransientConnectionException

    2026-10-14 23:10:15.100 WARN  [scheduler-1] DatabaseHealthMonitor -
    Database health check latency=4800 ms. Expected threshold=1000 ms

    2026-10-14 23:10:17.250 WARN  [http-nio-8080-exec-1] PaymentService -
    requestId=REQ-1011 Database transaction duration=7200 ms.
    Transaction remains active longer than expected.

    2026-10-14 23:10:20.000 ERROR [scheduler-1] DatabaseHealthMonitor -
    Database-dependent operations are experiencing elevated latency.
    Connection pool saturation and slow SQL queries observed.
    Further database metrics and query execution plans are required
    to identify the underlying cause.
    """;

        return  applicationLogs;
    }



}
