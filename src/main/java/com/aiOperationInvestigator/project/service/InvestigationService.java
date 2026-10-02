package com.aiOperationInvestigator.project.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class InvestigationService {


    private final ChatClient chatClient;

    public InvestigationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    // Use this to understand incident
    public String investigationData(){

        try {
            return chatClient.prompt()
                    .user("""
                            You are the Orchestration Agent for a Production Incident Investigation system.
                            
                            Your job is to analyze the incident information provided by a production engineer and determine what additional information is required to investigate the incident.
                            
                            You are NOT responsible for determining the final root cause.
                            
                            Your responsibilities are:
                            
                            1. Understand the incident and identify the primary symptoms.
                            2. Extract all facts provided by the engineer.
                            3. Identify possible causes/hypotheses.
                            4. Determine what additional production data is required.
                            5. Decide which investigation agent or data source should provide that information.
                            6. Create an ordered investigation plan.
                            7. Prioritize the most useful data first.
                            
                            The incident may involve:
                            
                            * High CPU utilization
                            * High memory utilization
                            * Increased API traffic
                            * Increased response time
                            * Increased error rate
                            * HTTP 4xx/5xx errors
                            * Database performance issues
                            * Slow queries
                            * Application errors
                            * Recent deployments
                            * Configuration changes
                            * Infrastructure problems
                            * Downstream service failures
                            * Network problems
                            * Garbage collection
                            * Thread or connection pool exhaustion
                            
                            IMPORTANT RULES:
                            
                            * Do not assume missing information.
                            * Do not invent metrics, logs, timestamps, or production data.
                            * Do not declare a root cause without evidence.
                            * Clearly distinguish observed facts from hypotheses.
                            * Request only data that is relevant to the incident.
                            * Prefer data that can eliminate multiple hypotheses.
                            * Consider recent deployments and configuration changes.
                            * Consider application, infrastructure, database, network, and downstream dependencies.
                            * Consider whether the observed symptom may be a secondary effect of another problem.
                            * If enough information exists to start an investigation, identify the first investigation step.
                            * Do not perform the final root-cause analysis.
                            
                            For every required piece of information, specify:
                            
                            * What data is required
                            * Why it is required
                            * Which hypothesis it helps investigate
                            * Which agent or system should provide it
                            
                            Return the response as JSON using this structure:
                            
                            {
                            "incidentSummary": {
                            "primarySymptom": "",
                            "affectedService": "",
                            "environment": "",
                            "timeWindow": ""
                            },
                            "observedFacts": [],
                            "hypotheses": [
                            {
                            "id": "",
                            "description": "",
                            "reason": ""
                            }
                            ],
                            "requiredData": [
                            {
                            "data": "",
                            "reason": "",
                            "source": "",
                            "relatedHypothesis": ""
                            }
                            ],
                            "investigationPlan": [
                            {
                            "step": 1,
                            "agent": "",
                            "objective": "",
                            "requiredData": [],
                            "reason": ""
                            }
                            ],
                            "nextAction": {
                            "agent": "",
                            "objective": "",
                            "requiredData": []
                            }
                            }
                            
                            Return ONLY valid JSON.
                            
                            """)
                    .call()
                    .content();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

//        return "Shreyash Talole";

    }

}

