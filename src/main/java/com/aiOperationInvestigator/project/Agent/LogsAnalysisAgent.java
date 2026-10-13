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
        // Read logs.txt and analyze logs using Gemini
        // Return the analysis
         System.out.println("Hello Shreyash");
        return  "Analysis form logs ---------- ";
    }



}
