package com.aiOperationInvestigator.project.Agent;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class InvestigationTools {
    private final LogsAnalysisAgent logsAnalysisAgent;
    private final RagAgent ragAgent;

    public InvestigationTools(LogsAnalysisAgent logsAnalysisAgent,
                              RagAgent ragAgent){
        this.logsAnalysisAgent = logsAnalysisAgent;
        this.ragAgent = ragAgent;
    }

    @Tool(description = """
        Analyze application logs to investigate a production incident.
        Use this tool to identify application errors, exceptions,
        request timeouts, HTTP 5xx responses, slow API requests,
        and other application-level failures relevant to the incident.
        Returns log evidence related to the incident description.
        Do not assume a root cause without supporting evidence.
        """)
    public String analyzeApplicationLogs(String incidentDescription) throws IOException {
        return logsAnalysisAgent.analyzeApplicationLogs(incidentDescription);
    }

    @Tool(description = """
        Analyze database logs to investigate a production incident.
        Use this tool to identify slow queries, database connection
        pool exhaustion, connection failures, lock waits, query timeouts,
        and other database-related issues relevant to the incident.
        Returns log evidence related to the incident description.
        Do not assume a root cause without supporting evidence.
        """)
    public String analyzeDatabaseLogs(String incidentDescription) throws IOException {
        return logsAnalysisAgent.analyzeDatabaseLogs(incidentDescription);
    }

    @Tool(description = """
        Analyze deployment logs to investigate a production incident.
        Use this tool to identify recent deployments, rollbacks,
        application version changes, configuration changes,
        failed releases, and deployment events that may be relevant
        to the incident time window.
        Returns deployment evidence related to the incident description.
        Do not conclude that a deployment caused the incident without
        supporting evidence.
        """)
    public String analyzeDeploymentLogs(String incidentDescription) throws IOException {
        return logsAnalysisAgent.analyzeDeploymentLogs(incidentDescription);
    }

    @Tool(description = """
    Generate synthetic historical incidents similar to the provided
    production incident description for testing purposes.
    Return each incident's description, date, root cause, and previously
    implemented solution in valid JSON.
    Do not retrieve real incidents or claim generated data is factual.
    """)
    public String searchPreviousSimilarIncident(@ToolParam(description = "Current production incident description")
                                                String incidentDescription){
        return ragAgent.retriveSimilarEVent(incidentDescription);
    }




}
