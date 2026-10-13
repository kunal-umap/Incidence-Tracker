package com.aiOperationInvestigator.project.Agent;

import lombok.extern.java.Log;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class InvestigationTools {
    private final LogsAnalysisAgent logsAnalysisAgent;

    public InvestigationTools(LogsAnalysisAgent logsAnalysisAgent){
        this.logsAnalysisAgent = logsAnalysisAgent;
    }

    @Tool(description = """
            Analyze application logs for a production incident.
            Use this tool when the incident requires log investigation.
            The tool reads the demo log file and returns evidence,
            possible hypotheses, and recommended next steps.
           """)
    public String analyzeApplicationLogs(String incidentDescription){
        return logsAnalysisAgent.analyzeLogs(incidentDescription);
    }


}
