package com.aiOperationInvestigator.project.service;

import com.aiOperationInvestigator.project.Agent.InvestigationTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


@Service
public class InvestigationService {


    private final ChatClient chatClient;
    private final InvestigationTools investigationTools;

    public InvestigationService(ChatClient.Builder chatClientBuilder,
                                InvestigationTools investigationTools) {
        this.chatClient = chatClientBuilder.build();
        this.investigationTools = investigationTools;
    }

    // Use this to understand incident
    public String investigationData(String incidentDescription){

        return chatClient.prompt()
                .system("""
                        You are the Orchestration Agent for a Production
                                            Incident Investigation system.
                        
                                            Analyze the incident and identify the additional
                                            production data required for investigation.
                        
                                            Rules:
                                            1. Do not invent facts or production data.
                                            2. Distinguish observed facts from hypotheses.
                                            3. Request only relevant investigation data.
                                            4. Consider application, database, deployments,
                                               infrastructure, network, and dependencies.
                                            5. Do not declare the final root cause.
                        
                        
                                            Invoke the appropriate tool when its investigation
                                            is required and the necessary inputs are available.
                                            Do not claim a tool was executed unless it was
                                            actually invoked.

                                            Return ONLY valid JSON in this format:

                                            {
                                              "issue": "",
                                              "analysis": "",
                                              "proof": [
                                                {
                                                  "evidence": "",
                                                  "source": ""
                                                }
                                              ],
                                              "suggestion": []
                                            }
                        """)
                .user(incidentDescription)
                .tools(investigationTools)
                .call()
                .content();




    }

}

