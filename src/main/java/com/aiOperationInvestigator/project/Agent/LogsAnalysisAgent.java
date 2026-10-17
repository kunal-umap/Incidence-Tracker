package com.aiOperationInvestigator.project.Agent;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class LogsAnalysisAgent {

    public String analyzeApplicationLogs(String incidentDescription) throws IOException {
        return Files.readString(Path.of("/app/logs/application/application.log"));
    }

    public String analyzeDatabaseLogs(String incidentDescription) throws IOException {
        return Files.readString(Path.of("/app/logs/database/database.log"));
    }

    public String analyzeDeploymentLogs(String incidentDescription) throws IOException {
        return Files.readString(Path.of("/app/logs/deployment/deployment.log"));
    }

}
