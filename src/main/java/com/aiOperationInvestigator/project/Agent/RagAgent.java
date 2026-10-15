package com.aiOperationInvestigator.project.Agent;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

@Component
public class RagAgent {

    private final ChatClient chatClient;

    public RagAgent(ChatClient.Builder chatClientBuilder){
        this.chatClient = chatClientBuilder.build();
    }

    public String retriveSimilarEVent(String incidentDescription){

        return chatClient.prompt()
                .system(
                        """
                                You are a Synthetic Incident Data Generator. Based on the provided incident description, generate 2–3 realistic historical incidents for testing purposes. Include the incident description, date, plausible root cause, and previously implemented solution. Do not retrieve external data. Clearly treat all generated information as fictional test data.

                                Return ONLY valid JSON:
                                {
                                  "similarIncidents": [
                                    {
                                      "incident": "",
                                      "date": "",
                                      "rootCause": "",
                                      "previouslyImplementedSolution": ""
                                    }
                                  ]
                                }
                              """
                )
                .user(incidentDescription)
                .call()
                .content();

    }

}
